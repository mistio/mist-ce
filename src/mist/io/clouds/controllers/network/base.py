"""Definition of base network subcontroller classes.

This currently contains only BaseNetworkController.

It contains all functionality concerning the management of networks and related
objects that is common among all cloud providers. Cloud specific subcontrollers
are in `mist.io.clouds.controllers.network.controllers`.

"""

import json
import copy
import logging
import mongoengine.errors

import mist.io.exceptions

from mist.io.clouds.utils import LibcloudExceptionHandler
from mist.io.clouds.controllers.base import BaseController


log = logging.getLogger(__name__)


class BaseNetworkController(BaseController):
    """Abstract base class for networking-specific subcontrollers.

    This base controller factors out all the steps common to all or most
    clouds into a base class, and defines an interface for provider
    or technology specific cloud controllers.

    Subclasses are meant to extend or override methods of this base class to
    account for differences between different cloud types.

    Care should be taken when considering to add new methods to a subclass.
    All controllers should have the same interface, to the degree this is
    feasible. That is to say, don't add a new method to a subclass unless
    there is a very good reason to do so.

    The following convention is followed:

    Any methods and attributes that don't start with an underscore are the
    controller's public API.

    In the `BaseNetworkController`, these public methods will contain all steps
    for network object management which are common to all cloud types.In almost
    all cases, subclasses SHOULD NOT override or extend the public methods of
    `BaseComputeController`. To account for cloud/subclass specific behaviour,
    one is expected to override the internal/private methods of the
    `BaseNetworkController`.

    Any methods and attributes that start with an underscore are the
    controller's internal/private API.

    To account for cloud/subclass specific behaviour, the public methods of
    `BaseNetworkController` call a number of private methods. These methods
    will always start with an underscore. When an internal method is only ever
    used in the process of one public method, it is prefixed as such to make
    identification and purpose more obvious.

    For example, method `self._create_network__parse_args` is called in the
    process of `self.create_network` to parse the arguments given into the
    format required by libcloud.

    For each different cloud type, a subclass needs to be defined. To provide
    cloud specific processing, hook the code on the appropriate private method.
    Each method defined here documents its intended purpose and use.
    """

    @LibcloudExceptionHandler(mist.io.exceptions.NetworkCreationError)
    def create_network(self, network, **kwargs):
        """Create a new Network.

        This method receives a Network mongoengine object, parses the arguments
        provided and populates all cloud-specific fields, performs early field
        validation using the constraints specified in the corresponding Network
        subclass, performs the necessary libcloud call, and, finally, saves the
        Network objects to the database.

        Subclasses SHOULD NOT override or extend this method.

        Instead, there is a private method that is called from this method, to
        allow subclasses to modify the data according to the specific of their
        cloud type. This method currently is:

            `self._create_network__prepare_args`

        Subclasses that require special handling should override this, by
        default, dummy method. More private methods may be added in the future.

        :param network: A Network mongoengine model. The model may not have yet
                        been saved in the database.
        :param kwargs:  A dict of parameters required for network creation.
        """
        for key, value in kwargs.iteritems():
            if key not in network._network_specific_fields:
                raise mist.io.exceptions.BadRequestError(key)
            setattr(network, key, value)

        # Perform early validation.
        try:
            network.validate(clean=True)
        except mongoengine.errors.ValidationError as err:
            raise mist.io.exceptions.BadRequestError(err)

        if network.cidr:
            kwargs['cidr'] = network.cidr
        kwargs['name'] = network.name or ''

        # Cloud-specific kwargs pre-processing.
        self._create_network__prepare_args(kwargs)

        # Create the network.
        libcloud_net = self.ctl.compute.connection.ex_create_network(**kwargs)

        try:
            network.network_id = libcloud_net.id
            network.save()
        except mongoengine.errors.ValidationError as exc:
            log.error("Error saving %s: %s", network, exc.to_dict())
            raise mist.io.exceptions.NetworkCreationError(exc.message)
        except mongoengine.errors.NotUniqueError as exc:
            log.error("Network %s not unique error: %s", network.name, exc)
            raise mist.io.exceptions.NetworkExistsError()

        return network

    def _create_network__prepare_args(self, kwargs):
        """Parses keyword arguments on behalf of `self.create_network`.

        Creates the parameter structure required by the libcloud method
        that handles network creation.

        Subclasses MAY override this method.
        """
        return

    @LibcloudExceptionHandler(mist.io.exceptions.SubnetCreationError)
    def create_subnet(self, subnet, **kwargs):
        """Create a new Subnet.

        This method receives a Subnet mongoengine object, parses the arguments
        provided and populates all cloud-specific fields, performs early field
        validation using the constraints specified in the corresponding Subnet
        subclass, performs the necessary libcloud call, and, finally, saves the
        Subnet objects to the database.

        Subclasses SHOULD NOT override or extend this method.

        There are instead a number of methods that are called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. These methods currently are:

            `self._create_subnet`
            `self._create_subnet__prepare_args`

        Subclasses that require special handling should override these, by
        default, dummy methods.

        :param subnet: A Subnet mongoengine model. The model may not have yet
                       been saved in the database.
        :param kwargs: A dict of parameters required for subnet creation.
        """
        for key, value in kwargs.iteritems():
            if key not in subnet._subnet_specific_fields:
                raise mist.io.exceptions.BadRequestError(key)
            setattr(subnet, key, value)

        # Perform early validation.
        try:
            subnet.validate(clean=True)
        except mongoengine.errors.ValidationError as err:
            raise mist.io.exceptions.BadRequestError(err)

        kwargs['cidr'] = subnet.cidr
        kwargs['name'] = subnet.name or ''

        # Cloud-specific kwargs processing.
        self._create_subnet__prepare_args(subnet, kwargs)

        # Create the subnet.
        libcloud_subnet = self._create_subnet(kwargs)

        try:
            subnet.subnet_id = libcloud_subnet.id
            subnet.save()
        except mongoengine.errors.ValidationError as exc:
            log.error("Error saving %s: %s", subnet, exc.to_dict())
            raise mist.io.exceptions.NetworkCreationError(exc.message)
        except mongoengine.errors.NotUniqueError as exc:
            log.error("Subnet %s is not unique: %s", subnet.name, exc)
            raise mist.io.exceptions.SubnetExistsError()

        return subnet

    def _create_subnet(self, kwargs):
        """Performs the libcloud call that handles subnet creation.

        This method is meant to be called internally by `self.create_subnet`.

        Unless naming conventions change or specialized parsing of the libcloud
        response is needed, subclasses SHOULD NOT need to override this method.

        Subclasses MAY override this method.
        """
        return self.ctl.compute.connection.ex_create_subnet(**kwargs)

    def _create_subnet__prepare_args(self, subnet, kwargs):
        """Parses keyword arguments on behalf of `self.create_subnet`.

        Creates the parameter structure required by the libcloud method
        that handles network creation.

        Subclasses MAY override this method.
        """
        return

    @LibcloudExceptionHandler(mist.io.exceptions.NetworkListingError)
    def list_networks(self):
        """Lists all Networks present on the Cloud.

        Fetches all Networks via libcloud, applies cloud-specific processing,
        and syncs the state of the database with the state of the Cloud.

        Subclasses SHOULD NOT override or extend this method.

        There are instead a number of methods that are called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. These methods currently are:

            `self._list_networks__cidr_range`
            `self._list_networks__postparse_network`

        More private methods may be added in the future. Subclasses that
        require special handling should override this, by default, dummy
        method.
        """
        # FIXME: Move these imports to the top of the file when circular
        # import issues are resolved
        from mist.io.networks.models import Network, NETWORKS

        libcloud_networks = self.ctl.compute.connection.ex_list_networks()

        # List of Network mongoengine objects to be returned to the API.
        networks = []
        for net in libcloud_networks:
            try:
                network = Network.objects.get(cloud=self.cloud,
                                              network_id=net.id)
            except Network.DoesNotExist:
                network = NETWORKS[self.provider](cloud=self.cloud,
                                                  network_id=net.id)

            network.name = net.name
            network.extra = copy.copy(net.extra)

            # Get the Network's CIDR.
            try:
                network.cidr = self._list_networks__cidr_range(network, net)
            except Exception as exc:
                log.exception('Failed to get CIDR of %s: %s', network, exc)

            # Apply cloud-specific processing.
            try:
                self._list_networks__postparse_network(network, net)
            except Exception as exc:
                log.exception('Error post-parsing %s: %s', network, exc)

            # Ensure JSON-encoding.
            for key, value in network.extra.iteritems():
                try:
                    json.dumps(value)
                except TypeError:
                    network.extra[key] = str(value)

            try:
                network.save()
            except mongoengine.errors.ValidationError as exc:
                log.error("Error updating %s: %s", network, exc.to_dict())
                raise mist.io.exceptions.BadRequestError(
                    {"msg": exc.message, "errors": exc.to_dict()}
                )
            except mongoengine.errors.NotUniqueError as exc:
                log.error("Network %s is not unique: %s", network.name, exc)
                raise mist.io.exceptions.NetworkExistsError()

            networks.append(network)

            # Delete existing networks not returned by libcloud. All associated
            # Subnets will also be deleted.
            Network.objects(cloud=self.cloud,
                            id__nin=[n.id for n in networks]).delete()

        return networks

    def _list_networks__cidr_range(self, network, libcloud_network):
        """Returns the network's IP range in CIDR notation.

        This method is meant to be called internally by `self.list_networks`
        in order to return the network's CIDR, if exists.

        Subclasses MAY override this method.

        :param network: A network mongoengine model. The model may not have yet
                        been saved in the database.
        :param libcloud_network: A libcloud network object.
        """
        return

    def _list_networks__postparse_network(self, network, libcloud_network):
        """Parses a libcloud network object on behalf of `self.list_networks`.

        Any subclass that needs to perform custom parsing of a network object
        returned by libcloud SHOULD override this private method.

        This method is expected to edit the network objects in place and not
        return anything.

        Subclasses MAY override this method.

        :param network: A network mongoengine model. The model may not have yet
                        been saved in the database.
        :param libcloud_network: A libcloud network object.
        """
        return

    @LibcloudExceptionHandler(mist.io.exceptions.SubnetListingError)
    def list_subnets(self, network, **kwargs):
        """Lists all Subnets attached to a Network present on the Cloud.

        Fetches all Subnets via libcloud, applies cloud-specific processing,
        and syncs the state of the database with the state of the Cloud.

        Subclasses SHOULD NOT override or extend this method.

        There are instead a number of methods that are called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. These methods currently are:

            `self._list_subnets__fetch_subnets`
            `self._list_subnets__cidr_range`
            `self._list_subnets__postparse_subnet`

        More private methods may be added in the future. Subclasses that
        require special handling should override this, by default, dummy
        method.
        """
        # FIXME: Move these imports to the top of the file when circular
        # import issues are resolved
        from mist.io.networks.models import Subnet, SUBNETS

        libcloud_subnets = self._list_subnets__fetch_subnets(network)

        # List of Subnet mongoengine objects to be returned to the API.
        subnets = []
        for libcloud_subnet in libcloud_subnets:
            try:
                subnet = Subnet.objects.get(network=network,
                                            subnet_id=libcloud_subnet.id)
            except Subnet.DoesNotExist:
                subnet = SUBNETS[self.provider](network=network,
                                                subnet_id=libcloud_subnet.id)

            subnet.name = libcloud_subnet.name
            subnet.extra = copy.copy(libcloud_subnet.extra)

            # Get the Subnet's CIDR.
            try:
                subnet.cidr = self._list_subnets__cidr_range(subnet,
                                                    libcloud_subnet)
            except Exception as exc:
                log.exception('Failed to get the CIDR of %s: %s', subnet, exc)

            # Apply cloud-specific processing.
            try:
                self._list_subnets__postparse_subnet(subnet, libcloud_subnet)
            except Exception as exc:
                log.exception('Error while post-parsing %s: %s', subnet, exc)

            # Ensure JSON-encoding.
            for key, value in subnet.extra.iteritems():
                try:
                    json.dumps(value)
                except TypeError:
                    subnet.extra[key] = str(value)

            try:
                subnet.save()
            except mongoengine.errors.ValidationError as exc:
                log.error("Error updating %s: %s", subnet, exc.to_dict())
                raise mist.io.exceptions.BadRequestError(
                    {"msg": exc.message, "errors": exc.to_dict()}
                )
            except mongoengine.errors.NotUniqueError as exc:
                log.error("Subnet %s not unique error: %s", subnet.name, exc)
                raise mist.io.exceptions.SubnetExistsError()

            subnets.append(subnet)

            # Delete missing subnets.
            Subnet.objects(network=network,
                           id__nin=[s.id for s in subnets]).delete()

        return subnets

    def _list_subnets__fetch_subnets(self, network):
        """Fetches a list of subnets.

        Performs the actual libcloud call that returns a subnet listing.

        This method is meant to be called internally by `self.list_subnets`.

        Due to inconsistent naming conventions and cloud-specific filtering,
        this method is not implemented in `BaseNetworkController`.

        Subclasses MUST override this method.
        """
        raise NotImplementedError('The BaseNetworkController CANNOT perform '
                                  'subnet listings due to cloud-specific '
                                  'filtering needs.')

    def _list_subnets__cidr_range(self, subnet, libcloud_subnet):
        """Returns the subnet's IP range in CIDR notation.

        This method is meant to be called internally by `self.list_subnets` in
        order to return the subnet's CIDR.

        Subclasses MAY override this method.

        :param subnet: A subnet mongoengine model. The model may not have yet
                       been saved in the database.
        :param libcloud_subnet: A libcloud subnet object.
        """
        return libcloud_subnet.cidr

    def _list_subnets__postparse_subnet(self, subnet, libcloud_subnet):
        """Parses a libcloud network object on behalf of `self.list_subnets`.

        Any subclass that needs to perform custom parsing of a subnet object
        returned by libcloud SHOULD override this private method.

        This method is expected to edit the subnet objects in place and not
        return anything.

        Subclasses MAY override this method.

        :param subnet: A subnet mongoengine model. The model may not have yet
                       been saved in the database.
        :param libcloud_subnet: A libcloud subnet object.
        """
        return

    @LibcloudExceptionHandler(mist.io.exceptions.NetworkDeletionError)
    def delete_network(self, network):
        """Deletes a network.

        Subclasses SHOULD NOT override or extend this method.

        If a subclass needs to override the way networks are deleted, it
        should override the private method `_delete_network` instead.
        """
        # FIXME: Move these imports to the top of the file when circular
        # import issues are resolved
        from mist.io.networks.models import Subnet

        assert network.cloud == self.cloud

        for subnet in Subnet.objects(network=network):
            subnet.ctl.delete()

        libcloud_network = self._get_libcloud_network(network)
        self._delete_network(network, libcloud_network)

        network.delete()

    def _delete_network(self, network, libcloud_network):
        """Performs the libcloud call that handles network deletion.

        This method is meant to be called internally by `self.delete_network`.

        Unless naming conventions change or specialized parsing of the libcloud
        response is needed, subclasses SHOULD NOT need to override this method.

        Subclasses MAY override this method.
        """
        # TODO: Currently, this is supported only by GCE, but it is trivial to
        # implement a similar method for the rest of the providers in order to
        # create a more uniform, high-level interface.
        libcloud_network.destroy()

    @LibcloudExceptionHandler(mist.io.exceptions.SubnetDeletionError)
    def delete_subnet(self, subnet):
        """Deletes a subnet.

        Subclasses SHOULD NOT override or extend this method.

        If a subclass needs to override the way networks are deleted, it
        should override the private method `_delete_network` instead.
        """
        assert subnet.network.cloud == self.cloud

        libcloud_subnet = self._get_libcloud_subnet(subnet)
        self._delete_subnet(subnet, libcloud_subnet)

        subnet.delete()

    def _delete_subnet(self, subnet, libcloud_subnet):
        """Performs the libcloud call that handles subnet deletion.

        This method is meant to be called internally by `self.delete_subnet`.

        Unless naming conventions change or specialized parsing of the libcloud
        response is needed, subclasses SHOULD NOT need to override this method.

        Subclasses MAY override this method.
        """
        libcloud_subnet.destroy()

    def _get_libcloud_network(self, network):
        """Returns an instance of a libcloud network.

        This method receives a Network mongoengine object and queries libcloud
        for the corresponding network instance.

        Subclasses MAY override this method.
        """
        networks = self.ctl.compute.connection.ex_list_networks()
        for net in networks:
            if net.id == network.network_id:
                return net
        raise mist.io.exceptions.NetworkNotFoundError(
            'Network %s with network_id %s' %
            (network.name, network.network_id))

    def _get_libcloud_subnet(self, subnet):
        """Returns an instance of a libcloud subnet.

        This method receives a Subnet mongoengine object and queries libcloud
        for the corresponding subnet instance.

        Subclasses MAY override this method.
        """
        subnets = self.ctl.compute.connection.ex_list_subnets()
        for sub in subnets:
            if sub.id == subnet.subnet_id:
                return sub
        raise mist.io.exceptions.SubnetNotFoundError(
            'Subnet %s with subnet_id %s' % (subnet.name, subnet.subnet_id))
