import logging
import ssl

import mongoengine.errors

import mist.io.exceptions
from libcloud.common.types import LibcloudError, InvalidCredsError, MalformedResponseError
from libcloud.common.exceptions import BaseHTTPError, RateLimitReachedError
from mist.io.clouds.controllers.base import BaseController

log = logging.getLogger(__name__)


def perform_libcloud_request(libcloud_func, request_exception_class, *args, **kwargs):
    try:
        return libcloud_func(*args, **kwargs)
    except InvalidCredsError as exc:
        log.error("Invalid creds on running %: %s", libcloud_func.__name__, exc)
        raise mist.io.exceptions.CloudUnauthorizedError(exc=exc, msg=exc.message)
    except ssl.SSLError as exc:
        log.error("SSLError on running %s: %s", libcloud_func.__name__, exc)
        raise mist.io.exceptions.CloudUnavailableError(exc=exc, msg=exc.message)
    except MalformedResponseError as exc:
        log.error("MalformedResponseError on running %s: %s", exc)
        raise mist.io.exceptions.MalformedResponseError(exc=exc, msg=exc.message)
    except RateLimitReachedError as exc:
        log.error("Rate limit error on running %s: %s", libcloud_func.__name__, exc)
        raise mist.io.exceptions.RateLimitError(exc=exc, msg=exc.message)
    except BaseHTTPError as exc:  # Libcloud errors caused by invalid parameters are raised as this type
        log.error("Bad request on running %s: %s", libcloud_func.__name__, exc)
        raise mist.io.exceptions.BadRequestError(exc=exc, msg=exc.message)
    except LibcloudError as exc:
        log.error("Error on running %s: %s", libcloud_func.__name__, exc)
        raise request_exception_class(exc=exc, msg=exc.message)


class BaseNetworkController(BaseController):
    """Abstract base class for networking-specific subcontrollers.

    All public methods in this class should not be overridden or extended unless the corresponding method in libcloud
        is significantly different from this implementation."""

    def create_network(self, network_doc, **kwargs):
        """Create a new network."""

        self._create_network__parse_args(kwargs)

        libcloud_network = perform_libcloud_request(self.ctl.compute.connection.ex_create_network,
                                                    mist.io.exceptions.NetworkCreationError,
                                                    **kwargs)
        try:
            network_doc.network_id = libcloud_network.id
            network_doc.save()
        except mongoengine.errors.ValidationError as exc:
            log.error("Error saving Network %s: %s", network_doc.title, exc.to_dict())
            raise mist.io.exceptions.NetworkCreationError(exc.message)
        except mongoengine.errors.NotUniqueError as exc:
            log.error("Network %s not unique error: %s", network_doc.title, exc)
            raise mist.io.exceptions.NetworkExistsError()

        return network_doc

    def _create_network__parse_args(self, kwargs):
        return

    def create_subnet(self, subnet_doc, parent_network, **kwargs):
        """Creates a new subnet."""

        self._create_subnet__parse_args(parent_network, kwargs)
        libcloud_subnet = perform_libcloud_request(self.ctl.compute.connection.ex_create_subnet,
                                                   mist.io.exceptions.SubnetCreationError,
                                                   **kwargs)
        try:
            subnet_doc.subnet_id = libcloud_subnet.id
            subnet_doc.save()
        except mongoengine.errors.ValidationError as exc:
            log.error("Error saving Subnet %s: %s", subnet_doc.title, exc.to_dict())
            raise mist.io.exceptions.NetworkCreationError(exc.message)
        except mongoengine.errors.NotUniqueError as exc:
            log.error("Subnet %s not unique error: %s", subnet_doc.title, exc)
            raise mist.io.exceptions.SubnetExistsError(exc.message)

        return subnet_doc

    def _create_subnet__parse_args(self, subnet_args, parent_network):
        return

    def list_networks(self):
        """List all Networks present on the cloud. Also syncs the state of the Network and Subnet documents on the DB
        with their state on the Cloud API."""

        from mist.io.networks.models import Network, NETWORKS

        libcloud_networks = perform_libcloud_request(self.ctl.compute.connection.ex_list_networks,
                                                     mist.io.exceptions.NetworkListingError)
        network_listing = []

        # Sync the DB state to the API state
        # Syncing Networks
        for network in libcloud_networks:
            try:
                network_doc = Network.objects.get(cloud=self.cloud, network_id=network.id)
            except Network.DoesNotExist:
                network_doc = NETWORKS[self.provider](cloud=self.cloud,
                                                      network_id=network.id)

            self._list_networks__parse_libcloud_object(network_doc, network)

            network_doc.title = network.name
            network_doc.extra = network.extra

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
            network_entry = network_doc.as_dict()
            network_entry['subnets'] = network_doc.ctl.list_subnets()
            network_listing.append(network_entry)

        return network_listing

    @staticmethod
    def _list_networks__parse_libcloud_object(network_doc, libcloud_network):
        return

    def list_subnets(self, network, **kwargs):
        """List all Subnets for a particular network present on the cloud."""

        from mist.io.networks.models import Subnet
        from mist.io.networks.models import SUBNETS

        self._list_subnets__parse_args(network, kwargs)
        libcloud_subnets = perform_libcloud_request(self.ctl.compute.connection.ex_list_subnets,
                                                    mist.io.exceptions.SubnetListingError,
                                                    **kwargs)

        subnet_listing = []
        for subnet in libcloud_subnets:

            try:
                subnet_doc = Subnet.objects.get(network=network, subnet_id=subnet.id)
            except Subnet.DoesNotExist:
                subnet_doc = SUBNETS[self.provider](network=network, subnet_id=subnet.id)

            self._list_subnets__parse_libcloud_object(subnet_doc, subnet)

            subnet_doc.title = subnet.name
            subnet_doc.extra = subnet.extra

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

    def _list_subnets__parse_args(self, network, kwargs):
        return

    @staticmethod
    def _list_subnets__parse_libcloud_object(subnet_doc, subnet):
        return

    def delete_network(self, network, **kwargs):
        """Delete a Network."""

        from mist.io.networks.models import Subnet

        for subnet in Subnet.objects(network=network):
            subnet.ctl.delete_subnet()

        self._delete_network__parse_args(network, kwargs)

        perform_libcloud_request(self.ctl.compute.connection.ex_delete_network,
                                 mist.io.exceptions.NetworkDeletionError,
                                 **kwargs)

        network.delete()

    def _delete_network__parse_args(self, network, kwargs):
        return

    def delete_subnet(self, subnet, **kwargs):
        """Delete a Subnet."""

        self._delete_subnet__parse_args(subnet, kwargs)
        try:
            perform_libcloud_request(self.ctl.compute.connection.ex_delete_subnet,
                                     mist.io.exceptions.SubnetDeletionError,
                                     **kwargs)
        except Exception as e:
            raise mist.io.exceptions.SubnetDeletionError("Got error %s" % str(e))
        subnet.delete()

    def _delete_subnet__parse_args(self, subnet, kwargs):
        return

    def _get_libcloud_network(self, network):
        return

    def _get_libcloud_subnet(self, network):
        return
