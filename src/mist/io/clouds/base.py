"""Definition of base classes for Clouds

This currently contains only BaseController. It includes basic functionality
for a given cloud (including libcloud calls, fetching and storing information
to database etc. Cloud specific controllers are in
`mist.io.clouds.controllers`.

"""

import ssl
import json
import logging
import datetime

from libcloud.common.types import InvalidCredsError
from libcloud.compute.base import Node, NodeLocation

from mist.io import config

from mist.io.exceptions import MistError
from mist.io.exceptions import MachineNotFoundError
from mist.io.exceptions import CloudUnavailableError
from mist.io.exceptions import CloudUnauthorizedError

from mist.core.tag.models import Tag
from mist.core.cloud.models import Machine


log = logging.getLogger(__name__)


# TODO: This should be moved to the tags directory, once it's migrated.
def tags_to_dict(tags):
    """Return a dict with each key/value tag being a dict item

    This will handle:
    - dict {key1: value1, key2: value2, ...}
    - lists of {key: value} pairs
    - lists of {"key": key, "value": value} pairs, value field is optional

    It will return:
    dict {key1: value1, key2: value2, ...}

    """

    if isinstance(tags, dict):
        return tags
    tdict = {}
    for tag in tags:
        if isinstance(tag, dict):
            if len(tag) == 1:
                key = tag.keys()[0]
                tdict[tag] = tag[key]
            elif 'key' in tag:
                tdict[tag['key']] = tag.get('value')
    return tdict


