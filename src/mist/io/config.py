from libcloud.compute.types import Provider


BACKENDS = [
#    {'provider' : Provider.OPENSTACK,
#     'title' : 'MOP OpenStack',
#     'id' : 'unweb',
#     'host': '147.102.2.135',
#     'auth_url': 'http://147.102.2.135',
#     'secret' : '44f94619-8af5-43a6-87b0-360bbce2b38c'},
    
    {'provider' : Provider.EC2,
     'title' : 'Amazon EC2',
     'id' : 'AKIAIHIF64EDA6VJDISQ',
     'secret' : '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',
     'poll_interval' : 5000,     
     },
    
    {'provider' : Provider.RACKSPACE,
     'title' : 'RackSpace Cloud',
     'id' : 'unwebme',
     'secret' : 'fb68dcedaa4e7f36b5bad4dc7bc28bed',
     'poll_interval' : 5000,
     },
    ]
