"""Cloud ComputeControllers

A cloud controller handles all operations that can be performed on a cloud,
commonly using libcloud under the hood.

It also performs several steps and combines the information stored in the
database with that returned from API calls to providers.

For each different cloud type, there is a corresponding cloud controller
defined here. All the different classes inherit BaseComputeController and share
a commmon interface, with the exception that some controllers may not have
implemented all methods.

A cloud controller is initialized given a cloud. Most of the time it will be
accessed through a cloud model, using the `ctl` abbreviation, like this:

    cloud = mist.io.clouds.models.Cloud.objects.get(id=cloud_id)
    print cloud.ctl.compute.list_machines()

"""


import re
import socket
import logging
import tempfile

from xml.sax.saxutils import escape

import netaddr

import mongoengine as me

from libcloud.pricing import get_size_price
from libcloud.compute.base import Node, NodeImage
from libcloud.compute.providers import get_driver
from libcloud.compute.types import Provider, NodeState

from mist.io import config

from mist.io.exceptions import MistError
from mist.io.exceptions import InternalServerError
from mist.io.exceptions import MachineNotFoundError

from mist.io.machines.models import Machine

from mist.core.vpn.methods import destination_nat as dnat
from mist.io.misc.cloud import CloudImage

from mist.io.clouds.controllers.main.base import BaseComputeController


log = logging.getLogger(__name__)


class AmazonComputeController(BaseComputeController):

    def _connect(self):
        return get_driver(Provider.EC2)(self.cloud.apikey,
                                        self.cloud.apisecret,
                                        region=self.cloud.region)

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.created_at  # datetime

    def _list_machines__machine_actions(self, machine, machine_libcloud):
        super(AmazonComputeController, self)._list_machines__machine_actions(
               machine, machine_libcloud)
        machine.actions.rename = True

    def _list_machines__postparse_machine(self, machine, machine_libcloud):
        # This is windows for windows servers and None for Linux.
        machine.os_type = machine_libcloud.extra.get('platform', 'linux')

    def _list_machines__cost_machine(self,  machine, machine_libcloud):
        # TODO: stopped instances still charge for the EBS device
        # https://aws.amazon.com/ebs/pricing/
        # Need to add this cost for all instances
        if machine_libcloud.state == NodeState.STOPPED:
            return 0, 0

        image_id = machine_libcloud.extra.get('image_id')
        try:
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
            try:
                # this might break if image_ids contains starred images
                # that are not valid anymore for AWS
                images = self.connection.list_images(None, image_ids)
            except Exception as e:
                bad_ids = re.findall(r'ami-\w*', e.message, re.DOTALL)
                for bad_id in bad_ids:
                    self.cloud.starred.remove(bad_id)
                self.cloud.save()
                images = self.connection.list_images(None,
                                                     default_images.keys() +
                                                     self.cloud.starred)
            for image in images:
                if image.id in default_images:
                    image.name = default_images[image.id]
            images += self.connection.list_images(ex_owner='self')
        else:
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

    def image_is_default(self, image_id):
        return image_id in config.EC2_IMAGES[self.cloud.region]

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


class DigitalOceanComputeController(BaseComputeController):

    def _connect(self):
        return get_driver(Provider.DIGITAL_OCEAN)(self.cloud.token)

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('created_at')  # iso8601 string

    def _list_machines__machine_actions(self, machine, machine_libcloud):
        super(
            DigitalOceanComputeController, self
        )._list_machines__machine_actions(machine, machine_libcloud)
        machine.actions.rename = True

    def _list_machines__cost_machine(self, machine, machine_libcloud):
        size = machine_libcloud.extra.get('size', {})
        return size.get('price_hourly', 0), size.get('price_monthly', 0)


