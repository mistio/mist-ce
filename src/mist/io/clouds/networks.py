import logging

log = logging.getLogger(__name__)


class NetworkSubcontroller(object):
    """Abstract base class for networking-specific subcontrollers"""

    def __init__(self, parent_controller):
        self.parent_controller = parent_controller

    def list_networks(self):
        """List Networks
        Should be extended by Cloud vendor-specific subclasses"""

        networks = {
            'public': [],
            'private': [],
            'routers': []
        }

        libcloud_networks = self.parent_controller.connection.ex_list_networks()
        log.info(libcloud_networks)
        return libcloud_networks


    def delete_networks(self):
        """Delete Network
        Should be extended by Cloud vendor-specific subclasses"""
        pass


    def create_subnet(self):
        """Create a Subnet
                Should be extended by Cloud vendor-specific subclasses"""
        pass


    def list_subnets(self):
        """List Subnets
                Should be extended by Cloud vendor-specific subclasses"""
        pass


    def delete_subnet(self):
        """Delete Subnet
                Should be extended by Cloud vendor-specific subclasses"""
        pass


class AmazonNetworkSubcontroller(NetworkSubcontroller):
    pass


class GoogleNetworkSubcontroller(NetworkSubcontroller):
    pass


class OpenStackNetworkSubcontroller(NetworkSubcontroller):
    pass