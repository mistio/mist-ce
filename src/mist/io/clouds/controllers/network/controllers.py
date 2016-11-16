import logging
import time

from mist.io.clouds.controllers.network.base import BaseNetworkController
from mist.io.exceptions import RequiredParameterMissingError, NetworkCreationError, NetworkError
from libcloud.compute.drivers.ec2 import EC2Network, EC2NetworkSubnet
from libcloud.compute.drivers.gce import GCENetwork


log = logging.getLogger(__name__)


class AmazonNetworkController(BaseNetworkController):

    # def add_network(cls, libcloud_network):
    #     return AmazonNetwork(title=libcloud_network.name,
    #                          network_id=libcloud_network.id,
    #                          is_default=libcloud_network.extra['is_default'],
    #                          state=libcloud_network.extra['state'],
    #                          instance_tenancy=libcloud_network.extra['instance_tenancy'],
    #                          dhcp_options_id=libcloud_network.extra['dhcp_options_id'],
    #                          tags=libcloud_network.extra['tags'])
    #
    # @classmethod
    # def add_subnet(cls, libcloud_subnet):
    #     return AmazonSubnet(title=libcloud_subnet.name,
    #                         subnet_id=libcloud_subnet.id,
    #                         state=libcloud_subnet.state,
    #                         available_ips=libcloud_subnet.extra['available_ips'],
    #                         cidr=libcloud_subnet.extra['cidr_block'],
    #                         tags=libcloud_subnet.extra['tags'],
    #                         zone=libcloud_subnet.extra['zone'])

    def _create_network__parse_args(self, network_args):
        for required_key in ['name', 'cidr']:
            if required_key not in network_args:
                raise RequiredParameterMissingError(required_key)
        network_args['instance_tenancy'] = network_args.get('instance_tenancy', 'default')

    def _create_subnet__parse_args(self, subnet_args, parent_network):
        for required_key in ['name', 'cidr', 'availability_zone']:
            if required_key not in subnet_args:
                raise RequiredParameterMissingError(required_key)
        subnet_args['vpc_id'] = parent_network.network_id

    def _list_subnets__parse_args(self, list_subnet_args, for_network=None):
        if for_network:
            list_subnet_args['filters'] = {'vpc-id': for_network.network_id}

    def _delete_network__parse_args(self, delete_network_args, network):
        delete_network_args['vpc'] = EC2Network(id=network.network_id, name='', cidr_block='')

    def _delete_subnet__parse_args(self, subnet_args, subnet):
        subnet_args['subnet'] = EC2NetworkSubnet(id=subnet.network_id, name='', state='')


