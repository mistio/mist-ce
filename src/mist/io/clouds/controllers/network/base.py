import logging
import ssl

import mongoengine.errors

import mist.io.exceptions
from libcloud.common.types import LibcloudError, InvalidCredsError, MalformedResponseError
from libcloud.common.exceptions import BaseHTTPError, RateLimitReachedError
from mist.io.clouds.controllers.base import BaseController

log = logging.getLogger(__name__)


class LibcloudExceptionHandler(object):
    def __init__(self, exception_class):
        self.exception_class = exception_class

    def __call__(self, func, *args, **kwargs):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except InvalidCredsError as exc:
                log.error("Invalid creds on running %: %s", func.__name__, exc)
                raise mist.io.exceptions.CloudUnauthorizedError(exc=exc, msg=exc.message)
            except ssl.SSLError as exc:
                log.error("SSLError on running %s: %s", func.__name__, exc)
                raise mist.io.exceptions.CloudUnavailableError(exc=exc, msg=exc.message)
            except MalformedResponseError as exc:
                log.error("MalformedResponseError on running %s: %s", exc)
                raise mist.io.exceptions.MalformedResponseError(exc=exc, msg=exc.message)
            except RateLimitReachedError as exc:
                log.error("Rate limit error on running %s: %s", func.__name__, exc)
                raise mist.io.exceptions.RateLimitError(exc=exc, msg=exc.message)
            except BaseHTTPError as exc:  # Libcloud errors caused by invalid parameters are raised as this type
                log.error("Bad request on running %s: %s", func.__name__, exc)
                raise mist.io.exceptions.BadRequestError(exc=exc, msg=exc.message)
            except LibcloudError as exc:
                log.error("Error on running %s: %s", func.__name__, exc)
                raise self.exception_class(exc=exc, msg=exc.message)

        return wrapper


