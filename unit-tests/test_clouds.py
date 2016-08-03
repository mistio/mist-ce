"""Tests Cloud models and Controllers"""

import os
import json

import yaml

import pytest
from deepdiff import DeepDiff
from pprint import pprint

import mist.io.clouds.models as models


@pytest.fixture
def load_staging_l_machines():
    with open('/mist.core/src/mist.io/unit-tests/list_machines.json') as data_f:
        data = json.load(data_f)
        data_f.close()
    return data


@pytest.fixture
def load_staging_l_locations():
    with open('/mist.core/src/mist.io/unit-tests/list_locations.json') as data_f:
        data = json.load(data_f)
        data_f.close()
    return data


@pytest.fixture
def load_staging_l_sizes():
    with open('/mist.core/src/mist.io/unit-tests/list_sizes.json') as data_f:
        data = json.load(data_f)
        data_f.close()
    return data


@pytest.fixture
def load_staging_l_images():
    with open('/mist.core/src/mist.io/unit-tests/list_images.json') as data_f:
        data = json.load(data_f)
        data_f.close()
    return data


def load_clouds_from_config():
    """Load clouds configuration from unit-tests/clouds.yaml"""

    path = os.path.join(os.path.dirname(os.path.realpath(__file__)),
                        'clouds.yaml')
    clouds = []
    print "Loading clouds from %s." % path
    with open(path) as fobj:
        settings = yaml.load(fobj)
    for cdict in settings:
        if not isinstance(cdict, dict):
            raise Exception("Cloud configuration is not a dict: %r" % cdict)
        if 'model' not in cdict:
            raise Exception("Cloud configuration doesn't specify "
                            "cloud: %s" % cdict)
        model = cdict.pop('model')
        if not (model.endswith('Cloud') and hasattr(models, model)):
            raise Exception("Invalid cloud model: %s" % model)
        clouds.append(getattr(models, model)(**cdict))
    return clouds


def iter_clouds(test_func):
    """Iterate test function over CLOUDS"""
    return pytest.mark.parametrize(
        'cloud', load_clouds_from_config(),
        ids=lambda cloud: cloud.__class__.__name__
    )(test_func)


def compare_fields(res):
    """compare result of DeepDiff, type of fields and values that changed"""
    type_changes = res.get('type_changes')
    if type_changes:    # res['type_changes']
        for k, v in type_changes.iteritems():
            if v['new_type'] == type('str'):
                assert isinstance(v['new_type'], basestring) == \
                       isinstance(v['old_type'], basestring)
            else:
                assert v['new_type'] == v['old_type'], "key is: %s" %k

    values_changed = res.get('values_changed')
    if values_changed:
        for k, v in values_changed.iteritems():
            if isinstance(v['new_value'], bool):
                assert v['new_value'] == v[
                    'old_value'], "new_value %s changed " \
                                  "to %s" % (k, v['new_value'])


@iter_clouds
def test_list_machines(cloud, load_staging_l_machines):

    print len(cloud.ctl.list_machines())
    response = cloud.ctl.list_machines()

    if response:
        machine = response[0]

        if cloud._cls == 'Cloud.AmazonCloud':
            res = DeepDiff(load_staging_l_machines.get('AmazonCloud'), machine)
            # pprint (res, indent=2)
            compare_fields(res)

        elif cloud._cls == "Cloud.PacketCloud":
            res = DeepDiff(load_staging_l_machines.get('PacketCloud'), machine)
            # pprint(res, indent=2)
            compare_fields(res)
        elif cloud._cls == "Cloud.DigitalOceanCloud":
            res = DeepDiff(load_staging_l_machines.get('DigitalOceanCloud'),
                           machine)
            # pprint(res, indent=2)
            compare_fields(res)
        elif cloud._cls == "SoftLayerCloud":
            res = DeepDiff(load_staging_l_machines.get('SoftLayerCloud'),
                           machine)
            # pprint(res, indent=2)
            compare_fields(res)
        elif cloud._cls == "Cloud.RackSpaceCloud":
            res = DeepDiff(load_staging_l_machines.get('RackSpaceCloud'),
                           machine)
            # pprint(res, indent=2)
            compare_fields(res)
        elif cloud._cls == "Cloud.LinodeCloud":
            res = DeepDiff(load_staging_l_machines.get('LinodeCloud'),
                           machine)
            # pprint(res, indent=2)
            compare_fields(res)
        elif cloud._cls == "Cloud.NephoScaleCloud":
            res = DeepDiff(load_staging_l_machines.get('NephoScaleCloud'),
                           machine)
            # pprint(res, indent=2)
            compare_fields(res)


