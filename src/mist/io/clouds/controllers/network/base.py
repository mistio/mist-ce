import logging

from mist.io.clouds.controllers.base import BaseController
from mist.io.clouds.controllers.network.models import Network, Subnet
from mist.io.exceptions import BadRequestError

log = logging.getLogger(__name__)


class BaseNetworkController(BaseController):
    """Abstract base class for networking-specific subcontrollers"""
    NetworkModelClass = Network
    SubnetModelClass = Subnet

    def create_network(self, network, ):
        """Create a new network. Arguments:
        network:
          required: true
          type: dict
        Should not be overridden or extended."""
        libcloud_network = self._create_network(network)
        db_network = self._create_network_document(libcloud_network)

        return db_network.as_dict()

    def _create_network(self, network):
        """Handles cloud-specific network creation calls.
         Should be overridden by all subclasses that support network creation"""

        raise NotImplementedError()

    def _create_network_document(self, libcloud_network):
        """Translates a libcloud network object to a DB document."""

        raise NotImplementedError()

    def _update_network_document(self, network_doc, libcloud_network):
        """Updates a Network DB document based on data from a libcloud object.
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
        db_subnet = self._create_subnet_document(libcloud_subnet, parent_network)

        return db_subnet.as_dict()

    def _create_subnet(self, subnet, parent_network):
        """Handles cloud-specific subnet creation calls.
        Should be overridden by all subclasses that can support it"""

        raise NotImplementedError()

    def _create_subnet_document(self, libcloud_subnet, parent_network):
        """Translates a libcloud subnet object to a DB document.
         Should be overridden by all subclasses that support subnet creation"""

        raise NotImplementedError()

    def _update_subnet_document(self, subnet_doc, libcloud_subnet):
        """Updates a Subnet DB document based on data from a libcloud object.
         Should be overridden by all subclasses that support subnet creation"""

        raise NotImplementedError()

    def list_networks(self):
        """List all Networks present on the cloud. Also syncs the state of the Network and Subnet documents on the DB
        with their state on the Cloud API.
        Should not be overridden or extended by subclasses"""

        libcloud_networks = self.ctl.compute.connection.ex_list_networks()

        # Sync the DB state to the API state
        # Syncing Networks
        for network in libcloud_networks:

            try:
                db_network = Network.objects.get(cloud=self.cloud, libcloud_id=network.id)
            except Network.DoesNotExist:
                db_network = self._create_network_document(network)
            else:
                db_network = self._update_network_document(db_network, network)

            # Syncing Subnets
            db_subnets_in_current_network = []
            libcloud_subnets = self._list_subnets_for_network(network)
            for subnet in libcloud_subnets:

                try:
                    db_subnet = Subnet.objects.get(cloud=self.cloud, libcloud_id=subnet.id)
                except Subnet.DoesNotExist:
                    db_subnet = self._create_subnet_document(subnet, network)
                else:
                    db_subnet = self._update_subnet_document(db_subnet, subnet)

                db_subnets_in_current_network.append(db_subnet)

            # Update the subnet references on the network object
            db_network.subnets = db_subnets_in_current_network
            db_network.save()

        return [net.as_dict() for net in Network.objects.get(cloud=self.cloud)]

    def _list_subnets_for_network(self, libcloud_network):
        """Returns all libcloud subnet objects that belong to a given libcloud Network object.
           Should be overridden by all subclasses that support network listing"""

        raise NotImplementedError()

    def delete_network(self, network_db_id):
        """Delete a Network. Arguments:
        network_id: the DB id of the network to delete
          type: string

        Should not be overridden or extended by subclasses"""

        try:
            network = Network.objects.get(id=network_db_id, cloud=self.cloud)
        except Network.DoesNotExist:
            log.error("Network %s does not exist", network_db_id)
            raise BadRequestError("The network with id {} does not exist".format(network_db_id))

        self._delete_network(network)
        network.delete()

    def _delete_network(self, network_db_object):
        """Handles cloud-specific network deletion calls.
         Should be overridden by all subclasses that can support it"""

        raise NotImplementedError()

    def delete_subnet(self, subnet_db_id):
        """Delete a Subnet. Arguments:
        network_id: the DB id of the subnet to delete
          type: string

        Should not be overridden or extended by subclasses"""

        try:
            subnet = Network.objects.get(id=subnet_db_id, cloud=self.cloud)
        except Subnet.DoesNotExist:
            log.error("Subnet %s does not exist", subnet_db_id)
            raise BadRequestError("The subnet with id {0} does not exist".format(subnet_db_id))

        self._delete_subnet(subnet)
        subnet.delete()

    def _delete_subnet(self, subnet_db_object):
        """Handles cloud-specific subnet deletion calls.
         Should be overridden by all subclasses that can support it"""

        raise NotImplementedError()
