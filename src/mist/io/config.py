"""Basic configuration and mappings

Here we define constants needed by mist.io

Also, the configuration from settings.py is exposed through this module.

"""

import logging


from libcloud.compute.types import Provider
from libcloud.compute.types import NodeState


# Parse user defined settings from settings.py in the top level project dir
log = logging.getLogger(__name__)
settings = {}
try:
    execfile("settings.py", settings)
except IOError:
    log.warning("No settings.py file found.")
except Exception as exc:
    log.error("Error parsing settings py: %r", exc)
CORE_URI = settings.get("CORE_URI", "https://mist.io")
SSL_VERIFY = settings.get("SSL_VERIFY", True)
JS_BUILD = settings.get("JS_BUILD", False)
CSS_BUILD = settings.get("CSS_BUILD", False)
JS_LOG_LEVEL = settings.get("JS_LOG_LEVEL", 3)
PY_LOG_LEVEL = settings.get("PY_LOG_LEVEL", logging.INFO)
PY_LOG_FORMAT = settings.get("PY_LOG_FORMAT", '%(asctime)s %(levelname)s %(threadName)s %(module)s - %(funcName)s: %(message)s')
PY_LOG_FORMAT_DATE = settings.get("PY_LOG_FORMAT_DATE", "%Y-%m-%d %H:%M:%S")
GOOGLE_ANALYTICS_ID = settings.get("GOOGLE_ANALYTICS_ID", "")
COMMAND_TIMEOUT = settings.get("COMMAND_TIMEOUT", 20)

# App constants

STATES = {
    NodeState.RUNNING: 'running',
    NodeState.REBOOTING: 'rebooting',
    NodeState.TERMINATED: 'terminated',
    NodeState.PENDING: 'pending',
    # we assume unknown means stopped, especially for the EC2 case
    NodeState.UNKNOWN: 'stopped',
    NodeState.STOPPED: 'stopped'
}


# All EC2 providers, useful for type checking
EC2_PROVIDERS = (
    Provider.EC2_US_EAST,
    Provider.EC2_AP_NORTHEAST,
    Provider.EC2_EU_WEST,
    Provider.EC2_US_WEST,
    Provider.EC2_AP_SOUTHEAST,
    Provider.EC2_AP_SOUTHEAST2,
    Provider.EC2_SA_EAST,
    Provider.EC2_US_WEST_OREGON
)


EC2_SECURITYGROUP = {
    'name': 'mistio',
    'description': 'Security group created by mist.io'
}


# Linode datacenter ids/names mapping
LINODE_DATACENTERS = {
    2: 'Dallas, TX, USA',
    3: 'Fremont, CA, USA',
    4: 'Atlanta, GA, USA',
    6: 'Newark, NJ, USA',
    7: 'London, UK',
    8: 'Tokyo, JP'
}


