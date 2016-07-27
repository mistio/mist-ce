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


import logging
import tempfile

from xml.sax.saxutils import escape

from libcloud.compute.providers import get_driver
from libcloud.compute.base import NodeImage
from libcloud.compute.types import Provider

from mist.io import config

from mist.core.vpn.methods import destination_nat as dnat

from mist.io.clouds.base import BaseController, tags_to_dict


log = logging.getLogger(__name__)


class AmazonController(BaseController):
    def connect(self):
        return get_driver(Provider.EC2)(self.cloud.apikey,
                                        self.cloud.apisecret,
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


class HostVirtualController(BaseController):
    def connect(self):
        return get_driver(Provider.HOSTVIRTUAL)(self.cloud.apikey)


class PacketController(BaseController):
    def connect(self):
        return get_driver(Provider.PACKET)(self.cloud.apikey,
                                           project=self.cloud.project_id)


class VultrController(BaseController):
    def connect(self):
        return get_driver(Provider.VULTR)(self.cloud.apikey)


class VSphereController(BaseController):
    def connect(self):
        host = dnat(self.cloud.owner, self.cloud.host)
        return get_driver(Provider.VSPHERE)(host=host,
                                            username=self.cloud.username,
                                            password=self.cloud.password)


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
