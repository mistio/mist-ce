"""Basic configuration and mappings"""
from libcloud.compute.types import Provider
from libcloud.compute.types import NodeState


COMMAND_TIMEOUT = 20


STATES = {
    NodeState.RUNNING: 'running',
    NodeState.REBOOTING: 'rebooting',
    NodeState.TERMINATED: 'terminated',
    NodeState.PENDING: 'pending',
    # we assume unknown means stopped, especially for the EC2 case
    NodeState.UNKNOWN: 'stopped'
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
                       {'title': 'Single server',
                        'provider': 'bare_metal',
                        },
                       # EC2
                       {'title': 'EC2 AP NORTHEAST',
                        'provider': Provider.EC2_AP_NORTHEAST,
                        },
                       {'title': 'EC2 AP SOUTHEAST',
                        'provider': Provider.EC2_AP_SOUTHEAST,
                        },
                       {'title': 'EC2 AP Sydney',
                        'provider': Provider.EC2_AP_SOUTHEAST2,
                        },
                       {'title': 'EC2 EU Ireland',
                        'provider': Provider.EC2_EU_WEST,
                        },
                       {'title': 'EC2 SA EAST',
                        'provider': Provider.EC2_SA_EAST,
                        },
                       {'title': 'EC2 US EAST',
                        'provider': Provider.EC2_US_EAST,
                        },
                       {'title': 'EC2 US WEST',
                        'provider': Provider.EC2_US_WEST,
                        },
                       {'title': 'EC2 US WEST OREGON',
                        'provider': Provider.EC2_US_WEST_OREGON,
                        },

                       # NephoScale
                       {'title': 'NephoScale',
                        'provider' : Provider.NEPHOSCALE},

                       # Linode
                       {'title': 'Linode',
                        'provider' : Provider.LINODE},

                       # OpenStack TODO: re-enable & test
                       {'title': 'OpenStack',
                        'provider': Provider.OPENSTACK,
                       },

                       # Rackspace
                       {'title': 'Rackspace DFW',
                        'provider': "%s:%s" % (Provider.RACKSPACE,'dfw')
                        },
                       {'title': 'Rackspace ORD',
                        'provider' : "%s:%s" % (Provider.RACKSPACE,'ord')
                        },
                       {'title': 'Rackspace LON',
                        'provider' : "%s:%s" % (Provider.RACKSPACE,'lon')
                        },
                       {'title': 'Rackspace US (OLD)',
                        'provider' : "%s:%s" % (Provider.RACKSPACE_FIRST_GEN,'us')
                        },
                       {'title': 'Rackspace UK (OLD)',
                        'provider' : "%s:%s" % (Provider.RACKSPACE_FIRST_GEN,'uk')
                        },
                       {'title': 'Rackspace AU',
                        'provider' : "%s:%s" % (Provider.RACKSPACE,'syd')
                        },
                       ]

