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


import uuid
import json
import socket
import logging
import tempfile

from xml.sax.saxutils import escape

import mongoengine as me

from libcloud.pricing import get_size_price
from libcloud.compute.base import Node, NodeImage
from libcloud.compute.providers import get_driver
from libcloud.compute.types import Provider, NodeState
from libcloud.utils.networking import is_private_subnet


from mist.io import config

from mist.io.exceptions import MistError
from mist.io.exceptions import NotFoundError
from mist.io.exceptions import BadRequestError
from mist.io.exceptions import CloudExistsError
from mist.io.exceptions import InternalServerError
from mist.io.exceptions import MachineNotFoundError
from mist.io.exceptions import CloudUnauthorizedError
from mist.io.exceptions import ServiceUnavailableError
from mist.io.exceptions import MachineUnauthorizedError
from mist.io.exceptions import RequiredParameterMissingError

from mist.io.helpers import sanitize_host, check_host

from mist.core.keypair.models import Keypair
from mist.core.vpn.methods import destination_nat as dnat
from mist.core.vpn.methods import to_tunnel

from mist.io.bare_metal import BareMetalDriver

from mist.io.clouds.base import BaseController, rename_kwargs


log = logging.getLogger(__name__)


class AmazonController(BaseController):

    provider = 'ec2'

    def _connect(self):
        return get_driver(Provider.EC2)(self.cloud.apikey,
                                        self.cloud.apisecret,
                                        region=self.cloud.region)

    def _add__preparse_kwargs(self, kwargs):

        # Autofill apisecret from other Amazon Cloud.
        apikey = kwargs.get('apikey')
        apisecret = kwargs.get('apisecret')
        if apisecret == 'getsecretfromdb':
            cloud = type(self.cloud).objects(owner=self.cloud.owner,
                                             apikey=apikey).first()
            if cloud is not None:
                kwargs['apisecret'] = cloud.apisecret

        # Regions translations, eg ec2_ap_northeast to ap-northeast-1.
        region = kwargs.get('region', '')
        if region.startswith('ec2_'):
            region = region[4:]
            parts = region.split('_')
            if parts[-1] == 'oregon':
                parts[-1] = '2'
            if not parts[-1].isdigit():
                parts.append('1')
            kwargs['region'] = '-'.join(parts)

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.created_at  # datetime

    def _list_machines__machine_actions(self, machine, machine_libcloud):
        super(AmazonController, self)._list_machines__machine_actions(
               machine, machine_libcloud)
        machine.actions.rename = True

    def _list_machines__postparse_machine(self, machine, machine_libcloud):
        # This is windows for windows servers and None for Linux.
        machine.os_type = machine_libcloud.extra.get('platform', 'linux')

    def _list_machines__cost_machine(self,  machine, machine_libcloud):
        image_id = machine_libcloud.extra.get('image_id')
        try:
            # FIXME: This is here to avoid circular imports.
            from mist.core.cloud.models import CloudImage
            os_type = CloudImage.objects.get(
                cloud_provider=machine_libcloud.driver.type, image_id=image_id
            ).os_type
        except:
            os_type = 'linux'
        sizes = machine_libcloud.driver.list_sizes()
        size = machine_libcloud.extra.get('instance_type')
        for node_size in sizes:
            if node_size.id == size:
                plan_price = node_size.price.get(os_type)
                if not plan_price:
                    # Use the default which is linux.
                    plan_price = node_size.price.get('linux')
                return plan_price.replace('/hour', '').replace('$', ''), 0
        return 0, 0

    def _list_images__fetch_images(self, search=None):
        default_images = config.EC2_IMAGES[self.cloud.region]
        image_ids = default_images.keys() + self.cloud.starred
        if not search:
            images = self.connection.list_images(None, image_ids)
            for image in images:
                if image.id in default_images:
                    image.name = default_images[image.id]
            images += self.connection.list_images(ex_owner='self')
        else:
            # FIXME: This is here to avoid circular imports.
            from mist.core.cloud.models import CloudImage
            image_models = CloudImage.objects(
                me.Q(cloud_provider=self.connection.type,
                     image_id__icontains=search) |
                me.Q(cloud_provider=self.connection.type,
                     name__icontains=search)
            )[:200]
            images = [NodeImage(id=image.image_id, name=image.name,
                                driver=self.connection, extra={})
                      for image in image_models]
            if not images:
                # Actual search on EC2.
                images = self.connection.list_images(
                    ex_filters={'name': '*%s*' % search}
                )
        return images

    def _list_locations__fetch_locations(self):
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
        return locations


