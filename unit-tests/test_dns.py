""" Test Dns Functionality """

import os
import uuid
import json
from deepdiff import DeepDiff
from pprint import pprint

from mist.io.dns.models import Zone, Record

__zone_id__ = None
__record_id__ = None
__num_zones__ = None
__num_records__ = None

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


def test_create_zone(cloud):
    """
    Unit test for creating a new DNS zone.
    """
    global __zone_id__
    global __num_zones__

    kwargs = {}
    kwargs['domain'] = 'domain.com'
    kwargs['type'] = 'master'
    kwargs['ttl'] = 172800
    kwargs['extra'] = {}

    __num_zones__ = len(Zone.objects(cloud=cloud))
    print "Zones initially %d" % __num_zones__
    print "**** Create DNS zone with domain %s" % kwargs['domain']
    Zone.add(owner=cloud.owner, cloud=cloud, id='', **kwargs)

    zones = Zone.objects()
    for zone in zones:
        if zone.domain == 'domain.com.':
            __zone_id__ = zone.id
            break

    if __zone_id__:
        if __num_zones__ == len(Zone.objects(cloud=cloud)) -1:
            print "**DNS zone created succesfully on the provider and the DB"
            __num_zones__ += 1
            print "__num_zones__: %d" % __num_zones__
        else:
            raise Exception


def test_list_zones(cloud, load_staging_l_zones):
    """
    Testing listing DNS zones
    """

    global __zone_id__
    global __num_zones__

    response = cloud.ctl.dns.list_zones()
    __num_zones__ = len(Zone.objects(cloud=cloud))
    print "Num zones response: %d" % len(response)
    if len(response) == __num_zones__:
        print "Success, we have %d zones" % len(response)
    else:
        raise Exception

    # if response:
    #     if cloud.ctl.provider == "ec2":
    #         dnsprovider = "route53"
    #     elif cloud.ctl.provider == "gce":
    #         dnsprovider = "google"
    #     ref = load_staging_l_zones.get(dnsprovider)
    #     res = diff(ref, response, ignore_order=True)
    #     compare_fields(res)


def test_create_record(cloud):
    """
    Test function for creating a DNS record
    """

    global __zone_id__
    global __record_id__
    global __num_records__
    zone = Zone.objects.get(owner=cloud.owner, id=__zone_id__)

    kwargs = {}
    kwargs['name'] = 'blog.test.io'
    kwargs['type'] = 'A'
    kwargs['data'] = '1.2.3.4'
    kwargs['ttl'] = 172800

    print "**** Create type %s DNS record with name %s" % \
        (kwargs['type'], kwargs['name'])
    record = Record.add(owner=cloud.owner, **kwargs)
    print "**** DNS record created succesfully"
    __record_id__ = record.id
    __num_records__ = 1
    print "Num records %d" % __num_records__


def test_list_records(cloud, load_staging_l_records):
    """
    Testing listing DNS records
    """
    global __zone_id__
    global __num_records__
    # zone = Zone.objects.get(owner=cloud.owner, id=__zone_id__)

    # records = zone.ctl.list_records()
    # print len(records)

    # if len(records) == __num_records__ + 2:
    #     print "List Records success"
    # else:
    #     raise Exception

    zones = Zone.objects(owner=cloud.owner)
    for zone in zones:
        records = zone.ctl.list_records()
        for record in records:
            print record.as_dict()

        # if cloud.ctl.provider == "ec2":
        #     dnsprovider = "route53"
        # elif cloud.ctl.provider == "gce":
        #     dnsprovider = "google"
        # ref = load_staging_l_records.get(dnsprovider)
        # res = diff(ref, records, ignore_order=True)
        # compare_fields(res)


def test_delete_record(cloud):
    """
    Testing deleting a particular records from a DNS zone
    """
    global __zone_id__
    global __record_id__
    # zone = Zone.objects.get(owner=cloud.owner, id=__zone_id__)
    # record = Record.objects.get(id=__record_id__)
    # try:
    #     record.ctl.delete_record()
    # except Exception:
    #     print "can't delete record: %s" % record.record_id
    # print "**** Record deleted successfully"

    zones = Zone.objects(owner=cloud.owner)
    print "We got %d zones" % len(zones)
    for zone in zones:
        records = Record.objects(zone=zone, type='A')
        for record in records:
            try:
                record.ctl.delete_record()
            except Exception:
                print "can't delete record: %s" % record.record_id
            print "**** Record deleted successfully"


def test_delete_zone(cloud):
    """
    Testing the deletion of a particular DNS zone
    """
    global __zone_id__
    zone = Zone.objects.get(owner=cloud.owner, id=__zone_id__)
    try:
        zone.ctl.delete_zone()
        print "*** DNS Zone %s deleted successfully" % zone.domain
    except Exception:
        print "Failed, cannot delete Zone: %s/%s" % (zone.zone_id, zone.domain)

    # zones = Zone.objects(owner=cloud.owner, domain='domain.com.')
    # for zone in zones:
    #     try:
    #         zone.ctl.delete_zone()
    #         print "DNS Zone %s deleted successfully" % \
    #         (zone.domain)
    #     except Exception as exc:
    #         print "Failed, cannot delete Zone: %s/%s because %s" % \
    #             (zone.zone_id, zone.domain, exc)
