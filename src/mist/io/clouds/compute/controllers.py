"""

"""

import re
import json
import logging

from xml.sax.saxutils import escape

import mongoengine as me

from libcloud.pricing import get_size_price
from libcloud.compute.base import NodeImage, Node
from libcloud.compute.types import NodeState

from mist.io import config

from mist.io.exceptions import MistError
from mist.io.exceptions import InternalServerError
from mist.io.exceptions import MachineNotFoundError

from mist.io.clouds.compute.base import ComputeController


log = logging.getLogger(__name__)


class AmazonComputeController(ComputeController):

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
        default_images = config.EC2_IMAGES[self.ctl.cloud.region]
        image_ids = default_images.keys() + self.ctl.cloud.starred
        if not search:
            try:
                # this might break if image_ids contains starred images
                # that are not valid anymore for AWS
                images = self.ctl.connection.list_images(None, image_ids)
            except Exception as e:
                bad_ids = re.findall(r'ami-\w*', e.message, re.DOTALL)
                for bad_id in bad_ids:
                    self.ctl.cloud.starred.remove(bad_id)
                self.ctl.cloud.save()
                images = self.ctl.connection.list_images(
                    None, default_images.keys() + self.ctl.cloud.starred)
            for image in images:
                if image.id in default_images:
                    image.name = default_images[image.id]
            images += self.ctl.connection.list_images(ex_owner='self')
        else:
            # FIXME: This is here to avoid circular imports.
            from mist.core.cloud.models import CloudImage
            image_models = CloudImage.objects(
                me.Q(cloud_provider=self.ctl.connection.type,
                     image_id__icontains=search) |
                me.Q(cloud_provider=self.ctl.connection.type,
                     name__icontains=search)
            )[:200]
            images = [NodeImage(id=image.image_id, name=image.name,
                                driver=self.ctl.connection, extra={})
                      for image in image_models]
            if not images:
                # Actual search on EC2.
                images = self.ctl.connection.list_images(
                    ex_filters={'name': '*%s*' % search}
                )
        return images

    def image_is_default(self, image_id):
        return image_id in config.EC2_IMAGES[self.ctl.cloud.region]

    def _list_locations__fetch_locations(self):
        """List availability zones for EC2 region

        In EC2 all locations of a region have the same name, so the
        availability zones are listed instead.

        """
        locations = self.ctl.connection.list_locations()
        for location in locations:
            try:
                location.name = location.availability_zone.name
            except:
                pass
        return locations


class DigitalOceanComputeController(ComputeController):

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


class LinodeComputeController(ComputeController):

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


class RackSpaceComputeController(ComputeController):

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


class SoftLayerComputeController(ComputeController):

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
        self.ctl.connection.reboot_node(machine_libcloud)
        return True

    def _destroy_machine(self, machine, machine_libcloud):
        self.ctl.connection.destroy_node(machine_libcloud)


class NephoScaleComputeController(ComputeController):

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
        sizes = self.ctl.connection.list_sizes(baremetal=False)
        sizes.extend(self.ctl.connection.list_sizes(baremetal=True))
        return sizes


