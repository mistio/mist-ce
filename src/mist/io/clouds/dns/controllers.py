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

from mist.io.clouds.dns.base import DNSController

from libcloud.dns.types import Provider as DnsProvider
from libcloud.dns.types import RecordType

class AmazonDNSController(DNSController):

    def list_zones(self):
        """

        """
        provider = DnsProvider.GOOGLE
        all_zones = {}
        all_zones[provider] = {}
        zones = self.ctl.dns_connection.list_zones()
        for zone in zones:
            #records[provider]['zones'].append(zone.id)
            all_zones[provider][zone.id] = {}
            all_zones[provider][zone.id]["domain"] = zone.domain
            all_zones[provider][zone.id]["type"] = zone.type
            all_zones[provider][zone.id]["ttl"] = zone.ttl
            all_zones[provider][zone.id]["extra"] = zone.extra
        return all_zones


class GoogleDNSController(DNSController):

    def list_zones(self):
        """

        """
        provider = DnsProvider.GOOGLE
        all_zones = {}
        all_zones[provider] = {}
        zones = self.ctl.dns_connection.list_zones()
        for zone in zones:
            #records[provider]['zones'].append(zone.id)
            all_zones[provider][zone.id] = {}
            all_zones[provider][zone.id]["domain"] = zone.domain
            all_zones[provider][zone.id]["type"] = zone.type
            all_zones[provider][zone.id]["ttl"] = zone.ttl
            all_zones[provider][zone.id]["extra"] = zone.extra
        return all_zones

