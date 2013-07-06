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
    Provider.EC2_SA_EAST,
    Provider.EC2_US_WEST_OREGON
)


# Base AMIs
EC2_IMAGES = {
    # EC2_US_EAST == EC2_US
    Provider.EC2_US_EAST: {
        'ami-a0cd60c9': 'Amazon Linux AMI 2012.03 32bit',
        'ami-aecd60c7': 'Amazon Linux AMI 2012.03 64bit',
        'ami-d258fbbb': 'Red Hat Enterprise Linux 6.3 32bit',
        'ami-cc5af9a5': 'Red Hat Enterprise Linux 6.3 64bit',
        'ami-0c32ef65': 'SUSE Linux Enterprise Server 11 SP2 32bit',
        'ami-ca32efa3': 'SUSE Linux Enterprise Server 11 SP2 64bit',
        'ami-057bcf6c': 'Ubuntu Server 12.04.1 LTS 32bit',
        'ami-82fa58eb': 'Ubuntu Server 12.04.1 LTS 64bit',
        'ami-c19e37a8': 'Ubuntu Server 11.10 32bit',
        'ami-d99e37b0': 'Ubuntu Server 11.10 64bit',
        'ami-e9ca7f80': 'Microsoft Windows 2008 R1 SP2 Base 32bit',
        'ami-71b50018': 'Microsoft Windows 2008 R1 SP2 Base 64bit',
        'ami-cbc87da2': 'Microsoft Windows 2008 R2 SP1 Base 64bit',
        'ami-4fcb7e26': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Express and IIS',
        'ami-b5c87ddc': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Web',
        'ami-83c87dea': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Standard',
        'ami-c02df0a9': 'Cluster Instances HVM SUSE Linux Enterprise 11 SP2',
        'ami-eccf6285': 'Cluster GPU Amazon Linux AMI 2012.03',
        'ami-a8cd60c1': 'Cluster Compute Amazon Linux AMI 2012.03',
        'ami-91c97cf8': 'Microsoft Windows 2008 R2 SP1 for Cluster Instances',
        'ami-a3c87dca': 'Microsoft Windows 2008 R2 SP1 with SQL Server for Cluster Instances',
        'ami-98fa58f1': 'Ubuntu Server 12.04.1 LTS for Cluster Instances',
        'ami-db9e37b2': 'Ubuntu Server 11.10 for Cluster Instances'
    },
    Provider.EC2_US_WEST_OREGON: {
        'ami-46da5576': 'Amazon Linux AMI 2012.03 32bit',
        'ami-48da5578': 'Amazon Linux AMI 2012.03 64bit',
        'ami-8625a9b6': 'Red Hat Enterprise Linux 6.3 32bit',
        'ami-8a25a9ba': 'Red Hat Enterprise Linux 6.3 64bit',
        'ami-fe2da0ce': 'SUSE Linux Enterprise Server 11 SP2 32bit',
        'ami-e42da0d4': 'SUSE Linux Enterprise Server 11 SP2 64bit',
        'ami-1add532a': 'Ubuntu Server 12.04.1 LTS 32bit',
        'ami-1cdd532c': 'Ubuntu Server 12.04.1 LTS 64bit',
        'ami-b649c686': 'Ubuntu Server 11.10 32bit',
        'ami-b849c688': 'Ubuntu Server 11.10 64bit',
        'ami-ee24abde': 'Microsoft Windows 2008 R1 SP2 Base 32bit',
        'ami-0a23ac3a': 'Microsoft Windows 2008 R1 SP2 Base 64bit',
        'ami-dc24abec': 'Microsoft Windows 2008 R2 SP1 Base 64bit',
        'ami-3423ac04': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Express and IIS 64bit',
        'ami-3822ad08': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Web 64bit',
        'ami-4a23ac7a': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Standard',
        'ami-44da5574': 'Cluster Compute Amazon Linux AMI 2012.03',
        'ami-1a23ac2a': 'Microsoft Windows 2008 R2 SP1 for Cluster Instances 64bit',
        'ami-3a22ad0a': 'Microsoft Windows 2008 R2 SP1 with SQL Server for Cluster Instances 64bit',
        'ami-cada54fa': 'Ubuntu Server 12.04.1 LTS for Cluster Instances',
    },
    # California
    Provider.EC2_US_WEST: {
        'ami-7d4c6938': 'Amazon Linux AMI 2012.03 32bit',
        'ami-734c6936': 'Amazon Linux AMI 2012.03 64bit',
        'ami-53f4ae16': 'Red Hat Enterprise Linux 6.3 32bit',
        'ami-51f4ae14': 'Red Hat Enterprise Linux 6.3 64bit',
        'ami-37144c72': 'SUSE Linux Enterprise Server 11 SP2 32bit',
        'ami-c7144c82': 'SUSE Linux Enterprise Server 11 SP2 64bit',
        'ami-d50c2890': 'Ubuntu Server 12.04.1 LTS 32bit',
        'ami-d70c2892': 'Ubuntu Server 12.04.1 LTS 64bit',
        'ami-c9d0f58c': 'Ubuntu Server 11.10 32bit',
        'ami-cbd0f58e': 'Ubuntu Server 11.10 64bit',
        'ami-5d5d7918': 'Microsoft Windows 2008 R1 SP2 Base 32bit',
        'ami-315d7974': 'Microsoft Windows 2008 R1 SP2 Base 64bit',
        'ami-635d7926': 'Microsoft Windows 2008 R2 SP1 Base 64bit',
        'ami-7d5d7938': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Express and IIS 64bit',
        'ami-3b5d797e': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Web 64bit',
        'ami-fb5d79be': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Standard',
    },
    Provider.EC2_AP_SOUTHEAST: {
        'ami-220b4a70': 'Amazon Linux AMI 2012.03 32bit',
        'ami-3c0b4a6e': 'Amazon Linux AMI 2012.03 64bit',
        'ami-a0e4a2f2': 'Red Hat Enterprise Linux 6.3 32bit',
        'ami-24e5a376': 'Red Hat Enterprise Linux 6.3 64bit',
        'ami-e2d094b0': 'SUSE Linux Enterprise Server 11 SP2 32bit',
        'ami-82d094d0': 'SUSE Linux Enterprise Server 11 SP2 64bit',
        'ami-e4db9ab6': 'Ubuntu Server 12.04.1 LTS 32bit',
        'ami-eadb9ab8': 'Ubuntu Server 12.04.1 LTS 64bit',
        'ami-745e1f26': 'Ubuntu Server 11.10 32bit',
        'ami-7a5e1f28': 'Ubuntu Server 11.10 64bit',
        'ami-44b8f916': 'Microsoft Windows 2008 R1 SP2 Base 32bit',
        'ami-d8b8f98a': 'Microsoft Windows 2008 R1 SP2 Base 64bit',
        'ami-c0b8f992': 'Microsoft Windows 2008 R2 SP1 Base 64bit',
        'ami-96b8f9c4': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Express and IIS 64bit',
        'ami-90b8f9c2': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Web 64bit',
        'ami-3cbbfa6e': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Standard 64bit',
    },
    Provider.EC2_AP_NORTHEAST: {
        'ami-2a19aa2b': 'Amazon Linux AMI 2012.03 32bit',
        'ami-2819aa29': 'Amazon Linux AMI 2012.03 64bit',
        'ami-4e53e04f': 'Red Hat Enterprise Linux 6.3 32bit',
        'ami-5453e055': 'Red Hat Enterprise Linux 6.3 64bit',
        'ami-ded263df': 'SUSE Linux Enterprise Server 11 SP2 32bit',
        'ami-e6d263e7': 'SUSE Linux Enterprise Server 11 SP2 64bit',
        'ami-bc47fabd': 'Ubuntu Server 12.04.1 LTS 32bit',
        'ami-c047fac1': 'Ubuntu Server 12.04.1 LTS 64bit',
        'ami-8044f681': 'Ubuntu Server 11.10 32bit',
        'ami-8244f683': 'Ubuntu Server 11.10 64bit',
        'ami-b08e33b1': 'Microsoft Windows 2008 R1 SP2 Base 32bit',
        'ami-24893425': 'Microsoft Windows 2008 R1 SP2 Base 64bit',
        'ami-f48e33f5': 'Microsoft Windows 2008 R2 SP1 Base 64bit',
        'ami-5c89345d': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Express and IIS 64bit',
        'ami-6a89346b': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Web 64bit',
        'ami-e68835e7': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Standard 64bit',
    },
    Provider.EC2_SA_EAST: {
        'ami-f836e8e5': 'Amazon Linux AMI 2012.03 32bit',
        'ami-fe36e8e3': 'Amazon Linux AMI 2012.03 64bit',
        'ami-4e07d953': 'Red Hat Enterprise Linux 6.3 32bit',
        'ami-4807d955': 'Red Hat Enterprise Linux 6.3 64bit',
        'ami-d261becf': 'SUSE Linux Enterprise Server 11 SP2 32bit',
        'ami-ca61bed7': 'SUSE Linux Enterprise Server 11 SP2 64bit',
        'ami-32845d2f': 'Ubuntu Server 12.04.1 LTS 32bit',
        'ami-2e845d33': 'Ubuntu Server 12.04.1 LTS 64bit',
        'ami-6a4b9577': 'Ubuntu Server 11.10 32bit',
        'ami-644b9579': 'Ubuntu Server 11.10 64bit',
        'ami-6090497d': 'Microsoft Windows 2008 R1 SP2 Base 32bit',
        'ami-cc9049d1': 'Microsoft Windows 2008 R1 SP2 Base 64bit',
        'ami-a89049b5': 'Microsoft Windows 2008 R2 SP1 Base 64bit',
        'ami-c69049db': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Express and IIS 64bit',
        'ami-fa9049e7': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Web 64bit',
        'ami-0c934a11': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Standard 64bit',
    },
    # EC2_EU_WEST == EC2_EU
    Provider.EC2_EU_WEST: {
        'ami-61555115': 'Amazon Linux AMI 2012.03 32bit',
        'ami-6d555119': 'Amazon Linux AMI 2012.03 64bit',
        'ami-8ff2f7fb': 'Red Hat Enterprise Linux 6.3 32bit',
        'ami-8bf2f7ff': 'Red Hat Enterprise Linux 6.3 64bit',
        'ami-edd1e899': 'SUSE Linux Enterprise Server 11 SP2 32bit',
        'ami-a1d1e8d5': 'SUSE Linux Enterprise Server 11 SP2 64bit',
        'ami-d1595fa5': 'Ubuntu Server 12.04.1 LTS 32bit',
        'ami-db595faf': 'Ubuntu Server 12.04.1 LTS 64bit',
        'ami-9bbfbbef': 'Ubuntu Server 11.10 32bit',
        'ami-85bfbbf1': 'Ubuntu Server 11.10 64bit',
        'ami-d19691a5': 'Microsoft Windows 2008 R1 SP2 Base 32bit',
        'ami-0f95927b': 'Microsoft Windows 2008 R1 SP2 Base 64bit',
        'ami-6995921d': 'Microsoft Windows 2008 R2 SP1 Base 64bit',
        'ami-51959225': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Express and IIS',
        'ami-b19592c5': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Web',
        'ami-cb9493bf': 'Microsoft Windows Server 2008 R2 SP1 with SQL Server Standard',
        'ami-39f8fe4d': 'Cluster GPU Amazon Linux AMI 2012.03 64bit',
        'ami-67555113': 'Cluster Compute Amazon Linux AMI 2012.03',
        'ami-879691f3': 'Microsoft Windows 2008 R2 SP1 for Cluster Instances',
        'ami-23959257': 'Microsoft Windows 2008 R2 SP1 with SQL Server for Cluster Instances',
        'ami-c5595fb1': 'Ubuntu Server 12.04.1 LTS for Cluster Instances 64bit',
    },
}


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
                       {'title': 'EC2 EU WEST',
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
                       ]
