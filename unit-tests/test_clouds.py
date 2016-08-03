"""Tests Cloud models and Controllers"""

import os
import json

import yaml
from deepdiff import DeepDiff
from pprint import pprint

import pytest

from mist.core.user.models import Organization, User

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
    """Load clouds configuration from unit-tests/clouds.yaml

    The YAML configuration file of clouds is expected to be in the following
    format:

        - name: My Amazon Cloud
          provider: ec2
          apikey: REDACTED
          apisecret: REDACTED
          region: ap-northeast-1
        - provider: linode
          apikey: REDACTED

    The `name` key is optional and will take the same value as `provider` if
    left blank or missing.

    """

    path = os.path.join(os.path.dirname(os.path.realpath(__file__)),
                        'clouds.yaml')
    print "Loading clouds from %s." % path
    with open(path) as fobj:
        clouds = yaml.load(fobj)
    if not isinstance(clouds, list):
        raise TypeError("Configuration in '%s' is expected to be a list, "
                        "not %s." % path, type(settings))
    for cdict in clouds:
        if not isinstance(cdict, dict):
            raise TypeError("Cloud configuration is not a dict: %r" % cdict)
        provider = cdict.get('provider')
        if not provider:
            raise ValueError("Cloud configuration doesn't specify "
                             "`provider`: %s" % cdict)
        if provider not in models.CLOUDS:
            raise KeyError("Invalid provider '%s', must be in %s." %
                           (provider, models.CLOUDS.keys()))
        if 'name' not in cdict:
            cdict['name'] = provider
    print "Loaded %d clouds." % len(clouds)
    return clouds


CLOUDS = load_clouds_from_config()
CLOUD_NAMES = [cdict['name'] for cdict in CLOUDS]


@pytest.fixture(scope='module')
def org(request):
    """Fixture to create an organization with proper clean up"""

    name = uuid.uuid4().hex
    print "Creating org '%s'." % name
    user = User(email='%s@example.com' % name)
    user.save()
    org = Organization(name=name)
    org.add_member_to_team('Owners', user)
    org.save()

    def fin():
        """Finalizer to clean up organization after tests"""
        while org.members:
            user = org.members[0]
            print "Deleting user '%s'." % user
            org.remove_member_from_members(user)
            user.delete()
        print "Deleting org '%s'." % name
        org.delete()

    request.addfinalizer(fin)

    return org


@pytest.fixture(scope='module', params=CLOUDS, ids=CLOUD_NAMES)
def cloud(request, org):
    """Fixture to create clouds from config file with proper cleanup"""

    cdict = request.param
    name = cdict.pop('name')
    cls = models.CLOUDS[cdict.pop('provider')]
    print "Creating cloud '%s'." % name
    cloud = cls.add(org, name, **cdict)

    def fin():
        """Finalizer clean up cloud after tests"""
        print "Deleting cloud '%s'." % name
        cloud.delete()

    request.addfinalizer(fin)

    return cloud


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
