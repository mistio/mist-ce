import logging
import time

from mist.io.clouds.controllers.network.base import BaseNetworkController, catch_common_exceptions
from mist.io.clouds.utils import rename_kwargs
import mist.io.exceptions

from libcloud.common.google import ResourceInUseError
log = logging.getLogger(__name__)


class AmazonNetworkController(BaseNetworkController):
    provider = 'ec2'

    def _create_network__parse_args(self, network_doc, kwargs):
        if 'cidr' not in kwargs:
            raise mist.io.exceptions.RequiredParameterMissingError('cidr')
        kwargs['name'] = network_doc.title
        rename_kwargs(kwargs, 'cidr', 'cidr_block')

    def _create_network__parse_libcloud_object(self, network_doc, libcloud_network):
        network_doc.network_id = libcloud_network.id
        network_doc.cidr = libcloud_network.cidr_block
        network_doc.is_default = libcloud_network.extra.pop('is_default')
        network_doc.state = libcloud_network.extra.pop('state')
        network_doc.extra = libcloud_network.extra

    def _create_subnet__parse_args(self, subnet_doc, kwargs):
        for required_key in ['cidr', 'availability_zone']:
            if required_key not in kwargs:
                raise mist.io.exceptions.RequiredParameterMissingError(required_key)
        kwargs['name'] = subnet_doc.title
        kwargs['vpc_id'] = subnet_doc.network.network_id
        rename_kwargs(kwargs, 'cidr', 'cidr_block')

    def _create_subnet__parse_libcloud_object(self, subnet_doc, libcloud_subnet):
        subnet_doc.cidr = libcloud_subnet.extra.pop('cidr_block')
        subnet_doc.subnet_id = libcloud_subnet.id
        subnet_doc.available_ips = libcloud_subnet.extra.pop('available_ips')
        subnet_doc.zone = libcloud_subnet.extra.pop('zone')
        subnet_doc.extra = libcloud_subnet.extra

    def _list_subnets__parse_args(self, kwargs):
        for_network = kwargs.pop('for_network', None)
        if for_network:
            kwargs['filters'] = {'vpc-id': for_network.network_id}

    def _delete_network__parse_args(self, network, kwargs):
        kwargs['vpc'] = self._get_libcloud_network(network)

    def _delete_subnet__parse_args(self, subnet, kwargs):
        kwargs['subnet'] = self._get_libcloud_subnet(subnet)

    def _get_libcloud_network(self, network):
        networks = self.ctl.compute.connection.ex_list_networks(network_ids=[network.network_id])
        if networks:
            return networks[0]
        return None

    def _get_libcloud_subnet(self, subnet):
        subnets = self.ctl.compute.connection.ex_list_subnets(subnet_ids=[subnet.subnet_id])
        if subnets:
            return subnets[0]
        return None


class GoogleNetworkController(BaseNetworkController):
    provider = 'gce'

    def _create_network__parse_args(self, network_doc, kwargs):
        kwargs['mode'] = kwargs.get('mode', 'legacy')
        if kwargs['mode'] == 'legacy':
            if 'cidr' not in kwargs:
                raise mist.io.exceptions.RequiredParameterMissingError('cidr')
        else:
            kwargs['cidr'] = kwargs.get('cidr', None)
        kwargs['name'] = network_doc.title

    def _create_network__parse_libcloud_object(self, network_doc, libcloud_network):
        network_doc.network_id = libcloud_network.id
        network_doc.cidr = libcloud_network.cidr
        network_doc.gateway_ip = libcloud_network.extra.pop('gatewayIPv4')
        network_doc.mode = libcloud_network.mode
        network_doc.extra = libcloud_network.extra

    def _create_subnet__parse_args(self, subnet_doc, kwargs):
        for required_key in ['cidr', 'region']:
            if required_key not in kwargs:
                raise mist.io.exceptions.RequiredParameterMissingError(required_key)
        kwargs['name'] = subnet_doc.title
        kwargs['network'] = subnet_doc.network.title

    def _create_subnet__parse_libcloud_object(self, subnet_doc, libcloud_subnet):
        subnet_doc.subnet_id = libcloud_subnet.id
        subnet_doc.cidr = libcloud_subnet.cidr
        subnet_doc.gateway_ip = libcloud_subnet.extra.pop('gatewayAddress')
        subnet_doc.region = libcloud_subnet.region.name
        subnet_doc.extra = libcloud_subnet.extra

    @catch_common_exceptions
    def create_subnet(self, subnet_doc, **kwargs):
        """Creates a new subnet.
        Overriden because of different libcloud method name."""

        self._create_subnet__parse_args(subnet_doc, kwargs)

        try:
            libcloud_subnet = self.ctl.compute.connection.ex_create_subnetwork(**kwargs)
        except Exception as e:
            raise mist.io.exceptions.SubnetCreationError("Got error %s" % str(e))

        self._create_subnet__parse_libcloud_object(subnet_doc, libcloud_subnet)
        subnet_doc.save()

        return subnet_doc.as_dict()

    @catch_common_exceptions
    def list_subnets(self, **kwargs):
        """List all Subnets for a particular network present on the cloud.
        Overriden because of different libcloud method name."""

        from mist.io.networks.models import Subnet
        from mist.io.networks.models import SUBNETS
        for_network = kwargs.pop('for_network', None)
        libcloud_subnets = self.ctl.compute.connection.ex_list_subnetworks(**kwargs)

        subnet_listing = []
        for subnet in libcloud_subnets:
            if for_network is None or subnet.network.id == for_network.network_id:
                try:
                    db_subnet = Subnet.objects.get(subnet_id=subnet.id)
                except Subnet.DoesNotExist:
                    subnet_doc = SUBNETS[self.provider].add(title=subnet.name,
                                                            network=for_network,
                                                            cloud=self.cloud,
                                                            create_on_cloud=False)

                else:
                    subnet_doc = SUBNETS[self.provider].add(title=subnet.name,
                                                            network=db_subnet.network,
                                                            cloud=self.cloud,
                                                            description=db_subnet.description,
                                                            object_id=db_subnet.id,
                                                            create_on_cloud=False)

                self._create_subnet__parse_libcloud_object(subnet_doc, subnet)
                if subnet_doc.network:  # Do not persist this subnet without a parent network reference
                    subnet_doc.save()
                subnet_listing.append(subnet_doc.as_dict())

        return subnet_listing

    @catch_common_exceptions
    def delete_network(self, network, **kwargs):
        """Delete a Network.
        Overriden because of different libcloud method name."""

        from mist.io.networks.models import Subnet

        associated_subnets = Subnet.objects(network=network)
        if network.mode == 'custom':
            for subnet in associated_subnets:
                subnet.ctl.delete_subnet()

        self._delete_network__parse_args(network, kwargs)

        # For custom networks, subnet deletion calls are asynchronous and a network cannot be deleted
        # before all of its subnets are gone. The network deletion call may not succeed immediately
        for attempt in range(10):
            try:
                self.ctl.compute.connection.ex_destroy_network(**kwargs)
            except ResourceInUseError:
                time.sleep(1)
            else:
                break
        # If all attempts are exhausted, raise an exception
        else:
            raise mist.io.exceptions.NetworkCreationError('Failed to delete network {}'.format(network.title))
        network.delete()

    def _delete_network__parse_args(self, network, kwargs):
        kwargs['network'] = self._get_libcloud_network(network)

    @catch_common_exceptions
    def delete_subnet(self, subnet, **kwargs):
        """Delete a Subnet."""

        self._delete_subnet__parse_args(subnet, kwargs)
        self.ctl.compute.connection.ex_destroy_subnetwork(**kwargs)
        subnet.delete()

    def _delete_subnet__parse_args(self, subnet, kwargs):
        kwargs['name'] = self._get_libcloud_subnet(subnet)

    def _get_libcloud_network(self, network):
        return self.ctl.compute.connection.ex_get_network(network.title)

    def _get_libcloud_subnet(self, subnet):
        return self.ctl.compute.connection.ex_get_subnetwork(name=subnet.title, region=subnet.region)