class AzureComputeController(ComputeController):

    def _list_machines__cost_machine(self,  machine, machine_libcloud):
        if machine_libcloud.state not in [NodeState.RUNNING, NodeState.PAUSED]:
            return 0, 0
        return machine_libcloud.extra.get('cost_per_hour', 0), 0

    def _list_images__fetch_images(self, search=None):
        images = self.ctl.connection.list_images()
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
        cloud_service = self.ctl.connection.get_cloud_service_from_node_id(
            machine_libcloud_id)
        return cloud_service

    def _get_machine_libcloud(self, machine, no_fail=False):
        cloud_service = self._cloud_service(machine.machine_id)
        for node in self.ctl.connection.list_nodes(
                ex_cloud_service_name=cloud_service):
            if node.id == machine.machine_id:
                return node
            if no_fail:
                return Node(machine.machine_id, name=machine.machine_id,
                            state=0, public_ips=[], private_ips=[],
                            driver=self.ctl.connection)
            raise MachineNotFoundError("Machine with id '%s'." %
                                       machine.machine_id)

    def _start_machine(self,  machine, machine_libcloud):
        cloud_service = self._cloud_service(machine.machine_id)
        self.ctl.connection.ex_start_node(machine_libcloud,
                                          ex_cloud_service_name=cloud_service)

    def _stop_machine(self, machine, machine_libcloud):
        cloud_service = self._cloud_service(machine.machine_id)
        self.ctl.connection.ex_stop_node(machine_libcloud,
                                         ex_cloud_service_name=cloud_service)

    def _reboot_machine(self, machine, machine_libcloud):
        cloud_service = self._cloud_service(machine.machine_id)
        self.ctl.connection.reboot_node(machine_libcloud,
                                        ex_cloud_service_name=cloud_service)

    def _destroy_machine(self, machine, machine_libcloud):
        cloud_service = self._cloud_service(machine.machine_id)
        self.ctl.connection.destroy_node(machine_libcloud,
                                         ex_cloud_service_name=cloud_service)

    def _list_machines__machine_actions(self,  machine, machine_libcloud):
        super(AzureComputeController, self)._list_machines__machine_actions(
              machine, machine_libcloud)
        if machine_libcloud.state is NodeState.PAUSED:
            machine.actions.start = True


class AzureArmComputeController(ComputeController):

    def _list_machines__cost_machine(self,  machine, machine_libcloud):
        if machine_libcloud.state not in [NodeState.RUNNING, NodeState.PAUSED]:
            return 0, 0
        return machine_libcloud.extra.get('cost_per_hour', 0), 0

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.created_at  # datetime

    def _list_images__fetch_images(self, search=None):
        return []

    def _reboot_machine(self, machine, machine_libcloud):
        self.ctl.connection.reboot_node(machine_libcloud)

    def _destroy_machine(self, machine, machine_libcloud):
        self.ctl.connection.destroy_node(machine_libcloud)

    def _list_machines__machine_actions(self,  machine, machine_libcloud):
        super(AzureArmComputeController, self)._list_machines__machine_actions(
              machine, machine_libcloud)
        if machine_libcloud.state is NodeState.PAUSED:
            machine.actions.start = True


class GoogleComputeController(ComputeController):

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
                          machine.id, machine.name, self.ctl.cloud)

        # Get disk metadata.
        try:
            if extra.get('boot_disk'):
                machine.extra['boot_disk_size'] = extra['boot_disk'].size
                machine.extra['boot_disk_type'] = extra[
                                            'boot_disk'].extra.get('type')
                machine.extra.pop('boot_disk')
        except:
            log.exception("Couldn't parse disk for machine %s:%s for %s",
                          machine.id, machine.name, self.ctl.cloud)

        # Get zone name.
        try:
            if extra.get('zone'):
                machine.extra['zone'] = extra['zone'].name
        except:
            log.exception("Couldn't parse zone for machine %s:%s for %s",
                          machine.id, machine.name, self.ctl.cloud)

        # Get machine type.
        try:
            if extra.get('machineType'):
                machine_type = extra['machineType'].split('/')[-1]
                machine.extra['machine_type'] = machine_type
        except:
            log.exception("Couldn't parse machine type "
                          "for machine %s:%s for %s",
                          machine.id, machine.name, self.ctl.cloud)

    def _list_images__fetch_images(self, search=None):
        images = self.ctl.connection.list_images()
        # GCE has some objects in extra so we make sure they are not passed.
        for image in images:
            image.extra.pop('licenses', None)
        return images

    def _list_machines__cost_machine(self,  machine, machine_libcloud):
        if machine_libcloud.state == NodeState.TERMINATED:
            return 0, 0
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
        sizes = self.ctl.connection.list_sizes()
        for size in sizes:
            zone = size.extra.pop('zone')
            size.extra['zone'] = {
                'id': zone.id,
                'name': zone.name,
                'status': zone.status,
                'country': zone.country,
            }
        return sizes


HostVirtualComputeController = ComputeController


class PacketComputeController(ComputeController):

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('created_at')  # iso8601 string

    def _list_machines__cost_machine(self,  machine, machine_libcloud):
        size = machine_libcloud.extra.get('plan')
        price = get_size_price(driver_type='compute', driver_name='packet',
                               size_id=size)
        return price or 0, 0