class BaseController(object):
    """Abstract base class for every cloud/provider controller

    This base controller factors out all the steps common to all or most
    clouds into a base class, and defines an interface for provider or
    technology specific cloud controllers.

    Subclasses are meant to extend or override methods of this base class to
    account for differencies between different cloud types.

    Care should be taken when considering to add new methods to a subclass.
    All controllers should have the same interface, to the degree this is
    feasible. That is to say, don't add a new method to a subclass unless
    there is a very good reason to do so.

    The following convention is followed:
    All methods that start with an underscore are considered internal. They
    are to be called, extended, overrided by subclasses, but not to be called
    directly by some consumer of the controller's API.
    All other methods are the public API of controllers and should be stable
    as possible. New methods should almost always first be added to this base
    class.

    """

    def __init__(self, cloud):
        """Initialize cloud controller given a cloud

        Most times one is expected to access a controller from inside the
        cloud, like this:

            cloud = mist.io.clouds.models.Cloud.objects.get(id=cloud_id)
            print cloud.ctl.list_machines()

        """

        self.cloud = cloud
        self._conn = None

    @property
    def connection(self):
        """Cached libcloud connection, accessible as attribute"""
        if self._conn is None:
            self._conn = self.connect()
        return self._conn

    def connect(self):
        """Return libcloud-like connection to cloud

        All subclasses MUST implement this method.

        """
        raise NotImplementedError()

    def disconnect(self):
        """Close libcloud-like connection to cloud"""
        if self._conn is not None:
            log.debug("Closing libcloud-like connection for %s.", self.cloud)
            self._conn.disconnect()
            self._conn = None

    def list_machines(self):
        """Return list of machines for cloud

        This returns the results obtained from libcloud, after some processing,
        formatting and injection of extra information in a sane format.

        In most cases where the machine listing is taken from a libcloud-like
        connection, a subclass shouldn't have to override (or even extend) this
        method directly.

        There are instead a number of class methods that are called from this
        method, to allow subclasses to modify the data according to the
        specific of their cloud type. These methods currently are:

            _post_parse_machine
            _cost_machine

        Subclasses that require special handling should override these, by
        default, dummy methods.

        """

        # Try to query list of machines from provider API.
        try:
            nodes = self.connection.list_nodes()
            log.info("List nodes returned %d results for %s.",
                     len(nodes), self.cloud)
        except InvalidCredsError:
            raise CloudUnauthorizedError()
        except ssl.SSLError as exc:
            log.exception("SSLError on running list_nodes on %s", self.cloud)
            raise CloudUnavailableError(exc=exc)
        except Exception as exc:
            log.exception("Error while running list_nodes on %s", self.cloud)
            raise CloudUnavailableError(exc=exc)

        now = datetime.datetime.utcnow()

        # Process each machine in returned list.
        machines = []
        for node in nodes:

            # Fetch machine mongoengine model from db, or initialize one.
            try:
                machine_model = Machine.objects.get(cloud=self.cloud,
                                                    machine_id=node.id)
            except Machine.DoesNotExist:
                machine_model = Machine(cloud=self.cloud, machine_id=node.id)

            # Update machine_model's last_seen fields
            machine_model.last_seen = now
            machine_model.missing_since = None

            # Get misc libcloud metadata.
            image_id = node.image or node.extra.get('imageId')
            size = (node.size or node.extra.get('flavorId')
                    or node.extra.get('instancetype'))

            # Get libcloud tags.
            tags = tags_to_dict(node.extra.get('tags') or
                                node.extra.get('metadata') or {})

            # Get machine tags from db and update libcloud's tag list,
            # overriding in case of conflict.
            tags.update({tag.key: tag.value for tag in Tag.objects(
                owner=self.cloud.owner, resource=Machine(id=node.id),
            ).only('key', 'value')})

            # Construct machine dict.
            machine = {
                'id': node.id,
                'uuid': machine_model.id,
                'name': node.name,
                'image_id': image_id,
                'size': size,
                'state': config.STATES[node.state],
                'private_ips': node.private_ips,
                'public_ips': node.public_ips,
                'tags': tags,
                'extra': node.extra,
                'last_seen': str(machine_model.last_seen or ''),
                'missing_since': str(machine_model.missing_since or ''),
            }
            machine.update(self.get_available_machine_actions(node.id))

            # Apply any cloud/provider specific post processing.
            try:
                self._post_parse_machine(machine, machine_model)
            except Exception as exc:
                log.exception("Error while post parsing machine %s:%s for %s",
                              machine_model.id, node.name, self.cloud)

            # Apply any cloud/provider cost reporting.
            try:
                self._cost_machine(machine, machine_model)
            except Exception as exc:
                log.exception("Error while calculating cost "
                              "for machine %s:%s for %s",
                              machine_model.id, node.name, self.cloud)

            # Make sure we don't meet any surprises when we try to json encode
            # later on in the HTTP response.
            for key, val in machine['extra'].items():
                try:
                    json.dumps(val)
                except TypeError:
                    machine['extra'][key] = str(val)

            # Optimize tags data structure for js...
            tags = machine['tags']
            if isinstance(tags, dict):
                machine['tags'] = [{'key': key, 'value': value}
                                   for key, value in tags.iteritems()
                                   if key != 'Name']

            # Save all changes to machine model on the database.
            # FIXME: This is currently disabled because we want to be able to
            # run tests without using a real mongo instance. It is a temporary
            # solution that will be lifted once we start using mock mongo on
            # tests.
            # machine_model.save()

            machines.append(machine)

        # Set last_seen on machine models we didn't see for the first time now.
        Machine.objects(cloud=self.cloud,
                        id__nin=[m['uuid'] for m in machines],
                        missing_since=None).update(missing_since=now)

        return machines

    def _post_parse_machine(self, machine, machine_model):
        """Post parse a machine before returning it in list_machines

        Any subclass that whishes to specially handle its cloud's tags and
        metadata, can implement this internal method.

        machine: a dict containing all machine metadata gathered from libcloud
                 and the database
        machine_model: A machine mongoengine model. The model may not have yet
                       been saved in the database.

        Note: machine['tags'] is a list of {key: value} pairs.

        This method is expected to edit its argument in place and not return
        anything.

        """
        return

    def _cost_machine(self, machine, machine_model):
        """Perform cost calculations for a machine

        Any subclass that whishes to handle its cloud's pricing, can implement
        this internal method.

        machine: a dict containing all machine metadata gathered from libcloud
                 and the database
        machine_model: A machine mongoengine model. The model may not have yet
                       been saved in the database.

        This method is expected to edit its argument in place and not return
        anything.

        This internal method is called right after _post_parse_machine and has
        the exact same signature. The reason this was split into a secondary
        method is to separate cost processing from generic metadata injection
        in subclasses.

        """
        return

    def list_images(self, search=None):
        return self._post_parse_images(self.connection.list_images(), search)

    def image_is_default(self, image_id):
        return True

    def _post_parse_images(self, images, search=None):

        # Filter out invalid images.
        images = [image for image in images
                  if image.name and image.id[:3] not in ('aki', 'ari')
                  and 'windows' not in image.name.lower()]

        # Filter images based on search term.
        if search:
            search = str(search).lower()
            images = [image for image in images
                      if search in image.id.lower()
                      or search in image.name.lower()]

        # Filter out duplicate images, if any.
        seen_ids = set()
        for i in reversed(xrange(len(images))):
            if image.id in seen_ids:
                images.pop(i)
            else:
                seen_ids.add(image.id)

        # sort images in following groups, then alphabetically:
        # 0: default and starred
        # 1: not default and starred
        # 2: default
        # 3: default and unstarred
        # 4: not default
        # 5: not default and unstarred
        sortvals = {}
        for image in images:
            if self.image_is_default(image.id):
                if image.id in self.cloud.starred:
                    if self.cloud.starred[image.id]:
                        # default and starred
                        sortvals[image.id] = 0
                    else:
                        # default and unstarred
                        sortvals[image.id] = 3
                else:
                    # default
                    sortvals[image.id] = 2
            else:
                if image.id in self.cloud.starred:
                    if self.cloud.starred[image.id]:
                        # not default and starred
                        sortvals[image.id] = 1
                    else:
                        # not default and unstarred
                        sortvals[image.id] = 5
                else:
                    # not default
                    sortvals[image.id] = 4
        images.sort(key=lambda image: (sortvals[image.id], image.name.lower()))

        # Images with sortvals 0, 1, 2 will be labeled as actually starred.
        # These correspond to images that are either starred in the cloud
        # or considered default.
        return [{'id': image.id,
                 'name': image.name,
                 'extra': image.extra,
                 'star': sortvals[image.id] < 3}
                for image in images]

    def list_sizes(self):
        return self._post_parse_sizes(self.connection.list_sizes())

    def _post_parse_sizes(self, sizes):
        return [{'id': size.id,
                 'name': size.name,
                 'bandwidth': size.bandwidth,
                 'disk': size.disk,
                 'driver': size.driver.name,
                 'price': size.price,
                 'ram': size.ram,
                 'extra': size.extra} for size in sizes]

    def list_locations(self):
        """List locations from each cloud

        Locations mean different things in each cloud. e.g. EC2 uses it as a
        datacenter in a given availability zone, whereas Linode lists
        availability zones. However all responses share id, name and country
        eventhough in some cases might be empty, e.g. Openstack.

        """
        try:
            locations = self.connection.list_locations()
        except:
            locations = [NodeLocation('', name='default', country='',
                                      driver=self.connection)]
        return self._post_parse_locations(locations)

    def _post_parse_locations(self, locations):
        return [{'id': location.id,
                 'name': location.name,
                 'country': location.country} for location in locations]

    def list_networks(self):
        raise MistError("Listing networks isn't supported for this provider.")

    def create_machine(self, name, keypair, image_id, *args, **kwargs):
        raise NotImplementedError()

    def get_available_machine_actions(self, machine_id=None):
        return {
            'can_stop': False,
            'can_start': False,
            'can_destroy': False,
            'can_reboot': False,
            'can_tag': False,
        }

    def get_machine_node(self, machine_id, no_fail=False):
        for node in self.connection.list_nodes():
            if node.id == machine_id:
                return node
        if no_fail:
            return Node(machine_id, name=machine_id, state=0,
                        public_ips=[], private_ips=[], driver=self.connection)
        raise MachineNotFoundError("Machine with id '%s'." % machine_id)

    def start_machine(self, machine_id):
        self.connection.ex_start_node(self.get_machine_node(machine_id, True))

    def stop_machine(self, machine_id):
        self.connection.ex_stop_node(self.get_machine_node(machine_id, True))

    def reboot_machine(self, machine_id):
        self.get_machine_node(machine_id, True).reboot()

    def destroy_machine(self, machine_id):
        self.get_machine_node(machine_id, True).destroy()

    def resize_machine(self, machine_id, plan_id):
        self.connection.ex_resize_node(self.get_machine_node(machine_id, True),
                                       plan_id)

    def __del__(self):
        self.disconnect()