class DigitalOceanController(BaseController):

    provider = 'digitalocean'

    def _connect(self):
        return get_driver(Provider.DIGITAL_OCEAN)(self.cloud.token)

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('created_at')  # iso8601 string

    def _list_machines__machine_actions(self, machine, machine_libcloud):
        super(DigitalOceanController, self)._list_machines__machine_actions(
               machine, machine_libcloud)
        machine.actions.rename = True

    def _list_machines__cost_machine(self, machine, machine_libcloud):
        size = machine_libcloud.extra.get('size', {})
        return size.get('price_hourly', 0), size.get('price_monthly', 0)


class LinodeController(BaseController):

    provider = 'linode'

    def _connect(self):
        return get_driver(Provider.LINODE)(self.cloud.apikey)

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('CREATE_DT')  # iso8601 string

    def _list_machines__machine_actions(self, machine, machine_libcloud):
        super(LinodeController, self)._list_machines__machine_actions(
               machine, machine_libcloud)
        machine.actions.rename = True
        machine.actions.stop = False
        # After resize, node gets to pending mode, needs to be started.
        if machine_libcloud.state is NodeState.PENDING:
            machine.actions.start = True

    def _list_machines__cost_machine(self, machine, machine_libcloud):
        size = machine_libcloud.extra.get('PLANID')
        price = get_size_price(driver_type='compute', driver_name='linode',
                               size_id=size)
        return 0, price or 0


class RackSpaceController(BaseController):

    provider = 'rackspace'

    def _connect(self):
        if self.cloud.region in ('us', 'uk'):
            driver = get_driver(Provider.RACKSPACE_FIRST_GEN)
        else:
            driver = get_driver(Provider.RACKSPACE)
        return driver(self.cloud.username, self.cloud.apikey,
                      region=self.cloud.region)

    def _add__preparse_kwargs(self, kwargs):
        username = kwargs.get('username')
        apikey = kwargs.get('apikey')
        if apikey == 'getsecretfromdb':
            cloud = type(self.cloud).objects(owner=self.cloud.owner,
                                             username=username).first()
            if cloud is not None:
                kwargs['apikey'] = cloud.apikey

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('created')  # iso8601 string

    def _list_machines__machine_actions(self, machine, machine_libcloud):
        super(RackSpaceController, self)._list_machines__machine_actions(
               machine, machine_libcloud)
        machine.actions.rename = True

    def _list_machines__cost_machine(self, machine, machine_libcloud):
        # Need to get image in order to specify the OS type
        # out of the image id.
        instance_image = machine_libcloud.extra.get('imageId')
        try:
            # FIXME: This is here to avoid circular imports.
            from mist.core.cloud.models import CloudImage
            os_type = CloudImage.objects.get(
                cloud_provider=machine_libcloud.driver.type,
                image_id=instance_image
            ).os_type
        except:
            os_type = 'linux'
        size = machine_libcloud.extra.get('flavorId')
        location = machine_libcloud.driver.region[:3]
        driver_name = 'rackspacenova' + location
        price = get_size_price(driver_type='compute', driver_name=driver_name,
                               size_id=size)
        if price:
            plan_price = price.get(os_type, 'linux')
            # 730 is the number of hours per month as on
            # https://www.rackspace.com/calculator
            return plan_price, float(plan_price) * 730

            # TODO: RackSpace mentions on
            # https://www.rackspace.com/cloud/public-pricing
            # there's a minimum service charge of $50/mo across all servers.


