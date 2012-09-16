"""Configure which backends you will use here"""
from libcloud.compute.types import Provider
from libcloud.compute.types import NodeState


STATES = {
    NodeState.RUNNING: 'running',
    NodeState.REBOOTING: 'rebooting',
    NodeState.TERMINATED: 'terminated',
    NodeState.PENDING: 'pending',
    # we assume unknown means stopped, especially for the EC2 case
    NodeState.UNKNOWN: 'stopped'
}


BACKENDS = [
    {'provider': Provider.EC2,
     'title': 'EC2',
     'id': 'AKIAIHIF64EDA6VJDISQ',
     'secret': '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',
     'poll_interval': 10000,
     'enabled': True,
     },

    {'provider': Provider.RACKSPACE,
     'title': 'RackSpace',
     'id': 'unwebme',
     'secret': 'fb68dcedaa4e7f36b5bad4dc7bc28bed',
     'poll_interval': 10000,
     'enabled': True,
     },

    {'provider' : Provider.OPENSTACK,
     'title' : 'Trystack',
     'id' : 'facebook624567501',
     'secret' : 'j2dq5nhr',
     'auth_url': 'https://nova-api.trystack.org:5443/v2.0',
     'auth_version' : '2.0_password',
     'poll_interval' : 10000,
     'enabled': True,
     },

    {'provider': Provider.LINODE,
     'title': 'Linode',
     'id': 'unwebme',
     'secret': 'RLps91fmdjkOj8x7bFjJO2lycZggNPhcS2hzmoU3H97YhjED6Crk8056F3FEoaNB',
     'poll_interval': 10000,
     'enabled': True,
     },
]


EC2_PROVIDERS = (
    Provider.EC2,
    Provider.EC2_EU,
    Provider.EC2_US_EAST,
    Provider.EC2_AP_NORTHEAST,
    Provider.EC2_EU_WEST,
    Provider.EC2_US_WEST,
    Provider.EC2_AP_SOUTHEAST,
    Provider.EC2_SA_EAST,
    Provider.EC2_US_WEST_OREGON
)


# Base AMIs for us-east AMAZON, using 64bit versions
EC2_IMAGES = {
    'ami-aecd60c7': 'Amazon Linux 2012.03',
    'ami-cc5af9a5': 'RedHat Enterprise Linux 6.3',
    'ami-ca32efa3': 'SUSE Linux Enterprise Server 11',
    'ami-82fa58eb': 'Ubuntu Server 12.04 LTS',
    'ami-d99e37b0': 'Ubuntu Server 11.10',
    'ami-eccf6285': 'Cluster GPU Amazon Linux AMI 2012.03',
    'ami-a8cd60c1': 'Cluster Compute Amazon Linux AMI 2012.03',
    'ami-98fa58f1': 'Ubuntu Server 12.04 LTS for Cluster Instances',
    'ami-db9e37b2': 'Ubuntu Server 11.10 for Cluster Instances'
}


EC2_KEY_NAME = 'mistio'


EC2_SECURITYGROUP= {
    'name': 'mistio',
    'description': 'Security group created by mist.io'
}