class GoogleNetworkController(BaseNetworkController):

    override_list_subnets = 'ex_list_subnetworks'
    override_delete_network = 'ex_destroy_network'
    override_delete_subnet = 'ex_destroy_subnetwork'

    # @classmethod
    # def add_network(cls, libcloud_network):
    #     return GoogleNetwork(title=libcloud_network.name,
    #                          network_id=libcloud_network.id,
    #                          cidr=libcloud_network.cidr,
    #                          IPv4Range=libcloud_network.extra['IPv4Range'],
    #                          autoCreateSubnetworks=libcloud_network.extra['autoCreateSubnetworks'],
    #                          creationTimestamp=libcloud_network.extra['creationTimestamp'],
    #                          description=libcloud_network.extra['description'],
    #                          gatewayIPv4=libcloud_network.extra['gatewayIPv4'],
    #                          mode=libcloud_network.extra['mode']
    #                          )
    #
    # @classmethod
    # def add_subnet(cls, libcloud_subnet):
    #     region = libcloud_subnet.extra['region'].split("/")[-1]
    #
    #     return GoogleSubnet(title=libcloud_subnet.name,
    #                         subnet_id=libcloud_subnet.id,
    #                         region=region,
    #                         cidr=libcloud_subnet.extra['ipCidrRange'],
    #                         gateway_ip=libcloud_subnet.extra['gatewayAddress'],
    #                         creationTimestamp=libcloud_subnet.extra['creationTimestamp'])

    def _create_network_parse_args(self, network_args):
        for required_key in ['name']:
            if required_key not in network_args:
                raise RequiredParameterMissingError(required_key)
        network_args['mode'] = network_args.get('mode', 'legacy')

    def _create_subnet_parse_args(self, subnet_args, parent_network):
        for required_key in ['name', 'cidr', 'region']:
            if required_key not in subnet_args:
                raise RequiredParameterMissingError(required_key)
        subnet_args['parent_network'] = parent_network.title

    def _list_subnets__parse_args(self, list_subnet_args, for_network=None):
       pass

    def _delete_network__parse_args(self, delete_network_args, network):
        pass

    def _delete_subnet__parse_args(self, subnet_args, subnet):
        pass

    # def _delete_network(self, network):
    #
    #     libcloud_network = GCENetwork(id='', name=network.title, cidr='',
    #                                   driver=None, extra={})
    #
    #     # Subnet deletion calls are asynchronous and a network cannot be deleted before all of its subnets are gone
    #     # The network deletion call may not succeed immediately
    #     for attempt in range(10):
    #         try:
    #             self.ctl.compute.connection.ex_destroy_network(libcloud_network)
    #         except Exception as e:
    #             time.sleep(1)
    #         else:
    #             break
    #     # If all attempts are exhausted, raise an exception
    #     else:
    #         raise NetworkError('Failed to delete network {}'.format(network.title))
    #
    # def _list_subnets(self, for_network=None):
    #     requested_subnets = []
    #     all_subnets = self.ctl.compute.connection.ex_list_subnetworks()
    #     for subnet in all_subnets:
    #         if not for_network or subnet.network == for_network.title:
    #             requested_subnets.append(subnet)
    #     return requested_subnets
    #
    # def _delete_subnet(self, subnet_doc):
    #     try:
    #         self.ctl.compute.connection.ex_destroy_subnetwork(subnet_doc.title, region=subnet_doc.region)
    #     except Exception as e:
    #         raise NetworkError("Got error %s" % str(e))

class OpenStackNetworkController(BaseNetworkController):
    # @classmethod
    # def add_network(cls, libcloud_network):
    #     return OpenStackNetwork(title=libcloud_network.name,
    #                             network_id=libcloud_network.id,
    #                             status=libcloud_network.status,
    #                             router_external=libcloud_network.router_external,
    #                             admin_state_up=libcloud_network.extra['admin_state_up'],
    #                             mtu=libcloud_network.extra['mtu'],
    #                             provider_network_type=libcloud_network.extra['provider:network_type'],
    #                             provider_physical_network=libcloud_network.extra['provider:physical_network'],
    #                             provider_segmentation_id=libcloud_network.extra['provider:segmentation_id'],
    #                             shared=libcloud_network.extra['shared'],
    #                             )

    @classmethod
    def _create_network_parse_args(cls, network_args):
        for required_key in ['name']:
            if required_key not in network_args:
                raise RequiredParameterMissingError(required_key)

        network_args['admin_state_up'] = network_args.get('admin_state_up', True)
        network_args['shared'] = network_args.get('shared', False)

    @classmethod
    def _create_subnet_parse_args(cls, subnet_args, parent_network):
        for required_key in ['name', 'cidr']:
            if required_key not in subnet_args:
                raise RequiredParameterMissingError(required_key)

        subnet_args['allocation_pools'] = subnet_args.get('allocation_pools', [])
        subnet_args['gateway_ip'] = subnet_args.get('gateway_ip', None)
        subnet_args['ip_version'] = subnet_args.get('ip_version', '4')
        subnet_args['enable_dhcp'] = subnet_args.get('enable_dhcp', True)
        subnet_args['network_id'] = parent_network.network_id

    def _list_subnets__parse_args(self, list_subnet_args, for_network=None):
        pass

    def _delete_network__parse_args(self, delete_network_args, network):
        pass

    def _delete_subnet__parse_args(self, subnet_args, subnet):
        pass
