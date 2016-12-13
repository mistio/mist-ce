"""Definition of network subcontroller classes.

This currently contains only BaseNetworkController. It contains all functionality
concerning the management of networks and related objects that is common between
all cloud providers.

Cloud specific subcontrollers are in `mist.io.clouds.controllers.network.controllers`.

"""

import logging

import mongoengine.errors

import mist.io.exceptions
from mist.io.clouds.controllers.base import BaseController
from mist.io.clouds.utils import LibcloudExceptionHandler, fix_dict_encoding


log = logging.getLogger(__name__)


class BaseNetworkController(BaseController):
    """Abstract base class for networking-specific subcontrollers.

    his base controller factors out all the steps common to all or most
    clouds into a base class, and defines an interface for provider or
    technology specific cloud controllers.

    Subclasses are meant to extend or override methods of this base class to
    account for differences between different cloud types.

    Care should be taken when considering to add new methods to a subclass.
    All controllers should have the same interface, to the degree this is
    feasible. That is to say, don't add a new method to a subclass unless
    there is a very good reason to do so.

    The following convention is followed:

    Any methods and attributes that don't start with an underscore are the
    controller's public API.

    In the `BaseNetworkController`, these public methods will contain all
    steps for network object management which are common to all cloud types.
    In almost all cases, subclasses SHOULD NOT override or extend the
    public methods of `BaseComputeController`. To account for cloud/subclass
    specific behaviour, one is expected to override the internal/private
     methods of `BaseNetworkController`.

    Any methods and attributes that start with an underscore are the
    controller's internal/private API.

    To account for cloud/subclass specific behaviour, the public methods of
    `BaseNetworkController` call a number of private methods. These methods
    will always start with an underscore. When an internal method is only ever
    used in the process of one public method, it
    is prefixed as such to make identification and purpose more obvious. For
    example, method `self._create_network__parse_args` is called in the
    process of `self.create_network` to parse the arguments given to
    self.create_network into the format requited by libcloud.

    For each different cloud type, a subclass needs to be defined.
    To provide cloud specific processing, hook the code on the appropriate private
     method. Each method defined here documents its intended purpose and use.
    """

    @LibcloudExceptionHandler(mist.io.exceptions.NetworkCreationError)
    def create_network(self, network, **kwargs):
        """Create a new network. This method receives a Network DB object from Network.add()
         and performs the following steps, using its associated private methods:
        It populates all its cloud-specific fields.
        It performs early validation on the Network object using all the constraints
            specified in the corresponding Network subclass.
        It creates the parameter structure required by the libcloud call that handles
        network creation.
        It performs the libcloud call.
        It validates the network object and saves it to the database.

        Subclasses SHOULD NOT override or extend this method.

        There is instead a private method that is called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. This method currently is:

            `self._create_network__parse_args`

        More private methods may be added in the future.
        Subclasses that require special handling should override this, by
        default, dummy method.

        network: A Network mongoengine model. The model may not have yet
            been saved in the database.
        kwargs: All cloud-specific parameters for network creation.
        """

        for key, value in kwargs.iteritems():
            if key not in network._network_specific_fields:
                raise mist.io.exceptions.BadRequestError(key)
            setattr(network, key, value)

        # Perform early validation
        try:
            network.validate(clean=True)
        except mongoengine.errors.ValidationError as err:
            raise mist.io.exceptions.BadRequestError(err)

        kwargs['name'] = network.title
        if hasattr(network, 'cidr'):
            kwargs['cidr'] = network.cidr

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

    def _create_network__parse_args(self, network_args):
        """This method creates the parameter structure required by the libcloud call that handles
        network creation based on the kwargs passed to create_network.

        network_args: All cloud-specific parameters for network creation.
        """
        return

    @LibcloudExceptionHandler(mist.io.exceptions.SubnetCreationError)
    def create_subnet(self, subnet, **kwargs):
        """Create a new subnet. This method receives a Subnet DB object from Subnet.add()
         and performs the following steps, using its associated private methods:
        It populates all its cloud-specific fields.
        It performs early validation on the Subnet object using all the constraints
            specified in the corresponding Subnet subclass.
        It creates the parameter structure required by the libcloud call that handles
            subnet creation.
        It performs the libcloud call.
        It validates the subnet object and saves it to the database.

        Subclasses SHOULD NOT override or extend this method.

        There are instead a number of methods that are called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. These methods currently are:

            `self._create_subnet__parse_args`
            `self._create_subnet__create_libcloud_subnet`

        Subclasses that require special handling should override these, by
        default, dummy methods.

        subnet: A Subnet mongoengine model. The model may not have yet
            been saved in the database.
        kwargs: All cloud-specific parameters for subnet creation.
        """

        for key, value in kwargs.iteritems():
            if key not in subnet._subnet_specific_fields:
                raise mist.io.exceptions.BadRequestError(key)
            setattr(subnet, key, value)

            # Perform early validation
        try:
            subnet.validate(clean=True)
        except mongoengine.errors.ValidationError as err:
            raise mist.io.exceptions.BadRequestError(err)

        kwargs['name'] = subnet.title
        kwargs['cidr'] = subnet.cidr

        self._create_subnet__parse_args(subnet.network, kwargs)
        libcloud_subnet = self._create_subnet__create_libcloud_subnet(subnet, kwargs)
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
        """This method creates the parameter structure required by the libcloud call that handles
            subnet creation based on the kwargs passed to create_subnet.

            subnet_args: All cloud-specific parameters for subnet creation.
            parent_network: The network Mongoengine object for the network this
                subnet will be attached to.
            """
        return

    def _create_subnet__create_libcloud_subnet(self, subnet, kwargs):
        """This method performs the libcloud call that handles subnet creation. This part of the process
            was split into a private method because the naming convention used for this call in libcloud
            is inconsistent and some clouds require specialized parsing of its response.

            subnet: A Subnet mongoengine model. The model may not have yet
                been saved in the database.
            kwargs: All cloud-specific parameters for subnet creation.
            """
        return self.ctl.compute.connection.ex_create_subnet(**kwargs)

    @LibcloudExceptionHandler(mist.io.exceptions.NetworkListingError)
    def list_networks(self):
        """Lists all Networks present on the cloud. Also syncs the state of the Network documents
         on the DB with their state on the Cloud API.

         Subclasses SHOULD NOT override or extend this method.

        There is instead a private method that is called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. This method currently is:

            `self._list_networks__parse_libcloud_object`

        More private methods may be added in the future.
        Subclasses that require special handling should override this, by
        default, dummy method."""

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
            network.extra = fix_dict_encoding(libcloud_network.extra)

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
        """This method creates the parameter structure required by the libcloud call that handles
            subnet creation based on the kwargs passed to create_subnet.

            network: A Network mongoengine model. The model may not have yet
                been saved in the database.
            libcloud_network: All LibcloudNetwork object returned by the list_networks call."""
        return

    @LibcloudExceptionHandler(mist.io.exceptions.SubnetListingError)
    def list_subnets(self, network):
        """Lists all Subnets attached to a network present on the cloud.
        Also syncs the state of the Subnet documents on the DB with their state
        on the Cloud API.

         Subclasses SHOULD NOT override or extend this method.

        There is instead a private method that is called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. This method currently is:

            `self._list_networks__parse_libcloud_object`

        More private methods may be added in the future.
        Subclasses that require special handling should override this, by
        default, dummy method.

        network: A Network mongoengine model. Only subnets attached to this
        network will be returned.
            """

        # FIXME: Move these imports to the top of the file when circular import issues are resolved
        from mist.io.networks.models import Subnet, SUBNETS

        list_subnets_args = {}
        self._list_subnets__parse_args(network, list_subnets_args)
        libcloud_subnets = self._list_subnets__fetch_subnets(network, list_subnets_args)

        subnet_listing = []
        for libcloud_subnet in libcloud_subnets:

            try:
                subnet = Subnet.objects.get(network=network, subnet_id=libcloud_subnet.id)
            except Subnet.DoesNotExist:
                subnet = SUBNETS[self.provider](network=network, subnet_id=libcloud_subnet.id)

            self._list_subnets__parse_libcloud_object(subnet, libcloud_subnet)

            subnet.title = libcloud_subnet.name
            subnet.extra = fix_dict_encoding(libcloud_subnet.extra)

            try:
                subnet.save()
            except mongoengine.errors.ValidationError as exc:
                log.error("Error updating Subnet %s: %s", subnet.title, exc.to_dict())
                raise mist.io.exceptions.SubnetCreationError(exc.message)
            except mongoengine.errors.NotUniqueError as exc:
                log.error("Subnet %s not unique error: %s", subnet.title, exc)
                raise mist.io.exceptions.SubnetExistsError(exc.message)

            subnet_listing.append(subnet)

        return subnet_listing

    def _list_subnets__parse_args(self, network, kwargs):
        """This method creates the parameter structure required by the libcloud call that
        returns subnet listings. It is used when Cloud APIs support filtering  the result of
         the list_subnet call based on some parameter.

            network: A Network mongoengine model.
            kwargs: A dictionary containing all the arguments to be passed to the
                list_subnets call. This will be modified by this method based on the
                network object.
            """
        return

    @staticmethod
    def _list_subnets__parse_libcloud_object(subnet, libcloud_subnet):
        """This method creates the parameter structure required by the libcloud call that handles
            subnet creation based on the kwargs passed to create_subnet.

            network: A Network mongoengine model. The model may not have yet
                been saved in the database.
            libcloud_network: All LibcloudNetwork object returned by the list_networks call."""
        return

    def _list_subnets__fetch_subnets(self, network, kwargs):
        """This method performs the libcloud call returns a subnet listing. This part of the process
            was split into a private method because the naming convention used for this call in libcloud
            is inconsistent and some clouds require specialized parsing of its response.

            network: A Network mongoengine model. The model may not have yet
                been saved in the database.
            kwargs: All cloud-specific parameters for ths subnet listing call.
                These are usually generated by _list_subnets__parse_libcloud_object
            """
        self._list_subnets__parse_args(network, kwargs)
        return self.ctl.compute.connection.ex_list_subnets(**kwargs)

    @LibcloudExceptionHandler(mist.io.exceptions.NetworkDeletionError)
    def delete_network(self, network):
        """Deletes a network.

        Subclasses SHOULD NOT override or extend this method.

        There are instead a number of methods that are called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. These methods currently are:

            `self._delete_network__parse_args`
            `self._delete_network__delete_libcloud_network`

        Subclasses that require special handling should override these, by
        default, dummy methods.

        network: A Network mongoengine model.
        """

        # FIXME: Move these imports to the top of the file when circular import issues are resolved
        from mist.io.networks.models import Subnet

        for subnet in Subnet.objects(network=network):
            subnet.ctl.delete_subnet()

        delete_network_args = {}

        self._delete_network__parse_args(network, delete_network_args)
        self._delete_network__delete_libcloud_network(network, delete_network_args)

        network.delete()

    def _delete_network__parse_args(self, network, kwargs):
        """This method creates the parameter structure required by the libcloud call that
        deletes networks.

        network: A Network mongoengine model.
        kwargs: A dictionary containing all the arguments to be passed to the
            delete_network call. This will be modified by this method based on the
            network object.
            """
        return

    def _delete_network__delete_libcloud_network(self, network, kwargs):
        """This method performs the libcloud call deletes a network. This part of the process
            was split into a private method because the naming convention used for this call in libcloud
            is inconsistent and some clouds require specialized parsing of its response.

            network: A Network mongoengine model.
            kwargs: A dictionary containing all the arguments to be passed to the
                delete_network call. This will be modified by this method based on the
                network object.
                """
        self.ctl.compute.connection.ex_delete_network(**kwargs)

    @LibcloudExceptionHandler(mist.io.exceptions.SubnetDeletionError)
    def delete_subnet(self, subnet):
        """Deletes a subnet.

        Subclasses SHOULD NOT override or extend this method.

        There are instead a number of methods that are called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. These methods currently are:

            `self._delete_subnet__parse_args`
            `self._delete_subnet__delete_libcloud_subnet`

        Subclasses that require special handling should override these, by
        default, dummy methods.

        subnet: A Subnet mongoengine model.
        """
        list_subnets_args = {}
        self._delete_subnet__parse_args(subnet, list_subnets_args)
        self._delete_subnet__delete_libcloud_subnet(subnet, list_subnets_args)

        subnet.delete()

    def _delete_subnet__parse_args(self, subnet, kwargs):
        """This method creates the parameter structure required by the libcloud call that
                deletes subnets.

        subnet: A Subnet mongoengine model.
        kwargs: A dictionary containing all the arguments to be passed to the
            delete_subnet call. This will be modified by this method based on the
            network object.
            """
        return

    def _delete_subnet__delete_libcloud_subnet(self, network, kwargs):
        """This method performs the libcloud call deletes a subnet. This part of the process
            was split into a private method because the naming convention used for this call in libcloud
            is inconsistent and some clouds require specialized parsing of its response.

            subnet: A Subnet mongoengine model.
            kwargs: A dictionary containing all the arguments to be passed to the
                delete_subnet call. This will be modified by this method based on the
                subnet object.
            """
        self.ctl.compute.connection.ex_delete_subnet(**kwargs)

    def _get_libcloud_network(self, network):
        """This method receives a Network mongoengine model and queries libcloud to
        return the corresponding LibcloudNetwork object. This is intended to be used as
        a helper method, especially for delete_network calls.

        Subclasses may override this method if needed.

            network: A Network mongoengine model.
        """
        return

    def _get_libcloud_subnet(self, network):
        """This method receives a Subnet mongoengine model and queries libcloud to
        return the corresponding LibcloudSubnet object. This is intended to be used as
        a helper method, especially for delete_subnet calls.

        Subclasses may override this method if needed.

            subnet: A Subnet mongoengine model.
        """
        return
