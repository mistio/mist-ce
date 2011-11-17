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
     'id' : 'AKIAJEEVXG4DN32QJLWA',
     'secret' : '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',
     'poll_interval' : 5000,     
     },
    ]
