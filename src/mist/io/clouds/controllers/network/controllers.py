import logging
import time

from mist.io.clouds.controllers.network.base import BaseNetworkController
from mist.io.exceptions import RequiredParameterMissingError, NetworkCreationError, NetworkError
from libcloud.compute.drivers.ec2 import EC2Network, EC2NetworkSubnet
from libcloud.compute.drivers.gce import GCENetwork
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
                                                              vpc_id=parent_network.network_id,
                                                              availability_zone=availability_zone)
        return subnet

    def _list_subnets(self, for_network=None):
        if for_network:
            return self.ctl.compute.connection.ex_list_subnets(filters={'vpc-id': for_network.network_id})
        else:
            return self.ctl.compute.connection.ex_list_subnets()

    def _delete_network(self, network):

        libcloud_network = EC2Network(id=network.network_id, name='', cidr_block='')
        try:
            self.ctl.compute.connection.ex_delete_network(libcloud_network)
        except Exception as e:
            raise NetworkError("Got error %s" % str(e))

    def _delete_subnet(self, subnet_doc):

        libcloud_subnet = EC2NetworkSubnet(id=subnet_doc.subnet_id, name='', state=None)
        try:
            self.ctl.compute.connection.ex_delete_subnet(libcloud_subnet)
        except Exception as e:
            raise NetworkError("Got error %s" % str(e))


class GoogleNetworkController(BaseNetworkController):

    NetworkModelClass = netmodels.GoogleNetwork
    SubnetModelClass = netmodels.GoogleSubnet

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
                                                                  network=parent_network.title)
        return subnet

    def _delete_network(self, network):

        libcloud_network = GCENetwork(id='', name=network.title, cidr='',
                                      driver=None, extra={})

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
            raise NetworkError('Failed to delete network {}'.format(network.title))

    def _list_subnets(self, for_network=None):
        requested_subnets = []
        all_subnets = self.ctl.compute.connection.ex_list_subnetworks()
        for subnet in all_subnets:
            if not for_network or subnet.network == for_network.title:
                requested_subnets.append(subnet)
        return requested_subnets

    def _delete_subnet(self, subnet_doc):
        try:
            self.ctl.compute.connection.ex_destroy_subnetwork(subnet_doc.title, region=subnet_doc.region)
        except Exception as e:
            raise NetworkError("Got error %s" % str(e))


class OpenStackNetworkController(BaseNetworkController):

    NetworkModelClass = netmodels.OpenStackNetwork
    SubnetModelClass = netmodels.OpenStackSubnet

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
                                                            network_id=parent_network.network_id, cidr=cidr,
                                                            allocation_pools=allocation_pools,
                                                            gateway_ip=gateway_ip,
                                                            ip_version=ip_version,
                                                            enable_dhcp=enable_dhcp)

    def _delete_network(self, network):

        try:
            self.ctl.compute.connection.ex_delete_network(network.network_id)
        except Exception as e:
            raise NetworkError(e)

    def _list_subnets(self, for_network=None):
        all_subnets = self.ctl.compute.connection.ex_list_subnets()
        db_subnet_ids = [subnet.subnet_id for subnet in for_network.subnets] if for_network else []
        if for_network:
            return [sub for sub in all_subnets if sub.id in db_subnet_ids]
        else:
            return all_subnets

    def _delete_subnet(self, subnet):
        try:
            self.ctl.compute.connection.ex_delete_subnet(subnet.subnet_id)
        except Exception as e:
            raise NetworkError(e)


class DigitalOceanNetworkController(BaseNetworkController):
    pass


class LinodeNetworkController(BaseNetworkController):
    pass


class RackSpaceNetworkController(BaseNetworkController):
    pass


class SoftlayerNetworkController(BaseNetworkController):
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
