import uuid
import logging

import mongoengine as me

from mist.io.exceptions import RequiredParameterMissingError
from mist.io.clouds.controllers.network import controllers


log = logging.getLogger(__name__)


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
    title = me.StringField(required=True)
    cloud = me.ReferenceField('Cloud', required=True)
    extra = me.DictField()

    _controller_cls = None

    meta = {
        'allow_inheritance': True,
        'collection': 'networks'
    }

    def __init__(self, *args, **kwargs):
        super(Network, self).__init__(*args, **kwargs)
        # Set attribute `ctl` to an instance of the appropriate controller.
        if self._controller_cls is None:
            raise NotImplementedError(
                "Can't initialize %s. Network is an abstract base class and "
                "shouldn't be used to create network instances. All Cloud "
                "subclasses should define a `_controller_cls` class attribute "
                "pointing to a `BaseNetworkController` subclass." % self
            )
        elif not issubclass(self._controller_cls,
                            controllers.BaseNetworkController):
            raise TypeError(
                "Can't initialize %s.  All Network subclasses should define a "
                "`_controller_cls` class attribute pointing to a "
                "`BaseNEtworkController` subclass." % self
            )
        self.ctl = self._controller_cls(self)
        # Calculate and store cloud type specific fields.
        self._cloud_specific_fields = [field for field in type(self)._fields if field not in Network._fields]

    @classmethod
    def add(cls, title, cloud, object_id='', **kwargs):

        if not title:
            raise RequiredParameterMissingError('title')
        if not cloud:
            raise RequiredParameterMissingError('cloud')

        network = cls(title=title, cloud=cloud)

        if object_id:
            network.id = object_id
            network.ctl.add_network(**kwargs)
        return network

    def as_dict(self):
        netdict = {'name': self.title,
                   'id': self.id,
                   'network_id': self.network_id}

        netdict.update({key: getattr(self, key) for key in self._cloud_specific_fields})

        return netdict

    def __repr__(self):
        return '<Network id:{id}, Title:{title}, Cloud:{cloud},' \
               'Cloud API id:{cloud_id}>'.format(id=self.id,
                                                 title=self.title,
                                                 cloud=self.cloud,
                                                 cloud_id=self.network_id)

    def __str__(self):
        return '{class_name} {title} ({id})'.format(class_name=self.__class__.__name__,
                                                    title=self.title,
                                                    id=self.id)


class AmazonNetwork(Network):
    is_default = me.BooleanField()
    state = me.StringField()
    instance_tenancy = me.StringField()
    tags = me.DictField()

    _controller_cls = controllers.AmazonNetworkController


class GoogleNetwork(Network):
    IPv4Range = me.BooleanField()
    autoCreateSubnetworks = me.BooleanField()
    creationTimestamp = me.StringField()
    description = me.StringField()
    gatewayIPv4 = me.StringField()
    mode = me.StringField()
    cidr = me.StringField()

    _controller_cls = controllers.GoogleNetworkController


class OpenStackNetwork(Network):
    status = me.StringField()
    router_external = me.BooleanField()
    admin_state_up = me.BooleanField()
    mtu = me.IntField()
    provider_network_type = me.StringField()
    provider_physical_network = me.StringField()
    provider_segmentation_id = me.IntField()
    shared = me.BooleanField()

    _controller_cls = controllers.OpenStackNetworkController


class Subnet(me.Document):
    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    subnet_id = me.StringField(required=True)
    title = me.StringField(required=True)
    cidr = me.StringField(required=True)
    network = me.ReferenceField('Network', required=True, reverse_delete_rule=me.CASCADE)
    extra = me.DictField()

    _controller_cls = None

    meta = {
        'allow_inheritance': True,
        'collection': 'subnets'
    }

    def __init__(self, *args, **kwargs):
        super(Subnet, self).__init__(*args, **kwargs)
        # Set attribute `ctl` to an instance of the appropriate controller.
        if self._controller_cls is None:
            raise NotImplementedError(
                "Can't initialize %s. Subnet is an abstract base class and "
                "shouldn't be used to create subnet instances. All Subnet "
                "subclasses should define a `_controller_cls` class attribute "
                "pointing to a `BaseNetworkController` subclass." % self
            )
        elif not issubclass(self._controller_cls,
                            controllers.BaseNetworkController):
            raise TypeError(
                "Can't initialize %s.  All Subnet subclasses should define a "
                "`_controller_cls` class attribute pointing to a "
                "`BaseNetworkController` subclass." % self
            )
        self.ctl = self._controller_cls(self)
        # Calculate and store cloud type specific fields.
        self._cloud_specific_fields = [field for field in type(self)._fields if field not in Network._fields]

    @classmethod
    def add(cls, title, base_network, object_id='', **kwargs):

        if not title:
            raise RequiredParameterMissingError('title')
        if not base_network:
            raise RequiredParameterMissingError('base_network')

        subnet = cls(title=title, base_network=base_network)

        if object_id:
            subnet.id = object_id
            subnet.ctl.add_subnet(**kwargs)
        return subnet

    def as_dict(self):
        netdict = {'name': self.title,
                   'id': self.id,
                   'subnet_id': self.subnet_id}

        netdict.update({key: getattr(self, key) for key in self._cloud_specific_fields})

        return netdict

    def __repr__(self):
        return '<Subnet id:{id}, Title:{title} Cloud API id:{cloud_id},' \
               ' of Network:{parent_network}>'.format(id=self.id,
                                                      title=self.title,
                                                      cloud_id=self.subnet_id,
                                                      parent_network=self.network)

    def __str__(self):
        return '{class_name} {title} ({id})'.format(class_name=self.__class__.__name__,
                                                    title=self.title,
                                                    id=self.id)


class AmazonSubnet(Subnet):
    state = me.StringField()
    available_ips = me.IntField()
    tags = me.DictField()
    zone = me.StringField()

    _controller_cls = controllers.AmazonNetworkController


class GoogleSubnet(Subnet):
    region = me.StringField()
    gateway_ip = me.StringField()
    creationTimestamp = me.StringField()

    _controller_cls = controllers.GoogleNetworkController


class OpenStackSubnet(Subnet):
    enable_dhcp = me.BooleanField()
    dns_nameservers = me.ListField()
    allocation_pools = me.ListField()
    gateway_ip = me.StringField()
    ip_version = me.IntField()
    host_routes = me.ListField()
    ipv6_address_mode = me.StringField()
    ipv6_ra_mode = me.StringField()
    subnetpool_id = me.StringField()

    _controller_cls = controllers.OpenStackNetworkController


_populate_class_mapping(NETWORKS, 'Network', Network)
_populate_class_mapping(SUBNETS, 'Subnet', Subnet)
