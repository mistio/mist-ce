import uuid
import logging

import mongoengine as me

from mist.io.clouds.models import Cloud
from mist.io.exceptions import RequiredParameterMissingError
from mist.io.networks.controllers import NetworkController, SubnetController


log = logging.getLogger(__name__)


NETWORKS = {}
SUBNETS = {}


def _populate_class_mapping(mapping, class_suffix, base_class):
    """Populates a mapping that matches a provider name with its provider-specific model classes"""
    for key, value in globals().items():
        if key.endswith(class_suffix) and key != class_suffix:
            value = globals()[key]
            if issubclass(value, base_class) and value is not base_class:
                mapping[value.provider] = value


class Network(me.Document):
    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    network_id = me.StringField(required=True)
    title = me.StringField(required=True)
    cloud = me.ReferenceField(Cloud, required=True)
    cidr = me.StringField()  # Cannot be required, some drivers do not provide it
    gateway_ip = me.StringField()  # Cannot be required, some drivers do not provide it
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
    def add(cls, title, cloud, description='', object_id='', create_on_cloud=True, **kwargs):

        if not title:
            raise RequiredParameterMissingError('title')
        if not cloud:
            raise RequiredParameterMissingError('cloud')

        network = cls(title=title,
                      cloud=cloud,
                      description=description)

        if object_id:
            network.id = object_id

        if create_on_cloud:
            network.ctl.create_network(**kwargs)
        return network

    def as_dict(self):
        netdict = {'name': self.title,
                   'id': self.id,
                   'description': self.description,
                   'network_id': self.network_id}

        netdict.update({key: getattr(self, key) for key in self._network_specific_fields})

        return netdict

    def __repr__(self):
        return '<Network id:{id}, Title:{title}, Description={description}, Cloud:{cloud},' \
               'Cloud API id:{cloud_id}>'.format(id=self.id,
                                                 title=self.title,
                                                 description=self.description,
                                                 cloud=self.cloud,
                                                 cloud_id=self.network_id)

    def __str__(self):
        return '{class_name} {title} ({id})'.format(class_name=self.__class__.__name__,
                                                    title=self.title,
                                                    id=self.id)


class AmazonNetwork(Network):
    provider = 'ec2'

    state = me.StringField()


class GoogleNetwork(Network):
    provider = 'gce'

    mode = me.StringField()


class OpenStackNetwork(Network):
    provider = 'openstack'

    admin_state_up = me.BooleanField()


class Subnet(me.Document):
    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    subnet_id = me.StringField(required=True)
    title = me.StringField(required=True)
    cloud = me.ReferenceField(Cloud, required=True)
    cidr = me.StringField(required=True)
    gateway_ip = me.StringField()  # Cannot be required, some drivers do not provide it
    network = me.ReferenceField('Network', required=True, reverse_delete_rule=me.CASCADE)
    description = me.StringField()

    extra = me.DictField()

    _controller_cls = None

    meta = {
        'allow_inheritance': True,
        'collection': 'subnets',
        'indexes': [
            {
                'fields': ['cloud', 'subnet_id'],
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
    def add(cls, title, network, cloud, description='', object_id='', create_on_cloud=True, **kwargs):

        if not title:
            raise RequiredParameterMissingError('title')
        if not cloud:
            raise RequiredParameterMissingError('cloud')

        subnet = cls(title=title,
                     network=network,
                     cloud=cloud,
                     description=description)

        if object_id:
            subnet.id = object_id

        if create_on_cloud:
            subnet.ctl.create_subnet(**kwargs)
        return subnet

    def as_dict(self):
        netdict = {'name': self.title,
                   'id': self.id,
                   'description': self.description,
                   'subnet_id': self.subnet_id}

        netdict.update({key: getattr(self, key) for key in self._subnet_specific_fields})

        return netdict

    def __repr__(self):
        return '<Subnet id:{id}, Title:{title}  Description={description}, Cloud API id:{cloud_id},' \
               ' of Network:{parent_network}>'.format(id=self.id,
                                                      title=self.title,
                                                      description=self.description,
                                                      cloud_id=self.subnet_id,
                                                      parent_network=self.network)

    def __str__(self):
        return '{class_name} {title} ({id})'.format(class_name=self.__class__.__name__,
                                                    title=self.title,
                                                    id=self.id)


class AmazonSubnet(Subnet):
    provider = 'ec2'

    available_ips = me.IntField()
    zone = me.StringField()


class GoogleSubnet(Subnet):
    provider = 'gce'

    region = me.StringField(required=True)


class OpenStackSubnet(Subnet):
    provider = 'openstack'

    enable_dhcp = me.BooleanField()
    dns_nameservers = me.ListField()
    allocation_pools = me.ListField()


_populate_class_mapping(NETWORKS, 'Network', Network)
_populate_class_mapping(SUBNETS, 'Subnet', Subnet)
