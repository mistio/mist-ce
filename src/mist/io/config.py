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
    }
]


# Base AMIs
EC2_IMAGES = {
    'us-east-1': {
        'ami-bba18dd2': 'Amazon Linux AMI 2013.09.2 (64-bit)',
        'ami-d7a18dbe': 'Amazon Linux AMI 2013.09.2 (32-bit)',
        'ami-e8084981': 'SUSE Linux Enterprise Server 11 (64-bit)',
        'ami-b60948df': 'SUSE Linux Enterprise Server 11 (32-bit)',
        'ami-ad184ac4': 'Ubuntu Server 13.10 (64-bit)',
        'ami-a9184ac0': 'Ubuntu Server 13.10 (32-bit)',
        'ami-63b6910a': 'Red Hat Enterprise Linux 6.5 for Cluster Instances',
        'ami-b93264d0': 'Ubuntu Server 12.04.3 LTS for HVM Instances',
        'ami-a25415cb': 'Red Hat Enterprise Linux 6.4 (64-bit)',
        'ami-7e175617': 'Red Hat Enterprise Linux 6.4 (32-bit)',
        'ami-a73264ce': 'Ubuntu Server 12.04.3 LTS (64-bit)',
        'ami-a53264cc': 'Ubuntu Server 12.04.3 LTS (32-bit)',
        'ami-e9a18d80': 'Amazon Linux AMI (HVM) 2013.09.2',
        'ami-b6c146df': 'Cluster Instances HVM SUSE Linux Enterprise 11',
        'ami-a1184ac8': 'Ubuntu Server 13.10 for HVM Instances',
    },
    'us-west-2': {
        'ami-ccf297fc': 'Amazon Linux AMI 2013.09.2 (64-bit)',
        'ami-def297ee': 'Amazon Linux AMI 2013.09.2 (32-bit)',
        'ami-d8b429e8': 'SUSE Linux Enterprise Server 11 (64-bit)',
        'ami-9eb429ae': 'SUSE Linux Enterprise Server 11 (32-bit)',
        'ami-ace67f9c': 'Ubuntu Server 13.10 (64-bit)',
        'ami-aae67f9a': 'Ubuntu Server 13.10 (32-bit)',
        'ami-3425be04': 'Red Hat Enterprise Linux 6.5 for Cluster Instances',
        'ami-203eb710': 'Cluster Instances HVM SUSE Linux Enterprise 11',
        'ami-b8a63b88': 'Red Hat Enterprise Linux 6.4 (64-bit)',
        'ami-baa63b8a': 'Red Hat Enterprise Linux 6.4 (32-bit)',
        'ami-6aad335a': 'Ubuntu Server 12.04.3 LTS (64-bit)',
        'ami-68ad3358': 'Ubuntu Server 12.04.3 LTS (32-bit)',
        'ami-f8f297c8': 'Amazon Linux AMI (HVM) 2013.09.2',
        'ami-6cad335c': 'Ubuntu Server 12.04.3 LTS for HVM Instances',
        'ami-90e67fa0': 'Ubuntu Server 13.10 for HVM Instances',
    },
    'us-west-1': {
        'ami-a43909e1': 'Amazon Linux AMI 2013.09.2 (64-bit)',
        'ami-923909d7': 'Amazon Linux AMI 2013.09.2 (32-bit)',
        'ami-aebd96eb': 'SUSE Linux Enterprise Server 11 (64-bit)',
        'ami-80bd96c5': 'SUSE Linux Enterprise Server 11 (32-bit)',
        'ami-4843740d': 'Ubuntu Server 13.10 (64-bit)',
        'ami-4e43740b': 'Ubuntu Server 13.10 (32-bit)',
        'ami-e04b7aa5': 'Red Hat Enterprise Linux 6.5 for Cluster Instances',
        'ami-6283a827': 'Red Hat Enterprise Linux 6.4 (64-bit)',
        'ami-4a83a80f': 'Red Hat Enterprise Linux 6.4 (32-bit)',
        'ami-acf9cde9': 'Ubuntu Server 12.04.3 LTS (64-bit)',
        'ami-a2f9cde7': 'Ubuntu Server 12.04.3 LTS (32-bit)',
        'ami-f63909b3': 'Amazon Linux AMI (HVM) 2013.09.2',
    },
    'eu-west-1': {
        'ami-5256b825': 'Amazon Linux AMI 2013.09.2 (64-bit)',
        'ami-6a56b81d': 'Amazon Linux AMI 2013.09.2 (32-bit)',
        'ami-8d1109f9': 'SUSE Linux Enterprise Server 11 (64-bit)',
        'ami-fd110989': 'SUSE Linux Enterprise Server 11 (32-bit)',
        'ami-480bea3f': 'Ubuntu Server 13.10 (64-bit)',
        'ami-4a0bea3d': 'Ubuntu Server 13.10 (32-bit)',
        'ami-2ce30f5b': 'Red Hat Enterprise Linux 6.5 for Cluster Instances',
        'ami-011b1975': 'Cluster Instances HVM SUSE Linux Enterprise 11',
        'ami-75342c01': 'Red Hat Enterprise Linux 6.4 (64-bit)',
        'ami-8b332bff': 'Red Hat Enterprise Linux 6.4 (32-bit)',
        'ami-8e987ef9': 'Ubuntu Server 12.04.3 LTS (64-bit)',
        'ami-80987ef7': 'Ubuntu Server 12.04.3 LTS (32-bit)',
        'ami-7c56b80b': 'Amazon Linux AMI (HVM) 2013.09.2',
        'ami-8c987efb': 'Ubuntu Server 12.04.3 LTS for HVM instances',
        'ami-360bea41': 'Ubuntu Server 13.10 for HVM Instances',
    },
    'ap-southeast-1': {
        'ami-b4baeee6': 'Amazon Linux AMI 2013.09.2 (64-bit)',
        'ami-b6baeee4': 'Amazon Linux AMI 2013.09.2 (32-bit)',
        'ami-3aa2ea68': 'SUSE Linux Enterprise Server 11 (64-bit)',
        'ami-14a2ea46': 'SUSE Linux Enterprise Server 11 (32-bit)',
        'ami-94baf0c6': 'Ubuntu Server 13.10 (64-bit)',
        'ami-96baf0c4': 'Ubuntu Server 13.10 (32-bit)',
        'ami-5a1c4808': 'Red Hat Enterprise Linux 6.5 for Cluster Instances',
        'ami-80bbf3d2': 'Red Hat Enterprise Linux 6.4 (64-bit)',
        'ami-9cbbf3ce': 'Red Hat Enterprise Linux 6.4 (32-bit)',
        'ami-b84e04ea': 'Ubuntu Server 12.04.3 LTS (64-bit)',
        'ami-ba4e04e8': 'Ubuntu Server 12.04.3 LTS (32-bit)',
        'ami-8ebaeedc': 'Amazon Linux AMI (HVM) 2013.09.2',
    },
    'ap-northeast-1': {
        'ami-0d13700c': 'Amazon Linux AMI 2013.09.2 (64-bit)',
        'ami-0b13700a': 'Amazon Linux AMI 2013.09.2 (32-bit)',
        'ami-9178e890': 'SUSE Linux Enterprise Server 11 (64-bit)',
        'ami-5344d452': 'SUSE Linux Enterprise Server 11 (32-bit)',
        'ami-b945ddb8': 'Ubuntu Server 13.10 (64-bit)',
        'ami-ad45ddac': 'Ubuntu Server 13.10 (32-bit)',
        'ami-b34edbb2': 'Cluster Instances HVM SUSE Linux Enterprise 11',
        'ami-5769f956': 'Red Hat Enterprise Linux 6.4 (64-bit)',
        'ami-bb68f8ba': 'Red Hat Enterprise Linux 6.4 (32-bit)',
        'ami-3f32ac3e': 'Ubuntu Server 12.04.3 LTS (64-bit)',
        'ami-3d32ac3c': 'Ubuntu Server 12.04.3 LTS (32-bit)',
        'ami-eb0c6fea': 'Amazon Linux AMI (HVM) 2013.09.2',
        'ami-111f7910': 'Red Hat Enterprise Linux 6.5 for Cluster Instances',
    },
    'ap-southeast-2': {
        'ami-5ba83761': 'Amazon Linux AMI 2013.09.2 (64-bit)',
        'ami-65a8375f': 'Amazon Linux AMI 2013.09.2 (32-bit)',
        'ami-1776e42d': 'SUSE Linux Enterprise Server 11 (64-bit)',
        'ami-24a5331e': 'SUSE Linux Enterprise Server 11 (32-bit)',
        'ami-9fc25ea5': 'Ubuntu 13.10 Server (64-bit)',
        'ami-99c25ea3': 'Ubuntu 13.10 Server (32-bit)',
        'ami-c7db44fd': 'Red Hat Enterprise Linux 6.5 for Cluster Instances',
        'ami-1d62f027': 'Red Hat Enterprise Linux 6.4 (64-bit)',
        'ami-957eecaf': 'Red Hat Enterprise Linux 6.4 (32-bit)',
        'ami-3d128f07': 'Ubuntu Server 12.04.3 LTS Server (64-bit)',
        'ami-c5138eff': 'Ubuntu Server 12.04.3 LTS Server (32-bit)',
        'ami-6fa83755': 'Amazon Linux AMI (HVM) 2013.09.2',
    },
    'sa-east-1': {
        'ami-c99130d4': 'Amazon Linux AMI 2013.09.2 (64-bit)',
        'ami-bf9130a2': 'Amazon Linux AMI 2013.09.2 (32-bit)',
        'ami-8574d098': 'SUSE Linux Enterprise Server 11 (64-bit)',
        'ami-6374d07e': 'SUSE Linux Enterprise Server 11 (32-bit)',
        'ami-41e84e5c': 'Ubuntu Server 13.10 (64-bit)',
        'ami-47e84e5a': 'Ubuntu Server 13.10 (32-bit)',
        'ami-e31cbafe': 'Red Hat Enterprise Linux 6.5 for Cluster Instances',
        'ami-fd73d7e0': 'Red Hat Enterprise Linux 6.4 (64-bit)',
        'ami-c373d7de': 'Red Hat Enterprise Linux 6.4 (32-bit)',
        'ami-35258228': 'Ubuntu Server 12.04.3 LTS (64-bit)',
        'ami-3b258226': 'Ubuntu Server 12.04.3 LTS (32-bit)',
        'ami-bd9130a0': 'Amazon Linux AMI (HVM) 2013.09.2',
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
