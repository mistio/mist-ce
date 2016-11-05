import logging

from mist.io.clouds.network.models import Network, Subnet

log = logging.getLogger(__name__)


class NetworkController(object):
    """Abstract base class for networking-specific subcontrollers"""

    def __init__(self, main_controller):
        self.ctl = main_controller

    def create_network(self, network, subnet, router):
        """Create a new network"""
        network_info = self._create_network(network, subnet, router)

        network_object = self._create_network_db_object(network_info, do_save=False)

        for subnet in network_info['subnets']:
            subnet_object = self._create_subnet_db_object(subnet, do_save=False)
            subnet_object.base_network = network_object
            network_object.subnets.append(subnet_object)
            subnet_object.save()

        network_object.save()
        return network_info

    def _create_network_db_object(self, network_info, do_save=True):
        """ Persist a new Network object to the DB"""
        network_object = Network(title=network_info['network']['name'],
                                 libcloud_id=network_info['network']['id'],
                                 cloud=self.ctl.cloud)
        if do_save:
            network_object.save()

        return network_object

    def _create_network(self, network, subnet, router):
        """Handles cloud-specific network creation calls.
         Should be overridden by all subclasses that can support it"""

        raise NotImplementedError()

    def create_subnet(self, subnet, parent_network_id):
        """Create a new subnet"""

        subnet_info = self._create_subnet(subnet, parent_network_id)
        self._create_subnet_db_object(subnet_info)

        return subnet_info

    def _create_subnet(self, subnet, parent_network):
        """Handles cloud-specific subnet creation calls.
        Should be overridden by all subclasses that can support it"""

        raise NotImplementedError()

    def _create_subnet_db_object(self, subnet_info, do_save=True):
        """ Persist a new Subnet object to the DB """
        subnet_object = Subnet(title=subnet_info['name'],
                               libcloud_id=subnet_info['id'],
                               cloud=self.ctl.cloud)
        if do_save:
            subnet_object.save()

        return subnet_object

    def list_networks(self, return_format):
        """List Networks"""

        libcloud_networks = self.ctl.connection.ex_list_networks()
        network_info = self._parse_network_listing(libcloud_networks, return_format)



        # TODO: Fetch all existing Network and subnet objects for this cloud, compare and sync

        return network_info

    def _parse_network_listing(self, network_listing, return_format):
        """Parses the result of the libcloud ex_list_networks call to conform the API call return format.
         Must be overridden by all subclasses"""

        raise NotImplementedError()

    def delete_network(self, network_id):
        """Delete Network"""

        delete_result = self._delete_network(network_id)
        return delete_result

    def _delete_network(self, network_id):
        """Handles cloud-specific network deletion calls.
         Should be overridden by all subclasses that can support it"""

        return self.ctl.connection.ex_delete_network(network_id)
