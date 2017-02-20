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

    def _create_record__prepare_args(self, zone, kwargs):
        """
        This is a private method to transform the arguments to the provider
        specific form.
        ---
        """
        # Route53 requires just the subdomain for A, AAAA, and CNAME records.
        if (kwargs['type'] in ['A', 'AAAA', 'CNAME'] and
                kwargs['name'].endswith(zone.domain)):
            kwargs['name'] = kwargs['name'][:-len(zone.domain)]
        kwargs['extra'] = {'ttl': kwargs.pop('ttl', 0)}

    def _list_records__postparse_data(self, pr_record, record):
        """Get the provider specific information into the Mongo model"""
        if pr_record.data not in record.rdata:
            record.rdata.append(pr_record.data)


class GoogleDNSController(BaseDNSController):
    """
    Google DNS provider specific overrides.
    """
    def _connect(self):
        return get_driver(Provider.GOOGLE)(self.cloud.email,
                                           self.cloud.private_key,
                                           project=self.cloud.project_id)

    def _create_record__prepare_args(self, zone, kwargs):
        """
        This is a private method to transform the arguments to the provider
        specific form.
        ---
        """
        # Google requires the full subdomain+domain for A, AAAA, and CNAME
        # records with a trailing dot.
        if (kwargs['type'] in ['A', 'AAAA', 'CNAME'] and
                not kwargs['name'].endswith('.')):
            kwargs['name'] += "."

        data = kwargs.pop('data', '')
        kwargs['data'] = {'ttl': kwargs.pop('ttl', 0), 'rrdatas': []}
        kwargs['data']['rrdatas'].append(data)

    def _list_records__postparse_data(self, pr_record, record):
        """Get the provider specific information into the Mongo model"""
        record.rdata = pr_record.data['rrdatas']
