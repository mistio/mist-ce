'''Configure which backends you will use here'''
from libcloud.compute.types import Provider


PUBLIC_KEYS = {}
#set your public keys here. Example:
PUBLIC_KEYS['user'] = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDM4ptvXl9/+15Tq4grtiJnHEs3mQW2e76ikIcMTMjxKtZdOB5i/TSyElEtKvBJpv7Nk1OIYgmKvUTDcwwxkY2GjtagoKAaPR1r1wCvVlWYac2doL4P2D5/fsOf2uMj6+lhPYT7Ubvod2AsgJx1Tyh0OFdaPMCoZy7FR2P+fOjjC6KTMPaHyWOvEfH/rxnBpNyzezwO3keBIOG48shW6ERagg+Hy9bfqqxNziw7iCaBqUabyv5AZYNrtGqZAx/kVO4Kqob3umAPtFJu2NDFA9+ugV8edF7U8GtZUZXSwO5nO0IWvxAUrsG0IezJLR42DPm7fBdRsmfZ/Dp9R2nNZ0nr user@user"
BACKENDS = [
    {'provider' : Provider.EC2,
     'title' : 'EC2',
     'id' : 'AKIAIHIF64EDA6VJDISQ',
     'secret' : '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',
     'poll_interval' : 10000,
     'public_key': PUBLIC_KEYS['user'],
     'enabled': True,
     },

    {'provider' : Provider.RACKSPACE,
     'title' : 'RackSpace',
     'id' : 'unwebme',
     'secret' : 'fb68dcedaa4e7f36b5bad4dc7bc28bed',
     'poll_interval' : 10000,
     'public_key': PUBLIC_KEYS['user'],
     'enabled': True,
     },
]

#BACKENDS = [
#    {'provider' : Provider.EC2,
#     'title' : 'EC2',
#     'id' : 'userid',
#     'secret' : 'secret',
#     'poll_interval' : 10000,
#     'public_key': PUBLIC_KEYS['user'],
#     },

#    {'provider' : Provider.RACKSPACE,
#     'title' : 'RackSpace',
#     'id' : 'userid',
#     'secret' : 'secret',
#     'poll_interval' : 10000,
#     'public_key': PUBLIC_KEYS['user'],
#     },
#    ]

# Base AMIs for us-east AMAZON
BASE_EC2_AMIS = {
    'ami-e565ba8c': "Amazon Linux",
    'ami-41d00528': 'RedHat Enterprise Linux',
    'ami-ca32efa3': 'SUSE Linux',
    'ami-a29943cb': 'Ubuntu',
    'ami-a6ba1ecf': 'Microsoft Windows Server 2008 Base'
}