# Base images for Rackspace
RACKSPACE_IMAGES = {
 '118': 'CentOS 6.0',
 '125': 'Ubuntu 12.04 LTS',
 '104': 'Debian 6',
 '107': 'FreeBSD 9.0',
 '127': 'CentOS 6.3',
 '109': 'openSUSE 12',
 '110': 'Red Hat Enterprise Linux 5.5',
 '114': 'CentOS 5.6',
 '112': 'Ubuntu 10.04 LTS',
 '103': 'Debian 5',
 '122': 'CentOS 6.2',
 '100': 'Arch 2012.08',
 '111': 'Red Hat Enterprise Linux 6',
 '120': 'Fedora 16',
 '115': 'Ubuntu 11.04',
 '116': 'Fedora 15',
 '108': 'Gentoo 12.3',
 '126': 'Fedora 17',
 '121': 'CentOS 5.8',
 '119': 'Ubuntu 11.10'
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


KEYPAIRS = [
    ("""ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEA7qHnqOLy9hWcP5W+iADJmkIK9n5veATDf1hU2TEHyr5/gRP2Ykto7Am7iHJdtf0ym+Y5q5fzzOdQS9AJ8mTPouHM8dXWhIkZxfrK4Ylawr/P3jBXA6Aq2EbxYmFFTPQ5PAAEwWb9ihCt+nt1EuVbEAYgSy27KYaXJPd+mv4gmcmw24CG0RIRPjl4t90ccf2i3FRP2Qn0SKwr3RafV7yH7xNjrT0Z49G32SBuQqhBHPUsFvxGeoHn4LeuXs0RsPY04isQ6OxbCZw8oQp3vU7hUvJxLaIUIbL4L1jVDZ0l4Dm8ba1BOF+VXI9ZVSEpEWVwx1TXyt0hqnknCz2nZjwVeQ== dimo@dimos-MacBook-Pro.local""",
     """-----BEGIN RSA PRIVATE KEY-----
        MIIEowIBAAKCAQEA7qHnqOLy9hWcP5W+iADJmkIK9n5veATDf1hU2TEHyr5/gRP2
        Ykto7Am7iHJdtf0ym+Y5q5fzzOdQS9AJ8mTPouHM8dXWhIkZxfrK4Ylawr/P3jBX
        A6Aq2EbxYmFFTPQ5PAAEwWb9ihCt+nt1EuVbEAYgSy27KYaXJPd+mv4gmcmw24CG
        0RIRPjl4t90ccf2i3FRP2Qn0SKwr3RafV7yH7xNjrT0Z49G32SBuQqhBHPUsFvxG
        eoHn4LeuXs0RsPY04isQ6OxbCZw8oQp3vU7hUvJxLaIUIbL4L1jVDZ0l4Dm8ba1B
        OF+VXI9ZVSEpEWVwx1TXyt0hqnknCz2nZjwVeQIBIwKCAQEAuBZ/gkiszHcSImwz
        5UJvouJ9fFLoRqSWz/OvKzRzuajmBH0dJ0F801f3EXzL8sqjYlKEQospyfRFQcxf
        cdi9bwX13yFNtrLn/yCN4S9x5rE59Iuw1ulFn4cvPUO5Hht8nAADqyOQYzFwROLl
        SRdU4HnBJA1V3jSge5paWk8DNM1M0+aHVgcbf1vexLXQerg6bFsJVfNGRrN1iz1z
        T1dmiqtj5xHNSoah8e95eva3YU97zdvakT4iBoRx4RBW/P0xc6yYgoMemwLXoOHz
        75hZMr8MMUE8zaj7S/eL2DsVcrbcHELgunBde5ktaAifoxYVm1DXMFGBtDClhWNv
        RRrXjwKBgQD8wSS/WQvGtTjrGS1yAr+peTXqVNmj3/rp13m3QQMMb8Ki8HCMf0iD
        C04PRFu1Gd3Ur+lbGJXvXW8xsT7XHL3hbMHXoDXziPLfw8mlqcQm98U7InOtmcuy
        6h8/lcsKigzDYzFYhJF7VGQEfbkYA0qtdT85EpvEm/qJsbPqPtygawKBgQDxslbf
        JPOYqwS4sqeJOHUV8xoqAc8IRe6NNKwQPhjHKl+eDIYRfzAED3YD46Ru48NFI1S9
        F2wFS21kUOrTTEVyK1CZgxXqftUV8EHYO8U9P1IAUBK45ZpxSwunTI7/iJVEAksk
        M+ccHBjqkuscMTcGIHPwEVL3StdCC3EjbvpKqwKBgQCJNaY7/SOmYmC6I5xT1Zs+
        viSVJr9KVQSNkjrCkQGnqmJYc+VTlY3DeypgDyp4QT3ofMCB6MZr/4WBYDgOYA9O
        fN5B2qDx60IEcZlZ7nHMAtjIVIfwhrBocHddCCxkzpk23hN5MgXVPHDPPO9zb4BP
        iMqMslSPTVwe3M9h55xXFQKBgHVlQCM91WdpAksU8kn22cjVKfclcy/nc94vhsYP
        iGC8z1tlKy0R5B86taoeHKrjp/0CiD6WWQnizruyRiwdu1S18/LKpD6yogNXcHBX
        i7AI0A7HzpRSQ7Ne9wgd3w5m6Wos/+0DRF4cRp3SVPBvrQL50emiA7nxJrmtyT0Y
        pXS5AoGBAMB+5K4IadmBIyRuzAyScwUBk9Sy800BLabCvMfVIX9cRb+/o0k0fedi
        0pROU5zeZkNATRwXyD0F3NnxW8TJcvW0xtaaqiHpSWiItqqIDY6ySb2aC4k43Dyy
        0HfyGamX7rJIdcyxEzXChiG7nypZAgr6qFpsilcuChMj3kIov6c0
        -----END RSA PRIVATE KEY-----"""),
]
