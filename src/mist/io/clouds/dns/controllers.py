"""Cloud DNS Sub-Controllers

A cloud's DNS sub-controller handles all calls to libcloud's DNS API by
subclassing and extending the `ComputeController`.

Most often for each different cloud type, there is a corresponding DNS
controller defined here. All the different classes inherit `ComputeController`
and share a commmon interface, with the exception that some controllers may
not have implemented all methods. It is also possible that certain cloud types
do not possess their own DNS controller, but rather utilize the base
`DNSController`.

A DNS controller is initialized given a cloud's main controller, which is
derived from `BaseController`. That way, all sub-controllers of a given cloud
will be interconnected at the main controller's level.

Most of the time a sub-controller will be accessed through a cloud's main
controller, using the `ctl` abbreviation, like this:

    cloud = mist.io.clouds.models.Cloud.objects.get(id=cloud_id)
    print cloud.ctl.DNS.enable()

"""

import logging

from mist.io.clouds.dns.base import DNSController

from libcloud.dns.types import Provider as DnsProvider
from libcloud.dns.types import RecordType
from libcloud.dns.types import ZoneDoesNotExistError

log = logging.getLogger(__name__)

class AmazonDNSController(DNSController):

    def __init__(self, main_controller):
        """

        """
        super(AmazonDNSController, self).__init__(main_controller)
        self.provider = DnsProvider.ROUTE53

    def list_zones(self):
        """

        """
        all_zones = []
        # TODO: I think this should be wrapped in try .. except
        # Need to check which exceptions can be raised by list_zones()
        zones = self.ctl.dns_connection.list_zones()
        for zone in zones:
            zone_details = {}
            for attr, value in zone.__dict__.iteritems():
                if attr != "driver":
                    zone_details[attr] = value
            zone_details["provider"] = self.provider
            all_zones.append(zone_details)
        return all_zones

    def list_records(self, zone_id):
        """

        """
        all_records = []

        # We cannot call list_records() with the zone_id, we need to provide
        # a zone object. We will get that by calling the get_zone() method.
        try:
            zone = self.ctl.dns_connection.get_zone(zone_id)
        except ZoneDoesNotExistError:
            log.warning("No zone found with id: " + zone_id +
                " under the " + self.provider + " DNS provider")
        else:
            # TODO: This should be wrapped in try .. except
            # Need to check which exceptions can be raised by list_zones()
            records = self.ctl.dns_connection.list_records(zone)
            for record in records:
                record_details = {}
                for attr, value in record.__dict__.iteritems():
                    if attr != "driver":
                        record_details[attr] = value
                record_details["provider"] = self.provider
                all_records.append(record_details)

        return all_records





class GoogleDNSController(DNSController):

    def __init__(self, main_controller):
        """

        """
        super(GoogleDNSController, self).__init__(main_controller)
        self.provider = DnsProvider.GOOGLE

    def list_zones(self):
        """

        """
        provider = DnsProvider.GOOGLE
        all_zones = []
        # TODO: I think this should be wrapped in try .. except
        # Need to check which exceptions can be raised by list_zones()
        zones = self.ctl.dns_connection.list_zones()
        for zone in zones:
            zone_details = {}
            for attr, value in zone.__dict__.iteritems():
                if attr != "driver":
                    zone_details[attr] = value
            zone_details["provider"] = provider
            all_zones.append(zone_details)
        return all_zones

    def list_records(self, zone_id):
        """

        """
        all_records = []

        # We cannot call list_records() with the zone_id, we need to provide
        # a zone object. We will get that by calling the get_zone() method.
        try:
            zone = self.ctl.dns_connection.get_zone(zone_id)
        except ZoneDoesNotExistError:
            log.warning("No zone found with id: " + zone_id +
                " under the " + self.provider + " DNS provider")
        else:
            # TODO: This should be wrapped in try .. except
            # Need to check which exceptions can be raised by list_zones()
            records = self.ctl.dns_connection.list_records(zone)
            for record in records:
                record_details = {}
                for attr, value in record.__dict__.iteritems():
                    if attr != "driver":
                        record_details[attr] = value
                record_details["provider"] = self.provider
                all_records.append(record_details)

        return all_records
