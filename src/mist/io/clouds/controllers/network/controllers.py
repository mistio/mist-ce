import logging

import mongoengine.errors

from mist.io.clouds.controllers.network.base import BaseNetworkController, LibcloudExceptionHandler, fix_dict_encoding
from mist.io.helpers import rename_kwargs
import mist.io.exceptions

log = logging.getLogger(__name__)


class AmazonNetworkController(BaseNetworkController):
    provider = 'ec2'

    def _create_network__parse_args(self, kwargs):
        rename_kwargs(kwargs, 'cidr', 'cidr_block')
        kwargs.pop('description', None)

    @staticmethod
    def _list_networks__parse_libcloud_object(network, libcloud_network):
        network.cidr = libcloud_network.cidr_block
        network.instance_tenancy = libcloud_network.extra.pop('instance_tenancy')

    def _create_subnet__parse_args(self, network, kwargs):
        kwargs['vpc_id'] = network.network_id
        rename_kwargs(kwargs, 'cidr', 'cidr_block')
        kwargs.pop('description', None)

    @staticmethod
    def _list_subnets__parse_libcloud_object(subnet, libcloud_subnet):
        subnet.cidr = libcloud_subnet.extra.pop('cidr_block')
        subnet.availability_zone = libcloud_subnet.extra.pop('zone')
        subnet.available_ips = libcloud_subnet.extra.pop('available_ips')

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

    def _create_network__parse_args(self, kwargs):
        # CIDR is a mandatory argument, but it must be None if mode != 'legacy'
        # CIDR validity for legacy mode has already been checked in GoogleNetwork.add()
        if 'cidr' not in kwargs:
            kwargs['cidr'] = None

    @staticmethod
    def _list_networks__parse_libcloud_object(network, libcloud_network):
        network.cidr = libcloud_network.cidr
        network.gateway_ip = libcloud_network.extra.pop('gatewayIPv4')
        network.mode = libcloud_network.mode
        network.description = libcloud_network.extra['description']

    def _create_subnet__parse_args(self, network, kwargs):
        kwargs['network'] = network.title

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
        kwargs['cidr'] = subnet.cidr
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

                libcloud_subnet.extra = fix_dict_encoding(libcloud_subnet.extra)
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

    def _create_network__parse_args(self, kwargs):
        kwargs.pop('description', None)

    @staticmethod
    def _list_networks__parse_libcloud_object(network, libcloud_network):
        network.admin_state_up = libcloud_network.extra.get('admin_state_up')
        network.shared = libcloud_network.extra.get('shared')

    def _create_subnet__parse_args(self, network, kwargs):
        kwargs['network_id'] = network.network_id
        kwargs.pop('description', None)

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
                libcloud_subnet.extra = fix_dict_encoding(libcloud_subnet.extra)
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
