
import os
import json
import uuid
import yaml
import pytest
import mist.io.clouds.models as models
from mist.core.keypair.models import Keypair
from mist.core.user.models import Organization, User

TEST_DIR = os.path.dirname(os.path.abspath(__file__))

@pytest.fixture
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
CREDS = {cdict['name']:cdict.get('creds') for cdict in CLOUDS}


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


@pytest.fixture(scope='module')
def key(request, org):
    """Fixture to create an SSH Keypair with proper cleanup"""

    key = Keypair()
    key.generate()
    name = uuid.uuid4().hex
    print "Creating key '%s'." % name
    key = Keypair(name=name, public=key.public, private=key.private, owner=org)
    key.save()

    def fin():
        """Finalizer to clean up organization after tests"""
        print "Deleting key '%s'." % name
        key.delete()

    request.addfinalizer(fin)

    return key


@pytest.fixture(scope='module', params=CLOUDS, ids=CLOUD_NAMES)
def cloud(request, org):
    """Fixture to create clouds from config file with proper cleanup"""

    cdict = request.param
    name = cdict['name']
    cls = models.CLOUDS[cdict['provider']]
    print "Creating cloud '%s'." % name
    cloud = cls.add(org, name, **cdict['fields'])

    def fin():
        """Finalizer clean up cloud after tests"""
        print "Deleting cloud '%s'." % name
        cloud.delete()

    request.addfinalizer(fin)

    return cloud


@pytest.fixture
def load_staging_l_machines():
    path = os.path.join(TEST_DIR, 'list_machines.json')
    print "Reading machines from path '%s'." % path
    with open(path) as fobj:
        return json.load(fobj)


@pytest.fixture
def load_staging_l_locations():
    path = os.path.join(TEST_DIR, 'list_locations.json')
    print "Reading locations from path '%s'." % path
    with open(path) as fobj:
        return json.load(fobj)


@pytest.fixture
def load_staging_l_sizes():
    path = os.path.join(TEST_DIR, 'list_sizes.json')
    print "Reading sizes from path '%s'." % path
    with open(path) as fobj:
        return json.load(fobj)


@pytest.fixture
def load_staging_l_images():
    path = os.path.join(TEST_DIR, 'list_images.json')
    print "Reading images from path '%s'." % path
    with open(path) as fobj:
        return json.load(fobj)


@pytest.fixture
def load_reference_networks():
    path = os.path.join(TEST_DIR, 'list_networks.json')
    print "Reading networks from path '%s'." % path
    with open(path) as fobj:
        return json.load(fobj)

