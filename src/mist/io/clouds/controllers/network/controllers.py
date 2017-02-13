"""Definition of cloud-specific network subcontroller classes.

This file should only contain subclasses of `BaseNetworkController`.

"""

import logging

from mist.io.helpers import rename_kwargs

from mist.io.exceptions import SubnetNotFoundError
from mist.io.exceptions import NetworkNotFoundError

from mist.io.clouds.controllers.network.base import BaseNetworkController


log = logging.getLogger(__name__)


class AmazonNetworkController(BaseNetworkController):

    def _create_network__prepare_args(self, kwargs):
        rename_kwargs(kwargs, 'cidr', 'cidr_block')

    def _create_subnet__prepare_args(self, subnet, kwargs):
        kwargs['vpc_id'] = subnet.network.network_id
        rename_kwargs(kwargs, 'cidr', 'cidr_block')

    def _list_networks__cidr_range(self, network, libcloud_network):
        return libcloud_network.cidr_block

    def _list_networks__postparse_network(self, network, libcloud_network):
        tenancy = libcloud_network.extra.pop('instance_tenancy')
        network.instance_tenancy = tenancy

    def _list_subnets__fetch_subnets(self, network):
        kwargs = {'filters': {'vpc-id': network.network_id}}
        return self.cloud.ctl.compute.connection.ex_list_subnets(**kwargs)

    def _list_subnets__cidr_range(self, subnet, libcloud_subnet):
        return subnet.extra.pop('cidr_block')

    def _list_subnets__postparse_subnet(self, subnet, libcloud_subnet):
        subnet.availability_zone = libcloud_subnet.extra.pop('zone')

    def _delete_network(self, network, libcloud_network):
        self.cloud.ctl.compute.connection.ex_delete_network(libcloud_network)

    def _delete_subnet(self, subnet, libcloud_subnet):
        self.cloud.ctl.compute.connection.ex_delete_subnet(libcloud_subnet)

    def _get_libcloud_network(self, network):
        kwargs = {'network_ids': [network.network_id]}
        networks = self.cloud.ctl.compute.connection.ex_list_networks(**kwargs)
        if networks:
            return networks[0]
        raise NetworkNotFoundError('Network %s with network_id %s' %
                                   (network.name, network.network_id))

    def _get_libcloud_subnet(self, subnet):
        kwargs = {'subnet_ids': [subnet.subnet_id]}
        subnets = self.cloud.ctl.compute.connection.ex_list_subnets(**kwargs)
        if subnets:
            return subnets[0]
        raise SubnetNotFoundError('Subnet %s with subnet_id %s' %
                                  (subnet.name, subnet.subnet_id))


class GoogleNetworkController(BaseNetworkController):

    def _create_subnet__prepare_args(self, subnet, kwargs):
        kwargs['network'] = subnet.network.name

    def _create_subnet(self, kwargs):
        return self.cloud.ctl.compute.connection.ex_create_subnetwork(**kwargs)

    def _list_networks__cidr_range(self, network, libcloud_network):
        return libcloud_network.cidr

    def _list_networks__postparse_network(self, network, libcloud_network):
        network.mode = libcloud_network.mode

    def _list_subnets__fetch_subnets(self, network):
        kwargs = {
            'filters': {'filter': 'network eq %s' % network.extra['selfLink']}
        }
        return self.cloud.ctl.compute.connection.ex_list_subnetworks(**kwargs)

    def _list_subnets__postparse_subnet(self, subnet, libcloud_subnet):
        # Replace `GCERegion` object with the region's name.
        if hasattr(libcloud_subnet, 'region'):
            region = libcloud_subnet.region.name
        else:
            try:
                region = subnet.extra['region']
                region = region.split('regions/')[-1]
            except (KeyError, IndexError):
                region = ''
                log.error('Failed to extract region name for %s', subnet)
        if region:
            subnet.region = region

    def _get_libcloud_network(self, network):
        return self.cloud.ctl.compute.connection.ex_get_network(network.name)

    def _get_libcloud_subnet(self, subnet):
        kwargs = {'name': subnet.name,
                  'region': subnet.region}
        return self.cloud.ctl.compute.connection.ex_get_subnetwork(**kwargs)


class OpenStackNetworkController(BaseNetworkController):

    def _create_subnet__prepare_args(self, subnet, kwargs):
        kwargs['network_id'] = subnet.network.network_id

    def _list_networks__postparse_network(self, network, libcloud_network):
        for field in network._network_specific_fields:
            if hasattr(libcloud_network, field):
                value = getattr(libcloud_network, field)
            else:
                try:
                    value = network.extra.pop(field)
                except KeyError:
                    log.error('Failed to get value for "%s" for network '
                              '"%s" (%s)', field, network.name, network.id)
                    continue
            setattr(network, field, value)

    def _list_subnets__fetch_subnets(self, network):
        kwargs = {'filters': {'network_id': network.network_id}}
        return self.cloud.ctl.compute.connection.ex_list_subnets(**kwargs)

    def _list_subnets__postparse_subnet(self, subnet, libcloud_subnet):
        for field in subnet._subnet_specific_fields:
            if hasattr(libcloud_subnet, field):
                value = getattr(libcloud_subnet, field)
            else:
                log.error('Failed to get value for "%s" for subnet'
                          ' "%s" (%s)', field, subnet.name, subnet.id)
                continue
            setattr(subnet, field, value)

    def _delete_network(self, network, libcloud_network):
        network_id = libcloud_network.id
        self.cloud.ctl.compute.connection.ex_delete_network(network_id)

    def _delete_subnet(self, subnet, libcloud_subnet):
        self.cloud.ctl.compute.connection.ex_delete_subnet(libcloud_subnet.id)
