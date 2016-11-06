"""Definition of `BaseDNSController`

The `BaseDNSController` is a sub-controller, which is set as an attribute to a
`BaseController` class. The `BaseDNSController` is responsible for interacting
with libcloud's DNS API.

"""

from mist.io import config

from mist.io.clouds.controllers.base import BaseController

from libcloud.dns.types import RecordType
from libcloud.dns.types import ZoneDoesNotExistError

import logging

log = logging.getLogger(__name__)


class BaseDNSController(BaseController):
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

    In the `BaseDNSController`, these public methods will in most cases contain
    a basic implementation that works for most clouds, along with the proper
    logging and error handling. In almost all cases, subclasses SHOULD NOT
    override or extend the public methods of `BaseController`. To account for
    cloud/subclass specific behaviour, one is expected to override the
    internal/private methods of `BaseDNSController`.

    Any methods and attributes that start with an underscore are the
    controller's internal/private API.

    To account for cloud/subclass specific behaviour, the public methods of
    `BaseDNSController` call a number of private methods. These methods will
    always start with an underscore, such as `_list_zones`.

    This `BaseDNSController` defines a strict interface to controlling clouds 
    that allow for DNS specific actions.
    For each different cloud type, a subclass needs to be defined. Each
    subclass MUST receive its main controller as its sole init argument

    """

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
                 'provider': self.ctl.dnsprovider} for zone in zones]


    def _list_zones(self):
        """
        Returns a list of available DNS zones for the cloud.
        This should not be overriden

        """

        # TODO: I think this should be wrapped in try .. except
        # Need to check which exceptions can be raised by list_zones()
        return self.connection.list_zones()


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
                 'ttl': record.ttl,
                 'extra': record.extra,
                 'provider': self.ctl.dnsprovider} for record in records]


    def _list_records(self, zone_id):
        """
        Returns all available records on a specific zone.

        """

        # We cannot call list_records() with the zone_id, we need to provide
        # a zone object. We will get that by calling the get_zone() method.
        try:
            zone = self.connection.get_zone(zone_id)
        except ZoneDoesNotExistError:
            log.warning("No zone found for id: " + zone_id +
                " under the " + self.ctl.dnsprovider + " DNS provider")
            return []
        else:
            # TODO: This should be wrapped in try .. except
            # Need to check which exceptions can be raised by list_records()
            return self.connection.list_records(zone)

    def delete_record(self,zone_id,record_id):
        """

        """
        return self._delete_record(zone_id,record_id)

    def _delete_record(self,zone_id,record_id):
        """
        We use the zone and record ids to delete the specific record under the
        specified zone.
        """
        try:
            record = self.connection.get_record(zone_id,record_id)
        except ZoneDoesNotExistError:
            log.warning("No zone found for id: " + zone_id +
                " under the " + self.ctl.dnsprovider + " DNS provider")
            return []
        except RecordDoesNotExistError:
            log.warning("No record found for id: " + record_id +
                " under zone_id: " + zone_id )
            return []
        else:
            return self.connection.delete_record(record)


    