class SoftLayerController(BaseController):

    provider = 'softlayer'

    def _connect(self):
        return get_driver(Provider.SOFTLAYER)(self.cloud.username,
                                              self.cloud.apikey)

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('created')  # iso8601 string

    def _list_machines__postparse_machine(self, machine, machine_libcloud):
        machine.os_type = 'linux'
        if 'windows' in str(machine_libcloud.extra.get('image', '')).lower():
            machine.os_type = 'windows'

    def _list_machines__cost_machine(self,  machine, machine_libcloud):
        # SoftLayer includes recurringFee on the VM metadata but
        # this is only for the compute - CPU pricing.
        # Other costs (ram, bandwidth, image) are included
        # on billingItemChildren.

        extra_fee = 0
        if not machine_libcloud.extra.get('hourlyRecurringFee'):
            cpu_fee = float(machine_libcloud.extra.get('recurringFee'))
            for item in machine_libcloud.extra.get('billingItemChildren', ()):
                # don't calculate billing that is cancelled
                if not item.get('cancellationDate'):
                    extra_fee += float(item.get('recurringFee'))
            return 0, cpu_fee + extra_fee
        else:
            # machine_libcloud.extra.get('recurringFee')
            # here will show what it has cost for the current month, up to now.
            cpu_fee = float(machine_libcloud.extra.get('hourlyRecurringFee'))
            for item in machine_libcloud.extra.get('billingItemChildren', ()):
                # don't calculate billing that is cancelled
                if not item.get('cancellationDate'):
                    extra_fee += float(item.get('hourlyRecurringFee'))

            return cpu_fee + extra_fee, 0

    def _reboot_machine(self, machine, machine_libcloud):
        self.connection.reboot_node(machine_libcloud)
        return True

    def _destroy_machine(self, machine, machine_libcloud):
        self.connection.destroy_node(machine_libcloud)


class NephoScaleController(BaseController):

    provider = 'nephoscale'

    def _connect(self):
        return get_driver(Provider.NEPHOSCALE)(self.cloud.username,
                                               self.cloud.password)

    def _list_machines__machine_actions(self,  machine, machine_libcloud):
        super(NephoScaleController, self)._list_machines__machine_actions(
               machine, machine_libcloud)
        machine.actions.rename = True

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('create_time')  # iso8601 string

    def _list_machines__postparse_machine(self, machine, machine_libcloud):
        machine.os_type = 'linux'
        if 'windows' in str(machine_libcloud.extra.get('image', '')).lower():
            machine.extra['os_type'] = machine.os_type = 'windows'

    def _list_sizes__fetch_sizes(self):
        sizes = self.connection.list_sizes(baremetal=False)
        sizes.extend(self.connection.list_sizes(baremetal=True))
        return sizes


class AzureController(BaseController):

    provider = 'azure'

    def _connect(self):
        tmp_cert_file = tempfile.NamedTemporaryFile(delete=False)
        tmp_cert_file.write(self.cloud.certificate)
        tmp_cert_file.close()
        return get_driver(Provider.AZURE)(self.cloud.subscription_id,
                                          tmp_cert_file.name)

    def _list_machines__cost_machine(self,  machine, machine_libcloud):
        # TODO: Get prices per location
        os_type = machine_libcloud.extra.get('os_type', 'linux')
        size = machine_libcloud.extra.get('instance_size')
        price = get_size_price(driver_type='compute', driver_name='azure',
                               size_id=size)
        if price:
            return price.get(os_type) or price.get('linux') or 0, 0
        return 0, 0

    def _list_images__fetch_images(self, search=None):
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
        return images_dict.values()

    def _cloud_service(self, machine_libcloud_id):
        """
        Azure libcloud driver needs the cloud service
        specified as well as the node
        """
        cloud_service = self.connection.get_cloud_service_from_node_id(
            machine_libcloud_id)
        return cloud_service

    def _get_machine_libcloud(self, machine, no_fail=False):
        cloud_service = self._cloud_service(machine.machine_id)
        for node in self.connection.list_nodes(
                ex_cloud_service_name=cloud_service):
            if node.id == machine.machine_id:
                return node
            if no_fail:
                return Node(machine.machine_id, name=machine.machine_id,
                            state=0, public_ips=[], private_ips=[],
                            driver=self.connection)
            raise MachineNotFoundError("Machine with id '%s'." %
                                       machine.machine_id)

    def _start_machine(self,  machine, machine_libcloud):
        cloud_service = self._cloud_service(machine.machine_id)
        self.connection.ex_start_node(machine_libcloud,
                                      ex_cloud_service_name=cloud_service)

    def _stop_machine(self, machine, machine_libcloud):
        cloud_service = self._cloud_service(machine.machine_id)
        self.connection.ex_stop_node(machine_libcloud,
                                     ex_cloud_service_name=cloud_service)

    def _reboot_machine(self, machine, machine_libcloud):
        cloud_service = self._cloud_service(machine.machine_id)
        self.connection.reboot_node(machine_libcloud,
                                    ex_cloud_service_name=cloud_service)

    def _destroy_machine(self, machine, machine_libcloud):
        cloud_service = self._cloud_service(machine.machine_id)
        self.connection.destroy_node(machine_libcloud,
                                     ex_cloud_service_name=cloud_service)



