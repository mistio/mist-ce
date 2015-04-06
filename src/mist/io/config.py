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

# celery settings
CELERY_SETTINGS = {
    'BROKER_URL': 'amqp://guest:guest@127.0.0.1/',
    'CELERY_TASK_SERIALIZER': 'json',
    'CELERYD_LOG_FORMAT': PY_LOG_FORMAT,
    'CELERYD_TASK_LOG_FORMAT': PY_LOG_FORMAT,
    'CELERYD_CONCURRENCY': 32,
    'CELERYD_MAX_TASKS_PER_CHILD': 32,
}
CELERY_SETTINGS.update(settings.get('CELERY_SETTINGS', {}))

# App constants

STATES = {
    NodeState.RUNNING: 'running',
    NodeState.REBOOTING: 'rebooting',
    NodeState.TERMINATED: 'terminated',
    NodeState.PENDING: 'pending',
    # we assume unknown means stopped, especially for the EC2 case
    NodeState.UNKNOWN: 'stopped',
    NodeState.STOPPED: 'stopped',
    NodeState.ERROR: 'error',
    NodeState.PAUSED: 'paused',
    NodeState.SUSPENDED: 'suspended',
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

SUPPORTED_PROVIDERS_V_2 = [
    # BareMetal
    {
        'title': 'Other Server',
        'provider': 'bare_metal',
        'regions': []
    },
    # Azure
    {
        'title': 'Azure',
        'provider': Provider.AZURE,
        'regions': []
    },
    # EC2
    {
        'title': 'EC2',
        'provider': 'ec2',
        'regions': [
            {
                'location': 'Tokyo',
                'id': Provider.EC2_AP_NORTHEAST
            },
            {
                'location': 'Singapore',
                'id': Provider.EC2_AP_SOUTHEAST
            },
            {
                'location': 'Sydney',
                'id': Provider.EC2_AP_SOUTHEAST2
            },
            {
                'location': 'Ireland',
                'id': Provider.EC2_EU_WEST
            },
            {
                'location': 'Sao Paulo',
                'id': Provider.EC2_SA_EAST
            },
            {
                'location': 'N. Virginia',
                'id': Provider.EC2_US_EAST
            },
            {
                'location': 'N. California',
                'id': Provider.EC2_US_WEST
            },
            {
                'location': 'Oregon',
                'id': Provider.EC2_US_WEST_OREGON
            },
        ]
    },
    # GCE
    {
        'title': 'Google Compute Engine',
        'provider': Provider.GCE,
        'regions': []
    },

    # NephoScale
    {
        'title': 'NephoScale',
        'provider': Provider.NEPHOSCALE,
        'regions': []
    },
    # DigitalOcean
    {
        'title': 'DigitalOcean',
        'provider': Provider.DIGITAL_OCEAN,
        'regions': []
    },
    # Linode
    {
        'title': 'Linode',
        'provider': Provider.LINODE,
        'regions': []
    },
    # OpenStack TODO: re-enable & test
    {
        'title': 'OpenStack',
        'provider': Provider.OPENSTACK,
        'regions': []
    },
    # Rackspace
    {
        'title': 'Rackspace',
        'provider': 'rackspace',
        'regions': [
            {
                'location': 'Dallas',
                'id': 'dfw'
            },
            {
                'location': 'Chicago',
                'id': 'ord'
            },
            {
                'location': 'N. Virginia',
                'id': 'iad'
            },
            {
                'location': 'London',
                'id': 'lon'
            },
            {
                'location': 'Sydney',
                'id': 'syd'
            },
            {
                'location': 'Hong Kong',
                'id': 'hkg'
            },
            {
                'location': 'US-First Gen',
                'id': 'rackspace_first_gen:us'
            },
            {
                'location': 'UK-First Gen',
                'id': 'rackspace_first_gen:uk'
            },
        ]
    },
    # Softlayer
    {
        'title': 'SoftLayer',
        'provider': Provider.SOFTLAYER,
        'regions': []
    },
    #HP Cloud
    {
        'title': 'HP Helion Cloud',
        'provider': Provider.HPCLOUD,
        'regions': [
            {
                'location': 'US West',
                'id': 'region-a.geo-1'
            },
            {
                'location': 'US East',
                'id': 'region-b.geo-1'
            }
        ]
    },
    # Docker
    {
        'title': 'Docker',
        'provider': Provider.DOCKER,
        'regions': []
    },
    # vCloud
    {
        'title': 'VMware vCloud',
        'provider': Provider.VCLOUD,
        'regions': []
    },
    # Indonesian vCloud
    {
        'title': 'Indonesian Cloud',
        'provider': Provider.INDONESIAN_VCLOUD,
        'regions': []
    },
    # libvirt
    {
        'title': 'KVM (via libvirt)',
        'provider' : Provider.LIBVIRT,
        'regions': []
    },
    # HostVirtual
    {
        'title': 'HostVirtual',
        'provider' : Provider.HOSTVIRTUAL,
        'regions': []
    },
    # vSphere
    {
        'title': 'VMWare vSphere',
        'provider' : Provider.VSPHERE,
        'regions': []
    }

]

SUPPORTED_PROVIDERS = [
    # BareMetal
    {
        'title': 'Bare Metal Server',
        'provider': 'bare_metal'
    },
    # Azure
    {
        'title': 'Azure',
        'provider': Provider.AZURE
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
        'title': 'HP Helion Cloud - US West',
        'provider' : "%s:%s" % (Provider.HPCLOUD,'region-a.geo-1')
    },
    {
        'title': 'HP Helion Cloud - US East',
        'provider' : "%s:%s" % (Provider.HPCLOUD,'region-b.geo-1')
    },
    # Docker
    {
        'title': 'Docker',
        'provider' : Provider.DOCKER
    },
    # vCloud
    {
        'title': 'VMware vCloud',
        'provider' : Provider.VCLOUD
    }
]


# Base AMIs
EC2_IMAGES = {
    'us-east-1': {
        'ami-76817c1e': 'Amazon Linux AMI 2014.03.2 (HVM)',
        'ami-0e857b66': 'SuSE Linux Enterprise Server 11 sp3 (HVM), SSD Volume Type',
        'ami-7c807d14': 'Amazon Linux AMI 2014.03.2 (PV)',
        'ami-8c27d8e4': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (64-bit)',
        'ami-7a2bd512': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (32-bit)',
        'ami-785bae10': 'Red Hat Enterprise Linux 7.0 (HVM)',
        'ami-864d84ee': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-b06a98d8': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-88ac51e0': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-e84d8480': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (64-bit)',
        'ami-384d8450': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (32-bit)',
    },
    'us-west-2': {
        'ami-d13845e1': 'Amazon Linux AMI 2014.03.2 (HVM)',
        'ami-7fd3ae4f': 'SuSE Linux Enterprise Server 11 sp3 (HVM), SSD Volume Type',
        'ami-1b3b462b': 'Amazon Linux AMI 2014.03.2 (PV)',
        'ami-a997ea99': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (64-bit)',
        'ami-8197eab1': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (32-bit)',
        'ami-77d7a747': 'Red Hat Enterprise Linux 7.0 (HVM)',
        'ami-e7b8c0d7': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-7bdaa84b': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-27cab817': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-8bb8c0bb': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (64-bit)',
        'ami-abb8c09b': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (32-bit)',
    },
    'us-west-1': {
        'ami-f0d3d4b5': 'Amazon Linux AMI 2014.03.2 (HVM)',
        'ami-7e04023b': 'SuSE Linux Enterprise Server 11 sp3 (HVM), SSD Volume Type',
        'ami-f1fdfeb4': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (64-bit)',
        'ami-dbfdfe9e': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (32-bit)',
        'ami-fe393ebb': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-f4cfc8b1': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-66b9bc23': 'Red Hat Enterprise Linux 7.0 (HVM)',
        'ami-a7fdfee2': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-a8d3d4ed': 'Amazon Linux AMI 2014.03.2 (PV)',
        'ami-aa6066ef': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (64-bit)',
        'ami-1a04025f': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (32-bit)',
    },
    'eu-west-1': {
        'ami-892fe1fe': 'Amazon Linux AMI 2014.03.2 (HVM)',
        'ami-61915916': 'SuSE Linux Enterprise Server 11 sp3 (HVM), SSD Volume Type',
        'ami-672ce210': 'Amazon Linux AMI 2014.03.2 (PV)',
        'ami-e368a194': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (64-bit)',
        'ami-0f915978': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (32-bit)',
        'ami-f7f03d80': 'Red Hat Enterprise Linux 7.0 (HVM)',
        'ami-0307d674': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-8ff23cf8': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-7f01cf08': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-3907d64e': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (64-bit)',
        'ami-b104d5c6': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (32-bit)',
    },
    'ap-southeast-1': {
        'ami-a6b6eaf4': 'Amazon Linux AMI 2014.03.2 (HVM)',
        'ami-fe3768ac': 'SuSE Linux Enterprise Server 11 sp3 (HVM), SSD Volume Type',
        'ami-56b7eb04': 'Amazon Linux AMI 2014.03.2 (PV)',
        'ami-080c535a': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (64-bit)',
        'ami-983768ca': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (32-bit)',
        'ami-b8fda0ea': 'Red Hat Enterprise Linux 7.0 (HVM)',
        'ami-12356d40': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-c483df96': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-9cb8e4ce': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-7c356d2e': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (64-bit)',
        'ami-ac346cfe': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (32-bit)',
    },
    'ap-northeast-1': {
        'ami-29dc9228': 'Amazon Linux AMI 2014.03.2 (HVM)',
        'ami-53aee652': 'SuSE Linux Enterprise Server 11 sp3 (HVM), SSD Volume Type',
        'ami-25dd9324': 'Amazon Linux AMI 2014.03.2 (PV)',
        'ami-cb551dca': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (64-bit)',
        'ami-95aee694': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (32-bit)',
        'ami-87206d86': 'Red Hat Enterprise Linux 7.0 (HVM)',
        'ami-a1124fa0': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-e9aee0e8': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-cfbff1ce': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-d9134ed8': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (64-bit)',
        'ami-e3104de2': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (32-bit)',
    },
    'ap-southeast-2': {
        'ami-d9fe9be3': 'Amazon Linux AMI 2014.03.2 (HVM)',
        'ami-3760040d': 'SuSE Linux Enterprise Server 11 sp3 (HVM), SSD Volume Type',
        'ami-6bf99c51': 'Amazon Linux AMI 2014.03.2 (PV)',
        'ami-0510743f': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (64-bit)',
        'ami-1760042d': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (32-bit)',
        'ami-5d254067': 'Red Hat Enterprise Linux 7.0 (HVM)',
        'ami-fddabdc7': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-45ea8f7f': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-85f194bf': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-83dabdb9': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (64-bit)',
        'ami-a3dabd99': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (32-bit)',
    },
    'sa-east-1': {
        'ami-c9e649d4': 'Amazon Linux AMI 2014.03.2 (HVM)',
        'ami-ebb21df6': 'SuSE Linux Enterprise Server 11 sp3 (HVM), SSD Volume Type',
        'ami-c7e649da': 'Amazon Linux AMI 2014.03.2 (PV)',
        'ami-47bf105a': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (64-bit)',
        'ami-17b11e0a': 'SuSE Linux Enterprise Server 11 sp3 (PV), SSD Volume Type (32-bit)',
        'ami-ed60ccf0': 'Red Hat Enterprise Linux 7.0 (HVM)',
        'ami-d5a30ac8': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-b1ec43ac': 'Red Hat Enterprise Linux 6.5 (PV) (64-bit)',
        'ami-ebe847f6': 'Red Hat Enterprise Linux 6.5 (PV) (32-bit)',
        'ami-a3a30abe': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (64-bit)',
        'ami-afa30ab2': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type (32-bit)',
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

GCE_IMAGES = ['debian-cloud',
              'centos-cloud',
              'suse-cloud',
              'rhel-cloud',
              'coreos-cloud',
              'gce-nvme',
              'google-containers',
              'opensuse-cloud',
              'suse-cloud',
              'ubuntu-os-cloud',
              'windows-cloud']
