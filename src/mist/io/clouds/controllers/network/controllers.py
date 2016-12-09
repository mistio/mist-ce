import logging
import re

import mongoengine.errors

from mist.io.clouds.controllers.network.base import BaseNetworkController, LibcloudExceptionHandler
from mist.io.helpers import rename_kwargs
from mist.io.clouds.utils import valid_cidr
import mist.io.exceptions

log = logging.getLogger(__name__)


class AmazonNetworkController(BaseNetworkController):
    provider = 'ec2'
    create_network_allowed_keys = ('name', 'cidr_block', 'instance_tenancy')
    create_subnet_allowed_keys = ('vpc_id', 'cidr_block', 'availability_zone', 'name')

    def _create_network__parse_args(self, kwargs):
        if not valid_cidr(kwargs.get('cidr')):
            raise mist.io.exceptions.InvalidParameterValue('cidr')
        if 'instance_tenancy' in kwargs and kwargs.get('instance_tenancy') not in ['default', 'private']:
            raise mist.io.exceptions.BadRequestError('instance_tenancy')
        rename_kwargs(kwargs, 'cidr', 'cidr_block')

        [kwargs.pop(key) for key in kwargs.keys() if key not in self.create_network_allowed_keys]

    @staticmethod
    def _list_networks__parse_libcloud_object(network, libcloud_network):
        network.cidr = libcloud_network.cidr_block
        network.state = libcloud_network.extra.pop('state')
        network.instance_tenancy = libcloud_network.extra.pop('instance_tenancy')

    def _create_subnet__parse_args(self, network, kwargs):
        if not valid_cidr(kwargs.get('cidr')):
            raise mist.io.exceptions.InvalidParameterValue('cidr')
        if not kwargs.get('availability_zone'):
            raise mist.io.exceptions.RequiredParameterMissingError('availability_zone')
        kwargs['vpc_id'] = network.network_id
        rename_kwargs(kwargs, 'cidr', 'cidr_block')

        [kwargs.pop(key) for key in kwargs.keys() if key not in self.create_subnet_allowed_keys]

    @staticmethod
    def _list_subnets__parse_libcloud_object(subnet, libcloud_subnet):
        subnet.cidr = libcloud_subnet.extra.pop('cidr_block')
        subnet.available_ips = libcloud_subnet.extra.pop('available_ips')
        subnet.zone = libcloud_subnet.extra.pop('zone')

    def _list_subnets__parse_args(self, network, kwargs):
        kwargs['filters'] = {'vpc-id': network.network_id}

    def _delete_network__parse_args(self, network, kwargs):
        kwargs['vpc'] = self._get_libcloud_network(network)

    def _delete_subnet__parse_args(self, subnet, kwargs):
        kwargs['subnet'] = self._get_libcloud_subnet(subnet)

    def _get_libcloud_network(self, network):
        networks = self.ctl.compute.connection.ex_list_networks(network_ids=[network.network_id])
        return networks[0] if networks else None

    def _get_libcloud_subnet(self, subnet):
        subnets = self.ctl.compute.connection.ex_list_subnets(subnet_ids=[subnet.subnet_id])
        return subnets[0] if subnets else None


