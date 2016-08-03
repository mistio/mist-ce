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


import json
import logging
import tempfile

from xml.sax.saxutils import escape

import mongoengine as me

from libcloud.compute.providers import get_driver
from libcloud.compute.base import NodeImage
from libcloud.compute.types import Provider


from mist.io import config

from mist.io.exceptions import MistError
from mist.io.exceptions import NotFoundError
from mist.io.exceptions import RequiredParameterMissingError

from mist.io.helpers import sanitize_host

from mist.core.keypair.models import Keypair
from mist.core.vpn.methods import destination_nat as dnat

from mist.io.clouds.base import BaseController, tags_to_dict, rename_kwargs


log = logging.getLogger(__name__)


class AmazonController(BaseController):

    provider = 'ec2'

    def _connect(self):
        return get_driver(Provider.EC2)(self.cloud.apikey,
                                        self.cloud.apisecret,
                                        region=self.cloud.region)

    def add(self, **kwargs):

        # Autofill apisecret from other Amazon Cloud.
        apikey = kwargs.get('apikey') or kwargs.get('api_key')
        apisecret = kwargs.get('apisecret') or kwargs.get('api_secret')
        if apisecret == 'getsecretfromdb':
            cloud = type(self.cloud).objects.first(owner=self.cloud.owner,
                                                   apikey=apikey)
            if cloud is not None:
                kwargs['apisecret'] = cloud.apisecret

        # Translate ec2_ap_northeast to ap-northeast-1.
        region = kwargs.get('region', '')
        if region.startswith('ec2_'):
            region = region[4:]
            parts = region.split('_')
            if not parts[-1].isdigit():
                parts.append('1')
            kwargs['region'] = '-'.join(parts)

        super(AmazonController, self).add(**kwargs)

    def list_images(self, search=None):
        default_images = config.EC2_IMAGES[self.cloud.region]
        image_ids = default_images.keys() + self.cloud.starred
        if not search:
            images = self.connection.list_images(None, image_ids)
            for image in images:
                if image.id in default_images:
                    image.name = default_images[image.id]
            images += self.connection.list_images(ex_owner='self')
        else:
            # FIXME:
            # image_models = CloudImage.objects(
            #     me.Q(cloud_provider=conn.type, image_id__icontains=term) |
            #     me.Q(cloud_provider=conn.type, name__icontains=term)
            # )[:200]
            image_models = []
            images = [NodeImage(id=image.image_id, name=image.name,
                                driver=self.connection, extra={})
                      for image in image_models]
            if not images:
                # Actual search on EC2.
                images = self.connection.list_images(
                    ex_filters={'name': '*%s*' % search}
                )

        return self._post_parse_images(images)

    def list_locations(self):
        """List availability zones for EC2 region

        In EC2 all locations of a region have the same name, so the
        availability zones are listed instead.

        """
        locations = self.connection.list_locations()
        for location in locations:
            try:
                location.name = location.availability_zone.name
            except:
                pass
        return self._post_parse_locations(locations)

    def _post_parse_machine(self, mist_machine_id, api_machine_id, machine_api,
                            machine_model, machine_dict):
        # This is windows for windows servers and None for Linux.
        extra = machine_dict['extra']
        extra['os_type'] = extra.get('platform', 'linux')


class DigitalOceanController(BaseController):

    provider = 'digitalocean'

    def _connect(self):
        return get_driver(Provider.DIGITAL_OCEAN)(self.cloud.token)


class DigitalOceanFirstGenController(BaseController):

    provider = 'digitalocean_first_gen'

    def _connect(self):
        return get_driver(Provider.DIGITAL_OCEAN_FIRST_GEN)(
            self.cloud.apikey, self.cloud.apisecret
        )


class LinodeController(BaseController):

    provider = 'linode'

    def _connect(self):
        return get_driver(Provider.LINODE)(self.cloud.apikey)

    def _post_parse_machine(self, mist_machine_id, api_machine_id, machine_api,
                            machine_model, machine_dict):
        datacenter = machine_dict['extra'].get('DATACENTER')
        datacenter = config.LINODE_DATACENTERS.get(datacenter)
        if datacenter:
            machine_dict['tags']['DATACENTERID'] = datacenter


