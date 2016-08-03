"""Tests Cloud models and Controllers"""

import os
import uuid

import yaml

import pytest

from mist.core.user.models import Organization, User

import mist.io.clouds.models as models


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


def test_list_machines(cloud):
    print len(cloud.ctl.list_machines())


def test_list_locations(cloud):
    print len(cloud.ctl.list_locations())


def test_list_images(cloud):
    print len(cloud.ctl.list_images())


def test_list_sizes(cloud):
    print len(cloud.ctl.list_sizes())