@iter_clouds
def test_list_locations(cloud, load_staging_l_locations):
    print len(cloud.ctl.list_locations())
    response = cloud.ctl.list_locations()

    if response:
        if cloud._cls == 'Cloud.AmazonCloud':
            list_loc = load_staging_l_locations.get('AmazonCloud')
            for d in response:
                for dd in list_loc:
                    res = DeepDiff(dd, d)
                    # pprint (res, indent=2)
                    compare_fields(res)
        elif cloud._cls == "Cloud.PacketCloud":
            list_loc = load_staging_l_locations.get('PacketCloud')
            for d in response:
                for dd in list_loc:
                    res = DeepDiff(dd, d)
                    # pprint(res, indent=2)
                    compare_fields(res)
        elif cloud._cls == "Cloud.DigitalOceanCloud":
            list_loc = load_staging_l_locations.get('DigitalOceanCloud')
            for d in response:
                for dd in list_loc:
                    res = DeepDiff(dd, d)
                    # pprint(res, indent=2)
                    compare_fields(res)
        elif cloud._cls == "Cloud.SoftLayerCloud":
            list_loc = load_staging_l_locations.get('SoftLayerCloud')
            for d in response:
                for dd in list_loc:
                    res = DeepDiff(dd, d)
                    # pprint(res, indent=2)
                    compare_fields(res)
        elif cloud._cls == "Cloud.RackSpaceCloud":
            list_loc = load_staging_l_locations.get('RackSpaceCloud')
            for d in response:
                for dd in list_loc:
                    res = DeepDiff(dd, d)
                    # pprint(res, indent=2)
                    compare_fields(res)
        elif cloud._cls == "Cloud.LinodeCloud":
            list_loc = load_staging_l_locations.get('LinodeCloud')
            for d in response:
                for dd in list_loc:
                    res = DeepDiff(dd, d)
                    # pprint(res, indent=2)
                    compare_fields(res)
        elif cloud._cls == "Cloud.NephoScaleCloud":
            list_loc = load_staging_l_locations.get('NephoScaleCloud')
            for d in response:
                for dd in list_loc:
                    res = DeepDiff(dd, d)
                    # pprint(res, indent=2)
                    compare_fields(res)


@iter_clouds
def test_list_images(cloud, load_staging_l_images):
    print len(cloud.ctl.list_images())
    response = cloud.ctl.list_images()
    if response:
        if cloud._cls == 'Cloud.AmazonCloud':
            list_loc = load_staging_l_images.get('AmazonCloud')
            for new in response:
                for old in list_loc:
                    for (k, v), (k2, v2) in zip(old.items(), new.items()):
                        if k == 'name':
                            v2_str = str(v2)
                            if v == v2_str:
                                res = DeepDiff(old, new)
                                pprint(res, indent=2)
                                compare_fields(res)
        elif cloud._cls == 'Cloud.Linode':
            list_loc = load_staging_l_images.get('LinodeCloud')
            for new in response:
                for old in list_loc:
                    for (k, v), (k2, v2) in zip(old.items(), new.items()):
                        if k == 'name':
                            v2_str = str(v2)
                            if v == v2_str:
                                res = DeepDiff(old, new)
                                pprint(res, indent=2)
                                compare_fields(res)


@iter_clouds
def test_list_sizes(cloud, load_staging_l_sizes):
    print len(cloud.ctl.list_sizes())
    response = cloud.ctl.list_sizes()
    if response:
        # pytest.set_trace()
        if cloud._cls == 'Cloud.AmazonCloud':
            list_loc = load_staging_l_sizes.get('AmazonCloud')
            for d in response:
                for dd in list_loc:
                    res = DeepDiff(dd, d)
                    # pprint(res, indent=2)
                    compare_fields(res)
        elif cloud._cls == "Cloud.PacketCloud":
            list_loc = load_staging_l_sizes.get('PacketCloud')
            for d in response:
                for dd in list_loc:
                    res = DeepDiff(dd, d)
                    # pprint(res, indent=2)
                    compare_fields(res)
        elif cloud._cls == "Cloud.DigitalOceanCloud":
            list_loc = load_staging_l_sizes.get('DigitalOceanCloud')
            for d in response:
                for dd in list_loc:
                    res = DeepDiff(dd, d)
                    # pprint(res, indent=2)
                    compare_fields(res)
        elif cloud._cls == "Cloud.SoftLayerCloud":
            list_loc = load_staging_l_sizes.get('SoftLayerCloud')
            for d in response:
                for dd in list_loc:
                    res = DeepDiff(dd, d)
                    # pprint(res, indent=2)
                    compare_fields(res)
        elif cloud._cls == "Cloud.RackSpaceCloud":
            list_loc = load_staging_l_sizes.get('RackSpaceCloud')
            for d in response:
                for dd in list_loc:
                    res = DeepDiff(dd, d)
                    # pprint(res, indent=2)
                    compare_fields(res)
        elif cloud._cls == "Cloud.LinodeCloud":
            list_loc = load_staging_l_sizes.get('LinodeCloud')
            for d in response:
                for dd in list_loc:
                    res = DeepDiff(dd, d)
                    # pprint(res, indent=2)
                    compare_fields(res)
        elif cloud._cls == "Cloud.NephoScaleCloud":
            list_loc = load_staging_l_sizes.get('NephoScaleCloud')
            for d in response:
                for dd in list_loc:
                    res = DeepDiff(dd, d)
                    # pprint(res, indent=2)
                    compare_fields(res)