SUPPORTED_PROVIDERS = [
    # BareMetal
    {
        'title': 'Bare Metal Server',
        'provider': 'bare_metal'
    },
    # EC2
    {
        'title': 'EC2 AP NORTHEAST',
        'provider': Provider.EC2_AP_NORTHEAST
    },
    {
        'title': 'EC2 AP SOUTHEAST',
        'provider': Provider.EC2_AP_SOUTHEAST
    },
    {
        'title': 'EC2 AP Sydney',
        'provider': Provider.EC2_AP_SOUTHEAST2
    },
    {
        'title': 'EC2 EU Ireland',
        'provider': Provider.EC2_EU_WEST
    },
    {
        'title': 'EC2 SA EAST',
        'provider': Provider.EC2_SA_EAST
    },
    {
        'title': 'EC2 US EAST',
        'provider': Provider.EC2_US_EAST
    },
    {
        'title': 'EC2 US WEST',
        'provider': Provider.EC2_US_WEST
    },
    {
        'title': 'EC2 US WEST OREGON',
        'provider': Provider.EC2_US_WEST_OREGON
    },
    # GCE
    {
        'title': 'Google Compute Engine',
        'provider' : Provider.GCE
    },

    # NephoScale
    {
        'title': 'NephoScale',
        'provider' : Provider.NEPHOSCALE
    },
    # DigitalOcean
    {
        'title': 'DigitalOcean',
        'provider' : Provider.DIGITAL_OCEAN
    },
    # Linode
    {
        'title': 'Linode',
        'provider' : Provider.LINODE
    },
    # OpenStack TODO: re-enable & test
    {
        'title': 'OpenStack',
        'provider': Provider.OPENSTACK
    },
    # Rackspace
    {
        'title': 'Rackspace DFW',
        'provider': "%s:dfw" % Provider.RACKSPACE
    },
    {
        'title': 'Rackspace ORD',
        'provider' : "%s:ord" % Provider.RACKSPACE
    },
    {
        'title': 'Rackspace IAD',
        'provider' : "%s:iad" % Provider.RACKSPACE
    },
    {
        'title': 'Rackspace LON',
        'provider' : "%s:lon" % Provider.RACKSPACE
    },
    {
        'title': 'Rackspace AU',
        'provider' : "%s:syd" % Provider.RACKSPACE
    },
    {
        'title': 'Rackspace HKG',
        'provider' : "%s:hkg" % Provider.RACKSPACE
    },
    {
        'title': 'Rackspace US (OLD)',
        'provider' : "%s:us" % Provider.RACKSPACE_FIRST_GEN
    },
    {
        'title': 'Rackspace UK (OLD)',
        'provider' : "%s:uk" % Provider.RACKSPACE_FIRST_GEN
    },
    # Softlayer
    {
        'title': 'SoftLayer',
        'provider' : Provider.SOFTLAYER
    },
    #HP Cloud
    {
        'title': 'HP Cloud US West AZ 1',
        'provider' : "%s:%s" % (Provider.OPENSTACK,'az-1.region-a.geo-1')
    },
    {
        'title': 'HP Cloud US West AZ 2',
        'provider' : "%s:%s" % (Provider.OPENSTACK,'az-2.region-a.geo-1')
    },
    {
        'title': 'HP Cloud US West AZ 3',
        'provider' : "%s:%s" % (Provider.OPENSTACK,'az-3.region-a.geo-1')
    },
    {
        'title': 'HP Cloud US East',
        'provider' : "%s:%s" % (Provider.OPENSTACK,'region-b.geo-1')
    },
    # Docker
    {
        'title': 'Docker',
        'provider' : Provider.DOCKER
    }
]


