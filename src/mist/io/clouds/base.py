"""Definition of base classes for Clouds

This currently contains only BaseController. It includes basic functionality
for a given cloud (including libcloud calls, fetching and storing information
to db etc. Cloud specific controllers are in `mist.io.clouds.controllers`.

"""

import ssl
import json
import logging
import datetime
import calendar

import mongoengine as me

from libcloud.common.types import InvalidCredsError
from libcloud.compute.types import NodeState
from libcloud.compute.base import NodeLocation

from mist.io import config

from mist.io.exceptions import BadRequestError
from mist.io.exceptions import CloudExistsError
from mist.io.exceptions import InternalServerError
from mist.io.exceptions import CloudUnavailableError
from mist.io.exceptions import CloudUnauthorizedError

from mist.io.helpers import get_datetime

from mist.core.tag.models import Tag

# from mist.core.cloud.models import Machine


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


def rename_kwargs(kwargs, old_key, new_key):
    """Given a `kwargs` dict rename `old_key` to `new_key`"""
    if old_key in kwargs:
        if new_key not in kwargs:
            log.warning("Got param '%s' when expecting '%s', trasforming.",
                        old_key, new_key)
            kwargs[new_key] = kwargs.pop(old_key)
        else:
            log.warning("Got both param '%s' and '%s', will not tranform.",
                        old_key, new_key)


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

    Any methods and attributes that don't start with an underscore are the
    controller's public API.

    In the `BaseController`, these public methods will in most cases contain
    a basic implementation that works for most clouds, along with the proper
    logging and error handling. In almost all cases, subclasses SHOULD NOT
    override or extend the public methods of `BaseController`. To account for
    cloud/subclass specific behaviour, one is expected to override the
    internal/private methods of `BaseController`.

    Any methods and attributes that start with an underscore are the
    controller's internal/private API.

    To account for cloud/subclass specific behaviour, the public methods of
    `BaseController` call a number of private methods. These methods will
    always start with an underscore, such as `self._connect`. When an internal
    method is only ever used in the process of one public method, it is
    prefixed as such to make identification and purpose more obvious. For
    example, method `self._list_machines__postparse_machine` is called in the
    process of `self.list_machines` to postparse a machine and inject or
    modify its attributes.

    This `BaseController` defines a strict interface to controlling clouds.
    For each different cloud type, a subclass needs to be defined. The subclass
    must at least define a proper `self._connect` method. For simple clouds,
    this may be enough. To provide cloud specific processing, hook the code on
    the appropriate private method. Each method defined here documents its
    intended purpose and use.

    """

    def __init__(self, cloud):
        """Initialize cloud controller given a cloud

        Most times one is expected to access a controller from inside the
        cloud, like this:

            cloud = mist.io.clouds.models.Cloud.objects.get(id=cloud_id)
            print cloud.ctl.list_machines()

        Subclasses SHOULD NOT override this method.

        If a subclass has to initialize a certain instance attribute, it SHOULD
        extend this method instead.

        """

        self.cloud = cloud
        self._conn = None

    @property
    def connection(self):
        """Cached libcloud connection, accessible as attribute

        Subclasses SHOULD NOT have to override or extend this method.

        """
        if self._conn is None:
            self._conn = self.connect()
        return self._conn

    def connect(self):
        """Return libcloud-like connection to cloud

        This is a wrapper, an error handler, around cloud specific `_connect`
        methods.

        Subclasses SHOULD NOT override or extend this method.

        Instead, subclasses MUST override `_connect` method.

        """
        try:
            return self._connect()
        except (CloudUnavailableError, CloudUnauthorizedError) as exc:
            log.error("Error adding cloud %s: %r", self.cloud, exc)
            raise
        except InvalidCredsError as exc:
            log.warning("Invalid creds while connecting to %s: %s",
                        self.cloud, exc)
            raise CloudUnauthorizedError("Invalid creds.")
        except ssl.SSLError as exc:
            log.error("SSLError on connecting to %s: %s", self.cloud, exc)
            raise CloudUnavailableError(exc=exc)
        except Exception as exc:
            log.exception("Error while connecting to %s", self.cloud)
            raise CloudUnavailableError(exc=exc)

    def _connect(self):
        """Return libcloud-like connection to cloud

        This is called solely by `connect` which adds error handling.

        All subclasses MUST implement this method.

        """
        raise NotImplementedError()

    def check_connection(self):
        """Raise exception if we can't connect to cloud provider

        In case of error, an instance of `CloudUnavailableError` or
        `CloudUnauthorizedError` should be raised.

        For most cloud providers, who use an HTTP API, calling `connect`
        doesn't really establish a connection, so we also have to attempt to
        make an actual call such as `list_machines` to verify that the
        connection actually works.

        If a subclass's `connect` not raising errors is enough to make sure
        that establishing a connection works, then these subclasses should
        override this method and only call `connect`.

        In most cases, subclasses SHOULD NOT override or extend this method.

        """
        self.connect()
        self.list_machines()

    def disconnect(self):
        """Close libcloud-like connection to cloud

        If a connection object has been initialized, this method will attempt
        to call its disconnect method.

        This method is called automatically called by the class's destructor.
        This may however be unreliable, so users should call `disconnect`
        manually to be on the safe side.

        For cloud providers whose connection object is dummy in the sense that
        it doesn't represent an actual underlying connection, this method
        doesn't really do anything.

        Subclasses SHOULD NOT override this method.

        If a subclass has to perform some special clean up, like deleting
        temporary files, it SHOULD *extend* this method instead.

        """
        if self._conn is not None:
            log.debug("Closing libcloud-like connection for %s.", self.cloud)
            self._conn.disconnect()
            self._conn = None

    def add(self, remove_on_error=True, fail_on_invalid_params=True, **kwargs):
        """Add new Cloud to the database

        This is only expected to be called by `Cloud.add` classmethod to create
        a cloud. Fields `owner` and `title` are already populated in
        `self.cloud`. The `self.cloud` model is not yet saved.

        Params:
        remove_on_error: If True, then a connection to the cloud will be
            established and if it fails, a `CloudUnavailableError` or
            `CloudUnauthorizedError` will be raised and the cloud will be
            deleted.
        fail_on_invalid_params: If True, then invalid keys in `kwargs` will
            raise an Error.

        Subclasses SHOULD NOT override or extend this method.

        If a subclass has to perform special parsing of `kwargs`, it can
        override `self._add__preparse_kwargs`.

        """

        # Transform params with extra underscores for compatibility.
        rename_kwargs(kwargs, 'api_key', 'apikey')
        rename_kwargs(kwargs, 'api_secret', 'apisecret')

        # Cloud specific kwargs preparsing.
        try:
            self._add__preparse_kwargs(kwargs)
        except Exception as exc:
            log.exception("Error while preparsing kwargs on add %s",
                          self.cloud)
            raise InternalServerError(exc=exc)

        # Basic param check.
        errors = {}
        # Check for invalid `kwargs` keys.
        for key in kwargs.keys():
            if key not in self.cloud._cloud_specific_fields:
                error = "Invalid parameter %s=%r." % (key, kwargs[key])
                if fail_on_invalid_params:
                    errors[key] = error
                else:
                    log.warning(error)
                    kwargs.pop(key)
        # Check for missing required `kwargs` keys.
        for key in self.cloud._cloud_specific_fields:
            if self.cloud._fields[key].required and key not in kwargs:
                errors[key] = "Required parameter missing '%s'." % key
        if errors:
            raise BadRequestError({
                'msg': "Invalid parameters %s." % errors.keys(),
                'errors': errors,
            })

        # Set fields to cloud model and attempt to save.
        for key, value in kwargs.iteritems():
            setattr(self.cloud, key, value)
        try:
            self.cloud.save()
        except me.ValidationError as exc:
            raise BadRequestError({'msg': exc.message,
                                   'errors': exc.to_dict()})
        except me.NotUniqueError:
            raise CloudExistsError()

        # Try to connect to cloud.
        if remove_on_error:
            try:
                try:
                    self.check_connection()
                except (CloudUnavailableError, CloudUnauthorizedError) as exc:
                    log.error("Removing cloud %s because "
                              "we couldn't connect: %r", self.cloud, exc)
                    raise
                except Exception as exc:
                    log.exception("Removing cloud %s because "
                                  "we couldn't connect.", self.cloud)
                    raise CloudUnavailableError(exc=exc)
            except:
                self.cloud.delete()
                raise

    def _add__preparse_kwargs(self, kwargs):
        """Preparse keyword arguments to `self.add`

        This is called by `self.add` when adding a new cloud, in order to apply
        preprocessing to the given params. Any subclass that requires any
        special preprocessing of the params passed to `self.add`, SHOULD
        override this method.

        Params:
        kwargs: A dict of the keyword arguments that will be set as attributes
            to the `Cloud` model instance stored in `self.cloud`. This method
            is expected to modify `kwargs` in place.

        Subclasses MAY override this method.

        """
        return

    def list_machines(self):
        """Return list of machines for cloud

        This returns the results obtained from libcloud, after some processing,
        formatting and injection of extra information in a sane format.

        Subclasses SHOULD NOT override or extend this method.

        There are instead a number of methods that are called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. These methods currently are:

            `self._list_machines__machine_actions`
            `self._list_machines__postparse_machine`
            `self._list_machines__cost_machine`

        Subclasses that require special handling should override these, by
        default, dummy methods.

        """

        # FIXME: Move this to top of the file once Machine model is migrated.
        # The import statement is currently here to avoid circular import
        # issues.
        from mist.core.cloud.models import Machine

        # Try to query list of machines from provider API.
        try:
            nodes = self.connection.list_nodes()
            log.info("List nodes returned %d results for %s.",
                     len(nodes), self.cloud)
        except InvalidCredsError as exc:
            log.warning("Invalid creds on running list_nodes on %s: %s",
                        self.cloud, exc)
            raise CloudUnauthorizedError()
        except ssl.SSLError as exc:
            log.error("SSLError on running list_nodes on %s: %s",
                      self.cloud, exc)
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

            # Update machine_model's last_seen fields.
            machine_model.last_seen = now
            machine_model.missing_since = None

            # Get misc libcloud metadata.
            image_id = str(node.image or node.extra.get('imageId') or
                           node.extra.get('image_id') or
                           node.extra.get('image') or '')
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
                'created': str(machine_model.created or ''),
            }

            # Get machine creation date.
            try:
                created = self._list_machines__machine_creation_date(node)
                if created:
                    machine_model.created = get_datetime(created)
            except Exception as exc:
                log.exception("Error finding creation date for %s in %s.",
                              self.cloud, machine_model)
            # TODO: Consider if we should fall back to using current date.
            # if not machine_model.created:
            #     machine_model.created = datetime.datetime.utcnow()

            # Update with available machine actions.
            try:
                self._list_machines__machine_actions(
                    machine_model.id, node.id, node, machine_model, machine
                )
            except Exception as exc:
                log.exception("Error while finding machine actions "
                              "for machine %s:%s for %s",
                              machine_model.id, node.name, self.cloud)

            # Apply any cloud/provider specific post processing.
            try:
                self._list_machines__postparse_machine(
                    machine_model.id, node.id, node, machine_model, machine
                )
            except Exception as exc:
                log.exception("Error while post parsing machine %s:%s for %s",
                              machine_model.id, node.name, self.cloud)

            # Apply any cloud/provider cost reporting.
            try:
                def parse_num(num):
                    try:
                        return float(num or 0)
                    except (ValueError, TypeError):
                        log.warning("Can't parse %r as float.", num)
                        return 0

                month_days = calendar.monthrange(now.year, now.month)[1]

                cph = parse_num(machine['tags'].get('cost_per_hour'))
                cpm = parse_num(machine['tags'].get('cost_per_month'))
                if not (cph or cpm) or cph > 100 or cpm > 100 * 24 * 31:
                    cph, cpm = map(parse_num,
                                   self._list_machines__cost_machine(node))
                if cph or cpm:
                    if not cph:
                        cph = cpm / month_days / 24
                    elif not cpm:
                        cpm = cph * 24 * month_days
                    machine['extra']['cost_per_hour'] = '%.2f' % cph
                    machine['extra']['cost_per_month'] = '%.2f' % cpm

            except Exception as exc:
                log.exception("Error while calculating cost "
                              "for machine %s:%s for %s",
                              machine_model.id, node.name, self.cloud)
            if node.state.lower() == 'terminated':
                machine['extra'].pop('cost_per_hour', None)
                machine['extra'].pop('cost_per_month', None)

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
            machine_model.save()

            machines.append(machine)

        # Set last_seen on machine models we didn't see for the first time now.
        Machine.objects(cloud=self.cloud,
                        id__nin=[m['uuid'] for m in machines],
                        missing_since=None).update(missing_since=now)

        return machines

    def _list_machines__machine_creation_date(self, machine_api):
        return

    def _list_machines__machine_actions(self, mist_machine_id, api_machine_id,
                                        machine_api, machine_model,
                                        machine_dict):
        """Add metadata on the machine dict on the allowed actions

        Any subclass that wishes to specially handle its allowed actions, can
        implement this internal method.

        mist_machine_id: The id assigned to the machine by mist. This is the
            machine's primary key in the database and the mist API.
        api_machine_id: The id assigned to the machine by its cloud. This is
            not guaranteed to be globally unique.
        machine_api: An instance of a libcloud compute node, as returned by
            libcloud's list_nodes.
        machine_dict: A dict containing all machine metadata gathered from
            libcloud and the database. This is what gets returned by mist's
            API.
        machine_model: A machine mongoengine model. The model may not have yet
            been saved in the database.

        This method is expected to edit `machine_dict` in place and not return
        anything.

        Subclasses MAY extend this method.

        """
        # Defaults for running state and common clouds.
        can_start = False
        can_stop = True
        can_reboot = True
        can_destroy = True
        can_rename = False  # Most providers do not support renaming.
        can_tag = True  # Always True now that we store tags in db.

        # Actions resume, suspend and undefine are states related to KVM.
        can_resume = False
        can_suspend = False
        can_undefine = False

        # Default actions for other states.
        if machine_api.state in (NodeState.REBOOTING, NodeState.PENDING):
            can_start = False
            can_stop = False
            can_reboot = False
        elif machine_api.state in (NodeState.STOPPED, NodeState.UNKNOWN):
            # We assume unknown state means stopped.
            can_start = True
            can_stop = False
            can_reboot = False
        elif machine_api.state in (NodeState.TERMINATED, ):
            can_start = False
            can_stop = False
            can_reboot = False
            can_destroy = False
            can_rename = False

        machine_dict.update({
            'can_start': can_start,
            'can_stop': can_stop,
            'can_reboot': can_reboot,
            'can_destroy': can_destroy,
            'can_rename': can_rename,
            'can_tag': can_tag,
            'can_resume': can_resume,
            'can_suspend': can_suspend,
            'can_undefine': can_undefine,
        })

    def _list_machines__postparse_machine(self, mist_machine_id,
                                          api_machine_id, machine_api,
                                          machine_model, machine_dict):
        """Post parse a machine before returning it in list_machines

        Any subclass that wishes to specially handle its cloud's tags and
        metadata, can implement this internal method.

        mist_machine_id: The id assigned to the machine by mist. This is the
            machine's primary key in the database and the mist API.
        api_machine_id: The id assigned to the machine by its cloud. This is
            not guaranteed to be globally unique.
        machine_api: An instance of a libcloud compute node, as returned by
            libcloud's list_nodes.
        machine_dict: A dict containing all machine metadata gathered from
            libcloud and the database. This is what gets returned by mist's
            API.
        machine_model: A machine mongoengine model. The model may not have yet
            been saved in the database.

        Note: machine_dict['tags'] is a list of {key: value} pairs.

        This method is expected to edit its arguments in place and not return
        anything.

        Subclasses MAY override this method.

        """
        return

    def _list_machines__cost_machine(self, machine_api):
        """Perform cost calculations for a machine

        Any subclass that wishes to handle its cloud's pricing, can implement
        this internal method.

        Params:
        machine_api: An instance of a libcloud compute node, as returned by
            libcloud's list_nodes.

        This method is expected to return a tuple of two values:
            (cost_per_hour, cost_per_month)

        Subclasses MAY override this method.

        """
        return 0, 0

    def list_images(self, search=None):
        """Return list of images for cloud

        This returns the results obtained from libcloud, after some processing,
        formatting and injection of extra information in a sane format.

        Subclasses SHOULD NOT override or extend this method.

        There are instead a number of methods that are called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. These methods currently are:

            `self._list_images__fetch_images`

        Subclasses that require special handling should override these, by
        default, dummy methods.

        """

        # Fetch images list, usually from libcloud connection.
        images = self._list_images__fetch_images(search=search)
        if not isinstance(images, list):
            images = list(images)

        # Filter out duplicate images, if any.
        seen_ids = set()
        for i in reversed(xrange(len(images))):
            image = images[i]
            if image.id in seen_ids:
                images.pop(i)
            else:
                seen_ids.add(image.id)

        # Filter images based on search term.
        if search:
            search = str(search).lower()
            images = [img for img in images
                      if search in img.id.lower()
                      or search in img.name.lower()]

        # Filter out invalid images.
        images = [img for img in images
                  if img.name and img.id[:3] not in ('aki', 'ari')
                  and 'windows' not in img.name.lower()]

        # Sort images in following groups, then alphabetically:
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

    def _list_images__fetch_images(self, search=None):
        """Fetch image listing in a libcloud compatible format

        This is to be called exclusively by `self.list_images`.

        Most subclasses that use a simple libcloud connection, shouldn't need
        to override or extend this method.

        Subclasses MAY override this method.

        """
        return self.connection.list_images()

    def image_is_default(self, image_id):
        # FIXME
        return True

    def list_sizes(self):
        """Return list of sizes for cloud

        This returns the results obtained from libcloud, after some processing,
        formatting and injection of extra information in a sane format.

        Subclasses SHOULD NOT override or extend this method.

        There are instead a number of methods that are called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. These methods currently are:

            `self._list_sizes__fetch_sizes`

        Subclasses that require special handling should override these, by
        default, dummy methods.

        """

        # Fetch sizes, usually from libcloud connection.
        sizes = self._list_sizes__fetch_sizes()

        # Format size information.
        return [{'id': size.id,
                 'name': size.name,
                 'bandwidth': size.bandwidth,
                 'disk': size.disk,
                 'driver': size.driver.name,
                 'price': size.price,
                 'ram': size.ram,
                 'extra': size.extra} for size in sizes]

    def _list_sizes__fetch_sizes(self):
        """Fetch size listing in a libcloud compatible format

        This is to be called exclusively by `self.list_sizes`.

        Most subclasses that use a simple libcloud connection, shouldn't need
        to override or extend this method.

        Subclasses MAY override this method.

        """
        return self.connection.list_sizes()

    def list_locations(self):
        """Return list of available locations for current cloud

        Locations mean different things in each cloud. e.g. EC2 uses it as a
        datacenter in a given availability zone, whereas Linode lists
        availability zones. However all responses share id, name and country
        eventhough in some cases might be empty, e.g. Openstack.

        This returns the results obtained from libcloud, after some processing,
        formatting and injection of extra information in a sane format.

        Subclasses SHOULD NOT override or extend this method.

        There are instead a number of methods that are called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. These methods currently are:

            `self._list_locations__fetch_locations`

        Subclasses that require special handling should override these, by
        default, dummy methods.

        """

        # Fetch locations, usually from libcloud connection.
        locations = self._list_locations__fetch_locations()

        # Format size information.
        return [{'id': location.id,
                 'name': location.name,
                 'country': location.country} for location in locations]

    def _list_locations__fetch_locations(self):
        """Fetch location listing in a libcloud compatible format

        This is to be called exclusively by `self.list_locations`.

        Most subclasses that use a simple libcloud connection, shouldn't need
        to override or extend this method.

        Subclasses MAY override this method.

        """
        try:
            return self.connection.list_locations()
        except:
            return [NodeLocation('', name='default', country='',
                                 driver=self.connection)]

    def __del__(self):
        """Disconnect libcloud connection upon garbage collection"""
        self.disconnect()
