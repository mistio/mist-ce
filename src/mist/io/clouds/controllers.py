"""Cloud Controllers

A cloud controller handles all operations that can be performed on a cloud,
commonly using libcloud under the hood.

It also performs several steps and combines the information stored in the
database with that returned from API calls to providers.

For each different cloud type, there is a corresponding cloud controller
defined here. All the different classes inherit BaseController and share a
commmon interface, with the exception that some controllers may not have
implemented all methods.

A cloud controller is initialized given a cloud. Most of the time it will be
accessed through a cloud model, using the `ctl` abbreviation, like this:

    cloud = mist.io.clouds.models.Cloud.objects.get(id=cloud_id)
    print cloud.ctl.list_machines()
"""


import ssl
import json
import logging
import datetime
import tempfile

from xml.sax.saxutils import escape

from libcloud.compute.providers import get_driver
from libcloud.compute.base import Node, NodeImage, NodeLocation
from libcloud.compute.types import Provider
from libcloud.common.types import InvalidCredsError

from mist.io import config

from mist.io.exceptions import MistError
from mist.io.exceptions import MachineNotFoundError
from mist.io.exceptions import CloudUnavailableError
from mist.io.exceptions import CloudUnauthorizedError

from mist.core.tag.models import Tag
from mist.core.cloud.models import Machine
from mist.core.vpn.methods import destination_nat as dnat


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
        images = [image for image in images
                  if image.name and image.id[:3] not in ('aki', 'ari')
                  and 'windows' not in image.name.lower()
                  and 'hvm' not in image.name.lower()]
        if search:
            search = str(search).lower()
            images = [image for image in images
                      if search in image.id.lower()
                      or search in image.name.lower()]

        # sort images in following groups, then alphabetically:
        # {0: default and starred, 1: default,
        #  2: not default and starred, 3: default and unstarred,
        #  4: not default, 5: not default and unstarred}
        # if self.default_images is empty, all images are considered to be
        # default
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
                    sortvals[image.id] = 1
            else:
                if image.id in self.cloud.starred:
                    if self.cloud.starred[image.id]:
                        # not default and starred
                        sortvals[image.id] = 2
                    else:
                        # not default and unstarred
                        sortvals[image.id] = 5
                else:
                    # not default
                    sortvals[image.id] = 4
        images.sort(key=lambda image: (sortvals[image.id], image.name.lower()))

        # images with sortvals 0, 1, 2 will be labeled as actually starred
        # these correspond to images that are either starred in the cloud
        # or considered default
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
                 'ram': size.ram} for size in sizes]

    def list_locations(self):
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


class AmazonController(BaseController):
    def connect(self):
        return get_driver(Provider.EC2)(self.cloud.apikey,
                                        self.cloud.api_secret,
                                        region=self.cloud.region)

    def list_images(self, search=None):
        default_images = config.EC2_IMAGES[self.cloud.region]
        starred_ids = [image_id for image_id in self.cloud.starred
                       if self.cloud.starred[image_id]
                       and image_id not in default_images]
        image_ids = default_images.keys() + starred_ids
        images = self.connection.list_images(None, image_ids)
        for image in images:
            if image.id in default_images:
                image.name = default_images[image.id]
        images += self.connection.list_images(ex_owner='amazon')
        images += self.connection.list_images(ex_owner='self')
        return self._post_parse_images(images)

    def list_locations(self):
        locations = self.connection.list_locations()
        for location in locations:
            try:
                location.name = location.availability_zone.name
            except:
                pass
        return self._post_parse_locations(locations)

    def _post_parse_machine(self, machine, machine_model):
        # This is windows for windows servers and None for Linux.
        machine['extra']['os_type'] = machine['extra'].get('platform', 'linux')


class DigitalOceanController(BaseController):
    def connect(self):
        return get_driver(Provider.DIGITAL_OCEAN)(self.cloud.token)


class DigitalOceanFirstGenController(BaseController):
    def connect(self):
        return get_driver(Provider.DIGITAL_OCEAN_FIRST_GEN)(
            self.cloud.apikey, self.cloud.apisecret
        )


class LinodeController(BaseController):
    def connect(self):
        return get_driver(Provider.LINODE)(self.cloud.apikey)

    def _post_parse_machine(self, machine, machine_model):
        datacenter = machine['extra'].get('DATACENTER')
        datacenter = config.LINODE_DATACENTERS.get(datacenter)
        if datacenter:
            machine['tags']['DATACENTERID'] = datacenter


class RackSpaceController(BaseController):
    def connect(self):
        if self.cloud.region in ('us', 'uk'):
            driver = get_driver(Provider.RACKSPACE_FIRST_GEN)
        else:
            driver = get_driver(Provider.RACKSPACE)
        return driver(self.cloud.username, self.cloud.apikey,
                      region=self.cloud.region)