class OpenStackNetworkController(BaseNetworkController):
    provider = 'openstack'

    def _create_network__parse_args(self, network_doc, kwargs):
        kwargs['admin_state_up'] = kwargs.get('admin_state_up', True)
        kwargs['shared'] = kwargs.get('shared', False)
        kwargs['name'] = network_doc.title

    def _create_network__parse_libcloud_object(self, network_doc, libcloud_network):
        network_doc.network_id = libcloud_network.id
        network_doc.admin_state_up = libcloud_network.extra.pop('admin_state_up')
        network_doc.extra = libcloud_network.extra

    def _create_subnet__parse_args(self, subnet_doc, kwargs):
        for required_key in ['cidr']:
            if required_key not in kwargs:
                raise mist.io.exceptions.RequiredParameterMissingError(required_key)
        kwargs['name'] = subnet_doc.title
        kwargs['network_id'] = subnet_doc.network.network_id
        kwargs['allocation_pools'] = kwargs.get('allocation_pools', [])
        kwargs['gateway_ip'] = kwargs.get('gateway_ip', None)
        kwargs['ip_version'] = kwargs.get('ip_version', '4')
        kwargs['enable_dhcp'] = kwargs.get('enable_dhcp', True)

    def _create_subnet__parse_libcloud_object(self, subnet_doc, libcloud_subnet):
        subnet_doc.subnet_id = libcloud_subnet.id
        subnet_doc.cidr = libcloud_subnet.cidr
        subnet_doc.gateway_ip = libcloud_subnet.gateway_ip
        subnet_doc.enable_dhcp = libcloud_subnet.enable_dhcp
        subnet_doc.dns_nameservers = libcloud_subnet.dns_nameservers
        subnet_doc.allocation_pools = libcloud_subnet.allocation_pools
        subnet_doc.extra = libcloud_subnet.extra

    @catch_common_exceptions
    def list_subnets(self, **kwargs):
        """List all Subnets for a particular network present on the cloud.
        Overtiden to implement filtering with the for_network kwarg"""

        from mist.io.networks.models import Subnet
        from mist.io.networks.models import SUBNETS
        for_network = kwargs.pop('for_network', None)
        libcloud_subnets = self.ctl.compute.connection.ex_list_subnets(**kwargs)

        subnet_listing = []
        for subnet in libcloud_subnets:
            if for_network is None or subnet.network_id == for_network.network_id:
                try:
                    db_subnet = Subnet.objects.get(subnet_id=subnet.id)
                except Subnet.DoesNotExist:
                    subnet_doc = SUBNETS[self.provider].add(title=subnet.name,
                                                            network=for_network,
                                                            cloud=self.cloud,
                                                            create_on_cloud=False)

                else:
                    subnet_doc = SUBNETS[self.provider].add(title=subnet.name,
                                                            network=db_subnet.network,
                                                            cloud=self.cloud,
                                                            description=db_subnet.description,
                                                            object_id=db_subnet.id,
                                                            create_on_cloud=False)

                self._create_subnet__parse_libcloud_object(subnet_doc, subnet)
                if subnet_doc.network:  # Do not persist this subnet without a parent network reference
                    subnet_doc.save()
                subnet_listing.append(subnet_doc.as_dict())

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
