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
AMQP_URI = settings.get("AMQP_URI", "localhost:5672")
MEMCACHED_HOST = settings.get("MEMCACHED_HOST", ["127.0.0.1:11211"])
BROKER_URL = settings.get("BROKER_URL", "amqp://guest:guest@127.0.0.1/")
SSL_VERIFY = settings.get("SSL_VERIFY", True)
JS_BUILD = settings.get("JS_BUILD", False)
CSS_BUILD = settings.get("CSS_BUILD", False)
LAST_BUILD = settings.get("LAST_BUILD", '')
JS_LOG_LEVEL = settings.get("JS_LOG_LEVEL", 3)
PY_LOG_LEVEL = settings.get("PY_LOG_LEVEL", logging.INFO)
PY_LOG_FORMAT = settings.get("PY_LOG_FORMAT", '%(asctime)s %(levelname)s %(threadName)s %(module)s - %(funcName)s: %(message)s')
PY_LOG_FORMAT_DATE = settings.get("PY_LOG_FORMAT_DATE", "%Y-%m-%d %H:%M:%S")
GOOGLE_ANALYTICS_ID = settings.get("GOOGLE_ANALYTICS_ID", "")
COMMAND_TIMEOUT = settings.get("COMMAND_TIMEOUT", 20)
ALLOW_CONNECT_LOCALHOST = settings.get('ALLOW_CONNECT_LOCALHOST', True)
ALLOW_CONNECT_PRIVATE = settings.get('ALLOW_CONNECT_PRIVATE', True)

# celery settings
CELERY_SETTINGS = {
    'BROKER_URL': BROKER_URL,
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
    NodeState.UNKNOWN: 'unknown',
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
    Provider.EC2_EU_CENTRAL,
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
    8: 'Tokyo, JP',
    9: 'Singapore, SG',
    10: 'Frankfurt, DE'
}