class BaseNetworkController(BaseController):
    """Abstract base class for networking-specific subcontrollers.

    All public methods in this class should not be overridden or extended unless the corresponding method in libcloud
        is significantly different from this implementation."""

    @LibcloudExceptionHandler(mist.io.exceptions.NetworkCreationError)
    def create_network(self, network, **kwargs):
        """Create a new network."""

        kwargs['name'] = network.title
        kwargs['description'] = network.description

        self._create_network__parse_args(kwargs)

        libcloud_network = self.ctl.compute.connection.ex_create_network(**kwargs)
        try:
            network.network_id = libcloud_network.id
            network.save()
        except mongoengine.errors.ValidationError as exc:
            log.error("Error saving Network %s: %s", network.title, exc.to_dict())
            raise mist.io.exceptions.NetworkCreationError(exc.message)
        except mongoengine.errors.NotUniqueError as exc:
            log.error("Network %s not unique error: %s", network.title, exc)
            raise mist.io.exceptions.NetworkExistsError()

        return network

    def _create_network__parse_args(self, kwargs):
        return

    @LibcloudExceptionHandler(mist.io.exceptions.SubnetCreationError)
    def create_subnet(self, subnet, **kwargs):
        """Creates a new subnet."""

        kwargs['name'] = subnet.title
        kwargs['description'] = subnet.description

        self._create_subnet__parse_args(subnet.network, kwargs)
        libcloud_subnet = self.ctl.compute.connection.ex_create_subnet(**kwargs)
        try:
            subnet.subnet_id = libcloud_subnet.id
            subnet.save()
        except mongoengine.errors.ValidationError as exc:
            log.error("Error saving Subnet %s: %s", subnet.title, exc.to_dict())
            raise mist.io.exceptions.NetworkCreationError(exc.message)
        except mongoengine.errors.NotUniqueError as exc:
            log.error("Subnet %s not unique error: %s", subnet.title, exc)
            raise mist.io.exceptions.SubnetExistsError(exc.message)

        return subnet

    def _create_subnet__parse_args(self, subnet_args, parent_network):
        return

    @LibcloudExceptionHandler(mist.io.exceptions.NetworkListingError)
    def list_networks(self):
        """List all Networks present on the cloud. Also syncs the state of the Network and Subnet documents on the DB
        with their state on the Cloud API."""

        # FIXME: Move these imports to the top of the file when circular import issues are resolved
        from mist.io.networks.models import Network, NETWORKS

        libcloud_networks = self.ctl.compute.connection.ex_list_networks()
        network_listing = []

        # Sync the DB state to the API state
        # Syncing Networks
        for libcloud_network in libcloud_networks:
            try:
                network = Network.objects.get(cloud=self.cloud, network_id=libcloud_network.id)
            except Network.DoesNotExist:
                network = NETWORKS[self.provider](cloud=self.cloud,
                                                  network_id=libcloud_network.id)

            self._list_networks__parse_libcloud_object(network, libcloud_network)

            network.title = libcloud_network.name
            if libcloud_network.extra.get('description'):
                network.description = libcloud_network.extra.pop('description')
            network.extra = libcloud_network.extra

            # Save the new network document
            try:
                network.save()
            except mongoengine.errors.ValidationError as exc:
                log.error("Error updating Network %s: %s", network.title, exc.to_dict())
                raise mist.io.exceptions.NetworkCreationError(exc.message)
            except mongoengine.errors.NotUniqueError as exc:
                log.error("Network %s not unique error: %s", network.title, exc)
                raise mist.io.exceptions.NetworkExistsError()

            network_listing.append(network)

        return network_listing

    @staticmethod
    def _list_networks__parse_libcloud_object(network, libcloud_network):
        return

    @LibcloudExceptionHandler(mist.io.exceptions.SubnetListingError)
    def list_subnets(self, network, **kwargs):
        """List all Subnets for a particular network present on the cloud."""

        # FIXME: Move these imports to the top of the file when circular import issues are resolved
        from mist.io.networks.models import Subnet, SUBNETS

        self._list_subnets__parse_args(network, kwargs)
        libcloud_subnets = self.ctl.compute.connection.ex_list_subnets(**kwargs)

        subnet_listing = []
        for libcloud_subnet in libcloud_subnets:

            try:
                subnet = Subnet.objects.get(network=network, subnet_id=libcloud_subnet.id)
            except Subnet.DoesNotExist:
                subnet = SUBNETS[self.provider](network=network, subnet_id=libcloud_subnet.id)

            self._list_subnets__parse_libcloud_object(subnet, libcloud_subnet)

            subnet.title = libcloud_subnet.name
            if libcloud_subnet.extra.get('description'):
                subnet.description = libcloud_subnet.extra.pop('description')
            subnet.extra = libcloud_subnet.extra

            try:
                subnet.save()
            except mongoengine.errors.ValidationError as exc:
                log.error("Error updating Subnet %s: %s", subnet.title, exc.to_dict())
                raise mist.io.exceptions.NetworkCreationError(exc.message)
            except mongoengine.errors.NotUniqueError as exc:
                log.error("Subnet %s not unique error: %s", subnet.title, exc)
                raise mist.io.exceptions.SubnetExistsError(exc.message)

            subnet_listing.append(subnet)

        return subnet_listing

    def _list_subnets__parse_args(self, network, kwargs):
        return

    @staticmethod
    def _list_subnets__parse_libcloud_object(subnet, libcloud_subnet):
        return

    @LibcloudExceptionHandler(mist.io.exceptions.NetworkDeletionError)
    def delete_network(self, network, **kwargs):
        """Delete a Network."""

        from mist.io.networks.models import Subnet

        for subnet in Subnet.objects(network=network):
            subnet.ctl.delete_subnet()

        self._delete_network__parse_args(network, kwargs)

        self.ctl.compute.connection.ex_delete_network(**kwargs)

        network.delete()

    def _delete_network__parse_args(self, network, kwargs):
        return

    @LibcloudExceptionHandler(mist.io.exceptions.SubnetDeletionError)
    def delete_subnet(self, subnet, **kwargs):
        """Delete a Subnet."""

        self._delete_subnet__parse_args(subnet, kwargs)
        self.ctl.compute.connection.ex_delete_subnet(**kwargs)

        subnet.delete()

    def _delete_subnet__parse_args(self, subnet, kwargs):
        return

    def _get_libcloud_network(self, network):
        return

    def _get_libcloud_subnet(self, network):
        return