class AzureArmController(BaseController):

    provider = 'azure_arm'

    def _connect(self):
        return get_driver(Provider.AZURE_ARM)(self.cloud.tenant_id,
                                              self.cloud.subscription_id,
                                              self.cloud.key,
                                              self.cloud.secret)

    def _list_machines__machine_creation_date(self, machine_api):
        return machine_api.created_at  # datetime

    def _list_machines__cost_machine(self, machine_api):
        return 0, 0

    def _list_images__fetch_images(self, search=None):
        return []

    def _start_machine(self,  machine, machine_libcloud):
        self.connection.ex_start_node(machine_libcloud)

    def _stop_machine(self, machine, machine_libcloud):
        self.connection.ex_stop_node(machine_libcloud)

    def _reboot_machine(self, machine, machine_libcloud):
        self.connection.reboot_node(machine_libcloud)

    def _destroy_machine(self, machine, machine_libcloud):
        self.connection.destroy_node(machine_libcloud)


class GoogleController(BaseController):

    provider = 'gce'

    def _connect(self):
        return get_driver(Provider.GCE)(self.cloud.email,
                                        self.cloud.private_key,
                                        project=self.cloud.project_id)

    def _add__preparse_kwargs(self, kwargs):
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

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        # iso8601 string
        return machine_libcloud.extra.get('creationTimestamp')

    def _list_machines__postparse_machine(self, machine, machine_libcloud):
        extra = machine_libcloud.extra

        # Wrap in try/except to prevent from future GCE API changes.
        # Identify server OS.
        machine.os_type = 'linux'
        try:
            if 'windows-cloud' in extra['disks'][0]['licenses'][0]:
                machine.os_type = 'windows'
        except:
            log.exception("Couldn't parse os_type for machine %s:%s for %s",
                          machine.id, machine.name, self.cloud)

        # Get disk metadata.
        try:
            if extra.get('boot_disk'):
                machine.extra['boot_disk_size'] = extra['boot_disk'].size
                machine.extra['boot_disk_type'] = extra[
                                            'boot_disk'].extra.get('type')
                machine.extra.pop('boot_disk')
        except:
            log.exception("Couldn't parse disk for machine %s:%s for %s",
                          machine.id, machine.name, self.cloud)

        # Get zone name.
        try:
            if extra.get('zone'):
                machine.extra['zone'] = extra['zone'].name
        except:
            log.exception("Couldn't parse zone for machine %s:%s for %s",
                          machine.id, machine.name, self.cloud)

        # Get machine type.
        try:
            if extra.get('machineType'):
                machine_type = extra['machineType'].split('/')[-1]
                machine.extra['machine_type'] = machine_type
        except:
            log.exception("Couldn't parse machine type "
                          "for machine %s:%s for %s",
                          machine.id, machine.name, self.cloud)

    def _list_images__fetch_images(self, search=None):
        images = self.connection.list_images()
        # GCE has some objects in extra so we make sure they are not passed.
        for image in images:
            image.extra.pop('licenses', None)
        return images

    def _list_machines__cost_machine(self,  machine, machine_libcloud):
        # https://cloud.google.com/compute/pricing
        size = machine_libcloud.extra.get('machineType')
        # eg europe-west1-d
        location = machine_libcloud.extra.get('location').split('-')[0]
        driver_name = 'google_' + location
        price = get_size_price(driver_type='compute', driver_name=driver_name,
                               size_id=size)
        if not price:
            return 0, 0
        os_type = machine_libcloud.extra.get('os_type')
        if 'sles' in machine_libcloud.image:
            os_type = 'sles'
        if 'rhel' in machine_libcloud.image:
            os_type = 'rhel'
        if 'win' in machine_libcloud.image:
            os_type = 'win'
        os_cost_per_hour = 0
        if os_type == 'sles':
            if size in ('f1-micro', 'g1-small'):
                os_cost_per_hour = 0.02
            else:
                os_cost_per_hour = 0.11
        if os_type == 'win':
            if size in ('f1-micro', 'g1-small'):
                os_cost_per_hour = 0.02
            else:
                cores = size.split('-')[-1]
                os_cost_per_hour = cores * 0.04
        if os_type == 'rhel':
            if size in ('n1-highmem-2', 'n1-highcpu-2', 'n1-highmem-4',
                        'n1-highcpu-4', 'f1-micro', 'g1-small',
                        'n1-standard-1', 'n1-standard-2', 'n1-standard-4'):
                os_cost_per_hour = 0.06
            else:
                os_cost_per_hour = 0.13

        try:
            if 'preemptible' in size:
                # No monthly discount.
                return price + os_cost_per_hour, 0
            else:
                # Monthly discount of 30% if the VM runs all the billing month.
                # Monthly discount on instance size only (not on OS image).
                return 0.7 * price + os_cost_per_hour, 0
            # TODO: better calculate the discounts, taking under consideration
            # when the VM has been initiated.
        except:
            pass

    def _list_sizes__fetch_sizes(self):
        sizes = self.connection.list_sizes()
        for size in sizes:
            zone = size.extra.pop('zone')
            size.extra['zone'] = {
                'id': zone.id,
                'name': zone.name,
                'status': zone.status,
                'country': zone.country,
            }
        return sizes