class SoftLayerController(BaseController):
    def connect(self):
        return get_driver(Provider.SOFTLAYER)(self.cloud.username,
                                              self.cloud.apikey)

    def _post_parse_machine(self, machine, machine_model):
        machine['extra']['os_type'] = 'linux'
        if 'windows' in str(machine['extra'].get('image', '')).lower():
            machine['extra']['os_type'] = 'windows'


class NephoScaleController(BaseController):
    def connect(self):
        return get_driver(Provider.NEPHOSCALE)(self.cloud.username,
                                               self.cloud.password)

    def list_sizes(self):
        sizes = self.connection.list_sizes(baremetal=False)
        sizes.extend(self.connection.list_sizes(baremetal=True))
        return self._post_parse_sizes(sizes)

    def _post_parse_machine(self, machine, machine_model):
        machine['extra']['os_type'] = 'linux'
        if 'windows' in str(machine['extra'].get('image', '')).lower():
            machine['extra']['os_type'] = 'windows'


class AzureController(BaseController):
    def connect(self):
        tmp_cert_file = tempfile.NamedTemporaryFile(delete=False)
        tmp_cert_file.write(self.cloud.certificate)
        tmp_cert_file.close()
        return get_driver(Provider.AZURE)(self.cloud.subscription_id,
                                          tmp_cert_file.name)

    def list_images(self, search=None):
        images = self.connection.list_images()
        images = [image for image in images
                  if 'windows' not in image.name.lower()
                  and 'RightImage' not in image.name]
        # there are many builds for some images eg Ubuntu).
        # All have the same name!
        images_dict = {}
        for image in images:
            if image.name not in images_dict:
                images_dict[image.name] = image
        images = sorted(images_dict.values(), key=lambda image: image.name)
        return self._post_parse_images(images, search)


class GoogleController(BaseController):
    def connect(self):
        return get_driver(Provider.GCE)(self.cloud.email,
                                        self.cloud.private_key,
                                        project=self.cloud.project_id)

    def list_images(self, search=None):
        images = self.connection.list_images()
        for project in ('debian-cloud', 'centos-cloud',
                        'suse-cloud', 'rhel-cloud'):
            try:
                images += self.connection.list_images(ex_project=project)
            except:
                pass
        images = [image for image in images if not image.extra['deprecated']]
        return self._post_parse_images(images, search)

    def list_sizes(self):
        # have to get sizes for one location only, since list_sizes returns
        # sizes for all zones (currently 88 sizes)
        sizes = self.connection.list_sizes(location='us-central1-a')
        # deprecated sizes for GCE
        sizes = [size for size in sizes
                 if size.name and not size.name.endswith('-d')]
        return self._post_parse_sizes(sizes)

    def _post_parse_machine(self, machine, machine_model):
        extra = machine['extra']

        # Tags and metadata exist in special location for GCE
        tags = tags_to_dict(extra.get('metadata', {}).get('items', []))
        for key in ('gce-initial-windows-password',
                    'gce-initial-windows-user'):
            # Windows specific metadata including user/password.
            if key in tags:
                extra[key] = tags.pop(key)
        tags.update(machine['tags'])
        machine['tags'] = tags

        # Wrap in try/except to prevent from future GCE API changes.

        # Identify server OS.
        machine['extra']['os_type'] = 'linux'
        try:
            if 'windows-cloud' in extra['disks'][0]['licenses'][0]:
                extra['os_type'] = 'windows'
        except:
            log.exception("Couldn't parse os_type for machine %s:%s for %s",
                          machine['uuid'], machine['name'], self.cloud)

        # Get disk metadata.
        try:
            if extra.get('boot_disk'):
                extra['boot_disk_size'] = extra['boot_disk'].size
                extra['boot_disk_type'] = extra['boot_disk'].extra.get('type')
                extra.pop('boot_disk')
        except:
            log.exception("Couldn't parse disk for machine %s:%s for %s",
                          machine['uuid'], machine['name'], self.cloud)

        # Get zone name.
        try:
            if extra.get('zone'):
                extra['zone'] = extra['zone'].name
        except:
            log.exception("Couldn't parse zone for machine %s:%s for %s",
                          machine['uuid'], machine['name'], self.cloud)

        # Get machine type.
        try:
            if extra.get('machineType'):
                extra['machine_type'] = extra['machineType'].split('/')[-1]
        except:
            log.exception("Couldn't parse machine type "
                          "for machine %s:%s for %s",
                          machine['uuid'], machine['name'], self.cloud)


# FIXME
class HostVirtualController(BaseController):
    def connect(self):
        return get_driver(Provider.HOSTVIRTUAL)(self.cloud.apikey)