# Base AMIs
EC2_IMAGES = {
    'us-east-1': {
        'ami-fb8e9292': 'Amazon Linux AMI 2014.03.1 (64-bit)',
        'ami-178e927e': 'Amazon Linux AMI 2014.03.1 (32-bit)',
        'ami-e8084981': 'SuSE Linux Enterprise Server 11 sp3 (PV) (64-bit)',
        'ami-b60948df': 'SuSE Linux Enterprise Server 11 sp3 (PV) (32-bit)',
        'ami-978d91fe': 'Amazon Linux AMI (HVM) 2014.03.1',
        'ami-e572438c': 'SuSE Linux Enterprise Server 11 sp3 (HVM)',
        'ami-8d756fe4': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-436a702a': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-018c9568': 'Ubuntu Server 14.04 LTS (PV) (64-bit)',
        'ami-358c955c': 'Ubuntu Server 14.04 LTS (PV) (32-bit)',
        'ami-5b697332': 'Red Hat Enterprise Linux 6.5 (HVM)',
        'ami-1d8c9574': 'Ubuntu Server 14.04 LTS (HVM)',
    },
    'us-west-2': {
        'ami-043a5034': 'Amazon Linux AMI 2014.03.1 (64-bit)',
        'ami-1e3a502e': 'Amazon Linux AMI 2014.03.1 (32-bit)',
        'ami-d8b429e8': 'SuSE Linux Enterprise Server 11 sp3 (PV) (64-bit)',
        'ami-9eb429ae': 'SuSE Linux Enterprise Server 11 sp3 (PV) (32-bit)',
        'ami-383a5008': 'Amazon Linux AMI (HVM) 2014.03.1',
        'ami-a8fe9898': 'SuSE Linux Enterprise Server 11 sp3 (HVM)',
        'ami-aa8bfe9a': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-dc8ffaec': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-6ac2a85a': 'Ubuntu Server 14.04 LTS (PV) (64-bit)',
        'ami-68c2a858': 'Ubuntu Server 14.04 LTS (PV) (32-bit)',
        'ami-e08efbd0': 'Red Hat Enterprise Linux 6.5 (HVM)',
        'ami-6cc2a85c': 'Ubuntu Server 14.04 LTS (HVM)',
    },
    'us-west-1': {
        'ami-7aba833f': 'Amazon Linux AMI 2014.03.1 (64-bit)',
        'ami-78ba833d': 'Amazon Linux AMI 2014.03.1 (32-bit)',
        'ami-aebd96eb': 'SuSE Linux Enterprise Server 11 sp3 (PV) (64-bit)',
        'ami-80bd96c5': 'SuSE Linux Enterprise Server 11 sp3 (PV) (32-bit)',
        'ami-5aba831f': 'Amazon Linux AMI (HVM) 2014.03.1',
        'ami-1a88bb5f': 'SuSE Linux Enterprise Server 11 sp3 (HVM)',
        'ami-f6dde5b3': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-e0dbe3a5': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-ee4f77ab': 'Ubuntu Server 14.04 LTS (PV) (64-bit)',
        'ami-ec4f77a9': 'Ubuntu Server 14.04 LTS (PV) (32-bit)',
        'ami-5cdce419': 'Red Hat Enterprise Linux 6.5 (HVM)',
        'ami-f64f77b3': 'Ubuntu Server 14.04 LTS (HVM)',
    },
    'eu-west-1': {
        'ami-2918e35e': 'Amazon Linux AMI 2014.03.1 (64-bit)',
        'ami-2d18e35a': 'Amazon Linux AMI 2014.03.1 (32-bit)',
        'ami-8d1109f9': 'SuSE Linux Enterprise Server 11 sp3 (PV) (64-bit)',
        'ami-fd110989': 'SuSE Linux Enterprise Server 11 sp3 (PV) (32-bit)',
        'ami-4b18e33c': 'Amazon Linux AMI (HVM) 2014.03.1',
        'ami-4a5fb53d': 'SuSE Linux Enterprise 11 sp3 (HVM)',
        'ami-9368ade4': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-916ca9e6': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-896c96fe': 'Ubuntu Server 14.04 LTS (PV) (64-bit)',
        'ami-8b6c96fc': 'Ubuntu Server 14.04 LTS (PV) (32-bit)',
        'ami-af6faad8': 'Red Hat Enterprise Linux 6.5 (HVM)',
        'ami-776d9700': 'Ubuntu Server 14.04 LTS (HVM)',
    },
    'ap-southeast-1': {
        'ami-b40d5ee6': 'Amazon Linux AMI 2014.03.1 (64-bit)',
        'ami-840d5ed6': 'Amazon Linux AMI 2014.03.1 (32-bit)',
        'ami-3aa2ea68': 'SuSE Linux Enterprise Server 11 sp3 (PV) (64-bit)',
        'ami-14a2ea46': 'SuSE Linux Enterprise Server 11 sp3 (PV) (32-bit)',
        'ami-860d5ed4': 'Amazon Linux AMI (HVM) 2014.03.1',
        'ami-367d2b64': 'SuSE Linux Enterprise Server 11 sp3 (HVM)',
        'ami-5ebcef0c': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-f0bfeca2': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-9a7724c8': 'Ubuntu Server 14.04 LTS (PV) (64-bit)',
        'ami-947724c6': 'Ubuntu Server 14.04 LTS (PV) (32-bit)',
        'ami-dcbeed8e': 'Red Hat Enterprise Linux 6.5 (HVM)',
        'ami-987724ca': 'Ubuntu Server 14.04 LTS (HVM)',
    },
    'ap-northeast-1': {
        'ami-c9562fc8': 'Amazon Linux AMI 2014.03.1 (64-bit)',
        'ami-c7562fc6': 'Amazon Linux AMI 2014.03.1 (32-bit)',
        'ami-9178e890': 'SuSE Linux Enterprise Server 11 sp3 (PV) (64-bit)',
        'ami-5344d452': 'SuSE Linux Enterprise Server 11 sp3 (PV) (32-bit)',
        'ami-bb562fba': 'Amazon Linux AMI (HVM) 2014.03.1',
        'ami-71ff9070': 'SuSE Linux Enterprise Server 11 sp3 (HVM)',
        'ami-a15e24a0': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-d7611bd6': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-bddaa2bc': 'Ubuntu Server 14.04 LTS (PV) (64-bit)',
        'ami-bbdaa2ba': 'Ubuntu Server 14.04 LTS (PV) (32-bit)',
        'ami-53641e52': 'Red Hat Enterprise Linux 6.5 (HVM)',
        'ami-bfdaa2be': 'Ubuntu Server 14.04 LTS (HVM)',
    },
    'ap-southeast-2': {
        'ami-3b4bd301': 'Amazon Linux AMI 2014.03.1 (64-bit)',
        'ami-d54ad2ef': 'Amazon Linux AMI 2014.03.1 (32-bit)',
        'ami-1776e42d': 'SuSE Linux Enterprise Server 11 sp3 (PV) (64-bit)',
        'ami-24a5331e': 'SuSE Linux Enterprise Server 11 sp3 (PV) (32-bit)',
        'ami-cf4ad2f5': 'Amazon Linux AMI (HVM) 2014.03.1',
        'ami-ab70ee91': 'SuSE Linux Enterprise Server 11 sp3 (HVM)',
        'ami-b72fb78d': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-732eb649': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-43128a79': 'Ubuntu Server 14.04 LTS (PV) (64-bit)',
        'ami-4d128a77': 'Ubuntu Server 14.04 LTS (PV) (32-bit)',
        'ami-452eb67f': 'Red Hat Enterprise Linux 6.5 (HVM)',
        'ami-41128a7b': 'Ubuntu Server 14.04 LTS (HVM)',
    },
    'sa-east-1': {
        'ami-215dff3c': 'Amazon Linux AMI 2014.03.1 (64-bit)',
        'ami-2b5dff36': 'Amazon Linux AMI 2014.03.1 (32-bit)',
        'ami-8574d098': 'SuSE Linux Enterprise Server 11 sp3 (PV) (64-bit)',
        'ami-6374d07e': 'SuSE Linux Enterprise Server 11 sp3 (PV) (32-bit)',
        'ami-635dff7e': 'Amazon Linux AMI (HVM) 2014.03.1',
        'ami-0121811c': 'SuSE Linux Enterprise Server 11 sp3 (HVM)',
        'ami-abc76ab6': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-05c76a18': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-7315b76e': 'Ubuntu Server 14.04 LTS (PV) (64-bit)',
        'ami-7115b76c': 'Ubuntu Server 14.04 LTS (PV) (32-bit)',
        'ami-5fc76a42': 'Red Hat Enterprise Linux 6.5 (HVM)',
        'ami-6d15b770': 'Ubuntu Server 14.04 LTS (HVM)',
    },
}


