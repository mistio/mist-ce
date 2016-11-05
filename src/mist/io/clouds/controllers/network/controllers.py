import logging
from mist.io.clouds.controllers.network.base import BaseNetworkController
from mist.io.exceptions import RequiredParameterMissingError, NetworkCreationError, NetworkError
from libcloud.compute.providers import get_driver
from libcloud.compute.types import Provider

from ipdb import launch_ipdb_on_exception

from mist.core.vpn.methods import destination_nat as dnat

log = logging.getLogger(__name__)


class AmazonNetworkController(BaseNetworkController):
    def _connect(self):
        return get_driver(Provider.EC2)(self.cloud.apikey,
                                        self.cloud.apisecret,
                                        region=self.cloud.region)

    def _delete_network(self, libcloud_network):
        try:
            subnets = self.connection.ex_list_subnets(filters={'vpc-id': libcloud_network.id})
            for subnet in subnets:
                self.connection.ex_delete_subnet(subnet)

            self.connection.ex_delete_network(libcloud_network)
        except Exception as e:
            raise NetworkError(str(e))

    def _create_network(self, network, subnet, router):
        try:
            new_network = self.connection.ex_create_network(name=network['name'],
                                                            cidr_block=network['cidr_block'],
                                                            instance_tenancy=network.get('instance_tenancy',
                                                                                         'default'))
        except Exception as e:
            raise NetworkCreationError("Got error %s" % str(e))

        ret = {'network': self._ec2_network_to_dict(new_network)}

        if subnet:
            try:
                new_subnet = self._create_subnet(subnet, new_network)
            except Exception as e:
                self.connection.ex_delete_network(new_network)
                raise NetworkCreationError("Got error %s" % str(e))
            ret['network']['subnets'] = [self._ec2_subnet_to_dict(new_subnet)]
        else:
            ret['network']['subnets'] = []

        return ret

    def _create_subnet(self, subnet, parent_network):

        try:
            cidr = subnet['cidr']
            availability_zone = subnet['availability_zone']
        except Exception as e:
            raise RequiredParameterMissingError(e)

        subnet = self.connection.ex_create_subnet(name=subnet.get('name'),
                                                  cidr_block=cidr,
                                                  vpc_id=parent_network.id,
                                                  availability_zone=availability_zone)
        return subnet

    @staticmethod
    def _ec2_network_to_dict(network):
        return {'name': network.name,
                'id': network.id,
                'is_default': network.extra.get('is_default', False),
                'state': network.extra.get('state'),
                'instance_tenancy': network.extra.get('instance_tenancy'),
                'dhcp_options_id': network.extra.get('dhcp_options_id'),
                'tags': network.extra.get('tags', [])}

    @staticmethod
    def _ec2_subnet_to_dict(subnet):
        return {'name': subnet.name,
                'id': subnet.id,
                'state': subnet.state,
                'available_ips': subnet.extra.get('available_ips'),
                'cidr_block': subnet.extra.get('cidr_block'),
                'tags': subnet.extra.get('tags', {}),
                'zone': subnet.extra.get('zone')}

    def _parse_network_listing(self, network_listing, return_format):
        self.connection.ex_list_subnets()
        for network in network_listing:
            network_entry = self._ec2_network_to_dict(network)
            subnets = self.connection.ex_list_subnets(filters={'vpc-id': network.id})
            network_entry['subnets'] = [self._ec2_subnet_to_dict(subnet) for subnet in subnets]
            return_format['public'].append(network_entry)
        return return_format


class GoogleNetworkController(BaseNetworkController):
    def _connect(self):
        return get_driver(Provider.GCE)(self.cloud.email,
                                        self.cloud.private_key,
                                        project=self.cloud.project_id)

    def _create_subnet(self, subnet, parent_network):
        try:
            name = subnet['name']
            cidr = subnet['cidr']
            region = subnet['region']
        except Exception as e:
            raise RequiredParameterMissingError(e)

        subnet = self.connection.ex_create_subnet(name=name,
                                                  cidr=cidr,
                                                  region=region,
                                                  description=subnet.get('description'),
                                                  network=parent_network)
        return subnet

    def _create_network(self, network, subnet, router):

        # Possible modes: legacy( no subnets), auto (automatic subnet creation), custom (manual subnet creation)
        # GCE forces this to be constant during a network's lifetime
        subnet_mode = network.get('mode', 'legacy')

        try:
            new_network = self.connection.ex_create_network(name=network['name'],
                                                            cidr=network.get('cidr_block'),
                                                            description=network.get('description'),
                                                            mode=subnet_mode)
        except Exception as e:
            raise NetworkCreationError("Got error %s" % str(e))

        ret = {'network': self._gce_network_to_dict(new_network)}

        if subnet_mode == 'custom':
            if subnet:
                try:
                    new_subnet = self._create_subnet(subnet, new_network)
                except Exception as e:
                    self._delete_network(new_network)
                    raise NetworkCreationError("Got error %s" % str(e))
                ret['network']['subnets'] = [self._gce_subnet_to_dict(new_subnet)]
            else:
                ret['network']['subnets'] = []

        return ret

    def _delete_network(self, libcloud_network):
        self.connection.ex_destroy_network(libcloud_network)

    def _parse_network_listing(self, network_listing, return_format):

        all_subnets = self.connection.ex_list_subnets()
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


class OpenStackNetworkController(BaseNetworkController):
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

    def _create_network(self, network, subnet, router):

        admin_state_up = network.get('admin_state_up', True)
        shared = network.get('shared', False)

        try:
            new_network = self.connection.ex_create_network(name=network['name'],
                                                            admin_state_up=admin_state_up,
                                                            shared=shared)
        except Exception as e:
            raise NetworkCreationError("Got error %s" % str(e))

        ret = {}
        if subnet:
            network_id = new_network.id

            try:
                subnet = self._create_subnet(subnet, new_network)
            except Exception as e:
                self.connection.ex_delete_network(network_id)
                raise NetworkCreationError("Got error %s" % str(e))

            ret['network'] = self._openstack_network_to_dict(new_network)
            ret['network']['subnets'] = [self._openstack_subnet_to_dict(subnet)]

        else:
            ret['network'] = self._openstack_network_to_dict(new_network)
            ret['network']['subnets'] = []

        return ret

    def _create_subnet(self, subnet, parent_network):

        try:
            subnet_name = subnet.get('name')
            cidr = subnet.get('cidr')
        except Exception as e:
            raise RequiredParameterMissingError(e)

        allocation_pools = subnet.get('allocation_pools', [])
        gateway_ip = subnet.get('gateway_ip', None)
        ip_version = subnet.get('ip_version', '4')
        enable_dhcp = subnet.get('enable_dhcp', True)

        return self.connection.ex_create_subnet(name=subnet_name,
                                                network_id=parent_network.id, cidr=cidr,
                                                allocation_pools=allocation_pools,
                                                gateway_ip=gateway_ip,
                                                ip_version=ip_version,
                                                enable_dhcp=enable_dhcp)

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

        conn = self.connection

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
