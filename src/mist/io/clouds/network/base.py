import logging


log = logging.getLogger(__name__)


class NetworkController(object):
    """Abstract base class for networking-specific subcontrollers"""

    def __init__(self, main_controller):
        self.ctl = main_controller

    def create_network(self, network, subnet, router):
        """Create a new network"""

        return self._create_network(network, subnet, router)

    def _create_network(self, network, subnet, router):
        """Handles cloud-specific network creation calls.
         Should be overridden by all subclasses that can support it"""

        raise NotImplementedError()

    def create_subnet(self, subnet, parent_network):
        """Create a new subnet"""

        return self._create_subnet(subnet, parent_network)

    def _create_subnet(self, subnet, parent_network):
        """Handles cloud-specific subnet creation calls.
        Should be overridden by all subclasses that can support it"""

        raise NotImplementedError()

    def list_networks(self, return_format):
        """List Networks"""

        libcloud_networks = self.ctl.connection.ex_list_networks()
        return self._parse_network_listing(libcloud_networks, return_format)

    def _parse_network_listing(self, network_listing, return_format):
        """Parses the result of the libcloud ex_list_networks call to conform the API call return format.
         Must be overridden by all subclasses"""

        raise NotImplementedError()

    def delete_network(self, libcloud_network):
        """Delete Network"""

        return self._delete_network(libcloud_network)

    def _delete_network(self, libcloud_network):
        """Handles cloud-specific network deletion calls.
         Should be overridden by all subclasses that can support it"""

        return self.ctl.connection.ex_delete_network(libcloud_network)
