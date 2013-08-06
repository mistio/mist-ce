"""Basic configuration and mappings"""
from libcloud.compute.types import Provider
from libcloud.compute.types import NodeState
from ec2_images import EC2_IMAGES

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
