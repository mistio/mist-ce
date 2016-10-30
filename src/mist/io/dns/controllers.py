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

from mist.io.dns.base import BaseController

from libcloud.dns.types import Provider, RecordType
from libcloud.dns.providers import get_driver

log = logging.getLogger(__name__)


class Route53Controller(BaseController):

    provider = 'route53'

    def _connect(self):
        return get_driver(Provider.ROUTE53)(self.cloud.apikey,
                                        self.cloud.apisecret)

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


class GoogleController(BaseController):

    provider = 'google'

    def _connect(self):
        return get_driver(Provider.GOOGLE)(self.cloud.email,
                                        self.cloud.private_key)

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