class HostVirtualController(BaseController):

    provider = 'hostvirtual'

    def _connect(self):
        return get_driver(Provider.HOSTVIRTUAL)(self.cloud.apikey)


class PacketController(BaseController):

    provider = 'packet'

    def _connect(self):
        return get_driver(Provider.PACKET)(self.cloud.apikey,
                                           project=self.cloud.project_id)

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('created_at')  # iso8601 string

    def _list_machines__cost_machine(self,  machine, machine_libcloud):
        size = machine_libcloud.extra.get('plan')
        price = get_size_price(driver_type='compute', driver_name='packet',
                               size_id=size)
        return price or 0, 0


class VultrController(BaseController):

    provider = 'vultr'

    def _connect(self):
        return get_driver(Provider.VULTR)(self.cloud.apikey)

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('date_created')  # iso8601 string

    def _list_machines__cost_machine(self,  machine, machine_libcloud):
        return machine_libcloud.extra.get('cost_per_month', 0)


class VSphereController(BaseController):

    provider = 'vsphere'

    def _connect(self):
        host = dnat(self.cloud.owner, self.cloud.host)
        return get_driver(Provider.VSPHERE)(host=host,
                                            username=self.cloud.username,
                                            password=self.cloud.password)

    def check_connection(self):
        """Check connection without performing `list_machines`

        In vSphere we are sure we got a successful connection with the provider
        if `self.connect` works, no need to run a `list_machines` to find out.

        """
        self.connect()

    def _add__preparse_kwargs(self, kwargs):
        if not kwargs.get('host'):
            raise RequiredParameterMissingError('host')
        kwargs['host'] = sanitize_host(kwargs['host'])
        check_host(kwargs['host'])


class VCloudController(BaseController):

    provider = 'vcloud'

    def _connect(self):
        host = dnat(self.cloud.owner, self.cloud.host)
        return get_driver(self.provider)(self.cloud.username,
                                         self.cloud.password, host=host,
                                         verify_match_hostname=False)

    def _add__preparse_kwargs(self, kwargs):
        if not kwargs.get('username'):
            raise RequiredParameterMissingError('username')
        if not kwargs.get('organization'):
            if '@' not in kwargs['username']:
                raise RequiredParameterMissingError('organization')
        else:
            kwargs['username'] = '%s@%s' % (kwargs['username'],
                                            kwargs.pop('organization'))
        if not kwargs.get('host'):
            raise RequiredParameterMissingError('host')
        kwargs['host'] = sanitize_host(kwargs['host'])
        check_host(kwargs['host'])

    def _list_machines__machine_actions(self,  machine, machine_libcloud):
        super(VCloudController, self)._list_machines__machine_actions(
              machine, machine_libcloud)
        if machine_libcloud.state is NodeState.PENDING:
            machine.actions.start = True
            machine.actions.stop = True


