import logging
import copy

import mongoengine as me

from mist.io.clouds.controllers.base import BaseController
from mist.io.clouds.controllers.network.models import Network, Subnet
from mist.io.exceptions import ConflictError, BadRequestError

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

        network_object = self._create_network_db_object(network_info, libcloud_network, do_save=False)

        if libcloud_subnet:
            subnet_object = self._create_subnet_db_object(libcloud_subnet, network_object, do_save=False)
            subnet_object.base_network = network_object
            network_object.subnets.append(subnet_object)
            subnet_object.save()

        network_object.save()
        return network_info

    def _create_network_db_object(self, network_info, libcloud_network, do_save=True):
        """ Persists a new Network object to the DB.
        Should not be overridden or extended by subclasses"""
        network_object = Network(title=network_info['network']['name'],
                                 libcloud_id=network_info['network']['id'],
                                 cloud=self.ctl.cloud,
                                 extra=copy.copy(libcloud_network.extra))
        if do_save:
            try:
                network_object.save()
            except me.ValidationError as exc:
                log.error("Error adding network: %s: %s", libcloud_network.name, exc.to_dict())
                raise BadRequestError({"msg": exc.message,
                                       "errors": exc.to_dict()})

        return network_object

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
        self._create_subnet_db_object(libcloud_subnet, parent_network)

        return libcloud_subnet

    def _create_subnet(self, subnet, parent_network):
        """Handles cloud-specific subnet creation calls.
        Should be overridden by all subclasses that can support it"""

        raise NotImplementedError()

    def _create_subnet_db_object(self, libcloud_subnet, parent_network, do_save=True):
        """ Persist a new Subnet object to the DB
            Should not be overridden or extended by subclasses"""

        subnet_object = Subnet(title=libcloud_subnet.name,
                               libcloud_id=libcloud_subnet.id,
                               cloud=self.ctl.cloud,
                               base_network=parent_network,
                               extra=copy.copy(libcloud_subnet.extra))
        if do_save:
            try:
                subnet_object.save()
            except me.ValidationError as exc:
                log.error("Error adding subnet: %s: %s", libcloud_subnet.name, exc.to_dict())
                raise BadRequestError({"msg": exc.message,
                                       "errors": exc.to_dict()})

        return subnet_object

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



        # TODO: Fetch all existing Network and subnet objects for this cloud, compare and sync

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
            network = Network.objects.get(id=network_db_id)
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


