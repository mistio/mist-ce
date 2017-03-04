"""Basic configuration and mappings
   Here we define constants needed by mist.io
   Also, the configuration from settings.py is exposed through this module.
"""
import os
import sys
import ssl
import logging

import libcloud.security
from libcloud.compute.types import Provider
from libcloud.compute.types import NodeState


libcloud.security.SSL_VERSION = ssl.PROTOCOL_TLSv1_2


###############################################################################
# The following variables are common for both open.source and mist.core
###############################################################################

CORE_URI = "https://mist.io"
AMQP_URI = "rabbitmq:5672"
MEMCACHED_HOST = ["memcached:11211"]
BROKER_URL = "amqp://guest:guest@rabbitmq/"
SSL_VERIFY = True

PY_LOG_LEVEL = logging.INFO
PY_LOG_FORMAT = '%(asctime)s %(levelname)s %(threadName)s %(module)s - %(funcName)s: %(message)s'
PY_LOG_FORMAT_DATE = "%Y-%m-%d %H:%M:%S"
LOG_EXCEPTIONS = True

JS_BUILD = False
CSS_BUILD = False
JS_LOG_LEVEL = 3

MONGO_URI = "mongodb:27017"
MONGO_DB = "mist2"

ACTIVATE_POLLER = True

# number of api tokens user can have
ACTIVE_APITOKEN_NUM = 20
ALLOW_CONNECT_LOCALHOST = True
ALLOW_CONNECT_PRIVATE = True
SAVE_TAGS_ON_PROVIDER = True  # TODO ?

# allow mist.io to connect to KVM hypervisor running on the same server
ALLOW_LIBVIRT_LOCALHOST = False

# Docker related
DOCKER_IP = "172.17.0.1"
DOCKER_PORT = "2375"
DOCKER_TLS_KEY = ""
DOCKER_TLS_CERT = ""
DOCKER_TLS_CA = ""

MAILER_SETTINGS = {
    'mail.host': "mailmock",
    'mail.port': "8025",
    'mail.tls': False,
    'mail.starttls': False,
    'mail.username': "",
    'mail.password': "",
}

# PLAN OUT experiments
NEW_UI_EXPERIMENT_ENABLE = False

GITHUB_BOT_TOKEN = ""

NO_VERIFY_HOSTS = []

###############################################################################
#  Different set in io and core
###############################################################################

SECRET = ""


NOTIFICATION_EMAIL = {
    'all': "",
    'dev': "",
    'ops': "",
    'sales': "",
    'demo': "",
    'support': "",
}

EMAIL_FROM = ""

# Monitoring Related
COLLECTD_HOST = ""
COLLECTD_PORT = ""

GOOGLE_ANALYTICS_ID = ""
COMMAND_TIMEOUT = 20  # TODO ?

# celery settings
CELERY_SETTINGS = {
    'BROKER_URL': BROKER_URL,
    'CELERY_TASK_SERIALIZER': 'json',
    'CELERYD_LOG_FORMAT': PY_LOG_FORMAT,
    'CELERYD_TASK_LOG_FORMAT': PY_LOG_FORMAT,
    'CELERYD_CONCURRENCY': 4,
    'CELERYD_MAX_TASKS_PER_CHILD': 32,
    'CELERYD_MAX_MEMORY_PER_CHILD': 204800,  # 20480 KiB - 200 MiB
    'CELERY_MONGODB_SCHEDULER_DB': 'mist2',
    'CELERY_MONGODB_SCHEDULER_COLLECTION': 'schedules',
    'CELERY_MONGODB_SCHEDULER_URL': MONGO_URI,
}


###############################################################################
# App constants
###############################################################################

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
    NodeState.STARTING: 'starting',
    NodeState.STOPPING: 'stopping',
    NodeState.RECONFIGURING: 'reconfiguring'
}

