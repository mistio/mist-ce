import uuid

import mongoengine as me

from mist.io.clouds.models import Cloud
import mist.io.exceptions
import mist.io.clouds.controllers.network.controllers
from mist.io.networks.controllers import NetworkController, SubnetController

NETWORKS = {}
SUBNETS = {}


def _populate_class_mapping(mapping, class_suffix, base_class):
    """Populates a mapping that matches a provider name with its provider-specific model classes"""
    for key, value in globals().items():
        if key.endswith(class_suffix) and key != class_suffix:
            value = globals()[key]
            if issubclass(value, base_class) and value is not base_class:
                mapping[value._controller_cls.provider] = value


class Network(me.Document):
    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    network_id = me.StringField(required=True)
    title = me.StringField()
    cloud = me.ReferenceField(Cloud, required=True)
    description = me.StringField()

    extra = me.DictField()

    _controller_cls = None

    meta = {
        'allow_inheritance': True,
        'collection': 'networks',
        'indexes': [
            {
                'fields': ['cloud', 'network_id'],
                'sparse': False,
                'unique': True,
                'cls': False,
            },
        ],
    }

    def __init__(self, *args, **kwargs):
        super(Network, self).__init__(*args, **kwargs)
        # Set attribute `ctl` to an instance of the appropriate controller.
        self.ctl = NetworkController(self)
        # Calculate and store network type specific fields.
        self._network_specific_fields = [field for field in type(self)._fields if field not in Network._fields]

    @classmethod
    def add(cls, cloud,  name='', description='', object_id='', **kwargs):

        network = cls(title=name,
                      cloud=cloud,
                      description=description)

        if object_id:
            network.id = object_id

        network.ctl.create_network(**kwargs)

        return network

    def as_dict(self):
        netdict = {'name': self.title,
                   'id': self.id,
                   'description': self.description,
                   'network_id': self.network_id,
                   'cloud': self.cloud.id}

        netdict.update({key: getattr(self, key) for key in self._network_specific_fields})

        return netdict

    def __repr__(self):
        return '<Network id:{id}, Title:{title}, Description={description}, Cloud:{cloud},' \
               'Cloud API id:{network_id}>'.format(id=self.id,
                                                 title=self.title,
                                                 description=self.description,
                                                 cloud=self.cloud,
                                                 network_id=self.network_id)

    def __str__(self):
        return '{class_name} {title} ({id})'.format(class_name=self.__class__.__name__,
                                                    title=self.title,
                                                    id=self.id)


class AmazonNetwork(Network):
    state = me.StringField()
    cidr = me.StringField()
    instance_tenancy = me.StringField(choices=('default', 'private'))

    _controller_cls = mist.io.clouds.controllers.network.controllers.AmazonNetworkController


class GoogleNetwork(Network):
    mode = me.StringField()
    cidr = me.StringField()
    gateway_ip = me.StringField()

    _controller_cls = mist.io.clouds.controllers.network.controllers.GoogleNetworkController


class OpenStackNetwork(Network):
    admin_state_up = me.BooleanField()
    shared = me.BooleanField

    _controller_cls = mist.io.clouds.controllers.network.controllers.OpenStackNetworkController


class Subnet(me.Document):
    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    subnet_id = me.StringField(required=True)
    title = me.StringField()
    cidr = me.StringField()
    network = me.ReferenceField('Network', required=True, reverse_delete_rule=me.CASCADE)
    description = me.StringField()

    extra = me.DictField()

    meta = {
        'allow_inheritance': True,
        'collection': 'subnets',
        'indexes': [
            {
                'fields': ['network', 'subnet_id'],
                'sparse': False,
                'unique': True,
                'cls': False,
            },
        ],
    }

    def __init__(self, *args, **kwargs):
        super(Subnet, self).__init__(*args, **kwargs)
        # Set attribute `ctl` to an instance of the appropriate controller.

        self.ctl = SubnetController(self)
        # Calculate and store subnet type specific fields.
        self._subnet_specific_fields = [field for field in type(self)._fields
                                        if field not in Subnet._fields]

    @classmethod
    def add(cls, network,  name='', description='', object_id='', **kwargs):

        subnet = cls(title=name,
                     network=network,
                     description=description)

        if object_id:
            subnet.id = object_id

        subnet.ctl.create_subnet(**kwargs)

        return subnet

    def as_dict(self):
        netdict = {'name': self.title,
                   'id': self.id,
                   'description': self.description,
                   'subnet_id': self.subnet_id,
                   'cloud': self.network.cloud.id,
                   'cidr': self.cidr,
                   'network': self.network.id}

        netdict.update({key: getattr(self, key) for key in self._subnet_specific_fields})

        return netdict

    def __repr__(self):
        return '<Subnet id:{id}, Title:{title}  Description={description}, Cloud API id:{subnet_id},' \
               ' of Network:{parent_network}>'.format(id=self.id,
                                                      title=self.title,
                                                      description=self.description,
                                                      subnet_id=self.subnet_id,
                                                      parent_network=self.network)

    def __str__(self):
        return '{class_name} {title} ({id})'.format(class_name=self.__class__.__name__,
                                                    title=self.title,
                                                    id=self.id)


class AmazonSubnet(Subnet):
    available_ips = me.IntField()
    zone = me.StringField()

    _controller_cls = mist.io.clouds.controllers.network.controllers.AmazonNetworkController


class GoogleSubnet(Subnet):
    region = me.StringField()
    gateway_ip = me.StringField()

    _controller_cls = mist.io.clouds.controllers.network.controllers.GoogleNetworkController


class OpenStackSubnet(Subnet):
    enable_dhcp = me.BooleanField()
    dns_nameservers = me.ListField()
    allocation_pools = me.ListField()
    gateway_ip = me.StringField()

    _controller_cls = mist.io.clouds.controllers.network.controllers.OpenStackNetworkController


_populate_class_mapping(NETWORKS, 'Network', Network)
_populate_class_mapping(SUBNETS, 'Subnet', Subnet)