class IndonesianVCloudController(VCloudController):

    provider = 'indonesian_vcloud'

    def _add__preparse_kwargs(self, kwargs):
        kwargs.setdefault('host', 'my.idcloudonline.com')
        if kwargs['host'] not in ('my.idcloudonline.com',
                                  'compute.idcloudonline.com'):
            raise me.ValidationError("Invalid host '%s'." % kwargs['host'])
        super(IndonesianVCloudController, self)._add__preparse_kwargs(kwargs)


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

    def _add__preparse_kwargs(self, kwargs):
        rename_kwargs(kwargs, 'auth_url', 'url')
        rename_kwargs(kwargs, 'tenant_name', 'tenant')
        url = kwargs.get('url')
        if url:
            if url.endswith('/v2.0/'):
                url = url.split('/v2.0/')[0]
            elif url.endswith('/v2.0'):
                url = url.split('/v2.0')[0]
            kwargs['url'] = url.rstrip('/')
            check_host(sanitize_host(kwargs['url']))

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('created')  # iso8601 string

    def _list_machines__machine_actions(self,  machine, machine_libcloud):
        super(OpenStackController, self)._list_machines__machine_actions(
               machine, machine_libcloud)
        machine.actions.rename = True


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
            # FIXME: The docker_host logic should come out of libcloud into
            # DockerController.list_machines
            return get_driver(Provider.DOCKER)(host=host,
                                               port=port,
                                               docker_host=self.cloud.host,
                                               key_file=key_temp_file.name,
                                               cert_file=cert_temp_file.name,
                                               ca_cert=ca_cert,
                                               verify_match_hostname=False)

        # Username/Password authentication.
        return get_driver(Provider.DOCKER)(self.cloud.username,
                                           self.cloud.password,
                                           host, port)

    def _add__preparse_kwargs(self, kwargs):
        rename_kwargs(kwargs, 'docker_port', 'port')
        rename_kwargs(kwargs, 'docker_host', 'host')
        rename_kwargs(kwargs, 'auth_user', 'username')
        rename_kwargs(kwargs, 'auth_password', 'password')
        if kwargs.get('host'):
            kwargs['host'] = sanitize_host(kwargs['host'])
            check_host(kwargs['host'])

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.created_at  # unix timestamp

    def _list_images__fetch_images(self, search=None):
        # Fetch mist's recommended images
        images = [NodeImage(id=image, name=name,
                            driver=self.connection, extra={})
                  for image, name in config.DOCKER_IMAGES.items()]
        # Fetch images from libcloud (supports search).
        if search:
            images += self.connection.search_images(term=search)[:100]
        else:
            images += self.connection.list_images()
        return images

    def image_is_default(self, image_id):
        return image_id in config.DOCKER_IMAGES

    def _action_change_port(self,  machine, machine_libcloud):
        """This part exists here for docker specific reasons. After start,
        reboot and destroy actions, docker machine instance need to rearrange
        its port. Finally save the machine in db.
        """
        # this exist here cause of docker host implementation
        if machine_libcloud.extra.get('tags', {}).get('type') == 'docker_host':
            return

        node_info = self.connection.inspect_node(machine_libcloud)
        try:
            port = node_info.extra[
                'network_settings']['Ports']['22/tcp'][0]['HostPort']
        except KeyError:
            port = 22

        for key_assoc in machine.key_associations:
            key_assoc.port = port
        machine.save()

    def _start_machine(self,  machine, machine_libcloud):
        self.connection.ex_start_node(machine_libcloud)
        self._action_change_port(machine, machine_libcloud)

    def _reboot_machine(self,  machine, machine_libcloud):
        machine_libcloud.reboot()
        self._action_change_port(machine, machine_libcloud)

    def _destroy_machine(self, machine, machine_libcloud):
        if machine_libcloud.state == NodeState.RUNNING:
            self.connection.ex_stop_node(machine_libcloud)
        machine_libcloud.destroy()


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
                                                ssh_port=int(port))
        else:
            host, port = dnat(self.cloud.owner, self.cloud.host, 5000)
            return get_driver(Provider.LIBVIRT)(host,
                                                hypervisor=self.cloud.host,
                                                user=self.cloud.username,
                                                tcp_port=int(port))

    def _add__preparse_kwargs(self, kwargs):
        rename_kwargs(kwargs, 'machine_hostname', 'host')
        rename_kwargs(kwargs, 'machine_user', 'username')
        rename_kwargs(kwargs, 'machine_key', 'key')
        rename_kwargs(kwargs, 'ssh_port', 'port')
        if kwargs.get('host'):
            kwargs['host'] = sanitize_host(kwargs['host'])
            check_host(kwargs['host'])
        if kwargs.get('key'):
            try:
                kwargs['key'] = Keypair.objects.get(owner=self.cloud.owner,
                                                    id=kwargs['key'])
            except Keypair.DoesNotExist:
                raise NotFoundError("Keypair does not exist.")

    def add(self, remove_on_error=True, fail_on_invalid_params=True, **kwargs):
        """This is a hack to associate a key with the VM hosting this cloud"""
        super(LibvirtController, self).add(
            remove_on_error=remove_on_error,
            fail_on_invalid_params=fail_on_invalid_params,
            **kwargs
        )
        if self.cloud.key is not None:
            # FIXME
            from mist.io.methods import associate_key
            associate_key(self.cloud.owner, self.cloud.key.id, self.cloud.id,
                          self.cloud.host,  # hypervisor id is the hostname
                          username=self.cloud.username, port=self.cloud.port)

    def _list_machines__machine_actions(self,  machine, machine_libcloud):
        super(LibvirtController, self)._list_machines__machine_actions(
               machine, machine_libcloud)
        if machine.extra.get('tags', {}).get('type') == 'hypervisor':
            # Allow only reboot and tag actions for hypervisor.
            for action in ('start', 'stop', 'destroy', 'rename'):
                setattr(machine.actions, action, False)
        else:
            machine.actions.undefine = True
            if machine_libcloud.state is NodeState.TERMINATED:
                # In libvirt a terminated machine can be started.
                machine.actions.start = True
            if machine_libcloud.state is NodeState.RUNNING:
                machine.actions.suspend = True
            if machine_libcloud.state is NodeState.SUSPENDED:
                machine.actions.resume = True

    def _list_machines__postparse_machine(self,  machine, machine_libcloud):
        xml_desc = machine_libcloud.extra.get('xml_description')
        if xml_desc:
            machine.extra['xml_description'] = escape(xml_desc)

    def _list_images__fetch_images(self, search=None):
        return self.connection.list_images(location=self.cloud.images_location)

    def _reboot_machine(self, machine, machine_libcloud):
        hypervisor = machine_libcloud.extra.get('tags', {}).get('type', None)
        if hypervisor == 'hypervisor':
            # issue an ssh command for the libvirt hypervisor
            try:
                hostname = machine_libcloud.public_ips[0] if \
                           machine_libcloud.public_ips else \
                           machine_libcloud.private_ips[0]
                command = '$(command -v sudo) shutdown -r now'
                # todo move it up
                from mist.core.methods import ssh_command
                ssh_command(self.cloud.owner, self.cloud.id,
                            machine_libcloud.id, hostname, command)
                return True
            except MistError as exc:
                log.error("Could not ssh machine %s", machine.name)
                raise
            except Exception as exc:
                log.exception(exc)
                raise InternalServerError(exc=exc)
        else:
            machine_libcloud.reboot()

    def _resume_machine(self, machine, machine_libcloud):
        self.connection.ex_resume_node(machine_libcloud)

    def _suspend_machine(self, machine, machine_libcloud):
        self.connection.ex_suspend_node(machine_libcloud)

    def _undefine_machine(self, machine, machine_libcloud):
        self.connection.ex_undefine_node(machine_libcloud)