class GoogleNetworkController(BaseNetworkController):
    provider = 'gce'
    # GCE requires networking asset names to match this Regex
    gce_asset_name_regex = re.compile('^(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)$')
    create_network_allowed_keys = ('name', 'mode', 'cidr', 'description')
    create_subnet_allowed_keys = ('name', 'cidr', 'network', 'region', 'description')

    def _create_network__parse_args(self, kwargs):

        if not re.match(self.gce_asset_name_regex, kwargs.get('name', '')):
            raise mist.io.exceptions.InvalidParameterValue('name')
        # valid modes are legacy = No subnets, auto = Auto subnet creation, custom = Manual Subnet Creation
        kwargs['mode'] = kwargs.get('mode', 'legacy')
        if kwargs['mode'] == 'legacy':
            # legacy mode networks require a CIDR address setting
            if not valid_cidr(kwargs.get('cidr')):
                raise mist.io.exceptions.InvalidParameterValue('cidr')
        else:
            # libcloud forbids passing a CIDR param for auto and custom modes
            kwargs['cidr'] = None

        [kwargs.pop(key) for key in kwargs.keys() if key not in self.create_network_allowed_keys]

    @staticmethod
    def _list_networks__parse_libcloud_object(network, libcloud_network):
        network.cidr = libcloud_network.cidr
        network.gateway_ip = libcloud_network.extra.pop('gatewayIPv4')
        network.mode = libcloud_network.mode
        network.description = libcloud_network.extra['description']

    def _create_subnet__parse_args(self, network, kwargs):
        # GCE requires subnet names to match this Regex
        if not re.match(self.gce_asset_name_regex, kwargs.get('name', '')):
            raise mist.io.exceptions.InvalidParameterValue('name')
        if not valid_cidr(kwargs.get('cidr')):
            raise mist.io.exceptions.InvalidParameterValue('cidr')
        if not kwargs.get('region'):
            raise mist.io.exceptions.RequiredParameterMissingError('region')
        kwargs['network'] = network.title

        [kwargs.pop(key) for key in kwargs.keys() if key not in self.create_subnet_allowed_keys]

    @staticmethod
    def _list_subnets__parse_libcloud_object(subnet, libcloud_subnet):
        subnet.cidr = libcloud_subnet.cidr
        subnet.gateway_ip = libcloud_subnet.extra.pop('gatewayAddress')
        subnet.region = libcloud_subnet.region.name
        subnet.description = libcloud_subnet.extra['description']

    @LibcloudExceptionHandler(mist.io.exceptions.SubnetCreationError)
    def create_subnet(self, subnet, **kwargs):
        """Creates a new subnet.
        Overridden because of different libcloud method name."""

        kwargs['name'] = subnet.title
        kwargs['description'] = subnet.description

        self._create_subnet__parse_args(subnet.network, kwargs)
        libcloud_subnet = self.ctl.compute.connection.ex_create_subnetwork(**kwargs)

        """ The region attribute is needed for libcloud API calls on the subnet object, including the
        ex_destroy_subnetwork call, so we cannot safely  wait for list_networks to populate its value."""
        subnet.region = libcloud_subnet.region.name

        try:
            subnet.subnet_id = libcloud_subnet.id
            subnet.save()
        except mongoengine.errors.ValidationError as exc:
            log.error("Error saving Subnet %s: %s", subnet.title, exc.to_dict())
            raise mist.io.exceptions.NetworkCreationError(exc.message)
        except mongoengine.errors.NotUniqueError as exc:
            log.error("Subnet %s not unique error: %s", subnet.title, exc)
            raise mist.io.exceptions.SubnetExistsError(exc.message)

        return libcloud_subnet

    @LibcloudExceptionHandler(mist.io.exceptions.SubnetListingError)
    def list_subnets(self, network, **kwargs):
        """List all Subnets for a particular network present on the cloud.
        Has been overridden because of different libcloud method name."""

        from mist.io.networks.models import Subnet
        from mist.io.networks.models import SUBNETS

        self._list_subnets__parse_args(network, kwargs)
        libcloud_subnets = self.ctl.compute.connection.ex_list_subnetworks(**kwargs)

        subnet_listing = []
        for libcloud_subnet in libcloud_subnets:
            if network.network_id == libcloud_subnet.network.id:
                try:
                    subnet = Subnet.objects.get(network=network, subnet_id=libcloud_subnet.id)
                except Subnet.DoesNotExist:
                    subnet = SUBNETS[self.provider](network=network, subnet_id=libcloud_subnet.id)

                self._list_subnets__parse_libcloud_object(subnet, libcloud_subnet)

                subnet.title = libcloud_subnet.name
                if libcloud_subnet.extra.get('description'):
                    subnet.description = libcloud_subnet.extra.pop('description')
                subnet.extra = libcloud_subnet.extra

                try:
                    subnet.save()
                except mongoengine.errors.ValidationError as exc:
                    log.error("Error updating Subnet %s: %s", subnet.title, exc.to_dict())
                    raise mist.io.exceptions.NetworkCreationError(exc.message)
                except mongoengine.errors.NotUniqueError as exc:
                    log.error("Subnet %s not unique error: %s", subnet.title, exc)
                    raise mist.io.exceptions.SubnetExistsError(exc.message)
                subnet_listing.append(subnet)

        return subnet_listing

    @LibcloudExceptionHandler(mist.io.exceptions.NetworkDeletionError)
    def delete_network(self, network, **kwargs):
        """Delete a Network.
        Overridden because of different libcloud method name."""

        from mist.io.networks.models import Subnet

        if network.mode == 'custom':
            associated_subnets = Subnet.objects(network=network)
            for subnet in associated_subnets:
                subnet.ctl.delete_subnet()

        self._delete_network__parse_args(network, kwargs)

        self.ctl.compute.connection.ex_destroy_network(**kwargs)

        network.delete()

    def _delete_network__parse_args(self, network, kwargs):
        kwargs['network'] = self._get_libcloud_network(network)

    @LibcloudExceptionHandler(mist.io.exceptions.SubnetDeletionError)
    def delete_subnet(self, subnet, **kwargs):
        """Delete a Subnet."""

        self._delete_subnet__parse_args(subnet, kwargs)
        self.ctl.compute.connection.ex_destroy_subnetwork(**kwargs)

        subnet.delete()

    def _delete_subnet__parse_args(self, subnet, kwargs):
        kwargs['name'] = subnet.title
        kwargs['region'] = subnet.region

    def _get_libcloud_network(self, network):
        return self.ctl.compute.connection.ex_get_network(network.title)

    def _get_libcloud_subnet(self, subnet):
        return self.ctl.compute.connection.ex_get_subnetwork(name=subnet.title, region=subnet.region)