# FIXME
class PacketController(BaseController):
    def connect(self):
        return get_driver(Provider.PACKET)(self.cloud.apikey,
                                           project=self.cloud.project_id)


# FIXME
class VultrController(BaseController):
    def connect(self):
        return get_driver(Provider.VULTR)(self.cloud.apikey)


# FIXME
class VSphereController(BaseController):
    def connect(self):
        host = dnat(self.cloud.owner, self.cloud.host)
        return get_driver(Provider.VSPHERE)(host=host,
                                            username=self.cloud.username,
                                            password=self.cloud.password)


# FIXME
class VCloudController(BaseController):
    def connect(self):
        host = dnat(self.cloud.owner, self.cloud.host)
        return get_driver(Provider.VCLOUD)(self.cloud.username,
                                           self.cloud.password, host=host,
                                           verify_match_hostname=False)

    def _post_parse_machine(self, machine, machine_model):
        if machine['extra'].get('vdc'):
            machine['tags']['vdc'] = machine['extra']['vdc']


class OpenStackController(BaseController):
    def connect(self):
        url = dnat(self.cloud.owner, self.cloud.url)
        return get_driver(Provider.OPENSTACK)(
            self.cloud.username,
            self.cloud.password,
            ex_force_auth_version='2.0_password',
            ex_force_auth_url=url,
            ex_tenant_name=self.cloud.tenant,
            ex_force_service_region=self.cloud.region,
            ex_force_base_url=self.cloud.compute_endpoint,
        )


class DockerController(BaseController):
    def connect(self):
        host, port = dnat(self.cloud.owner, self.cloud.host, self.cloud.port)

        # TLS authentication.
        if self.cloud.key_file and self.cloud.cert_file:
            key_temp_file = tempfile.NamedTemporaryFile(delete=False)
            key_temp_file.write(self.cloud.key_file)
            key_temp_file.close()
            cert_temp_file = tempfile.NamedTemporaryFile(delete=False)
            cert_temp_file.write(self.cloud.cert_file)
            cert_temp_file.close()
            ca_cert = None
            if self.cloud.ca_cert_file:
                ca_cert_temp_file = tempfile.NamedTemporaryFile(delete=False)
                ca_cert_temp_file.write(self.cloud.ca_cert_file)
                ca_cert_temp_file.close()
                ca_cert = ca_cert_temp_file.name
            return get_driver(Provider.DOCKER)(host=host,
                                               port=port,
                                               key_file=key_temp_file.name,
                                               cert_file=cert_temp_file.name,
                                               ca_cert=ca_cert,
                                               verify_match_hostname=False)

        # Username/Password authentication.
        return get_driver(Provider.DOCKER)(self.cloud.username,
                                           self.cloud.password,
                                           host, port)

    def list_images(self, search=None):
        mist_images = [NodeImage(id=image, name=name,
                                 driver=self.connection, extra={})
                       for image, name in config.DOCKER_IMAGES.items()]
        if search:
            images = self.connection.search_images(term=search)
            parsed = self._post_parse_images(mist_images, search)
            return parsed + self._post_parse_images(images)
        else:
            images = self.connection.list_images()
            return self._post_parse_images(mist_images + images)

    def image_is_default(self, image_id):
        return image_id in config.DOCKER_IMAGES


# FIXME
class LibvirtController(BaseController):
    def connect(self):
        """Three supported ways to connect: local system, qemu+tcp, qemu+ssh"""

        import libcloud.compute.drivers.libvirt_driver
        libvirt_driver = libcloud.compute.drivers.libvirt_driver
        libvirt_driver.ALLOW_LIBVIRT_LOCALHOST = config.ALLOW_LIBVIRT_LOCALHOST

        if self.cloud.key:
            host, port = dnat(self.cloud.owner,
                              self.cloud.host, self.cloud.port)
            return get_driver(Provider.LIBVIRT)(host,
                                                hypervisor=self.cloud.host,
                                                user=self.cloud.username,
                                                ssh_key=self.cloud.key,
                                                ssh_port=port)
        else:
            host, port = dnat(self.cloud.owner, self.cloud.host, 5000)
            return get_driver(Provider.LIBVIRT)(host,
                                                hypervisor=self.cloud.host,
                                                user=self.cloud.username,
                                                tcp_port=port)

    def _post_parse_machine(self, machine, machine_model):
        xml_desc = machine['extra'].get('xml_description')
        if xml_desc:
            machine['extra']['xml_description'] = escape(xml_desc)


# FIXME
class CoreOSController(BaseController):
    # def connect(self):
    #     return CoreOSDriver(Machine.objects(cloud=self.cloud))
    pass


# FIXME
class OtherController(BaseController):
    # def connect(self):
    #     return BareMetalDriver(Machine.objects(cloud=self.cloud))
    pass
