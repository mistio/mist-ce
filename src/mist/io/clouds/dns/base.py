"""Definition of `DNSController`

The `DNSController` is a sub-controller, which is set as an attribute to a
`BaseController` class. The `DNSController` is responsible for interacting
with libcloud's DNS API.

"""

from mist.io import config

from mist.io.exceptions import MistError
from mist.io.exceptions import ConflictError
from mist.io.exceptions import ForbiddenError
from mist.io.exceptions import BadRequestError
from mist.io.exceptions import InternalServerError
from mist.io.exceptions import MachineNotFoundError
from mist.io.exceptions import CloudUnavailableError
from mist.io.exceptions import CloudUnauthorizedError

from mist.io.clouds.main.base import BaseController

from libcloud.dns.types import Provider as DnsProvider
from libcloud.dns.types import RecordType
from libcloud.dns.types import ZoneDoesNotExistError

import logging

log = logging.getLogger(__name__)


class DNSController(object):
    """Base class to be inherited by every clouds that supports a DNS
    sub-controller.

    This base controller factors out all the basic steps common to all or
    most clouds into a base class, and defines an interface for provider or
    technology specific cloud controllers.

    Subclasses are meant to extend or override methods of this base class to
    account for differencies between different cloud types.

    Care should be taken when considering to add new methods to a subclass.
    All controllers should have the same interface, to the degree this is
    feasible. That is to say, don't add a new method to a subclass unless
    there is a very good reason to do so.

    The following convention is followed:

    Any methods and attributes that don't start with an underscore are the
    controller's public API.

    In the `DNSController`, these public methods will in most cases contain
    a basic implementation that works for most clouds, along with the proper
    logging and error handling. In almost all cases, subclasses SHOULD NOT
    override or extend the public methods of `BaseController`. To account for
    cloud/subclass specific behaviour, one is expected to override the
    internal/private methods of `DNSController`.

    Any methods and attributes that start with an underscore are the
    controller's internal/private API.

    To account for cloud/subclass specific behaviour, the public methods of
    `DNSController` call a number of private methods. These methods will
    always start with an underscore, such as `_list_machines__machine_actions`.
    When an internal method is only ever used in the process of one public
    method, it is prefixed as such to make identification and purpose more
    obvious. For example, method `self._list_machines__postparse_machine` is
    called in order to apply any special post-processing to the fields of a
    node returned by `self.list_machines`.

    This `DNSController` defines a strict interface to controlling clouds.
    For each different cloud type, a subclass needs to be defined. Each
    subclass MUST receive its main controller as its sole init argument

    """

    def __init__(self, main_controller=None):
        """Initialize a cloud's DNS sub-controller given a main controller

        Most times one is expected to access a sub-controller from inside the
        cloud, like this:

            cloud = mist.io.clouds.models.Cloud.objects.get(id=cloud_id)
            print cloud.ctl.dns.list_zones()

        Subclasses SHOULD NOT override this method.

        If a subclass has to initialize a certain instance attribute, it SHOULD
        extend this method instead.

        """
        if not main_controller or not isinstance(main_controller,
                                                 BaseController):
            raise TypeError(
                "Can't initialize %s. "
                "All subcontrollers should inherit a main controller "
                "pointing to a subclass of `BaseController`." % self
            )

        self.ctl = main_controller

    def list_zones(self):
        """
        This is the public method to call when requesting all the DNS zones
        under a specific cloud.
        """

        # Fetch zones, usually from libcloud connection.
        zones = self._list_zones()

        # Format zone information.
        return [{'id': zone.id,
                 'domain': zone.domain,
                 'type': zone.type,
                 'ttl': zone.ttl,
                 'extra': zone.extra,
                 'provider': self.ctl.dns_provider} for zone in zones]


    def _list_zones(self):
        """
        Returns a list of available DNS zones for the cloud.
        This should not be overriden

        """

        # TODO: I think this should be wrapped in try .. except
        # Need to check which exceptions can be raised by list_zones()
        return self.ctl.dns_connection.list_zones()


    def list_records(self,zone_id):
        """

        """

        # Fetch zones, usually from libcloud connection.
        records = self._list_records(zone_id)

        # Format zone information.
        return [{'id': record.id,
                 'name': record.name,
                 'type': record.type,
                 'data': record.data,
                 'zone': record.zone,
                 'ttl': record.ttl,
                 'extra': record.extra,
                 'provider': self.ctl.dns_provider} for record in records]


    def _list_records(self, zone_id):
        """
        Returns all available records on a specific zone.

        """

        # We cannot call list_records() with the zone_id, we need to provide
        # a zone object. We will get that by calling the get_zone() method.
        try:
            zone = self.ctl.dns_connection.get_zone(zone_id)
        except ZoneDoesNotExistError:
            log.warning("No zone found with id: " + zone_id +
                " under the " + self.ctl.dns_provider + " DNS provider")
            return []
        else:
            # TODO: This should be wrapped in try .. except
            # Need to check which exceptions can be raised by list_zones()
            return self.ctl.dns_connection.list_records(zone)
