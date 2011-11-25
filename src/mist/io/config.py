'''Configure which backends you will use here'''
from libcloud.compute.types import Provider


BACKENDS = [
    {'provider' : Provider.OPENSTACK,
     'title' : 'MOP OpenStack',
     'id' : 'novaadmin',
     'host': '147.102.2.156',
     'auth_url': 'http://147.102.2.156:8774/v1.1',
     'auth_version' : '1.0',
     'secret' : '68fc6627-20f1-4082-b99e-98a029d7499d',
     'poll_interval' : 10000,
     },

    {'provider' : Provider.EC2,
     'title' : 'Amazon EC2',
     'id' : 'AKIAIHIF64EDA6VJDISQ',
     'secret' : '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',
     'poll_interval' : 10000,
     },

    {'provider' : Provider.RACKSPACE,
     'title' : 'RackSpace Cloud',
     'id' : 'unwebme',
     'secret' : 'fb68dcedaa4e7f36b5bad4dc7bc28bed',
     'poll_interval' : 10000,
     },
    ]
