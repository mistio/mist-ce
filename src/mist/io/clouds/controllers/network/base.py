import logging

from mist.io.clouds.controllers.base import BaseController
from mist.io.clouds.controllers.network.models import Network, Subnet
import mist.io.exceptions

from mist.io.clouds.controllers.network.models import NETWORKS, SUBNETS

from mongoengine.errors import DoesNotExist

log = logging.getLogger(__name__)


class BaseNetworkController(BaseController):
    """Abstract base class for networking-specific subcontrollers"""

    def create_network(self, network):
        """Create a new network. Arguments:
        network:
          required: true
          type: dict
        Should not be overridden or extended."""
        self._create_network__parse_args(network)
        try:
            if hasattr(self, 'override_create_network'):
                libcloud_network = getattr(self.ctl.compute.connection, self.override_create_network)(**network)
            else:
                libcloud_network = self.ctl.compute.connection.ex_create_network(**network)
        except Exception as e:
            raise mist.io.exceptions.NetworkCreationError("Got error %s" % str(e))
        network_doc = NETWORKS[self.cloud.provider].add(name=network['name'], cloud=self.cloud, **libcloud_network)

        return network_doc.as_dict()

    def _create_network__parse_args(self, network_args):
        pass

    def create_subnet(self, subnet, parent_network_id):
        """Creates a new subnet. Arguments:
        subnet:
          type: dict
        parent_network_id: the DB id of the network this subnet belongs to
          type: string
        """
        try:
            parent_network = Network.objects.get(id=parent_network_id)
        except Network.DoesNotExist:
            raise mist.io.exceptions.NetworkNotFound()

        self._create_subnet__parse_args(subnet, parent_network)

        try:
            if hasattr(self, 'override_create_subnet'):
                libcloud_subnet = getattr(self.ctl.compute.connection, self.override_create_subnet)(**subnet)
            else:
                libcloud_subnet = self.ctl.compute.connection.ex_create_subnet(**subnet)
        except Exception as e:
            raise mist.io.exceptions.SubnetCreationError("Got error %s" % str(e))
        subnet_doc = SUBNETS[self.cloud.provider].add(name=subnet['name'], cloud=self.cloud, **libcloud_subnet)

        return subnet_doc.as_dict()

    def _create_subnet__parse_args(self, subnet_args, parent_network):
        pass

    def list_networks(self):
        """List all Networks present on the cloud. Also syncs the state of the Network and Subnet documents on the DB
        with their state on the Cloud API.
        Should not be overridden or extended by subclasses"""

        if hasattr(self, 'override_list_networks'):
            libcloud_networks = getattr(self.ctl.compute.connection, self.override_list_subnets)()
        else:
            libcloud_networks = self.ctl.compute.connection.ex_list_subnets()
        network_listing = []

        # Sync the DB state to the API state
        # Syncing Networks
        for network in libcloud_networks:

            try:
                db_network = Network.objects.get(cloud=self.cloud, network_id=network.id)
            except DoesNotExist:
                network_doc = NETWORKS[self.cloud.provider].add(name=network['name'],
                                                                cloud=self.cloud,
                                                                **network)
            else:
                network_doc = NETWORKS[self.cloud.provider].add(name=network['name'],
                                                                cloud=self.cloud,
                                                                object_id=db_network.id,
                                                                **network)

            # Syncing Subnets
            subnets_in_current_network = self.list_subnets(for_network=network_doc)

            network_entry = network.as_dict()
            subnet_listing = [sub.as_dict() for sub in subnets_in_current_network]
            network_entry['subnets'] = subnet_listing
            network_listing.append(network_entry)

        return network_listing

    def list_subnets(self, for_network=None):
        """List all Subnets for a particular network present on the cloud."""

        list_subnet_args = {}
        self._list_subnets__parse_args(list_subnet_args, for_network)
        if hasattr(self, 'override_list_subnets'):
            libcloud_subnets = getattr(self.ctl.compute.connection, self.override_list_subnets)(**list_subnet_args)
        else:
            libcloud_subnets = self.ctl.compute.connection.ex_list_subnets(**list_subnet_args)

        subnet_listing = []
        for subnet in libcloud_subnets:

            if for_network:
                # A DB sync is only possible if there is a parent network to attach subnets to
                try:
                    db_subnet = Subnet.objects.get(subnet_id=subnet.id)
                except DoesNotExist:
                    subnet_doc = SUBNETS[self.cloud.provider].add(title=subnet['name'],
                                                                  base_network=for_network,
                                                                  **subnet)
                else:
                    subnet_doc = SUBNETS[self.cloud.provider].add(title=subnet['name'],
                                                                  base_network=for_network,
                                                                  object_id=db_subnet.id,
                                                                  **subnet)
                subnet_listing.append(subnet_doc.as_dict())

            return subnet_listing

    def _list_subnets__parse_args(self, list_subnet_args, for_network=None):
        pass

    def delete_network(self, network_db_id):
        """Delete a Network. Arguments:
        network_id: the DB id of the network to delete
          type: string

        Should not be overridden or extended by subclasses"""
        try:
            network = Network.objects.get(id=network_db_id)
        except Network.DoesNotExist:
            raise mist.io.exceptions.NetworkNotFound()
        associated_subnets = Subnet.objects(network=network)
        for subnet in associated_subnets:
            self.delete_subnet(subnet.id)

        delete_network_args = {}
        self._delete_network__parse_args(delete_network_args, network)
        if hasattr(self, 'override_delete_network'):
            getattr(self.ctl.compute.connection, self.override_delete_network)(**delete_network_args)
        else:
            self.ctl.compute.connection.ex_delete_network(**delete_network_args)
        network.delete()

    def _delete_network__parse_args(self, delete_network_args, network):
        pass

    def delete_subnet(self, subnet_db_id):
        """Delete a Subnet. Arguments:
        network_id: the DB id of the subnet to delete
          type: string

        Should not be overridden or extended by subclasses"""

        try:
            subnet = Subnet.objects.get(id=subnet_db_id)
        except Subnet.DoesNotExist:
            raise mist.io.exceptions.SubnetNotFound()

        delete_subnet_args = {}
        self._delete_subnet__parse_args(delete_subnet_args, subnet)
        if hasattr(self, 'override_delete_subnet'):
            getattr(self.ctl.compute.connection, self.override_delete_subnet)(**delete_subnet_args)
        else:
            self.ctl.compute.connection.ex_delete_subnet(**delete_subnet_args)
        subnet.delete()

    def _delete_subnet__parse_args(self, subnet_args, subnet):
        pass



