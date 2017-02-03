""" Test Dns Functionality """

import os
import uuid
import json
from deepdiff import DeepDiff
from pprint import pprint

__zone_id__ = None

def unicode_to_str(data):
    if isinstance(data, dict):
        return {unicode_to_str(key): unicode_to_str(value)
                for key, value in data.iteritems()}
    elif isinstance(data, list):
        return [unicode_to_str(element) for element in data]
    elif isinstance(data, unicode):
        return data.encode('utf-8')
    else:
        return data


def diff(a, b, **kwargs):
    """Return a recursive diff of two objects after casting unicodes to str"""
    return DeepDiff(unicode_to_str(a), unicode_to_str(b), **kwargs)


def compare_fields(res):
    """Compare deep diff of objects, type of fields and values that changed"""
    pprint(res, indent=2)
    changes = res.get('type_changes')
    if changes:
        for key in changes:
            assert changes[key]['new_type'] == changes[key]['old_type']

    values_changed = res.get('values_changed')
    if values_changed:
        for k, v in values_changed.iteritems():
            if isinstance(v['new_value'], bool):
                assert v['new_value'] == v[
                    'old_value'], "new_value %s changed " \
                                  "to %s" % (k, v['new_value'])


def test_list_zones(cloud, load_staging_l_zones):
    """
    Testing listing DNS zones
    """
    response = cloud.ctl.dns.list_zones()
    print len(response)

    if response:
        if cloud.ctl.provider == "ec2":
            dnsprovider = "route53"
        elif cloud.ctl.provider == "gce":
            dnsprovider = "google"
        ref = load_staging_l_zones.get(dnsprovider)
        res = diff(ref, response, ignore_order=True)
        compare_fields(res)


def test_list_records(cloud, load_staging_l_records):
    """
    Testing listing DNS records
    """
    zones = cloud.ctl.dns.list_zones()
    print len(zones)

    if zones:
        for zone in zones:
            records = cloud.ctl.dns.list_records(zone['id'])
            print len(records)

            if records:
                if cloud.ctl.provider == "ec2":
                    dnsprovider = "route53"
                elif cloud.ctl.provider == "gce":
                    dnsprovider = "google"
                ref = load_staging_l_records.get(dnsprovider)
                res = diff(ref, records, ignore_order=True)
                compare_fields(res)


def test_create_zone(cloud):
    """
    Unit test for creating a new DNS zone.
    """
    global __zone_id__
    domain = "domain.com"
    type = 'master'
    ttl = 3600

    print "**** Create DNS zone with domain %s" % domain
    response = cloud.ctl.dns.create_zone(domain, type, ttl)
    print response

    if response:
        print "**** DNS zone created succesfully"
        __zone_id__ = response


def test_create_record(cloud):
    """
    Test function for creating a DNS record
    """
    global __record_id__
    name = "gogogo"
    type = "A"
    data = "1.2.3.4"
    ttl = 172800
    print "**** Create type %s DNS record with name %s" % (type, name)
    response = cloud.ctl.dns.create_record(__zone_id__,
                                           name, type, data, ttl)
    print response

    if response:
        print "**** DNS record created succesfully"
        __record_id__ = response.id


def test_delete_record(cloud):
    """
    Testing deleting a particular records from a DNS zone
    """

    response = cloud.ctl.dns.delete_record(__zone_id__, __record_id__)
    print response

    if response:
        print "**** Record deleted successfully"


def test_delete_zone(cloud):
    """
    Testing the deletion of a particular DNS zone
    """
    response = cloud.ctl.dns.delete_zone(__zone_id__)
    print response

    if response:
        print "DNS zone %s deleted successfully" % __zone_id__