class OtherController(BaseController):

    provider = 'bare_metal'

    def _connect(self):
        # FIXME: Move this to top of the file once Machine model is migrated.
        # The import statement is currently here to avoid circular import
        # issues.
        from mist.io.machines.models import Machine
        return BareMetalDriver(Machine.objects(cloud=self.cloud))

    def _list_machines__machine_actions(self, machine, machine_libcloud):
        super(OtherController, self)._list_machines__machine_actions(
            machine, machine_libcloud
        )
        machine.actions.reboot = False
        machine.actions.stop = False
        machine.actions.destroy = False
        # allow reboot action for bare metal with key associated
        if machine.key_associations:
            machine.actions.reboot = True

    def add(self, remove_on_error=True, fail_on_invalid_params=True, **kwargs):
        """Add new Cloud to the database

        This is the only cloud controller subclass that overrides the `add`
        method of `BaseController`.

        This is only expected to be called by `Cloud.add` classmethod to create
        a cloud. Fields `owner` and `title` are already populated in
        `self.cloud`. The `self.cloud` model is not yet saved.

        If appropriate kwargs are passed, this can currently also act as a
        shortcut to also add the first machine on this dummy cloud.

        """
        # Attempt to save.
        try:
            self.cloud.save()
        except me.ValidationError as exc:
            raise BadRequestError({'msg': exc.message,
                                   'errors': exc.to_dict()})
        except me.NotUniqueError:
            raise CloudExistsError("Cloud with name %s already exists"
                                   % self.cloud.title)

        # Add machine.
        if kwargs:
            try:
                self.add_machine_wrapper(
                    self.cloud.title, remove_on_error=remove_on_error,
                    fail_on_invalid_params=fail_on_invalid_params, **kwargs
                )
            except Exception as exc:
                if remove_on_error:
                    self.cloud.delete()
                raise

    def add_machine_wrapper(self, name, remove_on_error=True,
                            fail_on_invalid_params=True, **kwargs):
        """Wrapper around add_machine for kwargs backwards compatibity

        FIXME: This wrapper should be deprecated

        """
        # Sanitize params.
        rename_kwargs(kwargs, 'machine_ip', 'host')
        rename_kwargs(kwargs, 'machine_user', 'ssh_user')
        rename_kwargs(kwargs, 'machine_key', 'ssh_key')
        rename_kwargs(kwargs, 'machine_port', 'ssh_port')
        rename_kwargs(kwargs, 'remote_desktop_port', 'rdp_port')
        if kwargs.pop('windows', False):
            kwargs['os_type'] = 'windows'
        else:
            kwargs['os_type'] = 'unix'
        errors = {}
        for key in kwargs.keys():
            if key not in ('host', 'ssh_user', 'ssh_port', 'ssh_key',
                           'os_type', 'rdp_port'):
                error = "Invalid parameter %s=%r." % (key, kwargs[key])
                if fail_on_invalid_params:
                    errors[key] = error
                else:
                    log.warning(error)
                    kwargs.pop(key)
        if errors:
            raise BadRequestError({
                'msg': "Invalid parameters %s." % errors.keys(),
                'errors': errors,
            })

        # Add machine.
        return self.add_machine(name, remove_on_error=remove_on_error,
                                **kwargs)

    def add_machine(self, name, host='',
                    ssh_user='root', ssh_port=22, ssh_key=None,
                    os_type='unix', rdp_port=3389, remove_on_error=True):
        """Add machine to this dummy Cloud

        This is a special method that exists only on this Cloud subclass.

        """
        # FIXME: Move this to top of the file once Machine model is migrated.
        # The import statement is currently here to avoid circular import
        # issues.
        from mist.io.machines.models import Machine
        # FIXME: Move ssh command to Machine controller once it is migrated.
        from mist.core.methods import ssh_command

        # Sanitize inputs.
        host = sanitize_host(host)
        check_host(host)
        try:
            ssh_port = int(ssh_port)
        except (ValueError, TypeError):
            ssh_port = 22
        try:
            rdp_port = int(rdp_port)
        except (ValueError, TypeError):
            rdp_port = 3389
        if ssh_key:
            ssh_key = Keypair.objects.get(owner=self.cloud.owner, id=ssh_key)

        # Create and save machine entry to database.
        machine = Machine(
            cloud=self.cloud,
            name=name,
            machine_id=uuid.uuid4().hex,
            os_type=os_type,
            ssh_port=ssh_port,
            rdp_port=rdp_port
        )
        if host:
            if is_private_subnet(socket.gethostbyname(host)):
                machine.private_ips = [host]
            else:
                machine.hostname = host
                machine.public_ips = [host]
        machine.save()

        # Attempt to connect.
        if os_type == 'unix' and ssh_key:
            if not ssh_user:
                ssh_user = 'root'
            # Try to connect. If it works, it will create the association.
            try:
                if not host:
                    raise BadRequestError("You have specified an SSH key but "
                                          "machine hostname is empty.")
                to_tunnel(self.cloud.owner, host)  # May raise VPNTunnelError
                ssh_command(
                    self.cloud.owner, self.cloud.id, machine.machine_id, host,
                    'uptime', key_id=ssh_key.id, username=ssh_user,
                    port=ssh_port
                )
            except MachineUnauthorizedError as exc:
                if remove_on_error:
                    machine.delete()
                raise CloudUnauthorizedError(exc)
            except ServiceUnavailableError as exc:
                if remove_on_error:
                    machine.delete()
                raise MistError("Couldn't connect to host '%s'." % host)
            except:
                if remove_on_error:
                    machine.delete()
                raise

        return machine

    def _reboot_machine(self, machine, machine_libcloud):
        try:
            if machine.public_ips:
                hostname = machine.public_ips[0]
            else:
                hostname = machine.private_ips[0]

            command = '$(command -v sudo) shutdown -r now'
            # TODO move it up
            from mist.core.methods import ssh_command
            ssh_command(self.cloud.owner, self.cloud.id,
                        machine.machine_id, hostname, command)
            return True
        except:
            return False