class RackSpaceController(BaseController):

    provider = 'rackspace'

    def _connect(self):
        if self.cloud.region in ('us', 'uk'):
            driver = get_driver(Provider.RACKSPACE_FIRST_GEN)
        else:
            driver = get_driver(Provider.RACKSPACE)
        return driver(self.cloud.username, self.cloud.apikey,
                      region=self.cloud.region)

    def add(self, **kwargs):
        username = kwargs.get('username')
        apikey = kwargs.get('apikey') or kwargs.get('api_key')
        if apikey == 'getsecretfromdb':
            cloud = type(self.cloud).objects.first(owner=self.cloud.owner,
                                                   username=username)
            if cloud is not None:
                kwargs['apikey'] = cloud.apikey
        super(RackSpaceController, self).add(**kwargs)


class SoftLayerController(BaseController):

    provider = 'softlayer'

    def _connect(self):
        return get_driver(Provider.SOFTLAYER)(self.cloud.username,
                                              self.cloud.apikey)

    def _post_parse_machine(self, mist_machine_id, api_machine_id, machine_api,
                            machine_model, machine_dict):
        machine_dict['extra']['os_type'] = 'linux'
        if 'windows' in str(machine_dict['extra'].get('image', '')).lower():
            machine_dict['extra']['os_type'] = 'windows'


class NephoScaleController(BaseController):

    provider = 'nephoscale'

    def _connect(self):
        return get_driver(Provider.NEPHOSCALE)(self.cloud.username,
                                               self.cloud.password)

    def list_sizes(self):
        sizes = self.connection.list_sizes(baremetal=False)
        sizes.extend(self.connection.list_sizes(baremetal=True))
        return self._post_parse_sizes(sizes)

    def _post_parse_machine(self, mist_machine_id, api_machine_id, machine_api,
                            machine_model, machine_dict):
        machine_dict['extra']['os_type'] = 'linux'
        if 'windows' in str(machine_dict['extra'].get('image', '')).lower():
            machine_dict['extra']['os_type'] = 'windows'


class AzureController(BaseController):

    provider = 'azure'

    def _connect(self):
        tmp_cert_file = tempfile.NamedTemporaryFile(delete=False)
        tmp_cert_file.write(self.cloud.certificate)
        tmp_cert_file.close()
        return get_driver(Provider.AZURE)(self.cloud.subscription_id,
                                          tmp_cert_file.name)

    def list_images(self, search=None):
        images = self.connection.list_images()
        images = [image for image in images
                  if 'RightImage' not in image.name
                  and 'Barracude' not in image.name
                  and 'BizTalk' not in image.name]
        # There are many builds for some images eg Ubuntu.
        # All have the same name!
        images_dict = {}
        for image in images:
            if image.name not in images_dict:
                images_dict[image.name] = image

        return self._post_parse_images(images_dict.values(), search)