class LinodeComputeController(BaseComputeController):

    def _connect(self):
        return get_driver(Provider.LINODE)(self.cloud.apikey)

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('CREATE_DT')  # iso8601 string

    def _list_machines__machine_actions(self, machine, machine_libcloud):
        super(LinodeComputeController, self)._list_machines__machine_actions(
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


class RackSpaceComputeController(BaseComputeController):

    def _connect(self):
        if self.cloud.region in ('us', 'uk'):
            driver = get_driver(Provider.RACKSPACE_FIRST_GEN)
        else:
            driver = get_driver(Provider.RACKSPACE)
        return driver(self.cloud.username, self.cloud.apikey,
                      region=self.cloud.region)

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('created')  # iso8601 string

    def _list_machines__machine_actions(self, machine, machine_libcloud):
        super(
            RackSpaceComputeController, self
        )._list_machines__machine_actions(machine, machine_libcloud)
        machine.actions.rename = True

    def _list_machines__cost_machine(self, machine, machine_libcloud):
        # Need to get image in order to specify the OS type
        # out of the image id.
        instance_image = machine_libcloud.extra.get('imageId')
        try:
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


class SoftLayerComputeController(BaseComputeController):

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


class NephoScaleComputeController(BaseComputeController):

    def _connect(self):
        return get_driver(Provider.NEPHOSCALE)(self.cloud.username,
                                               self.cloud.password)

    def _list_machines__machine_actions(self,  machine, machine_libcloud):
        super(
            NephoScaleComputeController, self
        )._list_machines__machine_actions(machine, machine_libcloud)
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


class AzureComputeController(BaseComputeController):

    def _connect(self):
        tmp_cert_file = tempfile.NamedTemporaryFile(delete=False)
        tmp_cert_file.write(self.cloud.certificate)
        tmp_cert_file.close()
        return get_driver(Provider.AZURE)(self.cloud.subscription_id,
                                          tmp_cert_file.name)

    def _list_machines__cost_machine(self,  machine, machine_libcloud):
        if machine_libcloud.state not in [NodeState.RUNNING, NodeState.PAUSED]:
            return 0, 0
        return machine_libcloud.extra.get('cost_per_hour', 0), 0

    def _list_images__fetch_images(self, search=None):
        images = self.connection.list_images()
        images = [image for image in images
                  if 'RightImage' not in image.name and
                  'Barracude' not in image.name and
                  'BizTalk' not in image.name]
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

    def _list_machines__machine_actions(self,  machine, machine_libcloud):
        super(AzureComputeController, self)._list_machines__machine_actions(
              machine, machine_libcloud)
        if machine_libcloud.state is NodeState.PAUSED:
            machine.actions.start = True


class AzureArmComputeController(BaseComputeController):

    def _connect(self):
        return get_driver(Provider.AZURE_ARM)(self.cloud.tenant_id,
                                              self.cloud.subscription_id,
                                              self.cloud.key,
                                              self.cloud.secret)

    def _list_machines__cost_machine(self,  machine, machine_libcloud):
        if machine_libcloud.state not in [NodeState.RUNNING, NodeState.PAUSED]:
            return 0, 0
        return machine_libcloud.extra.get('cost_per_hour', 0), 0

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.created_at  # datetime

    def _list_images__fetch_images(self, search=None):
        return []

    def _reboot_machine(self, machine, machine_libcloud):
        self.connection.reboot_node(machine_libcloud)

    def _destroy_machine(self, machine, machine_libcloud):
        self.connection.destroy_node(machine_libcloud)

    def _list_machines__machine_actions(self,  machine, machine_libcloud):
        super(AzureArmComputeController, self)._list_machines__machine_actions(
              machine, machine_libcloud)
        if machine_libcloud.state is NodeState.PAUSED:
            machine.actions.start = True


class GoogleComputeController(BaseComputeController):

    def _connect(self):
        return get_driver(Provider.GCE)(self.cloud.email,
                                        self.cloud.private_key,
                                        project=self.cloud.project_id)

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
        if machine_libcloud.state == NodeState.TERMINATED:
            return 0, 0
        # https://cloud.google.com/compute/pricing
        size = machine_libcloud.extra.get('machineType').split('/')[-1]
        location = machine_libcloud.extra.get('location')
        # Get the location, locations currently are
        # europe us asia-east asia-northeast
        # all with different pricing
        if 'asia-northeast' in location:
            # eg asia-northeast1-a
            location = 'asia_northeast'
        elif 'asia-east' in location:
            # eg asia-east1-a
            location = 'asia_east'
        else:
            # eg europe-west1-d
            location = location.split('-')[0]
        driver_name = 'google_' + location
        price = get_size_price(driver_type='compute', driver_name=driver_name,
                               size_id=size)

        if not price:
            if size.startswith('custom'):
                cpu_price = 'custom_vcpu'
                ram_price = 'custom_ram'
                if 'preemptible' in size:
                    cpu_price = 'custom_vcpu_preemptible'
                    ram_price = 'custom_ram_preemptible'

                cpu_price = get_size_price(driver_type='compute',
                                           driver_name=driver_name,
                                           size_id=cpu_price)
                ram_price = get_size_price(driver_type='compute',
                                           driver_name=driver_name,
                                           size_id=ram_price)
                # Example custom-4-16384
                try:
                    cpu = int(size.split('-')[1])
                    ram = int(size.split('-')[2]) / 1024
                    price = cpu * cpu_price + ram * ram_price
                except:
                    log.exception("Couldn't parse custom size %s for cloud %s",
                                  size, self.cloud)
                    return 0, 0
            else:
                return 0, 0
        os_type = machine_libcloud.extra.get('os_type')
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


class HostVirtualComputeController(BaseComputeController):

    def _connect(self):
        return get_driver(Provider.HOSTVIRTUAL)(self.cloud.apikey)


class PacketComputeController(BaseComputeController):

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


class VultrComputeController(BaseComputeController):

    def _connect(self):
        return get_driver(Provider.VULTR)(self.cloud.apikey)

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('date_created')  # iso8601 string

    def _list_machines__cost_machine(self,  machine, machine_libcloud):
        return machine_libcloud.extra.get('cost_per_month', 0)


class VSphereComputeController(BaseComputeController):

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


class VCloudComputeController(BaseComputeController):

    def _connect(self):
        host = dnat(self.cloud.owner, self.cloud.host)
        return get_driver(self.provider)(self.cloud.username,
                                         self.cloud.password, host=host,
                                         verify_match_hostname=False)

    def _list_machines__machine_actions(self,  machine, machine_libcloud):
        super(VCloudComputeController, self)._list_machines__machine_actions(
              machine, machine_libcloud)
        if machine_libcloud.state is NodeState.PENDING:
            machine.actions.start = True
            machine.actions.stop = True


class OpenStackComputeController(BaseComputeController):

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

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('created')  # iso8601 string

    def _list_machines__machine_actions(self,  machine, machine_libcloud):
        super(
            OpenStackComputeController, self
        )._list_machines__machine_actions(machine, machine_libcloud)
        machine.actions.rename = True


class DockerComputeController(BaseComputeController):

    def __init__(self, *args, **kwargs):
        super(DockerComputeController, self).__init__(*args, **kwargs)
        self._dockerhost = None

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

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.created_at  # unix timestamp

    def _list_machines__postparse_machine(self, machine, machine_libcloud):
        machine.machine_type = 'container'
        machine.parent = self.dockerhost

    @property
    def dockerhost(self):
        """This is a helper method to get the machine representing the host"""
        if self._dockerhost is not None:
            return self._dockerhost

        try:
            # Find dockerhost from database.
            machine = Machine.objects.get(cloud=self.cloud,
                                          machine_type='container-engine')
        except Machine.DoesNotExist:
            try:
                # Find dockerhost with previous format from database.
                machine = Machine.objects.get(
                    cloud=self.cloud, **{'extra__tags.type': 'docker_host'}
                )
            except Machine.DoesNotExist:
                # Create dockerrhost machine.
                machine = Machine(cloud=self.cloud,
                                  machine_type='container-engine')

        # Update dockerhost machine model fields.
        changed = False
        for attr, val in {'name': self.cloud.title,
                          'hostname': self.cloud.host,
                          'machine_type': 'container-engine'}.iteritems():
            if getattr(machine, attr) != val:
                setattr(machine, attr, val)
                changed = True
        if not machine.machine_id:
            machine.machine_id = machine.id
            changed = True
        try:
            ip_addr = socket.gethostbyname(machine.hostname)
        except socket.gaierror:
            pass
        else:
            is_private = netaddr.IPAddress(ip_addr).is_private()
            ips = machine.private_ips if is_private else machine.public_ips
            if ip_addr not in ips:
                ips.insert(0, ip_addr)
                changed = True
        if changed:
            machine.save()

        self._dockerhost = machine
        return machine

    def _list_machines__fetch_generic_machines(self):
        return [self.dockerhost]

    def _list_images__fetch_images(self, search=None):
        # Fetch mist's recommended images
        images = [NodeImage(id=image, name=name,
                            driver=self.connection, extra={})
                  for image, name in config.DOCKER_IMAGES.items()]
        # Add starred images
        images += [NodeImage(id=image, name=image,
                             driver=self.connection, extra={})
                   for image in self.cloud.starred
                   if image not in config.DOCKER_IMAGES]
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
        if machine.machine_type == 'container-engine':
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


class LibvirtComputeController(BaseComputeController):

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

    def _list_machines__machine_actions(self,  machine, machine_libcloud):
        super(LibvirtComputeController, self)._list_machines__machine_actions(
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


class OtherComputeController(BaseComputeController):

    def _connect(self):
        return None

    def _list_machines__fetch_machines(self):
        return []

    def _get_machine_libcloud(self, machine):
        return None

    def _list_machines__fetch_generic_machines(self):
        return Machine.objects(cloud=self.cloud)

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
        except Exception as exc:
            raise MistError("Couldn't reboot machine: %s" % exc)

    def list_images(self, search=None):
        return []

    def list_sizes(self):
        return []

    def list_locations(self):
        return []
