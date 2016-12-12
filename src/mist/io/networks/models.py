import uuid

import mongoengine as me
import netaddr

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
    network_id = me.StringField()
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
    def add(cls, cloud, name='', description='', object_id='', **kwargs):
        network = cls(title=name,
                      cloud=cloud,
                      description=description)

        if object_id:
            network.id = object_id

        for key, value in kwargs.iteritems():
            if key not in network._network_specific_fields:
                raise mist.io.exceptions.BadRequestError(key)
            setattr(network, key, value)
        # Perform early validation
        try:
            network.validate(clean=True)
        except me.ValidationError as err:
            raise mist.io.exceptions.BadRequestError(err)
        network.ctl.create_network(**kwargs)

        return network

    def as_dict(self):
        net_dict = {'name': self.title,
                    'id': self.id,
                    'description': self.description,
                    'network_id': self.network_id,
                    'cloud': self.cloud.id,
                    'extra': self.extra}

        net_dict.update({key: getattr(self, key) for key in self._network_specific_fields})

        return net_dict

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
    cidr = me.StringField(required=True)
    instance_tenancy = me.StringField(choices=('default', 'private'),
                                      default='default')

    _controller_cls = mist.io.clouds.controllers.network.controllers.AmazonNetworkController

    def clean(self):
        try:
            ip_glob = netaddr.cidr_to_glob(self.cidr)
            netaddr.valid_glob(ip_glob)
        except (TypeError, netaddr.AddrFormatError) as err:
            raise me.ValidationError(err)


class GoogleNetwork(Network):
    title = me.StringField(regex='^(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)$')
    mode = me.StringField(choices=('legacy', 'auto', 'custom'), default='legacy')
    cidr = me.StringField()
    gateway_ip = me.StringField()

    @classmethod
    def add(cls, cloud, name='', description='', object_id='', **kwargs):
        if kwargs.get('mode') != 'legacy' and kwargs.get('cidr'):
            raise me.ValidationError()

        return super(GoogleNetwork, cls).add(cloud, name, description, object_id, **kwargs)

    def clean(self):
        if self.mode == 'legacy':
            try:
                ip_glob = netaddr.cidr_to_glob(self.cidr)
                netaddr.valid_glob(ip_glob)
            except (TypeError, netaddr.AddrFormatError) as err:
                raise me.ValidationError(err)

    _controller_cls = mist.io.clouds.controllers.network.controllers.GoogleNetworkController


class OpenStackNetwork(Network):
    admin_state_up = me.BooleanField(default=True)
    shared = me.BooleanField(default=False)

    _controller_cls = mist.io.clouds.controllers.network.controllers.OpenStackNetworkController


class Subnet(me.Document):
    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    subnet_id = me.StringField()
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
    def add(cls, network, cidr, name='', description='', object_id='', **kwargs):

        subnet = cls(title=name,
                     cidr=cidr,
                     network=network,
                     description=description)

        if object_id:
            subnet.id = object_id

        for key, value in kwargs.iteritems():
            if key not in subnet._subnet_specific_fields:
                raise mist.io.exceptions.BadRequestError(key)
            setattr(subnet, key, value)

        # Perform early validation
        try:
            subnet.validate(clean=True)
        except me.ValidationError as err:
            raise mist.io.exceptions.BadRequestError(err)

        subnet.ctl.create_subnet(**kwargs)

        return subnet

    def clean(self):
        if self.cidr:
            try:
                netaddr.cidr_to_glob(self.cidr)
            except (TypeError, netaddr.AddrFormatError) as err:
                raise me.ValidationError(err)

    def as_dict(self):
        subnet_dict = {'name': self.title,
                       'id': self.id,
                       'description': self.description,
                       'subnet_id': self.subnet_id,
                       'cloud': self.network.cloud.id,
                       'cidr': self.cidr,
                       'network': self.network.id,
                       'extra': self.extra}

        subnet_dict.update({key: getattr(self, key) for key in self._subnet_specific_fields})

        return subnet_dict

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
    availability_zone = me.StringField(required=True)

    _controller_cls = mist.io.clouds.controllers.network.controllers.AmazonNetworkController


class GoogleSubnet(Subnet):
    title = me.StringField(required=True, regex='^(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)$')
    region = me.StringField(required=True)
    gateway_ip = me.StringField()

    _controller_cls = mist.io.clouds.controllers.network.controllers.GoogleNetworkController


class OpenStackSubnet(Subnet):
    enable_dhcp = me.BooleanField(default=False)
    dns_nameservers = me.ListField(default=lambda: [])
    allocation_pools = me.ListField(default=lambda: [])
    gateway_ip = me.StringField()
    ip_version = me.IntField(default='4')

    _controller_cls = mist.io.clouds.controllers.network.controllers.OpenStackNetworkController


_populate_class_mapping(NETWORKS, 'Network', Network)
_populate_class_mapping(SUBNETS, 'Subnet', Subnet)