EC2_IMAGES[Provider.EC2_EU_WEST] = EC2_IMAGES['eu-west-1']
EC2_IMAGES[Provider.EC2_SA_EAST] = EC2_IMAGES['sa-east-1']
EC2_IMAGES[Provider.EC2_AP_NORTHEAST] = EC2_IMAGES['ap-northeast-1']
EC2_IMAGES[Provider.EC2_AP_SOUTHEAST2] = EC2_IMAGES['ap-southeast-2']
EC2_IMAGES[Provider.EC2_AP_SOUTHEAST] = EC2_IMAGES['ap-southeast-1']
EC2_IMAGES[Provider.EC2_US_WEST] = EC2_IMAGES['us-west-1']
EC2_IMAGES[Provider.EC2_US_WEST_OREGON] = EC2_IMAGES['us-west-2']
EC2_IMAGES[Provider.EC2_US_EAST] = EC2_IMAGES['us-east-1']


# Provider.EC2_EU_WEST etc naming is deprecated by libcloud.
#
# Now we call driver = get_driver(Providers.EC2_EU_WEST) in helpers.connect
# which calls the default EC2 driver passing datacenter argument. Instead we
# should call the default driver of EC2 passing the datacenter, example
#
# driver = get_driver(Providers.EC2)
# conn = driver(key, secret, datacenter='eu-west-1')
#
# What we gain:
# 1 Avoid using libcloud deprecated code
# 2 No need to keep a separate mapping of ec2 providers
#
# EC2 datacenters are ['us-east-1', 'us-west-2', 'us-west-1', 'eu-west-1',
# 'ap-southeast-1', 'ap-northeast-1', 'ap-southeast-2','sa-east-1']

DOCKER_IMAGES = {
    'mist/ubuntu-14.04': 'Ubuntu 14.04',
    'mist/debian-wheezy': 'Debian Wheezy',
    'mist/opensuse-13.1': 'OpenSUSE 13.1',
    'mist/fedora-20': 'Fedora 20',
}