class VultrComputeController(ComputeController):

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('date_created')  # iso8601 string

    def _list_machines__cost_machine(self,  machine, machine_libcloud):
        return machine_libcloud.extra.get('cost_per_month', 0)


VSphereComputeController = ComputeController


class VCloudComputeController(ComputeController):

    def _list_machines__machine_actions(self,  machine, machine_libcloud):
        super(VCloudComputeController, self)._list_machines__machine_actions(
              machine, machine_libcloud)
        if machine_libcloud.state is NodeState.PENDING:
            machine.actions.start = True
            machine.actions.stop = True


IndonesianVCloudComputeController = ComputeController


class OpenStackComputeController(ComputeController):

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.extra.get('created')  # iso8601 string

    def _list_machines__machine_actions(self,  machine, machine_libcloud):
        super(
            OpenStackComputeController, self
        )._list_machines__machine_actions(machine, machine_libcloud)
        machine.actions.rename = True


class DockerComputeController(ComputeController):

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return machine_libcloud.created_at  # unix timestamp

    def _list_images__fetch_images(self, search=None):
        # Fetch mist's recommended images
        images = [NodeImage(id=image, name=name,
                            driver=self.ctl.connection, extra={})
                  for image, name in config.DOCKER_IMAGES.items()]
        # Add starred images
        images += [NodeImage(id=image, name=image,
                             driver=self.ctl.connection, extra={})
                   for image in self.ctl.cloud.starred
                   if image not in config.DOCKER_IMAGES]
        # Fetch images from libcloud (supports search).
        if search:
            images += self.ctl.connection.search_images(term=search)[:100]
        else:
            images += self.ctl.connection.list_images()
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

        node_info = self.ctl.connection.inspect_node(machine_libcloud)
        try:
            port = node_info.extra[
                'network_settings']['Ports']['22/tcp'][0]['HostPort']
        except KeyError:
            port = 22

        for key_assoc in machine.key_associations:
            key_assoc.port = port
        machine.save()

    def _start_machine(self, machine, machine_libcloud):
        self.ctl.connection.ex_start_node(machine_libcloud)
        self._action_change_port(machine, machine_libcloud)

    def _reboot_machine(self,  machine, machine_libcloud):
        machine_libcloud.reboot()
        self._action_change_port(machine, machine_libcloud)

    def _destroy_machine(self, machine, machine_libcloud):
        if machine_libcloud.state == NodeState.RUNNING:
            self.ctl.connection.ex_stop_node(machine_libcloud)
        machine_libcloud.destroy()


class LibvirtComputeController(ComputeController):

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
        return self.ctl.connection.list_images(
            location=self.ctl.cloud.images_location)

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
                ssh_command(self.ctl.cloud.owner, self.ctl.cloud.id,
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
        self.ctl.connection.ex_resume_node(machine_libcloud)

    def _suspend_machine(self, machine, machine_libcloud):
        self.ctl.connection.ex_suspend_node(machine_libcloud)

    def _undefine_machine(self, machine, machine_libcloud):
        self.ctl.connection.ex_undefine_node(machine_libcloud)


class OtherComputeController(ComputeController):

    def _list_machines__machine_actions(self, machine, machine_libcloud):
        super(OtherComputeController, self)._list_machines__machine_actions(
            machine, machine_libcloud
        )
        machine.actions.reboot = False
        machine.actions.stop = False
        machine.actions.destroy = False
        # allow reboot action for bare metal with key associated
        if machine.key_associations:
            machine.actions.reboot = True

    def _reboot_machine(self, machine, machine_libcloud):
        try:
            if machine.public_ips:
                hostname = machine.public_ips[0]
            else:
                hostname = machine.private_ips[0]

            command = '$(command -v sudo) shutdown -r now'
            # TODO move it up
            from mist.core.methods import ssh_command
            ssh_command(self.ctl.cloud.owner, self.ctl.cloud.id,
                        machine.machine_id, hostname, command)
            return True
        except:
            return False
