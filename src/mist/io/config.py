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

                       # Linode
                       {'title': 'Linode',
                        'provider' : Provider.LINODE},

                       # OpenStack TODO: re-enable & test
                       {'title': 'OpenStack',
                        'provider': Provider.OPENSTACK,
                       },

                       # RackSpace
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
        'ami-05355a6c': 'Amazon Linux AMI 2013.03.1 64bit',
        'ami-b3345bda': 'Amazon Linux AMI 2013.03.1 32bit',
        'ami-7d0c6314': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-730c631a': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-ca32efa3': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-0c32ef65': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-d0f89fb9': 'Ubuntu Server 12.04.2 LTS 64bit',
        'ami-def89fb7': 'Ubuntu Server 12.04.2 LTS 32bit',
        'ami-c30360aa': 'Ubuntu Server 13.04 64bit',
        'ami-cd0360a4': 'Ubuntu Server 13.04 32bit',
        'ami-a73758ce': 'Cluster Compute Amazon Linux AMI 2013.03.1 64bit',
        'ami-9d0b64f4': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
        'ami-b6c146df': 'Cluster Instances HVM SUSE Linux Enterprise 11 64bit',
        'ami-d4f89fbd': 'Ubuntu Server 12.04.2 LTS for HVM Instances 64bit',
        'ami-c70360ae': 'Ubuntu Server 13.04 for HVM Instances 64bit',
        'ami-4cc7bb25': 'Microsoft Windows Server 2008 Base 64bit',
        'ami-dec2beb7': 'Microsoft Windows Server 2008 Base 32bit',
        'ami-90c4b8f9': 'Microsoft Windows Server 2008 R2 Base 64bit',
        'ami-86c6baef': 'Microsoft Windows Server 2008 R2 with SQL Server Express and IIS 64bit',
        'ami-9cc0bcf5': 'Microsoft Windows Server 2008 R2 with SQL Server Web 64bit',
        'ami-dac7bbb3': 'Microsoft Windows Server 2008 R2 with SQL Server Standard 64bit',
        'ami-60c0bc09': 'Microsoft Windows Server 2012 Base 64bit',
        'ami-acc7bbc5': 'Microsoft Windows Server 2012 with SQL Server Express 64bit',
        'ami-bac7bbd3': 'Microsoft Windows Server 2012 with SQL Server Web 64bit',
        'ami-d2c0bcbb': 'Microsoft Windows Server 2012 with SQL Server Standard 64bit',
    },

    'us-west-2': {
        'ami-0358ce33': 'Amazon Linux AMI 2013.03.1 64bit',
        'ami-1958ce29': 'Amazon Linux AMI 2013.03.1 32bit',
        'ami-5344d263': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-7944d249': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-e42da0d4': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-fe2da0ce': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-70f96e40': 'Ubuntu Server 12.04.2 LTS 64bit',
        'ami-0ef96e3e': 'Ubuntu Server 12.04.2 LTS 32bit',
        'ami-bf1d8a8f': 'Ubuntu Server 13.04 64bit',
        'ami-bd1d8a8d': 'Ubuntu Server 13.04 32bit',
        'ami-d75bcde7': 'Cluster Compute Amazon Linux AMI 2013.03.1 64bit',
        'ami-1344d223': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
        'ami-72f96e42': 'Ubuntu Server 12.04.2 LTS for Cluster Instances 64bit',
        'ami-203eb710': 'Cluster Instances HVM SUSE Linux Enterprise 11 64bit',
        'ami-a11d8a91': 'Ubuntu Server 13.04 for HVM Instances 64bit',
        'ami-715fcc41': 'Microsoft Windows Server 2008 Base 64bit',
        'ami-7b5ecd4b': 'Microsoft Windows Server 2008 Base 32bit',
        'ami-eb58cbdb': 'Microsoft Windows Server 2008 R2 Base 64bit',
        'ami-0f5fcc3f': 'Microsoft Windows Server 2008 R2 with SQL Server Express and IIS 64bit',
        'ami-5d5ecd6d': 'Microsoft Windows Server 2008 R2 with SQL Server Web 64bit',
        'ami-eb5fccdb': 'Microsoft Windows Server 2008 R2 with SQL Server Standard 64bit',
        'ami-855fccb5': 'Microsoft Windows Server 2012 Base 64bit',
        'ami-795fcc49': 'Microsoft Windows Server 2012 with SQL Server Express 64bit',
        'ami-e75fccd7': 'Microsoft Windows Server 2012 with SQL Server Web 64bit',
        'ami-2b5ecd1b': 'Microsoft Windows Server 2012 with SQL Server Standard 64bit',
    },
    'us-west-1': {
        'ami-3ffed17a': 'Amazon Linux AMI 2013.03.1 64bit',
        'ami-29fed16c': 'Amazon Linux AMI 2013.03.1 32bit',
        'ami-c7fad582': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-27fad562': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-c7144c82': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-37144c72': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-fe002cbb': 'Ubuntu Server 12.04.2 LTS 64bit',
        'ami-fc002cb9': 'Ubuntu Server 12.04.2 LTS 32bit',
        'ami-d383af96': 'Ubuntu Server 13.04 64bit',
        'ami-d183af94': 'Ubuntu Server 13.04 32bit',
        'ami-47fed102': 'Cluster Compute Amazon Linux AMI 2013.03.1 64bit',
        'ami-5dfad518': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
        'ami-c6486083': 'Microsoft Windows Server 2008 Base 64bit',
        'ami-d6496193': 'Microsoft Windows Server 2008 Base 32bit',
        'ami-76486033': 'Microsoft Windows Server 2008 R2 Base 64bit',
        'ami-c4486081': 'Microsoft Windows Server 2008 R2 with SQL Server Express and IIS 64bit',
        'ami-ec4961a9': 'Microsoft Windows Server 2008 R2 with SQL Server Web 64bit',
        'ami-4e49610b': 'Microsoft Windows Server 2008 R2 with SQL Server Standard 64bit',
        'ami-ac4860e9': 'Microsoft Windows Server 2012 Base 64bit',
        'ami-ce48608b': 'Microsoft Windows Server 2012 with SQL Server Express 64bit',
        'ami-40496105': 'Microsoft Windows Server 2012 with SQL Server Web 64bit',
        'ami-2e49616b': 'Microsoft Windows Server 2012 with SQL Server Standard 64bit',
    },
    'eu-west-1': {
        'ami-c7c0d6b3': 'Amazon Linux AMI 2013.03.1 64bit',
        'ami-ddc1d7a9': 'Amazon Linux AMI 2013.03.1 32bit',
        'ami-9bf6e0ef': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-23f6e057': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-a1d1e8d5': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-edd1e899': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-ce7b6fba': 'Ubuntu Server 12.04.2 LTS 64bit',
        'ami-c27b6fb6': 'Ubuntu Server 12.04.2 LTS 32bit',
        'ami-3d160149': 'Ubuntu Server 13.04 64bit',
        'ami-31160145': 'Ubuntu Server 13.04 32bit',
        'ami-d1c0d6a5': 'Cluster Compute Amazon Linux AMI 2013.03.1 64bit',
        'ami-71f6e005': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
        'ami-c87b6fbc': 'Ubuntu Server 12.04.2 LTS for HVM instances 64bit',
        'ami-011b1975': 'Cluster Instances HVM SUSE Linux Enterprise 11 64bit',
        'ami-3f16014b': 'Ubuntu Server 13.04 for HVM Instances 64bit',
        'ami-31d7cb45': 'Microsoft Windows Server 2008 Base 64bit',
        'ami-89d0ccfd': 'Microsoft Windows Server 2008 Base 32bit',
        'ami-25d7cb51': 'Microsoft Windows Server 2008 R2 Base 64bit',
        'ami-e3d7cb97': 'Microsoft Windows Server 2008 R2 with SQL Server Express and IIS 64bit',
        'ami-5dd1cd29': 'Microsoft Windows Server 2008 R2 with SQL Server Web 64bit',
        'ami-afd0ccdb': 'Microsoft Windows Server 2008 R2 with SQL Server Standard 64bit',
        'ami-b9d7cbcd': 'Microsoft Windows Server 2012 Base 64bit',
        'ami-2bd7cb5f': 'Microsoft Windows Server 2012 with SQL Server Express 64bit',
        'ami-95d7cbe1': 'Microsoft Windows Server 2012 with SQL Server Web 64bit',
        'ami-fbd0cc8f': 'Microsoft Windows Server 2012 with SQL Server Standard 64bit',
    },

    'ap-southeast-1': {
        'ami-fade91a8': 'Amazon Linux AMI 2013.03.1 64bit',
        'ami-ccde919e': 'Amazon Linux AMI 2013.03.1 32bit',
        'ami-40db9412': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-a6dc93f4': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-82d094d0': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-e2d094b0': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-64084736': 'Ubuntu Server 12.04.2 LTS 64bit',
        'ami-66084734': 'Ubuntu Server 12.04.2 LTS 32bit',
        'ami-2b511e79': 'Ubuntu Server 13.04 64bit',
        'ami-25511e77': 'Ubuntu Server 13.04 32bit',
        'ami-18de914a': 'Cluster Compute Amazon Linux AMI 2013.03.1 64bit',
        'ami-b4dc93e6': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
        'ami-d2aae380': 'Microsoft Windows Server 2008 Base 64bit',
        'ami-6eade43c': 'Microsoft Windows Server 2008 Base 32bit',
        'ami-d4aae386': 'Microsoft Windows Server 2008 R2 Base 64bit',
        'ami-f2aae3a0': 'Microsoft Windows Server 2008 R2 with SQL Server Express and IIS 64bit',
        'ami-0eade45c': 'Microsoft Windows Server 2008 R2 with SQL Server Web 64bit',
        'ami-60ade432': 'Microsoft Windows Server 2008 R2 with SQL Server Standard 64bit',
        'ami-98aae3ca': 'Microsoft Windows Server 2012 Base 64bit',
        'ami-d8aae38a': 'Microsoft Windows Server 2012 with SQL Server Express 64bit',
        'ami-b8aae3ea': 'Microsoft Windows Server 2012 with SQL Server Web 64bit',
        'ami-4cade41e': 'Microsoft Windows Server 2012 with SQL Server Standard 64bit',
    },
    'ap-northeast-1': {
        'ami-39b23d38': 'Amazon Linux AMI 2013.03.1 64bit',
        'ami-2db23d2c': 'Amazon Linux AMI 2013.03.1 32bit',
        'ami-e74dc2e6': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-d14dc2d0': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-e6d263e7': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-ded263df': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-fe6ceeff': 'Ubuntu Server 12.04.2 LTS 64bit',
        'ami-fc6ceefd': 'Ubuntu Server 12.04.2 LTS 32bit',
        'ami-6b26ab6a': 'Ubuntu Server 13.04 64bit',
        'ami-6926ab68': 'Ubuntu Server 13.04 32bit',
        'ami-2db33c2c': 'Cluster Compute Amazon Linux AMI 2013.03.1 64bit',
        'ami-b34edbb2': 'Cluster Instances HVM SUSE Linux Enterprise 11 64bit',
        'ami-8b4dc28a': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
        'ami-db48dcda': 'Microsoft Windows Server 2008 Base 64bit',
        'ami-294ade28': 'Microsoft Windows Server 2008 Base 32bit',
        'ami-0149dd00': 'Microsoft Windows Server 2008 R2 Base 64bit',
        'ami-0349dd02': 'Microsoft Windows Server 2008 R2 with SQL Server Express and IIS 64bit',
        'ami-634ade62': 'Microsoft Windows Server 2008 R2 with SQL Server Web 64bit',
        'ami-174ade16': 'Microsoft Windows Server 2008 R2 with SQL Server Standard 64bit',
        'ami-4549dd44': 'Microsoft Windows Server 2012 Base 64bit',
        'ami-e148dce0': 'Microsoft Windows Server 2012 with SQL Server Express 64bit',
        'ami-7f49dd7e': 'Microsoft Windows Server 2012 with SQL Server Web 64bit',
        'ami-094ade08': 'Microsoft Windows Server 2012 with SQL Server Standard 64bit',
    },
    'ap-southeast-2': {
        'ami-d16bfbeb': 'Amazon Linux AMI 2013.03.1 64bit',
        'ami-dd6bfbe7': 'Amazon Linux AMI 2013.03.1 32bit',
        'ami-836dfdb9': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-a56dfd9f': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-04ea7a3e': 'Ubuntu 12.04.2 LTS Server 64bit',
        'ami-06ea7a3c': 'Ubuntu 12.04.2 LTS Server 32bit',
        'ami-84a333be': 'Ubuntu 13.04 Server 64bit',
        'ami-86a333bc': 'Ubuntu 13.04 Server 32bit',
        'ami-14a5332e': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-24a5331e': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-876bfbbd': 'Cluster Compute Amazon Linux AMI 2013.03.1 64bit',
        'ami-b36dfd89': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
        'ami-da3cafe0': 'Microsoft Windows Server 2008 Base 64bit',
        'ami-aa23b090': 'Microsoft Windows Server 2008 Base 32bit',
        'ami-dc3cafe6': 'Microsoft Windows Server 2008 R2 Base 64bit',
        'ami-c43caffe': 'Microsoft Windows Server 2008 R2 with SQL Server Express and IIS 64bit',
        'ami-9823b0a2': 'Microsoft Windows Server 2008 R2 with SQL Server Web 64bit',
        'ami-bc23b086': 'Microsoft Windows Server 2008 R2 with SQL Server Standard 64bit',
        'ami-1223b028': 'Microsoft Windows Server 2012 Base 64bit',
        'ami-d23cafe8': 'Microsoft Windows Server 2012 with SQL Server Express 64bit',
        'ami-7823b042': 'Microsoft Windows Server 2012 with SQL Server Web 64bit',
        'ami-4623b07c': 'Microsoft Windows Server 2012 with SQL Server Standard 64bit',
    },
    'sa-east-1': {
        'ami-5253894f': 'Amazon Linux AMI 2013.03.1 64bit',
        'ami-58538945': 'Amazon Linux AMI 2013.03.1 32bit',
        'ami-52518b4f': 'Red Hat Enterprise Linux 6.4 64bit',
        'ami-22518b3f': 'Red Hat Enterprise Linux 6.4 32bit',
        'ami-ca61bed7': 'SUSE Linux Enterprise Server 11 64bit',
        'ami-d261becf': 'SUSE Linux Enterprise Server 11 32bit',
        'ami-a3da00be': 'Ubuntu Server 12.04.2 LTS 64bit',
        'ami-a1da00bc': 'Ubuntu Server 12.04.2 LTS 32bit',
        'ami-28e43e35': 'Ubuntu Server 13.04 64bit',
        'ami-2ee43e33': 'Ubuntu Server 13.04 32bit',
        'ami-38538925': 'Cluster Compute Amazon Linux AMI 2013.03.1 64bit',
        'ami-28518b35': 'Red Hat Enterprise Linux 6.4 for Cluster Instances 64bit',
        'ami-f000a5ed': 'Microsoft Windows Server 2008 Base 64bit',
        'ami-fa00a5e7': 'Microsoft Windows Server 2008 Base 32bit',
        'ami-c200a5df': 'Microsoft Windows Server 2008 R2 Base 64bit',
        'ami-c600a5db': 'Microsoft Windows Server 2008 R2 with SQL Server Express and IIS 64bit',
        'ami-de00a5c3': 'Microsoft Windows Server 2008 R2 with SQL Server Web 64bit',
        'ami-c000a5dd': 'Microsoft Windows Server 2008 R2 with SQL Server Standard 64bit',
        'ami-1a03a607': 'Microsoft Windows Server 2012 Base 64bit',
        'ami-1203a60f': 'Microsoft Windows Server 2012 with SQL Server Express 64bit',
        'ami-0e03a613': 'Microsoft Windows Server 2012 with SQL Server Web 64bit',
        'ami-0c03a611': 'Microsoft Windows Server 2012 with SQL Server Standard 64bit',
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