# Base AMIs
EC2_IMAGES = {
    'us-east-1': {
        'ami-35792c5c': 'Amazon Linux AMI 2013.09 64bit',
        'ami-51792c38': 'Amazon Linux AMI 2013.09 32bit',
        'ami-a25415cb': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-7e175617': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-e8084981': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-b60948df': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-d0f89fb9': 'Ubuntu Server 12.04.2 LTS 64bit',
        'ami-def89fb7': 'Ubuntu Server 12.04.2 LTS 32bit',
        'ami-c30360aa': 'Ubuntu Server 13.04 64bit',
        'ami-cd0360a4': 'Ubuntu Server 13.04 32bit',
        'ami-69792c00': 'Amazon Linux AMI (HVM) 2013.09 64bit',
        'ami-3218595b': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
        'ami-b6c146df': 'Cluster Instances HVM SUSE Linux Enterprise 11 64bit',
        'ami-d4f89fbd': 'Ubuntu Server 12.04.2 LTS for HVM Instances 64bit',
        'ami-c70360ae': 'Ubuntu Server 13.04 for HVM Instances 64bit',
    },
    'us-west-2': {
        'ami-d03ea1e0': 'Amazon Linux AMI 2013.09 64bit',
        'ami-ec3ea1dc': 'Amazon Linux AMI 2013.09 32bit',
        'ami-b8a63b88': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-baa63b8a': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-d8b429e8': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-9eb429ae': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-70f96e40': 'Ubuntu Server 12.04.2 LTS 64bit',
        'ami-0ef96e3e': 'Ubuntu Server 12.04.2 LTS 32bit',
        'ami-bf1d8a8f': 'Ubuntu Server 13.04 64bit',
        'ami-bd1d8a8d': 'Ubuntu Server 13.04 32bit',
        'ami-e43ea1d4': 'Amazon Linux AMI (HVM) 2013.09 64bit',
        'ami-18a23f28': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
        'ami-72f96e42': 'Ubuntu Server 12.04.2 LTS for Cluster Instances 64bit',
        'ami-203eb710': 'Cluster Instances HVM SUSE Linux Enterprise 11 64bit',
        'ami-a11d8a91': 'Ubuntu Server 13.04 for HVM Instances 64bit',
    },
    'us-west-1': {
        'ami-687b4f2d': 'Amazon Linux AMI 2013.09 64bit',
        'ami-667b4f23': 'Amazon Linux AMI 2013.09 32bit',
        'ami-6283a827': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-4a83a80f': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-aebd96eb': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-80bd96c5': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-fe002cbb': 'Ubuntu Server 12.04.2 LTS 64bit',
        'ami-fc002cb9': 'Ubuntu Server 12.04.2 LTS 32bit',
        'ami-d383af96': 'Ubuntu Server 13.04 64bit',
        'ami-d183af94': 'Ubuntu Server 13.04 32bit',
        'ami-4e7b4f0b': 'Amazon Linux AMI (HVM) 2013.09 64bit',
        'ami-7080ab35': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
    },
    'eu-west-1': {
        'ami-149f7863': 'Amazon Linux AMI 2013.09 64bit',
        'ami-109f7867': 'Amazon Linux AMI 2013.09 32bit',
        'ami-75342c01': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-8b332bff': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-8d1109f9': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-fd110989': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-ce7b6fba': 'Ubuntu Server 12.04.2 LTS 64bit',
        'ami-c27b6fb6': 'Ubuntu Server 12.04.2 LTS 32bit',
        'ami-3d160149': 'Ubuntu Server 13.04 64bit',
        'ami-31160145': 'Ubuntu Server 13.04 32bit',
        'ami-209f7857': 'Amazon Linux AMI (HVM) 2013.09 64bit',
        'ami-f72b3383': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
        'ami-c87b6fbc': 'Ubuntu Server 12.04.2 LTS for HVM instances 64bit',
        'ami-011b1975': 'Cluster Instances HVM SUSE Linux Enterprise 11 64bit',
        'ami-3f16014b': 'Ubuntu Server 13.04 for HVM Instances 64bit',
    },
    'ap-southeast-1': {
        'ami-14f2b946': 'Amazon Linux AMI 2013.09 64bit',
        'ami-16f2b944': 'Amazon Linux AMI 2013.09 32bit',
        'ami-80bbf3d2': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-9cbbf3ce': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-3aa2ea68': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-14a2ea46': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-64084736': 'Ubuntu Server 12.04.2 LTS 64bit',
        'ami-66084734': 'Ubuntu Server 12.04.2 LTS 32bit',
        'ami-2b511e79': 'Ubuntu Server 13.04 64bit',
        'ami-25511e77': 'Ubuntu Server 13.04 32bit',
        'ami-6af2b938': 'Amazon Linux AMI (HVM) 2013.09 64bit',
        'ami-04bef656': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
    },
    'ap-northeast-1': {
        'ami-3561fe34': 'Amazon Linux AMI 2013.09 64bit',
        'ami-2f61fe2e': 'Amazon Linux AMI 2013.09 32bit',
        'ami-5769f956': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-bb68f8ba': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-9178e890': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-5344d452': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-fe6ceeff': 'Ubuntu Server 12.04.2 LTS 64bit',
        'ami-fc6ceefd': 'Ubuntu Server 12.04.2 LTS 32bit',
        'ami-6b26ab6a': 'Ubuntu Server 13.04 64bit',
        'ami-6926ab68': 'Ubuntu Server 13.04 32bit',
        'ami-0961fe08': 'Amazon Linux AMI (HVM) 2013.09 64bit',
        'ami-b34edbb2': 'Cluster Instances HVM SUSE Linux Enterprise 11 64bit',
        'ami-41108040': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
    },
    'ap-southeast-2': {
        'ami-a148d59b': 'Amazon Linux AMI 2013.09 64bit',
        'ami-af48d595': 'Amazon Linux AMI 2013.09 32bit',
        'ami-1d62f027': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-957eecaf': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-1776e42d': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-24a5331e': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-04ea7a3e': 'Ubuntu 12.04.2 LTS  Server 64bit',
        'ami-06ea7a3c': 'Ubuntu 12.04.2 LTS  Server 32bit',
        'ami-84a333be': 'Ubuntu 13.04 Server 64bit',
        'ami-86a333bc': 'Ubuntu 13.04 Server 32bit',
        'ami-a948d593': 'Amazon Linux AMI (HVM) 2013.09 64bit',
        'ami-517eec6b': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
    },
    'sa-east-1': {
        'ami-9f6ec982': 'Amazon Linux AMI 2013.09 64bit',
        'ami-636ec97e': 'Amazon Linux AMI 2013.09 32bit',
        'ami-fd73d7e0': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-c373d7de': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-8574d098': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-6374d07e': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-a3da00be': 'Ubuntu Server 12.04.2 LTS 64bit',
        'ami-a1da00bc': 'Ubuntu Server 12.04.2 LTS 32bit',
        'ami-28e43e35': 'Ubuntu Server 13.04 64bit',
        'ami-2ee43e33': 'Ubuntu Server 13.04 32bit',
        'ami-9d6ec980': 'Amazon Linux AMI (HVM) 2013.09 64bit',
        'ami-b77dd9aa': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
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


NOTE = '''
Provider.EC2_EU_WEST etc naming is deprecated by libcloud. 

Now we call driver = get_driver(Providers.EC2_EU_WEST) in helpers.connect which calls the default EC2 driver passing datacenter argument. Instead we should call the default driver of EC2 passing the datacenter, example 

driver = get_driver(Providers.EC2)
conn = driver(key, secret, datacenter='eu-west-1')

What we gain:
1 Avoid using libcloud deprecated code
2 No need to keep a separate mapping of ec2 providers

EC2 datacenters are ['us-east-1', 'us-west-2', 'us-west-1', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1', 'ap-southeast-2','sa-east-1']
'''
