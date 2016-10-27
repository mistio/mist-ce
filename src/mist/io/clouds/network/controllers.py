import logging
from mist.io.clouds.models import Network, Subnet
from mist.io.clouds.network.base import NetworkController


log = logging.getLogger(__name__)


class AmazonNetworkController(NetworkController):

    def _create_network(self, network_listing):
        pass

    def _parse_network_listing(self, network_listing):
        pass


class GoogleNetworkController(NetworkController):

    def _create_network(self, network_listing):
        pass

    def _parse_network_listing(self, network_listing):
        pass


class OpenStackNetworkController(NetworkController):

    def _create_network(self, network_listing):
        pass

    @staticmethod
    def _openstack_network_to_dict(network, subnets=None, floating_ips=None, nodes=None):
        if nodes is None:
            nodes = []
        if floating_ips is None:
            floating_ips = []
        if subnets is None:
            subnets = []

        net = {'name': network.name,
               'id': network.id,
               'status': network.status,
               'router_external': network.router_external,
               'extra': network.extra,
               'public': bool(network.router_external),
               'subnets': [OpenStackNetworkController._openstack_subnet_to_dict(subnet)
                           for subnet in subnets if subnet.id in network.subnets], 'floating_ips': []}
        for floating_ip in floating_ips:
            if floating_ip.floating_network_id == network.id:
                net['floating_ips'].append(
                    OpenStackNetworkController._openstack_floating_ip_to_dict(floating_ip, nodes))
        return net

    @staticmethod
    def _openstack_floating_ip_to_dict(floating_ip, nodes=None):
        if nodes is None:
            nodes = []

        ret = {'id': floating_ip.id,
               'floating_network_id': floating_ip.floating_network_id,
               'floating_ip_address': floating_ip.floating_ip_address,
               'fixed_ip_address': floating_ip.fixed_ip_address,
               'status': str(floating_ip.status),
               'port_id': floating_ip.port_id,
               'extra': floating_ip.extra,
               'node_id': ''}

        for node in nodes:
            if floating_ip.fixed_ip_address in node.private_ips:
                ret['node_id'] = node.id

        return ret

    @staticmethod
    def _openstack_subnet_to_dict(subnet):
        net = {'name': subnet.name,
               'id': subnet.id,
               'cidr': subnet.cidr,
               'enable_dhcp': subnet.enable_dhcp,
               'dns_nameservers': subnet.dns_nameservers,
               'allocation_pools': subnet.allocation_pools,
               'gateway_ip': subnet.gateway_ip,
               'ip_version': subnet.ip_version,
               'extra': subnet.extra}

        return net

    @staticmethod
    def _openstack_router_to_dict(router):
        ret = {'name': router.name,
               'id': router.id,
               'status': router.status,
               'external_gateway_info': router.external_gateway_info,
               'external_gateway': router.external_gateway,
               'admin_state_up': router.admin_state_up,
               'extra': router.extra}

        return ret

    def _parse_network_listing(self, network_listing, return_format):

        conn = self.ctl.connection

        subnets = conn.ex_list_subnets()
        routers = conn.ex_list_routers()
        floating_ips = conn.ex_list_floating_ips()
        if conn.tenant_id:
            floating_ips = [floating_ip for floating_ip in floating_ips if
                            floating_ip.extra.get('tenant_id') == conn.connection.tenant_id]
        nodes = conn.list_nodes() if floating_ips else []

        public_networks, private_networks = [], []

        for net in network_listing:
            public_networks.append(net) if net.router_external else private_networks.append(net)

        for pub_net in public_networks:
            return_format['public'].append(self._openstack_network_to_dict(pub_net, subnets, floating_ips, nodes))
        for network in private_networks:
            return_format['private'].append(self._openstack_network_to_dict(network, subnets))
        for router in routers:
            return_format['routers'].append(self._openstack_router_to_dict(router))

        return return_format

