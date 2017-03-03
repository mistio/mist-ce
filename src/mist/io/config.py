"""Basic configuration and mappings
   Here we define constants needed by mist.io
   Also, the configuration from settings.py is exposed through this module.
"""
import os
import logging

from libcloud.compute.types import Provider
from libcloud.compute.types import NodeState

# Parse user defined settings from settings.py in the top level project dir
log = logging.getLogger(__name__)

# If SETTINGS_FILE env variable exists, it will point to a mounted
# file that hosts the configuration option of our Kubernetes configMap.
settings_file = os.getenv('SETTINGS_FILE') or 'settings.py'

settings = {}
try:
    execfile(settings_file, settings)
except IOError:
    log.warning("No %s file found." % settings_file)
except Exception as exc:
    log.error("Error parsing settings py: %r", exc)

###############################################################################
# The following variables are common for both open.source and mist.core
###############################################################################
AMQP_URI = settings.get("AMQP_URI", "localhost:5672")
SSL_VERIFY = settings.get("SSL_VERIFY", True)

PY_LOG_LEVEL = settings.get("PY_LOG_LEVEL", logging.INFO)
PY_LOG_FORMAT = settings.get("PY_LOG_FORMAT", '%(asctime)s %(levelname)s %(threadName)s %(module)s - %(funcName)s: %(message)s')
PY_LOG_FORMAT_DATE = settings.get("PY_LOG_FORMAT_DATE", "%Y-%m-%d %H:%M:%S")
LOG_EXCEPTIONS = settings.get("LOG_EXCEPTIONS", True)

JS_BUILD = settings.get("JS_BUILD", False)
CSS_BUILD = settings.get("CSS_BUILD", False)
JS_LOG_LEVEL = settings.get("JS_LOG_LEVEL", 3)

MONGO_URI = settings.get("MONGO_URI", os.environ.get("MONGO_URI", "mongodb:27017"))
MONGO_DB = settings.get("MONGO_DB", os.environ.get("MONGO_DB", "mist2"))

ACTIVATE_POLLER = settings.get("ACTIVATE_POLLER", True)  # TODO depracate it

# number of api tokens user can have
ACTIVE_APITOKEN_NUM = settings.get('ACTIVE_APITOKEN_NUM', 20)
ALLOW_CONNECT_LOCALHOST = settings.get('ALLOW_CONNECT_LOCALHOST', True)
ALLOW_CONNECT_PRIVATE = settings.get('ALLOW_CONNECT_PRIVATE', True)
SAVE_TAGS_ON_PROVIDER = settings.get('SAVE_TAGS_ON_PROVIDER', True)  # TODO ?

# allow mist.io to connect to KVM hypervisor running on the same server
ALLOW_LIBVIRT_LOCALHOST = settings.get('ALLOW_LIBVIRT_LOCALHOST', False)

# Docker related
DOCKER_IP = settings.get("DOCKER_IP", os.environ.get("DOCKER_IP", "172.17.0.1"))
DOCKER_PORT = settings.get("DOCKER_PORT", os.environ.get("DOCKER_PORT", "2375"))
DOCKER_TLS_KEY = settings.get("DOCKER_TLS_KEY", os.environ.get("DOCKER_TLS_KEY"))
DOCKER_TLS_CERT = settings.get("DOCKER_TLS_CERT", os.environ.get("DOCKER_TLS_CERT"))
DOCKER_TLS_CA = settings.get("DOCKER_TLS_CA", os.environ.get("DOCKER_TLS_CA"))

MAILER_SETTINGS = settings.get("MAILER_SETTINGS",
                               {
                                   'mail.host': "mailmock",
                                   'mail.port': "8025",
                                   'mail.tls': False,
                                   'mail.starttls': False,
                                   'mail.username': "",
                                   'mail.password': ""
                               })
# PLAN OUT experiments
NEW_UI_EXPERIMENT_ENABLE = settings.get("NEW_UI_EXPERIMENT_ENABLE", False)

GITHUB_BOT_TOKEN = settings.get("GITHUB_BOT_TOKEN", "")

###############################################################################
#  Different set in io and core
###############################################################################
SECRET = settings.get("SECRET", "")

CORE_URI = settings.get("CORE_URI", os.environ.get("CORE_URI", "https://mist.io"))
MEMCACHED_HOST = settings.get("MEMCACHED_HOST", ["127.0.0.1:11211"])
BROKER_URL = settings.get("BROKER_URL", "amqp://guest:guest@127.0.0.1/")

#  TODO COuld we add our email here?
NOTIFICATION_EMAIL = {
    'all': settings.get("NOTIFICATION_EMAIL", ""),
    'dev': settings.get("NOTIFICATION_EMAIL_DEV", ""),
    'ops': settings.get("NOTIFICATION_EMAIL_OPS", ""),
    'sales': settings.get("NOTIFICATION_EMAIL_SALES", ""),
    'demo': settings.get("NOTIFICATION_EMAIL_DEMO", ""),
    'support':  settings.get("NOTIFICATION_EMAIL_SUPPORT", ""),
    }

EMAIL_FROM = settings.get("EMAIL_FROM", "")

# Monitoring Related
COLLECTD_HOST = settings.get("COLLECTD_HOST", "")
COLLECTD_PORT = settings.get("COLLECTD_PORT", "")

GOOGLE_ANALYTICS_ID = settings.get("GOOGLE_ANALYTICS_ID", "")
COMMAND_TIMEOUT = settings.get("COMMAND_TIMEOUT", 20)  # TODO ?

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
#    Provider.EC2_AP_SOUTH1,
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

try:
    from mist.core.config import *
except ImportError:
    pass
