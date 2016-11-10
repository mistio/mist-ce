import logging
import time

from mist.io.clouds.controllers.network.base import BaseNetworkController
from mist.io.exceptions import RequiredParameterMissingError, NetworkCreationError, NetworkError
from libcloud.compute.drivers.ec2 import EC2Network, EC2NetworkSubnet
from libcloud.compute.drivers.gce import GCENetwork, GCESubnetwork
from libcloud.compute.drivers.openstack import OpenStackNetwork, OpenStackSubnet
import mist.io.clouds.controllers.network.models as netmodels


log = logging.getLogger(__name__)


class AmazonNetworkController(BaseNetworkController):
    NetworkModelClass = netmodels.AmazonNetwork
    SubnetModelClass = netmodels.AmazonSubnet

    def _create_network(self, network):

        try:
            name = network['name']
            cidr_block = network['cidr_block']
            instance_tenancy = network.get('instance_tenancy', 'default')
        except Exception as e:
            raise RequiredParameterMissingError(e)

        try:
            libcloud_network = self.ctl.compute.connection.ex_create_network(name=name,
                                                                             cidr_block=cidr_block,
                                                                             instance_tenancy=instance_tenancy)
        except Exception as e:
            raise NetworkCreationError("Got error %s" % str(e))

        return libcloud_network

    def _create_subnet(self, subnet, parent_network):

        try:
            name = subnet['name']
            cidr = subnet['cidr']
            availability_zone = subnet['availability_zone']
        except Exception as e:
            raise RequiredParameterMissingError(e)

        subnet = self.ctl.compute.connection.ex_create_subnet(name=name,
                                                              cidr_block=cidr,
                                                              vpc_id=parent_network.id,
                                                              availability_zone=availability_zone)
        return subnet

    def _list_subnets_for_network(self, libcloud_network):
        return self.ctl.compute.connection.ex_list_subnets(filters={'vpc-id': libcloud_network.id})

    def _delete_network(self, network):

        libcloud_network = EC2Network(id=network.network_id, name='', cidr_block='')

        for subnet in network.subnets:
            self._delete_subnet(subnet)

        self.ctl.compute.connection.ex_delete_network(libcloud_network)

    def _delete_subnet(self, subnet):

        libcloud_subnet = EC2NetworkSubnet(id=subnet.network_id, name='', state=None)
        self.ctl.compute.connection.ex_delete_subnet(libcloud_subnet)


class GoogleNetworkController(BaseNetworkController):
    NetworkModelClass = netmodels.GoogleNetwork
    SubnetModelClass = netmodels.AmazonSubnet

    def _create_network(self, network):

        try:
            name = network['name']
            # Possible modes: legacy( no subnets), auto (automatic subnet creation), custom (manual subnet creation)
            # GCE forces this to be constant during a network's lifetime
            subnet_mode = network.get('mode', 'legacy')
        except Exception as e:
            raise RequiredParameterMissingError(e)

        try:
            libcloud_network = self.ctl.compute.connection.ex_create_network(name=name,
                                                                             cidr=network.get('cidr_block'),
                                                                             description=network.get('description'),
                                                                             mode=subnet_mode)
        except Exception as e:
            raise NetworkCreationError("Got error %s" % str(e))

        return libcloud_network

    def _create_subnet(self, subnet, parent_network):
        try:
            name = subnet['name']
            cidr = subnet['cidr']
            region = subnet['region']
        except Exception as e:
            raise RequiredParameterMissingError(e)

        subnet = self.ctl.compute.connection.ex_create_subnetwork(name=name,
                                                                  cidr=cidr,
                                                                  region=region,
                                                                  description=subnet.get('description'),
                                                                  network=parent_network)
        return subnet

    def _delete_network(self, network):

        associated_subnets = [{'name': subnet.title, 'region': subnet.extra['region']}
                              for subnet in network.subnets]
        libcloud_network = GCENetwork(id='', name=network.title, cidr='',
                                      driver=None, extra=network.extra)

        # Destroy all associated subnetworks before destroying the network object
        try:
            for subnet in associated_subnets:
                self.ctl.compute.connection.ex_destroy_subnetwork(subnet['name'], region=subnet['region'])
        except Exception as e:
            raise NetworkError(str(e))

        # Subnet deletion calls are asynchronous and a network cannot be deleted before all of its subnets are gone
        # The network deletion call may not succeed immediately
        for attempt in range(10):
            try:
                self.ctl.compute.connection.ex_destroy_network(libcloud_network)
            except Exception as e:
                time.sleep(1)
            else:
                break
        # If all attempts are exhausted, raise an exception
        else:
            raise NetworkError('Failed to delete network {}'.format(libcloud_network.name))

        return True



class OpenStackNetworkController(BaseNetworkController):
    NetworkModelClass = netmodels.AmazonNetwork
    SubnetModelClass = netmodels.AmazonSubnet

    def _create_network(self, network):

        admin_state_up = network.get('admin_state_up', True)
        shared = network.get('shared', False)

        try:
            new_network = self.ctl.compute.connection.ex_create_network(name=network['name'],
                                                                        admin_state_up=admin_state_up,
                                                                        shared=shared)
        except Exception as e:
            raise NetworkCreationError("Got error %s" % str(e))

        return new_network

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

        return self.ctl.compute.connection.ex_create_subnet(name=subnet_name,
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

    def _delete_network(self, network):

        try:
            self.ctl.compute.connection.ex_delete_network(network.network_id)
        except Exception as e:
            raise NetworkError(e)
        return True


class DigitalOceanNetworkController(BaseNetworkController):
    pass


class LinodeNetworkController(BaseNetworkController):
    pass


class RackSpaceNetworkController(BaseNetworkController):
    pass


class SoftLayerNetworkController(BaseNetworkController):
    pass


class NephoScaleNetworkController(BaseNetworkController):
    pass


class AzureNetworkController(BaseNetworkController):
    pass


class AzureArmNetworkController(BaseNetworkController):
    pass


class HostVirtualNetworkController(BaseNetworkController):
    pass


class PacketNetworkController(BaseNetworkController):
    pass


class VultrNetworkController(BaseNetworkController):
    pass


class VSphereNetworkController(BaseNetworkController):
    pass


class VCloudNetworkController(BaseNetworkController):
    pass


class IndonesianVCloudNetworkController(BaseNetworkController):
    pass


class DockerNetworkController(BaseNetworkController):
    pass


class LibvirtNetworkController(BaseNetworkController):
    pass


class OtherNetworkController(BaseNetworkController):
    pass
