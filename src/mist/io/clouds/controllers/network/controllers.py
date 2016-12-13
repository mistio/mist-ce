"""Definition of cloud-specific network subcontroller classes.

This file should only contain subclasses of BaseNetworkController.

"""
import logging

from mist.io.clouds.controllers.network.base import BaseNetworkController
from mist.io.helpers import rename_kwargs


log = logging.getLogger(__name__)


class AmazonNetworkController(BaseNetworkController):
    provider = 'ec2'

    def _create_network__parse_args(self, network_args):
        rename_kwargs(network_args, 'cidr', 'cidr_block')

    @staticmethod
    def _list_networks__parse_libcloud_object(network, libcloud_network):
        network.cidr = libcloud_network.cidr_block
        network.instance_tenancy = libcloud_network.extra.pop('instance_tenancy')

    def _create_subnet__parse_args(self, network, kwargs):
        kwargs['vpc_id'] = network.network_id
        rename_kwargs(kwargs, 'cidr', 'cidr_block')

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

    def _create_subnet__parse_args(self, network, kwargs):
        kwargs['network'] = network.title

    def _create_subnet__create_libcloud_subnet(self, subnet, kwargs):
        libcloud_subnet = self.ctl.compute.connection.ex_create_subnetwork(**kwargs)
        """ The region attribute is needed for libcloud API calls on the subnet object, including the
        ex_destroy_subnetwork call, so we cannot safely  wait for list_networks to populate its value."""
        subnet.region = libcloud_subnet.region.name
        return libcloud_subnet

    @staticmethod
    def _list_networks__parse_libcloud_object(network, libcloud_network):
        network.cidr = libcloud_network.cidr
        network.gateway_ip = libcloud_network.extra.pop('gatewayIPv4')
        network.mode = libcloud_network.mode

    @staticmethod
    def _list_subnets__parse_libcloud_object(subnet, libcloud_subnet):
        subnet.cidr = libcloud_subnet.cidr
        subnet.gateway_ip = libcloud_subnet.extra.pop('gatewayAddress')
        subnet.region = libcloud_subnet.region.name

    def _list_subnets__fetch_subnets(self, network, kwargs):
        libcloud_subnets = self.ctl.compute.connection.ex_list_subnetworks(**kwargs)
        return [libcloud_subnet for libcloud_subnet in libcloud_subnets
                if libcloud_subnet.network.id == network.network_id]

    def _delete_network__delete_libcloud_network(self, network, kwargs):
        # FIXME: Move these imports to the top of the file when circular import issues are resolved
        from mist.io.networks.models import Subnet

        if network.mode == 'custom':
            associated_subnets = Subnet.objects(network=network)
            for subnet in associated_subnets:
                subnet.ctl.delete_subnet()

        self.ctl.compute.connection.ex_destroy_network(**kwargs)

    def _delete_network__parse_args(self, network, kwargs):
        kwargs['network'] = self._get_libcloud_network(network)

    def _delete_subnet__parse_args(self, subnet, kwargs):
        kwargs['name'] = subnet.title
        kwargs['region'] = subnet.region

    def _delete_subnet__delete_libcloud_subnet(self, network, kwargs):
        self.ctl.compute.connection.ex_destroy_subnetwork(**kwargs)

    def _get_libcloud_network(self, network):
        return self.ctl.compute.connection.ex_get_network(network.title)

    def _get_libcloud_subnet(self, subnet):
        return self.ctl.compute.connection.ex_get_subnetwork(name=subnet.title, region=subnet.region)


class OpenStackNetworkController(BaseNetworkController):
    provider = 'openstack'

    @staticmethod
    def _list_networks__parse_libcloud_object(network, libcloud_network):
        network.admin_state_up = libcloud_network.extra.get('admin_state_up')
        network.shared = libcloud_network.extra.get('shared')

    def _create_subnet__parse_args(self, network, kwargs):
        kwargs['network_id'] = network.network_id

    def _list_subnets__fetch_subnets(self, network, kwargs):
        libcloud_subnets = self.ctl.compute.connection.ex_list_subnets(**kwargs)
        return [libcloud_subnet for libcloud_subnet in libcloud_subnets
                if libcloud_subnet.network_id == network.network_id]

    @staticmethod
    def _list_subnets__parse_libcloud_object(subnet, libcloud_subnet):
        subnet.cidr = libcloud_subnet.cidr
        subnet.gateway_ip = libcloud_subnet.gateway_ip
        subnet.enable_dhcp = libcloud_subnet.enable_dhcp
        subnet.dns_nameservers = libcloud_subnet.dns_nameservers
        subnet.allocation_pools = libcloud_subnet.allocation_pools

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
