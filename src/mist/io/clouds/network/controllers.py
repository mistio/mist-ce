import logging
# from mist.io.clouds.network.models import Network, Subnet
from mist.io.clouds.network.base import NetworkController

log = logging.getLogger(__name__)


class AmazonNetworkController(NetworkController):
    def _create_network(self, network_listing):
        pass

    @staticmethod
    def _ec2_network_to_dict(network):
        net = {'name': network.name,
               'id': network.id,
               'is_default': network.extra.get('is_default', False),
               'state': network.extra.get('state'),
               'instance_tenancy': network.extra.get('instance_tenancy'),
               'dhcp_options_id': network.extra.get('dhcp_options_id'),
               'tags': network.extra.get('tags', []),
               'subnets': [{'name': network.cidr_block}]}
        return net

    def _parse_network_listing(self, network_listing, return_format):
        for network in network_listing:
            return_format['public'].append(self._ec2_network_to_dict(network))
        return return_format


class GoogleNetworkController(NetworkController):
    def _create_network(self, network_listing):
        pass

    def _parse_network_listing(self, network_listing, return_format):

        all_subnets = self.ctl.connection.ex_list_subnets()
        subnets = []
        for region in all_subnets:
            subnets += all_subnets[region]['subnetworks']
        for network in network_listing:
            return_format['public'].append(self._gce_network_to_dict(network, subnets=[s for s in subnets if
                                                                                       s['network'].endswith(
                                                                                           network.name)]))
        return return_format

    @staticmethod
    def _gce_network_to_dict(network, subnets=None):
        if subnets is None:
            subnets = []
        net = {'name': network.name,
               'id': network.id,
               'extra': network.extra,
               'subnets': [GoogleNetworkController._gce_subnet_to_dict(s) for s in subnets]}
        return net

    @staticmethod
    def _gce_subnet_to_dict(subnet):
        # In case network is empty
        if not subnet:
            return {}
        # Network and region come in URL form, so we have to split it
        # and use the last element of the splited list
        network = subnet['network'].split("/")[-1]
        region = subnet['region'].split("/")[-1]

        ret = {
            'id': subnet['id'],
            'name': subnet['name'],
            'network': network,
            'region': region,
            'cidr': subnet['ipCidrRange'],
            'gateway_ip': subnet['gatewayAddress'],
            'creation_timestamp': subnet['creationTimestamp']
        }
        return ret


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

        if conn.connection.tenant_id:
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
