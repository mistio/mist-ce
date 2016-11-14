import logging

from mist.io.clouds.controllers.base import BaseController
from mist.io.clouds.controllers.network.models import Network, Subnet
from mist.io.exceptions import BadRequestError

from mongoengine.errors import DoesNotExist

log = logging.getLogger(__name__)


class BaseNetworkController(BaseController):
    """Abstract base class for networking-specific subcontrollers"""
    NetworkModelClass = Network
    SubnetModelClass = Subnet

    def create_network(self, network):
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

        new_net = self.NetworkModelClass.from_libcloud(libcloud_network)
        new_net.cloud = self.cloud
        new_net.save()
        return new_net

    def _update_network_document(self, old_network_doc, libcloud_network):
        """Updates a Network DB document based on data from a libcloud object.
         Should be overridden by all subclasses that support network creation"""

        new_network_doc = self.NetworkModelClass.from_libcloud(libcloud_network)
        new_network_doc.id = old_network_doc.id
        new_network_doc.cloud = self.cloud
        new_network_doc.save()
        return new_network_doc

    def create_subnet(self, subnet, parent_network_id):
        """Creates a new subnet. Arguments:
        subnet:
          type: dict
        parent_network_id: the DB id of the network this subnet belongs to
          type: string
        """

        parent_network = Network.objects.get(id=parent_network_id)
        libcloud_subnet = self._create_subnet(subnet, parent_network)
        db_subnet = self._create_subnet_document(libcloud_subnet, parent_network)

        return db_subnet.as_dict()

    def _create_subnet(self, subnet, parent_network):
        """Handles cloud-specific subnet creation calls.
        Should be overridden by all subclasses that can support it"""

        raise NotImplementedError()

    def _create_subnet_document(self, libcloud_subnet, parent_network):
        """Translates a libcloud subnet object to a DB document."""

        new_subnet = self.SubnetModelClass.from_libcloud(libcloud_subnet)
        new_subnet.network = parent_network
        return new_subnet.save()

    def _update_subnet_document(self, old_subnet_doc, libcloud_subnet):
        """Updates a Subnet DB document based on data from a libcloud object.
         Should be overridden by all subclasses that support subnet creation"""

        new_subnet_doc = self.SubnetModelClass.from_libcloud(libcloud_subnet)
        new_subnet_doc.network = old_subnet_doc.network
        new_subnet_doc.id = old_subnet_doc.id
        new_subnet_doc.save()
        return new_subnet_doc

    def list_networks(self):
        """List all Networks present on the cloud. Also syncs the state of the Network and Subnet documents on the DB
        with their state on the Cloud API.
        Should not be overridden or extended by subclasses"""

        libcloud_networks = self.ctl.compute.connection.ex_list_networks()
        db_networks = []

        # Sync the DB state to the API state
        # Syncing Networks
        for network in libcloud_networks:

            try:
                db_network = Network.objects.get(cloud=self.cloud, network_id=network.id)
            except DoesNotExist:
                db_network = self._create_network_document(network)
            else:
                db_network = self._update_network_document(db_network, network)

            # Syncing Subnets
            subnets_in_current_network = self.list_subnets(for_network=db_network, return_docs=True)

            # Update the subnet references on the network object
            db_network.subnets = subnets_in_current_network
            db_network.save()
            db_networks.append(db_network)

        network_listing = []

        for network in db_networks:
            network_entry = network.as_dict()
            subnet_listing = [sub.as_dict() for sub in network.subnets]
            network_entry['subnets'] = subnet_listing
            network_listing.append(network_entry)

        return network_listing

    def list_subnets(self, for_network=None, return_docs=False):
        """List all libcloud Subnets present on the cloud. Can optionally only return subnets that belong to a particular
        network by setting the for_network argument."""

        libcloud_subnets = self._list_subnets(for_network)
        db_subnets = []
        for subnet in libcloud_subnets:

            try:
                db_subnet = Subnet.objects.get(subnet_id=subnet.id)
            except DoesNotExist:
                db_subnet = self._create_subnet_document(subnet, for_network)
            else:
                db_subnet = self._update_subnet_document(db_subnet, subnet)
            db_subnets.append(db_subnet)

        if return_docs:
            return db_subnets
        else:
            return [subnet.as_dict() for subnet in db_subnets]

    def _list_subnets(self, libcloud_network=None):
        """Returns all libcloud subnet objects that belong to a given Cloud.
           Should be overridden by all subclasses that support network listing"""

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
            raise BadRequestError("The network with id {0} does not exist".format(network_db_id))
        for subnet in network.subnets:
            self.delete_subnet(subnet.id)

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
            subnet = Subnet.objects.get(id=subnet_db_id)
        except Subnet.DoesNotExist:
            log.error("Subnet %s does not exist", subnet_db_id)
            raise BadRequestError("The subnet with id {0} does not exist".format(subnet_db_id))

        self._delete_subnet(subnet)
        subnet.delete()

    def _delete_subnet(self, subnet_db_object):
        """Handles cloud-specific subnet deletion calls.
         Should be overridden by all subclasses that can support it"""

        raise NotImplementedError()
