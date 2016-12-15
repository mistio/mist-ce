"""Models for network and network-related objects"""
import uuid

import mongoengine as me
import netaddr

from mist.io.clouds.models import Cloud
import mist.io.clouds.controllers.network.controllers as net_controllers
from mist.io.networks.controllers import NetworkController, SubnetController

# Automatically populated mapping of all Network subclasses, keyed by their
# provider name
NETWORKS = {}
# Automatically populated mapping of all Subnet subclasses, keyed by their
# provider name
SUBNETS = {}


def _populate_class_mapping(mapping, class_suffix, base_class):
    """Populates a mapping that matches a provider name with its
    provider-specific model classes """
    for key, value in globals().items():
        if key.endswith(class_suffix) and key != class_suffix:
            value = globals()[key]
            if issubclass(value, base_class) and value is not base_class:
                mapping[value._controller_cls.provider] = value


class Network(me.Document):
    """The basic network model. Only meant to be used as a base class for
    cloud-specific Network subclasses. Contains all common
    provider-independent functionality. """

    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    network_id = me.StringField()
    title = me.StringField()
    cloud = me.ReferenceField(Cloud, required=True)
    description = me.StringField()

    # The 'extra' dictionary returned by libcloud. Contains miscellaneous
    # data about the network object
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
        self._network_specific_fields = [field for field in type(self)._fields
                                         if field not in Network._fields]

    @classmethod
    def add(cls, cloud, name='', description='', object_id='', **kwargs):
        """Create a new Network DB object and use the appropriate
        NetworkController to create it on the cloud. """
        network = cls(title=name,
                      cloud=cloud,
                      description=description)

        if object_id:
            network.id = object_id

        network.ctl.create_network(**kwargs)

        return network

    def clean(self):
        """Called by Network.save to validate every Field that's persisted
        to the DB. So far, only checks the CIDR address range value to
        determine if it maps to a valid IPv4 address range, if applicable. """
        if 'cidr' in self._network_specific_fields:
            try:
                netaddr.cidr_to_glob(self.cidr)
            except (TypeError, netaddr.AddrFormatError) as err:
                raise me.ValidationError(err)

    def as_dict(self):
        """Returns a representation of the Network object as a
        JSON-serializable dictionary. Used by the list_networks method to
        return network data to the frontend. """
        net_dict = {'name': self.title,
                    'id': self.id,
                    'description': self.description,
                    'network_id': self.network_id,
                    'cloud': self.cloud.id,
                    'extra': self.extra}

        net_dict.update({key: getattr(self, key)
                         for key in self._network_specific_fields})

        return net_dict

    def __repr__(self):
        format_params = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'cloud': self.cloud,
            'network_id': self.network_id
        }
        return '<Network id:{id}, Title:{title}, Description={description}, ' \
               'Cloud:{cloud},' \
               'Cloud API id:{network_id}>'.format(**format_params)

    def __str__(self):
        return '{class_name} {title} ({id})'.format(
            class_name=self.__class__.__name__,
            title=self.title,
            id=self.id)


class AmazonNetwork(Network):
    cidr = me.StringField(required=True)
    instance_tenancy = me.StringField(choices=('default', 'private'),
                                      default='default')

    _controller_cls = net_controllers.AmazonNetworkController


class GoogleNetwork(Network):
    title = me.StringField(regex='^(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)$')
    mode = me.StringField(choices=('legacy', 'auto', 'custom'),
                          default='legacy')
    cidr = me.StringField()
    gateway_ip = me.StringField()

    def clean(self):
        """GCM networks only allow CIDR assignment if the 'legacy' mode has
        been selected. Otherwise, a value of None must be passed to libcloud
        for the network creation call to succeed. """
        if self.mode == 'legacy':
            super(GoogleNetwork, self).clean()
        else:
            if self.cidr is not None:
                raise me.ValidationError('CIDR cannot be set for modes other '
                                         'than "legacy"')

    _controller_cls = net_controllers.GoogleNetworkController


class OpenStackNetwork(Network):
    admin_state_up = me.BooleanField(default=True)
    shared = me.BooleanField(default=False)

    _controller_cls = net_controllers.OpenStackNetworkController


class Subnet(me.Document):
    """The basic subnet model. Only meant to be used as a base class for
    cloud-specific Subnet subclasses. Contains all common
    provider-independent functionality. """
    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    subnet_id = me.StringField()
    title = me.StringField()
    cidr = me.StringField(required=True)

    # The network this subnet is attached to. This Subnet object will
    # automatically be deleted if the network is deleted.
    network = me.ReferenceField('Network', required=True,
                                reverse_delete_rule=me.CASCADE)
    description = me.StringField()

    # The 'extra' dictionary returned by libcloud. Contains miscellaneous
    # data about the subnet object
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
    def add(cls, network, cidr, name='', description='', object_id='',
            **kwargs):
        """Create a new Subnet DB object and use the appropriate
        NetworkController to create it on the cloud."""

        subnet = cls(title=name,
                     cidr=cidr,
                     network=network,
                     description=description)

        if object_id:
            subnet.id = object_id

        subnet.ctl.create_subnet(**kwargs)

        return subnet

    def clean(self):
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

        subnet_dict.update({key: getattr(self, key)
                            for key in self._subnet_specific_fields})

        return subnet_dict

    def __repr__(self):
        format_params = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'parent_network': self.network,
            'subnet_id': self.subnet_id,
        }
        return '<Subnet id:{id}, Title:{title}  Description={description}, ' \
               'Cloud API id:{subnet_id},' \
               ' of Network:{parent_network}>'.format(**format_params)

    def __str__(self):
        return '{class_name} {title} ({id})'.format(
            class_name=self.__class__.__name__,
            title=self.title,
            id=self.id)


class AmazonSubnet(Subnet):
    availability_zone = me.StringField(required=True)

    _controller_cls = net_controllers.AmazonNetworkController


class GoogleSubnet(Subnet):
    title = me.StringField(required=True, regex='^(?:[a-z](?:[-a-z0-9]{0,'
                                                '61}[a-z0-9])?)$')
    region = me.StringField(required=True)
    gateway_ip = me.StringField()

    _controller_cls = net_controllers.GoogleNetworkController


class OpenStackSubnet(Subnet):
    enable_dhcp = me.BooleanField(default=False)
    dns_nameservers = me.ListField(default=lambda: [])
    allocation_pools = me.ListField(default=lambda: [])
    gateway_ip = me.StringField()
    ip_version = me.IntField(default=4)

    _controller_cls = net_controllers.OpenStackNetworkController


_populate_class_mapping(NETWORKS, 'Network', Network)
_populate_class_mapping(SUBNETS, 'Subnet', Subnet)