class GoogleController(BaseController):

    provider = 'gce'

    def _connect(self):
        return get_driver(Provider.GCE)(self.cloud.email,
                                        self.cloud.private_key,
                                        project=self.cloud.project_id)

    def add(self, **kwargs):
        private_key = kwargs.get('private_key')
        if not private_key:
            raise RequiredParameterMissingError('private_key')
        project_id = kwargs.get('project_id')
        if not project_id:
            raise RequiredParameterMissingError('project_id')
        email = kwargs.get('email', '')
        if not email:
            # Support both ways to authenticate a service account,
            # by either using a project id and json key file (highly
            # recommended) and also by specifying email, project id and private
            # key file.
            try:
                creds = json.loads(private_key)
                kwargs['email'] = creds['client_email']
                kwargs['private_key'] = creds['private_key']
            except:
                raise MistError("Make sure you upload a valid json file.")
        super(GoogleController, self).add(**kwargs)

    def list_images(self, search=None):
        images = self.connection.list_images()

        # GCE has some objects in extra so we make sure they are not passed.
        for image in images:
            image.extra.pop('licenses', None)

        return self._post_parse_images(images, search)

    def list_sizes(self):
        sizes = self.connection.list_sizes()
        for size in sizes:
            zone = size.extra.pop('zone')
            size.extra['zone'] = {
                'id': zone.id,
                'name': zone.name,
                'status': zone.status,
                'country': zone.country,
            }
        return self._post_parse_sizes(sizes)

    def _post_parse_machine(self, mist_machine_id, api_machine_id, machine_api,
                            machine_model, machine_dict):
        extra = machine_dict['extra']

        # Tags and metadata exist in special location for GCE
        tags = tags_to_dict(extra.get('metadata', {}).get('items', []))
        for key in ('gce-initial-windows-password',
                    'gce-initial-windows-user'):
            # Windows specific metadata including user/password.
            if key in tags:
                extra[key] = tags.pop(key)
        tags.update(machine_dict['tags'])
        machine_dict['tags'] = tags

        # Wrap in try/except to prevent from future GCE API changes.

        # Identify server OS.
        machine_dict['extra']['os_type'] = 'linux'
        try:
            if 'windows-cloud' in extra['disks'][0]['licenses'][0]:
                extra['os_type'] = 'windows'
        except:
            log.exception("Couldn't parse os_type for machine %s:%s for %s",
                          mist_machine_id, machine_dict['name'],
                          self.cloud)

        # Get disk metadata.
        try:
            if extra.get('boot_disk'):
                extra['boot_disk_size'] = extra['boot_disk'].size
                extra['boot_disk_type'] = extra['boot_disk'].extra.get('type')
                extra.pop('boot_disk')
        except:
            log.exception("Couldn't parse disk for machine %s:%s for %s",
                          mist_machine_id, machine_dict['name'], self.cloud)

        # Get zone name.
        try:
            if extra.get('zone'):
                extra['zone'] = extra['zone'].name
        except:
            log.exception("Couldn't parse zone for machine %s:%s for %s",
                          mist_machine_id, machine_dict['name'], self.cloud)

        # Get machine type.
        try:
            if extra.get('machineType'):
                extra['machine_type'] = extra['machineType'].split('/')[-1]
        except:
            log.exception("Couldn't parse machine type "
                          "for machine %s:%s for %s",
                          mist_machine_id, machine_dict['name'], self.cloud)


class HostVirtualController(BaseController):

    provider = 'hostvirtual'

    def _connect(self):
        return get_driver(Provider.HOSTVIRTUAL)(self.cloud.apikey)


class PacketController(BaseController):

    provider = 'packet'

    def _connect(self):
        return get_driver(Provider.PACKET)(self.cloud.apikey,
                                           project=self.cloud.project_id)


class VultrController(BaseController):

    provider = 'vultr'

    def _connect(self):
        return get_driver(Provider.VULTR)(self.cloud.apikey)


class VSphereController(BaseController):

    provider = 'vsphere'

    def _connect(self):
        host = dnat(self.cloud.owner, self.cloud.host)
        return get_driver(Provider.VSPHERE)(host=host,
                                            username=self.cloud.username,
                                            password=self.cloud.password)

    def check_connection(self):
        """Check connection without performing `list_machines`

        In vSphere we are sure we got a succesful connection with the provider
        if `self.connect` works, no need to run a `list_machines` to find out.

        """
        self.connect()

    def add(self, **kwargs):
        if not kwargs.get('host'):
            raise RequiredParameterMissingError('host')
        kwargs['host'] = sanitize_host(kwargs['host'])
        super(VSphereController, self).add(**kwargs)


class VCloudController(BaseController):

    provider = 'vcloud'

    def _connect(self):
        host = dnat(self.cloud.owner, self.cloud.host)
        return get_driver(self.provider)(self.cloud.username,
                                         self.cloud.password, host=host,
                                         verify_match_hostname=False)

    def add(self, **kwargs):
        if not kwargs.get('username'):
            raise RequiredParameterMissingError('username')
        if not kwargs.get('organization'):
            raise RequiredParameterMissingError('organization')
        kwargs['username'] = '%s@%s' % (kwargs['username'],
                                        kwargs.pop('organization'))
        if not kwargs.get('host'):
            raise RequiredParameterMissingError('host')
        kwargs['host'] = sanitize_host(kwargs['host'])
        super(VCloudController, self).add(**kwargs)

    def _post_parse_machine(self, mist_machine_id, api_machine_id, machine_api,
                            machine_model, machine_dict):
        if machine_dict['extra'].get('vdc'):
            machine_dict['tags']['vdc'] = machine_dict['extra']['vdc']


