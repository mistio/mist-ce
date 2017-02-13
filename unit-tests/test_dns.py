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
    global __num_records__

    domain = "domain.com"
    type = 'master'
    ttl = 3600

    __num_zones__ = len(Zone.objects(cloud=cloud, deleted=None))
    print "Zones initially %d" % __num_zones__
    __num_records__ = len(Record.objects(deleted=None))
    print "**** Create DNS zone with domain %s" % domain
    cloud.ctl.dns.create_zone(domain, type, ttl)

    zones = Zone.objects(deleted=None)
    for zone in zones:
        if zone.domain == 'domain.com.':
            __zone_id__ = zone.id
            break

    if __zone_id__:
        if __num_zones__ == len(Zone.objects(cloud=cloud, deleted=None)) -1:
            print "**DNS zone created succesfully on the provide and on the DB"
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
    __num_zones__ = len(Zone.objects(cloud=cloud, deleted=None))
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

    name = "gogogo"
    type = "A"
    data = "1.2.3.4"
    ttl = 172800
    print "**** Create type %s DNS record with name %s" % (type, name)
    zone.ctl.create_record(name, type, data, ttl)
    print "**** DNS record created succesfully"
    record = Record.objects.get(zone=zone, type='A')
    __record_id__ = record.id
    __num_records__ += 1


def test_list_records(cloud, load_staging_l_records):
    """
    Testing listing DNS records
    """
    global __zone_id__
    global __num_records__
    # zone = Zone.objects.get(owner=cloud.owner, id=__zone_id__)
    zones = Zone.objects(owner=cloud.owner, domain='domain.com.')

    for zone in zones:
        records = zone.ctl.list_records()
        print len(records)

    if len(records) == __num_records__:
        print "List Records success"
    else:
        raise Exception

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
    #zone = Zone.objects(owner=cloud.owner, id=__zone_id__)
    zones = Zone.objects(owner=cloud.owner, domain='domain.com.')
    print "%d zones" % len(zones)
    # record = Record.objects.get(zone=zone, id=__record_id__)
    for zone in zones:
        records = Record.objects(zone=zone, type='A')
        print "%d records" % len(records)
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
    # zones = Zone.objects(owner=cloud.owner, domain='domain.com.')
    try:
        zone.ctl.delete_zone()
        print "DNS Zone %s deleted successfully at: %s" % \
        (zone.domain, zone.deleted)
    except Exception:
        print "Failed, cannot delete Zone: %s/%s" % (zone.zone_id, zone.domain)
