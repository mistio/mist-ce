import logging
import itertools

from mist.io.clouds.controllers.base import BaseController
from mist.io.clouds.controllers.network.models import Network, Subnet
from mist.io.exceptions import ConflictError, BadRequestError, RequiredParameterMissingError

log = logging.getLogger(__name__)


class BaseNetworkController(BaseController):
    """Abstract base class for networking-specific subcontrollers"""

    def create_network(self, network, subnet, router):
        """Create a new network. Arguments:
        network:
          required: true
          type: dict
        router:
          type: dict
        subnet:
          type: dict
        Should not be overridden or extended."""
        network_info, libcloud_network, libcloud_subnet = self._create_network(network, subnet, router)

        network_object = Network.create(self.cloud,
                                        libcloud_network=libcloud_network,
                                        do_save=False)

        if libcloud_subnet:
            subnet_object = Subnet.create(
                self.cloud,
                libcloud_subnet=libcloud_subnet,
                parent_network=network_object,
                do_save=False)
            subnet_object.base_network = network_object
            network_object.subnets.append(subnet_object)
            subnet_object.save()

        network_object.save()
        return network_info

    def _create_network(self, network, subnet, router):
        """Handles cloud-specific network creation calls.
         Should be overridden by all subclasses that support network creation"""

        raise NotImplementedError()

    def create_subnet(self, subnet, parent_network_id):
        """Creates a new subnet. Arguments:
        subnet:
          type: dict
        parent_network_id: the DB id of the network this subnet belongs to
          type: string
        """

        libcloud_subnet = self._create_subnet(subnet, parent_network_id)
        parent_network = Network.objects.get(id=parent_network_id)
        subnet_object = Subnet.create(self.cloud,
                                      libcloud_subnet=libcloud_subnet,
                                      parent_network=parent_network)

        return subnet_object, libcloud_subnet

    def _create_subnet(self, subnet, parent_network):
        """Handles cloud-specific subnet creation calls.
        Should be overridden by all subclasses that can support it"""

        raise NotImplementedError()

    def list_networks(self, return_format):
        """List all Networks present on the cloud. Also syncs the state of the Network and Subnet documents on the DB
        with their state on the Cloud API.
        Arguments:
        return_format: Should have the following structure:
            {
            'public': [],
            'private': [],
            'routers': []
            }
          required: true
          type: dict
        Should not be overridden or extended by subclasses"""

        libcloud_networks = self.connection.ex_list_networks()
        network_info = self._parse_network_listing(libcloud_networks, return_format)

        all_networks = itertools.chain(network_info['public'], network_info['private'])

        # Sync the DB state to the API state
        for network in all_networks:

            try:
                db_network = Network.objects.get(cloud=self.ctl.cloud, libcloud_id=network['id'])
            except Network.DoesNotExist:
                db_network = Network.create(self.cloud,
                                            libcloud_network=None,
                                            network_info=network,
                                            do_save=False)

            # Update the attributes on the DB network object
            db_network.name = network['name']
            db_network.extra = {key: value for key, value in network_info.items()
                                if key not in ['name', 'id']}

            db_subnets_in_current_network = []
            for subnet in network['subnets']:

                try:
                    db_subnet = Subnet.objects.get(cloud=self.ctl.cloud, libcloud_id=subnet['id'])
                except Subnet.DoesNotExist:
                    db_subnet = Subnet.create(
                        self.cloud,
                        subnet_info=subnet,
                        parent_network=db_network,
                        do_save=False)

                # Update the attributes on the DB network object
                db_subnet.name = subnet['name']
                db_subnet.extra = {key: value for key, value in network_info.items()
                                   if key not in ['name', 'id']}
                db_subnet.save()
                db_subnets_in_current_network.append(db_subnet)

            # Update the subnet references on the network object
            db_network.subnets = db_subnets_in_current_network
            db_network.save()

        return network_info

    def _parse_network_listing(self, network_listing, return_format):
        """Parses the result of the libcloud ex_list_networks call to conform the API call return format.
         Must be overridden by all subclasses that support network listing"""

        raise NotImplementedError()

    def delete_network(self, network_db_id):
        """Delete a Network. Arguments:
        network_id: the DB id of the network to delete
          type: string

        Should not be overridden or extended by subclasses"""

        try:
            network = Network.objects.get(id=network_db_id, cloud=self.ctl.cloud)
        except Network.DoesNotExist:
            log.error("Network %s does not exist", network_db_id)
            raise BadRequestError("The network with id {} does not exist".format(network_db_id))

        delete_result = self._delete_network(network)
        if delete_result:
            network.delete()
        else:
            raise BadRequestError("The network with id {} could not be deleted".format(network_db_id))
        return delete_result

    def _delete_network(self, network_db_object):
        """Handles cloud-specific network deletion calls.
         Should be overridden by all subclasses that can support it"""

        raise NotImplementedError()