SUPPORTED_PROVIDERS_V_2 = [
    # BareMetal
    {
        'title': 'Other Server',
        'provider': 'bare_metal',
        'regions': []
    },
    # CoreOS
    {
        'title': 'CoreOS',
        'provider': 'coreos',
        'regions': [],
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
                'location': 'Frankfurt',
                'id': Provider.EC2_EU_CENTRAL
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
        'title': 'GCE',
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
    # Vultr
    {
        'title': 'Vultr',
        'provider' : Provider.VULTR,
        'regions': []
    },
     # vSphere
    {
        'title': 'VMWare vSphere',
        'provider' : Provider.VSPHERE,
        'regions': []
    },
    # Packet.net
    {
        'title': 'Packet.net',
        'provider' : Provider.PACKET,
        'regions': []
    }
]

SUPPORTED_PROVIDERS = [
    # BareMetal
    {
        'title': 'Bare Metal Server',
        'provider': 'bare_metal'
    },
    # CoreOS
    {
        'title': 'CoreOS',
        'provider': 'coreos'
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
        'title': 'EC2 EU Frankfurt',
        'provider': Provider.EC2_EU_CENTRAL
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
    'eu-central-1': {
        'ami-a8221fb5': 'Amazon Linux AMI 2015.03 (HVM), SSD Volume Type',
        'ami-a22610bf': 'SUSE Linux Enterprise Server 12 (HVM), SSD Volume Type',
        'ami-fc0033e1': 'SUSE Linux Enterprise Server 11 SP3 (PV), SSD Volume Type',
        'ami-dafdcfc7': 'Red Hat Enterprise Linux 7.1 (HVM), SSD Volume Type',
        'ami-accff2b1': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-ac221fb1': 'Amazon Linux AMI 2015.03 (PV)',
        'ami-b6cff2ab': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type',
    },
    'us-east-1': {
        'ami-1ecae776': 'Amazon Linux AMI 2015.03 (HVM), SSD Volume Type',
        'ami-aeb532c6': 'SUSE Linux Enterprise Server 12 (HVM), SSD Volume Type',
        'ami-c08fcba8': 'SUSE Linux Enterprise Server 11 SP3 (PV), SSD Volume Type',
        'ami-12663b7a': 'Red Hat Enterprise Linux 7.1 (HVM), SSD Volume Type',
        'ami-d05e75b8': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-1ccae774': 'Amazon Linux AMI 2015.03 (PV)',
        'ami-d85e75b0': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type',
    },
    'us-west-2': {
        'ami-e7527ed7': 'Amazon Linux AMI 2015.03 (HVM), SSD Volume Type',
        'ami-d7450be7': 'SUSE Linux Enterprise Server 12 (HVM), SSD Volume Type',
        'ami-5df2ab6d': 'SUSE Linux Enterprise Server 11 SP3 (PV), SSD Volume Type',
        'ami-4dbf9e7d': 'Red Hat Enterprise Linux 7.1 (HVM), SSD Volume Type',
        'ami-5189a661': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-ff527ecf': 'Amazon Linux AMI 2015.03 (PV)',
        'ami-6989a659': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type',
    },
    'us-west-1': {
        'ami-d114f295': 'Amazon Linux AMI 2015.03 (HVM), SSD Volume Type',
        'ami-b95b4ffc': 'SUSE Linux Enterprise Server 12 (HVM), SSD Volume Type',
        'ami-fe8891bb': 'SUSE Linux Enterprise Server 11 SP3 (PV), SSD Volume Type',
        'ami-a540a5e1': 'Red Hat Enterprise Linux 7.1 (HVM), SSD Volume Type',
        'ami-df6a8b9b': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-d514f291': 'Amazon Linux AMI 2015.03 (PV)',
        'ami-d16a8b95': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type',
    },
    'eu-west-1': {
        'ami-a10897d6': 'Amazon Linux AMI 2015.03 (HVM), SSD Volume Type',
        'ami-e801af9f': 'SUSE Linux Enterprise Server 12 (HVM), SSD Volume Type',
        'ami-17c44860': 'SUSE Linux Enterprise Server 11 SP3 (PV), SSD Volume Type',
        'ami-25158352': 'Red Hat Enterprise Linux 7.1 (HVM), SSD Volume Type',
        'ami-47a23a30': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-bf0897c8': 'Amazon Linux AMI 2015.03 (PV)',
        'ami-5da23a2a': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type',
    },
    'ap-southeast-1': {
        'ami-68d8e93a': 'Amazon Linux AMI 2015.03 (HVM), SSD Volume Type',
        'ami-84b392d6': 'SUSE Linux Enterprise Server 12 (HVM), SSD Volume Type',
        'ami-3cbe956e': 'SUSE Linux Enterprise Server 11 SP3 (PV), SSD Volume Type',
        'ami-dc1c2b8e': 'Red Hat Enterprise Linux 7.1 (HVM), SSD Volume Type',
        'ami-96f1c1c4': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-acd9e8fe': 'Amazon Linux AMI 2015.03 (PV)',
        'ami-e8f1c1ba': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type',
    },
    'ap-northeast-1': {
        'ami-cbf90ecb': 'Amazon Linux AMI 2015.03 (HVM), SSD Volume Type',
        'ami-d54a79d4': 'SUSE Linux Enterprise Server 12 (HVM), SSD Volume Type',
        'ami-5cb8a65d': 'SUSE Linux Enterprise Server 11 SP3 (PV), SSD Volume Type',
        'ami-b1b458b1': 'Red Hat Enterprise Linux 7.1 (HVM), SSD Volume Type',
        'ami-936d9d93': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-27f90e27': 'Amazon Linux AMI 2015.03 (PV)',
        'ami-8d6d9d8d': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type',
    },
    'ap-southeast-2': {
        'ami-fd9cecc7': 'Amazon Linux AMI 2015.03 (HVM), SSD Volume Type',
        'ami-b90e6283': 'SUSE Linux Enterprise Server 12 (HVM), SSD Volume Type',
        'ami-ad0d7997': 'SUSE Linux Enterprise Server 11 SP3 (PV), SSD Volume Type',
        'ami-d3daace9': 'Red Hat Enterprise Linux 7.1 (HVM), SSD Volume Type',
        'ami-69631053': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-ff9cecc5': 'Amazon Linux AMI 2015.03 (PV)',
        'ami-7163104b': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type',
    },
    'sa-east-1': {
        'ami-b52890a8': 'Amazon Linux AMI 2015.03 (HVM), SSD Volume Type',
        'ami-f102b6ec': 'SUSE Linux Enterprise Server 12 (HVM), SSD Volume Type',
        'ami-23912d3e': 'SUSE Linux Enterprise Server 11 SP3 (PV), SSD Volume Type',
        'ami-09e25b14': 'Red Hat Enterprise Linux 7.1 (HVM), SSD Volume Type',
        'ami-4d883350': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-bb2890a6': 'Amazon Linux AMI 2015.03 (PV)',
        'ami-55883348': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type',
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
EC2_IMAGES[Provider.EC2_EU_CENTRAL] = EC2_IMAGES['eu-central-1']


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