class IndonesianVCloudController(VCloudController):

    provider = 'indonesian_vcloud'

    def add(self, **kwargs):
        kwargs.setdefault('host', 'my.idcloudonline.com')
        if kwargs['host'] not in ('my.idcloudonline.com',
                                  'compute.idcloudonline.com'):
            raise me.ValidationError("Invalid host '%s'." % kwargs['host'])
        super(IndonesianVCloudController, self).add(**kwargs)


class OpenStackController(BaseController):

    provider = 'openstack'

    def _connect(self):
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

    def add(self, **kwargs):
        rename_kwargs(kwargs, 'auth_url', 'url')
        url = kwargs.get('url')
        if url:
            if url.endswith('/v2.0/'):
                url = url.split('/v2.0/')[0]
            elif url.endswith('/v2.0'):
                url = url.split('/v2.0')[0]
            kwargs['url'] = url.rstrip('/')
        super(OpenStackController, self).add(**kwargs)


class DockerController(BaseController):

    provider = 'docker'

    def _connect(self):
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

    def add(self, **kwargs):
        rename_kwargs(kwargs, 'docker_port', 'port')
        rename_kwargs(kwargs, 'docker_host', 'host')
        rename_kwargs(kwargs, 'auth_user', 'username')
        rename_kwargs(kwargs, 'auth_password', 'password')
        if kwargs.get('host'):
            kwargs['host'] = sanitize_host(kwargs['host'])
        super(DockerController, self).add(**kwargs)

    def list_images(self, search=None):
        # Fetch mist's recommended images
        images = [NodeImage(id=image, name=name,
                            driver=self.connection, extra={})
                  for image, name in config.DOCKER_IMAGES.items()]

        # Fetch images from libcloud (supports search).
        if search:
            images += self.connection.search_images(term=search)[:100]
        else:
            images += self.connection.list_images()

        # Parse and return images
        return self._post_parse_images(images, search)

    def image_is_default(self, image_id):
        return image_id in config.DOCKER_IMAGES


class LibvirtController(BaseController):

    provider = 'libvirt'

    def _connect(self):
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
                                                ssh_key=self.cloud.key.private,
                                                ssh_port=port)
        else:
            host, port = dnat(self.cloud.owner, self.cloud.host, 5000)
            return get_driver(Provider.LIBVIRT)(host,
                                                hypervisor=self.cloud.host,
                                                user=self.cloud.username,
                                                tcp_port=port)

    def add(self, **kwargs):
        rename_kwargs(kwargs, 'machine_hostname', 'host')
        rename_kwargs(kwargs, 'machine_user', 'username')
        rename_kwargs(kwargs, 'ssh_port', 'port')
        if kwargs.get('host'):
            kwargs['host'] = sanitize_host(kwargs['host'])
        if kwargs.get('key'):
            try:
                kwargs['key'] = Keypair.objects.get(owner=self.cloud.owner,
                                                    id=kwargs['key'])
            except Keypair.DoesNotExist:
                raise NotFoundError("Keypair does not exist.")
        super(LibvirtController, self).add(**kwargs)

    def _post_parse_machine(self, mist_machine_id, api_machine_id, machine_api,
                            machine_model, machine_dict):
        xml_desc = machine_dict['extra'].get('xml_description')
        if xml_desc:
            machine_dict['extra']['xml_description'] = escape(xml_desc)

    def list_images(self, search=None):
        return self._post_parse_images(
            self.connection.list_images(location=self.cloud.images_location),
            search
        )


# FIXME
class CoreOSController(BaseController):

    provider = 'coreos'

    # def _connect(self):
    #     return CoreOSDriver(Machine.objects(cloud=self.cloud))


# FIXME
class OtherController(BaseController):

    provider = 'bare_metal'

    # def _connect(self):
    #     return BareMetalDriver(Machine.objects(cloud=self.cloud))
    pass
