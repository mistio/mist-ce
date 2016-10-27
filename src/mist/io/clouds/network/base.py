import logging


log = logging.getLogger(__name__)


class NetworkController(object):
    """Abstract base class for networking-specific subcontrollers"""

    def __init__(self, main_controller):
        self.ctl = main_controller

    def create_network(self):
        """Create a new network
        Should be extended by Cloud vendor-specific subclasses"""

        pass

    def _create_network(self, network_params):
        """Handles cloud-specific network creation calls.
         Must be overridden by all subclasses"""
        pass

    def list_networks(self, return_format):
        """List Networks
        Should be extended by Cloud vendor-specific subclasses"""

        libcloud_networks = self.ctl.connection.ex_list_networks()
        return self._parse_network_listing(libcloud_networks, return_format)

    def _parse_network_listing(self, network_listing, return_format):
        """Parses the result of the libcloud ex_list_networks call to conform the API call return format.
         Must be overridden by all subclasses"""
        pass

    def delete_network(self):
        """Delete Network
        Should be extended by Cloud vendor-specific subclasses"""

        pass

    # def create_subnet(self):
    #     """Create a Subnet
    #             Should be extended by Cloud vendor-specific subclasses"""
    #
    #     from mist.io.clouds.models import Subnet
    #     pass
    #
    # def list_subnets(self):
    #     """List Subnets
    #             Should be extended by Cloud vendor-specific subclasses"""
    #
    #     from mist.io.clouds.models import Subnet
    #     pass
    #
    # def delete_subnet(self):
    #     """Delete Subnet
    #             Should be extended by Cloud vendor-specific subclasses"""
    #
    #     from mist.io.clouds.models import Subnet
    #     pass