class OpenStackNetworkController(BaseNetworkController):
    provider = 'openstack'
    create_network_allowed_keys = ('name', 'admin_state_up', 'shared')
    create_subnet_allowed_keys = ('name', 'cidr', 'network_id', 'allocation_pools',
                                  'gateway_ip', 'ip_version', 'enable_dhcp')

    def _create_network__parse_args(self, kwargs):
        if not kwargs.get('name'):
            raise mist.io.exceptions.RequiredParameterMissingError('name')
        kwargs['admin_state_up'] = kwargs.get('admin_state_up', True)
        kwargs['shared'] = kwargs.get('shared', False)

        [kwargs.pop(key) for key in kwargs.keys() if key not in self.create_network_allowed_keys]

    @staticmethod
    def _list_networks__parse_libcloud_object(network, libcloud_network):
        network.admin_state_up = libcloud_network.extra.get('admin_state_up')
        network.shared = libcloud_network.extra.get('shared')

    def _create_subnet__parse_args(self, network, kwargs):
        if not kwargs.get('name'):
            raise mist.io.exceptions.RequiredParameterMissingError('name')
        if not valid_cidr(kwargs.get('cidr')):
            raise mist.io.exceptions.InvalidParameterValue('cidr')
        kwargs['network_id'] = network.network_id
        kwargs['allocation_pools'] = kwargs.get('allocation_pools', [])
        kwargs['gateway_ip'] = kwargs.get('gateway_ip', None)
        kwargs['ip_version'] = kwargs.get('ip_version', '4')
        kwargs['enable_dhcp'] = kwargs.get('enable_dhcp', True)

        [kwargs.pop(key) for key in kwargs.keys() if key not in self.create_subnet_allowed_keys]

    @staticmethod
    def _list_subnets__parse_libcloud_object(subnet, libcloud_subnet):
        subnet.cidr = libcloud_subnet.cidr
        subnet.gateway_ip = libcloud_subnet.gateway_ip
        subnet.enable_dhcp = libcloud_subnet.enable_dhcp
        subnet.dns_nameservers = libcloud_subnet.dns_nameservers
        subnet.allocation_pools = libcloud_subnet.allocation_pools

    @LibcloudExceptionHandler(mist.io.exceptions.SubnetListingError)
    def list_subnets(self, network, **kwargs):
        """List all Subnets for a particular network present on the cloud.
        Overridden to implement filtering with the network arg"""

        from mist.io.networks.models import Subnet
        from mist.io.networks.models import SUBNETS

        self._list_subnets__parse_args(network, kwargs)
        libcloud_subnets = self.ctl.compute.connection.ex_list_subnets(**kwargs)

        subnet_listing = []
        for libcloud_subnet in libcloud_subnets:
            if libcloud_subnet.network_id == network.network_id:
                try:
                    subnet = Subnet.objects.get(network=network, subnet_id=libcloud_subnet.id)
                except Subnet.DoesNotExist:
                    subnet = SUBNETS[self.provider](network=network, subnet_id=libcloud_subnet.id)

                self._list_subnets__parse_libcloud_object(subnet, libcloud_subnet)

                subnet.title = libcloud_subnet.name
                if libcloud_subnet.extra.get('description'):
                    subnet.description = libcloud_subnet.extra.pop('description')
                subnet.extra = libcloud_subnet.extra

                try:
                    subnet.save()
                except mongoengine.errors.ValidationError as exc:
                    log.error("Error updating Subnet %s: %s", subnet.title, exc.to_dict())
                    raise mist.io.exceptions.NetworkCreationError(exc.message)
                except mongoengine.errors.NotUniqueError as exc:
                    log.error("Subnet %s not unique error: %s", subnet.title, exc)
                    raise mist.io.exceptions.SubnetExistsError(exc.message)
                subnet_listing.append(subnet)

        return subnet_listing

    def _delete_network__parse_args(self, network, kwargs):
        kwargs['network_id'] = network.network_id

    def _delete_subnet__parse_args(self, subnet, kwargs):
        kwargs['subnet_id'] = subnet.subnet_id

    def _get_libcloud_network(self, network):
        networks = self.ctl.compute.connection.ex_list_networks()
        for net in networks:
            if net.network_id == network.network_id:
                return net
        return None

    def _get_libcloud_subnet(self, subnet):
        subnets = self.ctl.compute.connection.ex_list_subnets()
        for sub in subnets:
            if sub.subnet_id == subnet.subnet_id:
                return sub
        return None
