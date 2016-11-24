import logging
import ssl

import mongoengine.errors

import mist.io.exceptions
from libcloud.common.types import InvalidCredsError
from mist.io.clouds.controllers.base import BaseController

log = logging.getLogger(__name__)


def catch_common_exceptions(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except InvalidCredsError as exc:
            log.warning("Invalid creds on running %: %s", func.__name__, exc)
            raise mist.io.exceptions.CloudUnauthorizedError()
        except ssl.SSLError as exc:
            log.error("SSLError on running %s: %s", func.__name__, exc)
            raise mist.io.exceptions.CloudUnavailableError(exc=exc)
    return wrapper


class BaseNetworkController(BaseController):
    """Abstract base class for networking-specific subcontrollers.

    All public methods in this class should not be overridden or extended unless the corresponding method in libcloud
        is significantly different from this implementation."""

    @catch_common_exceptions
    def create_network(self, network_doc, **kwargs):
        """Create a new network."""

        self._create_network__parse_args(network_doc, kwargs)
        try:
            libcloud_network = self.ctl.compute.connection.ex_create_network(**kwargs)
        except Exception as e:
            raise mist.io.exceptions.NetworkCreationError("Got error %s" % str(e))

        self._create_network__parse_libcloud_object(network_doc, libcloud_network)

        # Save the new network document
        try:
            network_doc.save()
        except mongoengine.errors.ValidationError as exc:
            log.error("Error updating Network %s: %s", network_doc.title, exc.to_dict())
            raise mist.io.exceptions.NetworkCreationError(exc.message)
        except mongoengine.errors.NotUniqueError as exc:
            log.error("Network %s not unique error: %s", network_doc.title, exc)
            raise mist.io.exceptions.NetworkExistsError()

        return network_doc

    def _create_network__parse_args(self, network_doc, kwargs):
        return

    def _create_network__parse_libcloud_object(self, network_doc, libcloud_network):
        return

    @catch_common_exceptions
    def create_subnet(self, subnet_doc, **kwargs):
        """Creates a new subnet."""

        self._create_subnet__parse_args(subnet_doc, kwargs)

        try:
            libcloud_subnet = self.ctl.compute.connection.ex_create_subnet(**kwargs)
        except Exception as e:
            raise mist.io.exceptions.SubnetCreationError("Got error %s" % str(e))

        self._create_subnet__parse_libcloud_object(subnet_doc, libcloud_subnet)

        try:
            subnet_doc.save()
        except mongoengine.errors.ValidationError as exc:
            log.error("Error updating Subnet %s: %s", subnet_doc.title, exc.to_dict())
            raise mist.io.exceptions.NetworkCreationError(exc.message)
        except mongoengine.errors.NotUniqueError as exc:
            log.error("Subnet %s not unique error: %s", subnet_doc.title, exc)
            raise mist.io.exceptions.SubnetExistsError(exc.message)

        return subnet_doc

    def _create_subnet__parse_args(self, subnet_args, parent_network):
        return

    def _create_subnet__parse_libcloud_object(self, subnet_doc, libcloud_subnet):
        return

    @catch_common_exceptions
    def list_networks(self, **kwargs):
        """List all Networks present on the cloud. Also syncs the state of the Network and Subnet documents on the DB
        with their state on the Cloud API."""

        from mist.io.networks.models import Network, NETWORKS

        self._list_networks__parse_args(kwargs)
        libcloud_networks = self.ctl.compute.connection.ex_list_networks(**kwargs)
        network_listing = []

        # Sync the DB state to the API state
        # Syncing Networks
        for network in libcloud_networks:
            try:
                db_network = Network.objects.get(cloud=self.cloud, network_id=network.id)
            except Network.DoesNotExist:
                network_doc = NETWORKS[self.provider].add(title=network.name,
                                                          cloud=self.cloud,
                                                          create_on_cloud=False)
            else:
                network_doc = NETWORKS[self.provider].add(title=network.name,
                                                          cloud=self.cloud,
                                                          description=db_network.description,
                                                          object_id=db_network.id,
                                                          create_on_cloud=False)
            self._create_network__parse_libcloud_object(network_doc, network)

            # Save the new network document
            try:
                network_doc.save()
            except mongoengine.errors.ValidationError as exc:
                log.error("Error updating Network %s: %s", network_doc.title, exc.to_dict())
                raise mist.io.exceptions.NetworkCreationError(exc.message)
            except mongoengine.errors.NotUniqueError as exc:
                log.error("Network %s not unique error: %s", network_doc.title, exc)
                raise mist.io.exceptions.NetworkExistsError()

            # Syncing Subnets
            subnets_in_current_network = network_doc.ctl.list_subnets()

            network_entry = network_doc.as_dict()
            network_entry['subnets'] = subnets_in_current_network
            network_listing.append(network_entry)

        return network_listing

    def _list_networks__parse_args(self, kwargs):
        return

    @catch_common_exceptions
    def list_subnets(self, **kwargs):
        """List all Subnets for a particular network present on the cloud."""

        from mist.io.networks.models import Subnet
        from mist.io.networks.models import SUBNETS

        self._list_subnets__parse_args(kwargs)
        libcloud_subnets = self.ctl.compute.connection.ex_list_subnets(**kwargs)

        subnet_listing = []
        for subnet in libcloud_subnets:

            try:
                db_subnet = Subnet.objects.get(subnet_id=subnet.id)
            except Subnet.DoesNotExist:
                subnet_doc = SUBNETS[self.provider].add(title=subnet.name,
                                                        network=kwargs.get('for_network'),
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
                try:
                    subnet_doc.save()
                except mongoengine.errors.ValidationError as exc:
                    log.error("Error updating Subnet %s: %s", subnet_doc.title, exc.to_dict())
                    raise mist.io.exceptions.NetworkCreationError(exc.message)
                except mongoengine.errors.NotUniqueError as exc:
                    log.error("Subnet %s not unique error: %s", subnet_doc.title, exc)
                    raise mist.io.exceptions.SubnetExistsError(exc.message)
            subnet_listing.append(subnet_doc.as_dict())

        return subnet_listing

    def _list_subnets__parse_args(self, kwargs):
        return

    @catch_common_exceptions
    def delete_network(self, network, **kwargs):
        """Delete a Network."""

        from mist.io.networks.models import Subnet

        associated_subnets = Subnet.objects(network=network)
        for subnet in associated_subnets:
            subnet.ctl.delete_subnet()

        self._delete_network__parse_args(network, kwargs)
        try:
            self.ctl.compute.connection.ex_delete_network(**kwargs)
        except Exception as e:
            raise mist.io.exceptions.NetworkDeletionError("Got error %s" % str(e))
        network.delete()

    def _delete_network__parse_args(self, network, kwargs):
        return

    @catch_common_exceptions
    def delete_subnet(self, subnet, **kwargs):
        """Delete a Subnet."""

        self._delete_subnet__parse_args(subnet, kwargs)
        try:
            self.ctl.compute.connection.ex_delete_subnet(**kwargs)
        except Exception as e:
            raise mist.io.exceptions.SubnetDeletionError("Got error %s" % str(e))
        subnet.delete()

    def _delete_subnet__parse_args(self, subnet, kwargs):
        return

    def _get_libcloud_network(self, network):
        return

    def _get_libcloud_subnet(self, network):
        return
