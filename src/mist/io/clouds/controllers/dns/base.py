"""Definition of `BaseDNSController`

The `BaseDNSController` is a sub-controller, which is set as an attribute to a
`BaseController` class. The `BaseDNSController` is responsible for interacting
with libcloud's DNS API.

"""
import re
import ssl
import logging

from mist.io.clouds.controllers.base import BaseController

from libcloud.common.types import InvalidCredsError
from libcloud.dns.types import ZoneDoesNotExistError, RecordDoesNotExistError

from mist.io.exceptions import CloudUnavailableError
from mist.io.exceptions import CloudUnauthorizedError
from mist.io.exceptions import ZoneNotFoundError
from mist.io.exceptions import RecordNotFoundError

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
        zones = self._list_zones__fetch_zones()

        # Format zone information.
        return [{'id': zone.id,
                 'domain': zone.domain,
                 'type': zone.type,
                 'ttl': zone.ttl,
                 'extra': zone.extra} for zone in zones]

    def _list_zones__fetch_zones(self):
        """
        Returns a list of available DNS zones for the cloud.
        This should not be overriden as the implementation is the same across
        all implemented DNS providers.

        """
        # Try to get the list of DNS zones from provider API.
        try:
            zones = self.connection.list_zones()
            log.info("List zones returned %d results for %s.",
                     len(zones), self.cloud)
            return zones
        except InvalidCredsError as exc:
            log.warning("Invalid creds on running list_zones on %s: %s",
                        self.cloud, exc)
            raise CloudUnauthorizedError()
        except ssl.SSLError as exc:
            log.error("SSLError on running list_zones on %s: %s",
                      self.cloud, exc)
            raise CloudUnavailableError(exc=exc)
        except Exception as exc:
            log.exception("Error while running list_zones on %s", self.cloud)
            raise CloudUnavailableError(exc=exc)

    def list_records(self, zone_id):
        """
        Public method to return a list of  records under a specific zone.
        """
        # Fetch zones, usually from libcloud connection.
        records = self._list_records__fetch_records(zone_id)

        # Format zone information.
        return [{'id': record.id,
                 'name': record.name,
                 'type': record.type,
                 'data': record.data,
                 'ttl': record.ttl,
                 'extra': record.extra} for record in records]

    def _list_records__fetch_records(self, zone_id):
        """
        Returns all available records on a specific zone.

        """
        # Try to get the list of DNS records under a specific zone from
        # the provider API.
        # We cannot call list_records() with the zone_id, we need to provide
        # a zone object. We will get that by calling the get_zone() method.
        try:
            records = self.connection.get_zone(zone_id).list_records()
            log.info("List records returned %d results for %s.",
                     len(records), self.cloud)
            return records
        except InvalidCredsError as exc:
            log.warning("Invalid creds on running list_zones on %s: %s",
                        self.cloud, exc)
            raise CloudUnauthorizedError()
        except ssl.SSLError as exc:
            log.error("SSLError on running list_zones on %s: %s",
                      self.cloud, exc)
            raise CloudUnavailableError(exc=exc)
        except ZoneDoesNotExistError as exc:
            log.warning("No zone found for %s in: %s ", zone_id, self.cloud)
            raise ZoneNotFoundError(exc=exc)
        except Exception as exc:
            log.exception("Error while running list_zones on %s", self.cloud)
            raise CloudUnavailableError(exc=exc)

    def delete_record(self, zone_id, record_id):
        """
        Public method to be called with a zone and record ids to delete the
        specific record under the specified zone.
        """
        return self._delete_record__from_id(zone_id, record_id)

    def _delete_record__from_id(self, zone_id, record_id):
        """
        We use the zone and record ids to delete the specific record under the
        specified zone.
        """
        try:
            self.connection.get_record(zone_id, record_id).delete()
        except ZoneDoesNotExistError as exc:
            log.warning("No zone found for %s in: %s ", zone_id, self.cloud)
            raise ZoneNotFoundError(exc=exc)
        except RecordDoesNotExistError:
            log.warning("No record found for id: %s under zone %s",
                        record_id, zone_id)
            raise RecordNotFoundError(exc=exc)
        except Exception as exc:
            log.exception("Error while running create_record on %s", self.cloud)
            raise CloudUnavailableError(exc=exc)

    def delete_zone(self, zone_id):
        """
        Public method called to delete the specific zone for the provided id.
        """
        return self._delete_zone__for_cloud(zone_id)

    def _delete_zone__for_cloud(self, zone_id):
        """
        We use the zone id to retrieve and delete it for this cloud.
        """
        try:
            self.connection.get_zone(zone_id).delete()
        except ZoneDoesNotExistError as exc:
            log.warning("No zone found for %s in: %s ", zone_id, self.cloud)
            raise ZoneNotFoundError(exc=exc)
        except Exception as exc:
            log.exception("Error while running create_record on %s", self.cloud)
            raise CloudUnavailableError(exc=exc)

    def create_zone(self, domain, type='master', ttl=None, extra=None):
        """
        This is the public method that is called to create a new DNS zone.
        """
        return self._create_zone__for_cloud(domain, type, ttl, extra)

    def _create_zone__for_cloud(self, domain, type, ttl, extra):
        """
        This is the private method called to create a record under a specific
        zone. The underlying functionality is implement in the same way for
        all available providers so there shouldn't be any reason to override
        this.
        ----
        """
        if not re.match(".*\.$", domain):
            domain += "."
        try:
            zone = self.connection.create_zone(domain, type='master',
                                               ttl=None, extra=None)
            log.info("Zone %s created successfully for %s.",
                     zone.domain, self.cloud)
            return zone.id
        except InvalidCredsError as exc:
            log.warning("Invalid creds on running create_record on %s: %s",
                        self.cloud, exc)
            raise CloudUnauthorizedError()
        except ssl.SSLError as exc:
            log.error("SSLError on running create_record on %s: %s",
                      self.cloud, exc)
            raise CloudUnavailableError(exc=exc)
        except Exception as exc:
            log.exception("Error while running create_record on %s", self.cloud)
            raise CloudUnavailableError(exc=exc)

    def create_record(self, zone_id, name, type, data, ttl):
        """
        This is the public method that is called to create a new DNS record
        under a specific zone.
        """
        return self._create_record__for_zone(zone_id, name, type, data, ttl)

    def _create_record__for_zone(self, zone_id, name, type, data, ttl):
        """
        This is the private method called to create a record under a specific
        zone. The underlying functionality is implement in the same way for
        all available providers so there shouldn't be any reason to override
        this.
        ----
        """
        if not re.match(".*\.$", name):
            name += "."
        data, extra = self._create_record__prepare_args(data, ttl)
        try:
            zone = self.connection.get_zone(zone_id)
            record = zone.create_record(name, type, data, extra)
            log.info("Type %s record created successfully for %s.",
                     record.type, self.cloud)
            return record
        except InvalidCredsError as exc:
            log.warning("Invalid creds on running create_record on %s: %s",
                        self.cloud, exc)
            raise CloudUnauthorizedError()
        except ssl.SSLError as exc:
            log.error("SSLError on running create_record on %s: %s",
                      self.cloud, exc)
            raise CloudUnavailableError(exc=exc)
        except ZoneDoesNotExistError as exc:
            log.warning("No zone found for %s in: %s ", zone_id, self.cloud)
            raise ZoneNotFoundError(exc=exc)
        except Exception as exc:
            log.exception("Error while running create_record on %s", self.cloud)
            raise CloudUnavailableError(exc=exc)

    def _create_record__prepare_args(self, data, ttl):
        """
        This is a private
        ---
        """
        raise NotImplementedError()
