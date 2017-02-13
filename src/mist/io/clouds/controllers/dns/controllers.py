"""Cloud DNS Sub-Controllers

A cloud's DNS sub-controller handles all calls to libcloud's DNS API by
subclassing and extending the `BaseDNSController`.

Most often for each different cloud type, there is a corresponding DNS
controller defined here. All the different classes inherit `BaseDBSController`
and share a commmon interface, with the exception that some controllers may
not have implemented all methods. It is also possible that certain cloud types
do not possess their own DNS controller, but rather utilize the base
`BaseDNSController`.

A DNS controller is initialized given a cloud's main controller, which is
derived from `BaseController`. That way, all sub-controllers of a given cloud
will be interconnected at the main controller's level.

Most of the time a sub-controller will be accessed through a cloud's main
controller, using the `ctl` abbreviation, like this:

    cloud = mist.io.clouds.models.Cloud.objects.get(id=cloud_id)
    print cloud.ctl.dns.list_zones()

"""

import re
import logging

from libcloud.dns.types import Provider
from libcloud.dns.providers import get_driver

from mist.io.clouds.controllers.dns.base import BaseDNSController

log = logging.getLogger(__name__)


class AmazonDNSController(BaseDNSController):
    """
    Amazon Route53 specific overrides.
    """

    def _connect(self):
        return get_driver(Provider.ROUTE53)(self.cloud.apikey,
                                            self.cloud.apisecret)

    def _create_record__prepare_args(self, zone, name, data, ttl):
        """
        This is a private
        ---
        """
        extra = {'ttl': ttl}
        return name, data, extra

    def _list__records_postparse_data(self, node, record):
        """Get the provider specific information into the Mongo model"""
        if node.data not in record['rdata']:
            record['rdata'].append(node.data)
        record['data'] = {'rrdata': record['rdata']}
        record['extra'] = node.extra

class GoogleDNSController(BaseDNSController):
    """
    Google DNS provider specific overrides.
    """
    def _connect(self):
        return get_driver(Provider.GOOGLE)(self.cloud.email,
                                           self.cloud.private_key,
                                           project=self.cloud.project_id)

    def _create_record__prepare_args(self, zone, name, data, ttl):
        """
        This is a private
        ---
        """
        if not re.match(".*\.$", name):
            name += "."
        name += zone.domain
        extra = None
        record_data = {'ttl': ttl, 'rrdatas': []}
        record_data['rrdatas'].append(data)
        return name, record_data, extra

    def _list__records_postparse_data(self, node, record):
        """Get the provider specific information into the Mongo model"""
        record['rdata'] = node.data['rrdatas']
        record['data'] = node.data
        record['extra'] = node.extra
