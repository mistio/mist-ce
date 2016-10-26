"""Tests Cloud models and Controllers"""

import os
import uuid
import json
from deepdiff import DeepDiff
from pprint import pprint


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


def test_list_machines(cloud, load_staging_l_machines):

    response = cloud.ctl.compute.list_machines()
    print len(response)

    if response:
        machine = response[0].as_dict_old()
        ref = load_staging_l_machines.get(cloud.ctl.provider)
        for t in machine, ref:
            # Remove keys from extra.
            for key in ('billingItemChildren', 'hoursUsed', 'recurringFee'):
                if key in t['extra']:
                    t['extra'].pop(key)

        # Ignore value changes in some fields.
        for key in ('uuid', 'last_seen'):
            if type(machine[key]) == type(ref[key]) or (
                isinstance(machine[key], basestring) and
                isinstance(ref[key], basestring)
            ):
                machine[key] = ref[key]

        res = diff(ref, machine)
        compare_fields(res)


def test_list_locations(cloud, load_staging_l_locations):

    response = cloud.ctl.compute.list_locations()
    print len(response)

    if response:
        ref = load_staging_l_locations.get(cloud.ctl.provider)
        res = diff(ref, response, ignore_order=True)
        compare_fields(res)


def test_list_images(cloud, load_staging_l_images):

    response = cloud.ctl.compute.list_images()
    print len(response)

    if response:
        ref = load_staging_l_images.get(cloud.ctl.provider)
        res = diff(ref, response, ignore_order=True)
        compare_fields(res)


def test_list_sizes(cloud, load_staging_l_sizes):

    response = cloud.ctl.compute.list_sizes()
    print len(response)

    if response:
        ref = load_staging_l_sizes.get(cloud.ctl.provider)
        res = diff(ref, response, ignore_order=True)
        compare_fields(res)