# All EC2 providers, useful for type checking
EC2_PROVIDERS = (
    Provider.EC2_US_EAST,
    Provider.EC2_AP_NORTHEAST,
    Provider.EC2_AP_NORTHEAST1,
    Provider.EC2_AP_NORTHEAST2,
    Provider.EC2_EU_WEST,
    Provider.EC2_EU_CENTRAL,
    Provider.EC2_US_WEST,
    Provider.EC2_AP_SOUTHEAST,
    Provider.EC2_AP_SOUTHEAST2,
    Provider.EC2_SA_EAST,
    Provider.EC2_US_WEST_OREGON,
    # Provider.EC2_AP_SOUTH1,
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
    # Azure
    {
        'title': 'Azure',
        'provider': Provider.AZURE,
        'regions': []
    },
    # AzureARM
    {
        'title': 'Azure ARM',
        'provider': Provider.AZURE_ARM,
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
                'location': 'Seoul',
                'id': Provider.EC2_AP_NORTHEAST2
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
#            {
#                'location': 'Mumbai',
#                'id': Provider.EC2_AP_SOUTH1
#            },
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
    # Azure
    {
        'title': 'Azure',
        'provider': Provider.AZURE
    },
    # Azure ARM
    {
        'title': 'Azure ARM',
        'provider': Provider.AZURE_ARM
    },
    # EC2
    {
        'title': 'EC2 AP Tokyo',
        'provider': Provider.EC2_AP_NORTHEAST1
    },
    {
        'title': 'EC2 AP Seoul',
        'provider': Provider.EC2_AP_NORTHEAST2
    },
#    {
#        'title': 'EC2 AP Mumbai',
#        'provider': Provider.EC2_AP_SOUTH1
#    },
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
    'eu-west-1': {
        'ami-d41d58a7': 'Amazon Linux AMI 2016.09.0 (HVM), SSD Volume Type',
        'ami-0e10557d': 'Amazon Linux AMI 2016.09.0 (PV)',
        'ami-05bfde76': 'Ubuntu Server 14.04 LTS (PV), SSD Volume Type',
        'ami-ed82e39e': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-8b8c57f8': 'Red Hat Enterprise Linux 7.2 (HVM), SSD Volume Type',
        'ami-f4278487': 'SUSE Linux Enterprise Server 12 SP1 (HVM), SSD Volume Type',
        'ami-fa7cdd89': 'SUSE Linux Enterprise Server 11 SP4 (PV), SSD Volume Type',
        'ami-b6b8d8c5': 'CoreOS stable 1068.8.0 (PV)',
        'ami-cbb5d5b8': 'CoreOS stable 1068.8.0 (HVM)',
    },
    'eu-central-1': {
        'ami-0044b96f': 'Amazon Linux AMI 2016.09.0 (HVM), SSD Volume Type',
        'ami-1345b87c': 'Amazon Linux AMI 2016.09.0 (PV)',
        'ami-875042eb': 'Red Hat Enterprise Linux 7.2 (HVM), SSD Volume Type',
        'ami-a9a557c6': 'Ubuntu Server 16.04 LTS (HVM), SSD Volume Type',
        'ami-26c43149': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-2eaeb342': 'SUSE Linux Enterprise Server 11 SP4 (PV), SSD Volume Type',
        'ami-6bd2ce07': 'SUSE Linux Enterprise Server 12 SP1 (HVM), SSD Volume Type',
        'ami-7b7a8f14': 'CoreOS stable 1068.8.0 (HVM)',
        'ami-d1c431be': 'CoreOS stable 1068.8.0 (PV)',
    },
    'us-east-1': {
        'ami-c481fad3': 'Amazon Linux AMI 2016.09.0 (HVM), SSD Volume Type',
        'ami-4d87fc5a': 'Amazon Linux AMI 2016.09.0 (PV)',
        'ami-2051294a': 'Red Hat Enterprise Linux 7.2 (HVM), SSD Volume Type',
        'ami-b7b4fedd': 'SUSE Linux Enterprise Server 12 SP1 (HVM), SSD Volume Type',
        'ami-2d39803a': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-2ef48339': 'Ubuntu Server 16.04 LTS (HVM), SSD Volume Type',
        'ami-7f2e6015': 'SUSE Linux Enterprise Server 11 SP4 (PV), SSD Volume Type',
        'ami-098e011e': 'CoreOS stable 1068.8.0 (PV)',
        'ami-368c0321': 'CoreOS stable 1068.8.0 (HVM)',
    },
    'us-west-1': {
        'ami-de347abe': 'Amazon Linux AMI 2016.09.0 (HVM), SSD Volume Type',
        'ami-df3779bf': 'Amazon Linux AMI 2016.09.0 (PV)',
        'ami-48db9d28': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-a9a8e4c9': 'Ubuntu Server 16.04 LTS (HVM), SSD Volume Type',
        'ami-d1315fb1': 'Red Hat Enterprise Linux 7.2 (HVM), SSD Volume Type',
        'ami-6d701b0d': 'SUSE Linux Enterprise Server 12 SP 1 (HVM), SSD Volume Type',
        'ami-e7a4cc87': 'SUSE Linux Enterprise Server 11 SP4 (PV), SSD Volume Type',
        'ami-ae2564ce': 'CoreOS stable 1068.8.0 (PV)',
        'ami-bc2465dc': 'CoreOS stable 1068.8.0 (HVM)',
    },
    'us-west-2': {
        'ami-b04e92d0': 'Amazon Linux AMI 2016.09.0 (HVM), SSD Volume Type',
        'ami-1d49957d': 'Amazon Linux AMI 2016.09.0 (PV)',
        'ami-775e4f16': 'Red Hat Enterprise Linux 7.2 (HVM), SSD Volume Type',
        'ami-d2627db3': 'SUSE Linux Enterprise Server 12 SP1 (HVM), SSD Volume Type',
        'ami-d732f0b7': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-746aba14': 'Ubuntu Server 16.04 LTS (HVM), SSD Volume Type',
        'ami-86fae7e7': 'SUSE Linux Enterprise Server 11 SP4 (PV), SSD Volume Type',
        'ami-cfef22af': 'CoreOS stable 1068.8.0 (HVM)',
        'ami-ecec218c': 'CoreOS stable 1068.8.0 (PV)',
    },
    'ap-southeast-1': {
        'ami-7243e611': 'Amazon Linux AMI 2016.09.0 (HVM), SSD Volume Type',
        'ami-3f03c55c': 'Red Hat Enterprise Linux 7.2 (HVM), SSD Volume Type',
        'ami-2a19da49': 'SUSE Linux Enterprise Server 12 SP 1 (HVM), SSD Volume Type',
        'ami-21d30f42': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-1a5f9f79': 'SUSE Linux Enterprise Server 11 SP4 (PV), SSD Volume Type',
        'ami-42934921': 'Ubuntu Server 16.04 LTS (HVM), SSD Volume Type',
        'ami-a743e6c4': 'Amazon Linux AMI 2016.09.0 (PV)',
        'ami-3203df51': 'CoreOS stable 1068.8.0 (PV)',
        'ami-9b00dcf8': 'CoreOS stable 1068.8.0 (HVM)',
    },
    'ap-southeast-2': {
        'ami-3ad6e659': 'Amazon Linux AMI 2016.09.0 (PV)',
        'ami-55d4e436': 'Amazon Linux AMI 2016.09.0 (HVM), SSD Volume Type',
        'ami-e0c19f83': 'Red Hat Enterprise Linux 7.2 (HVM), SSD Volume Type',
        'ami-0f510a6c': 'SUSE Linux Enterprise Server 12 SP 1 (HVM), SSD Volume Type',
        'ami-8ea3fbed': 'SUSE Linux Enterprise Server 11 SP4 (PV), SSD Volume Type',
        'ami-ba3e14d9': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-623c0d01': 'Ubuntu Server 16.04 LTS (HVM), SSD Volume Type',
        'ami-e8e4ce8b': 'CoreOS stable 1068.8.0 (HVM)',
        'ami-ede4ce8e': 'CoreOS stable 1068.8.0 (PV)',
    },
    'sa-east-1': {
        'ami-b777e4db': 'Amazon Linux AMI 2016.09.0 (HVM), SSD Volume Type',
        'ami-27b3094b': 'Red Hat Enterprise Linux 7.2 (HVM), SSD Volume Type',
        'ami-4ede5922': 'SUSE Linux Enterprise Server 12 SP 1 (HVM), SSD Volume Type',
        'ami-dc48dcb0': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-029a1e6e': 'SUSE Linux Enterprise Server 11 SP4 (PV), SSD Volume Type',
        'ami-60bd2d0c': 'Ubuntu Server 16.04 LTS (HVM), SSD Volume Type',
        'ami-1d75e671': 'Amazon Linux AMI 2016.09.0 (PV)',
        'ami-0317836f': 'CoreOS stable 1068.8.0 (PV)',
        'ami-ef43d783': 'CoreOS stable 1068.8.0 (HVM)',
    },
    'ap-northeast-1': {
        'ami-1a15c77b': 'Amazon Linux AMI 2016.09.0 (HVM), SSD Volume Type',
        'ami-cf14c6ae': 'Amazon Linux AMI 2016.09.0 (PV)',
        'ami-0dd8f963': 'Red Hat Enterprise Linux 7.2 (HVM), SSD Volume Type',
        'ami-5e849130': 'Ubuntu Server 16.04 Beta2 (PV)',
        'ami-0919cd68': 'Ubuntu Server 16.04 LTS (HVM), SSD Volume Type',
        'ami-a21529cc': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-27fed749': 'SUSE Linux Enterprise Server 11 SP4 (PV), SSD Volume Type',
        'ami-f8220896': 'SUSE Linux Enterprise Server 12 SP1 (HVM), SSD Volume Type',
        'ami-d0e21bb1': 'CoreOS stable 1068.8.0 (PV)',
        'ami-fcd9209d': 'CoreOS stable 1068.8.0 (HVM)',
    },
    'ap-northeast-2': {
        'ami-a04297ce': 'Amazon Linux AMI 2016.09.0 (HVM), SSD Volume Type',
        'ami-44db152a': 'Red Hat Enterprise Linux 7.2 (HVM), SSD Volume Type',
        'ami-e9985687': 'SUSE Linux Enterprise Server 12 SP1 (HVM), SSD Volume Type',
        'ami-09dc1267': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-91de14ff': 'CoreOS stable 1068.8.0 (HVM)',
        'ami-9edf15f0': 'CoreOS stable 1068.8.0 (PV)'
    },
    'ap-south-1': {
        'ami-cacbbea5': 'Amazon Linux AMI 2016.09.0 (HVM), SSD Volume Type',
        'ami-cdbdd7a2': 'Red Hat Enterprise Linux 7.2 (HVM), SSD Volume Type',
        'ami-cebed4a1': 'SUSE Linux Enterprise Server 12 SP1 (HVM), SSD Volume Type',
        'ami-4a90fa25': 'Ubuntu Server 14.04 LTS (HVM), SSD Volume Type',
        'ami-7e94fe11': 'Ubuntu Server 16.04 LTS (HVM), SSD Volume Type',
        'ami-985025f7': 'CoreOS-stable-1068.10.0-hvm',
        'ami-ec5f2a83': 'CoreOS-stable-1068.10.0',
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
EC2_IMAGES[Provider.EC2_AP_NORTHEAST2] = EC2_IMAGES['ap-northeast-2']
EC2_IMAGES[Provider.EC2_AP_NORTHEAST1] = EC2_IMAGES['ap-northeast-1']
#EC2_IMAGES[Provider.EC2_AP_SOUTH1] = EC2_IMAGES['ap-south-1']

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

GCE_IMAGES = [
    'debian-cloud',
    'centos-cloud',
    'suse-cloud',
    'rhel-cloud',
    'coreos-cloud',
    'gce-nvme',
    'google-containers',
    'opensuse-cloud',
    'suse-cloud',
    'ubuntu-os-cloud',
    'windows-cloud',
]

BANNED_EMAIL_PROVIDERS = [
    'mailinator.com',
    'bob.info',
    'veryreallemail.com',
    'spamherelots.com',
    'putthisinyourspamdatabase.com',
    'thisisnotmyrealemail.com',
    'binkmail.com',
    'spamhereplease.com',
    'sendspamhere.com',
    'chogmail.com',
    'spamthisplease.com',
    'frapmail.com',
    'obobbo.com',
    'devnullmail.com',
    'dispostable.com',
    'yopmail.com',
    'soodonims.com',
    'spambog.com',
    'spambog.de',
    'discardmail.com',
    'discardmail.de',
    'spambog.ru',
    'cust.in',
    '0815.ru',
    's0ny.net',
    'hochsitze.com',
    'hulapla.de',
    'misterpinball.de',
    'nomail2me.com',
    'dbunker.com',
    'bund.us',
    'teewars.org',
    'superstachel.de',
    'brennendesreich.de',
    'ano-mail.net',
    '10minutemail.com',
    'rppkn.com',
    'trashmail.net',
    'dacoolest.com',
    'junk1e.com',
    'throwawayemailaddress.com',
    'imgv.de',
    'spambastion.com',
    'dreameheap.com',
    'trollbot.org',
    'getairmail.com',
    'anonymizer.com',
    'dudmail.com',
    'scatmail.com',
    'trayna.com',
    'spamgourmet.com',
    'incognitomail.org',
    'mailexpire.com',
    'mailforspam.com',
    'sharklasers.com',
    'guerillamail.com',
    'guerrillamailblock.com',
    'guerrillamail.net',
    'guerrillamail.org',
    'guerrillamail.biz',
    'spam4.me',
    'grr.la',
    'guerrillamail.de',
    'trbvm.com',
    'byom.de',
]


# Get settings from mist.core.
def dirname(path, num=1):
    for i in xrange(num):
        path = os.path.dirname(path)
    return path


CORE_CONFIG_PATH = os.path.join(dirname(__file__, 5),
                                'mist', 'core', 'config.py')
if os.path.exists(CORE_CONFIG_PATH):
    print >> sys.stderr, "Will load core config from %s" % CORE_CONFIG_PATH
    execfile(CORE_CONFIG_PATH)


# Get settings from environmental variables.
FROM_ENV_STRINGS = [
    'AMQP_URI', 'BROKER_URL', 'CORE_URI', 'MONGO_URI', 'MONGO_DB', 'DOCKER_IP',
    'DOCKER_PORT', 'DOCKER_TLS_KEY', 'DOCKER_TLS_CERT', 'DOCKER_TLS_CA',
]
FROM_ENV_INTS = [
]
FROM_ENV_BOOLS = [
    'SSL_VERIFY', 'ALLOW_CONNECT_LOCALHOST', 'ALLOW_CONNECT_PRIVATE',
    'ALLOW_LIBVIRT_LOCALHOST',
]
FROM_ENV_ARRAYS = [
    'MEMCACHED_HOST',
]
print >> sys.stderr, "Reading settings from environmental variables."
for key in FROM_ENV_STRINGS:
    if os.getenv(key):
        locals()[key] = os.getenv(key)
for key in FROM_ENV_INTS:
    if os.getenv(key):
        try:
            locals()[key] = int(os.getenv(key))
        except (KeyError, ValueError):
            print >> sys.stderr, "Invalid value for %s: %s" % (key,
                                                               os.getenv(key))
for key in FROM_ENV_BOOLS:
    if os.getenv(key) is not None:
        locals()[key] = os.getenv(key) in ('1', 'true', 'True')
for key in FROM_ENV_ARRAYS:
    if os.getenv(key):
        locals()[key] = os.getenv(key).split(',')


# Get settings from settings file.
settings_file = os.getenv('SETTINGS_FILE') or 'settings.py'
if os.path.exists(settings_file):
    print >> sys.stderr, "Reading local settings from %s" % settings_file
    conf = {}
    execfile(settings_file, conf)
    for key in conf:
        if isinstance(locals().get(key), dict) and isinstance(conf[key], dict):
            locals()[key].update(conf[key])
        else:
            locals()[key] = conf[key]


# Update celery settings.
CELERY_SETTINGS.update({
    'BROKER_URL': BROKER_URL,
    'CELERY_MONGODB_SCHEDULER_URL': MONGO_URI,
    'CELERYD_LOG_FORMAT': PY_LOG_FORMAT,
    'CELERYD_TASK_LOG_FORMAT': PY_LOG_FORMAT,
})


# Configure libcloud to not verify certain hosts.
if NO_VERIFY_HOSTS:
    if DOCKER_IP:
        NO_VERIFY_HOSTS.append(DOCKER_IP)
    libcloud.security.NO_VERIFY_MATCH_HOSTNAMES = NO_VERIFY_HOSTS
