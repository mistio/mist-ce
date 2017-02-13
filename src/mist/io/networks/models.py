import re
import uuid
import netaddr
import mongoengine as me

from mist.io.exceptions import RequiredParameterMissingError

from mist.io.clouds.models import Cloud
from mist.io.clouds.models import CLOUDS

from mist.io.networks.controllers import SubnetController
from mist.io.networks.controllers import NetworkController


# Automatically populated mappings of all Network and Subnet subclasses,
# keyed by their provider name.
NETWORKS, SUBNETS = {}, {}


def _populate_class_mapping(mapping, class_suffix, base_class):
    """Populates a dict that matches a provider name with its model class."""
    for key, value in globals().items():
        if key.endswith(class_suffix) and key != class_suffix:
            if issubclass(value, base_class) and value is not base_class:
                for provider, cls in CLOUDS.items():
                    if key.replace(class_suffix, '') in repr(cls):
                        mapping[provider] = value


class Network(me.Document):
    """The basic Network model.

    This class is only meant to be used as a basic class for cloud-specific
    `Network` subclasses.

    `Network` contains all common, provider-independent fields and handlers.
    """

    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    cloud = me.ReferenceField(Cloud, required=True)
    network_id = me.StringField()  # required=True)

    name = me.StringField()
    cidr = me.StringField()
    description = me.StringField()

    extra = me.DictField()  # The `extra` dictionary returned by libcloud.

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
        # Set `ctl` attribute.
        self.ctl = NetworkController(self)
        # Calculate and store network type specific fields.
        self._network_specific_fields = [field for field in type(self)._fields
                                         if field not in Network._fields]

    @classmethod
    def add(cls, cloud, cidr=None, name='', description='', id='', **kwargs):
        """Add a Network.

        This is a class method, meaning that it is meant to be called on the
        class itself and not on an instance of the class.

        You're not meant to be calling this directly, but on a network subclass
        instead like this:

            network = AmazonNetwork.add(cloud=cloud, name='Ec2Network')

        :param cloud: the Cloud on which the network is going to be created.
        :param cidr:
        :param name: the name to be assigned to the new network.
        :param description: an optional description.
        :param id: a custom object id, passed in case of a migration.
        :param kwargs: the kwargs to be passed to the corresponding controller.

        """
        assert isinstance(cloud, Cloud)
        network = cls(cloud=cloud, cidr=cidr, name=name,
                      description=description)
        if id:
            network.id = id
        network.ctl.create(**kwargs)
        return network

    def clean(self):
        """Checks the CIDR to determine if it maps to a valid IPv4 network."""
        if self.cidr:
            try:
                netaddr.cidr_to_glob(self.cidr)
            except (TypeError, netaddr.AddrFormatError) as err:
                raise me.ValidationError(err)

    def as_dict(self):
        """Returns the API representation of the `Network` object."""
        net_dict = {
            'id': self.id,
            'cloud': self.cloud.id,
            'network_id': self.network_id,
            'name': self.name,
            'cidr': self.cidr,
            'description': self.description,
            'extra': self.extra,
        }
        net_dict.update(
            {key: getattr(self, key) for key in self._network_specific_fields}
        )
        return net_dict

    def __str__(self):
        return '%s "%s" (%s)' % (self.__class__.__name__, self.name, self.id)


class AmazonNetwork(Network):
    instance_tenancy = me.StringField(default='default', choices=('default',
                                                                  'private'))

    def clean(self):
        """Extended validation for EC2 Networks to ensure CIDR assignment."""
        if not self.cidr:
            raise me.ValidationError('Missing IPv4 range in CIDR notation')
        super(AmazonNetwork, self).clean()


class GoogleNetwork(Network):
    mode = me.StringField(default='legacy', choices=('legacy', 'auto',
                                                     'custom'))

    def clean(self):
        """Custom validation for GCE Networks.

        GCE enforces:

            - Regex constrains on network names.
            - CIDR assignment only if `legacy` mode has been selected.

        """
        if self.mode == 'legacy':
            super(GoogleNetwork, self).clean()
        elif self.cidr is not None:
            raise me.ValidationError('CIDR cannot be set for modes other than '
                                     '"legacy" - Current mode: %s' % self.mode)

        if not re.match('^(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)$', self.name):
            raise me.ValidationError('A **lowercase** name must be specified')


class OpenStackNetwork(Network):
    shared = me.BooleanField(default=False)
    admin_state_up = me.BooleanField(default=True)
    router_external = me.BooleanField(default=False)


class Subnet(me.Document):
    """The basic Subnet model.

    This class is only meant to be used as a basic class for cloud-specific
    `Subnet` subclasses.

    `Subnet` contains all common, provider-independent fields and handlers.
    """

    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    network = me.ReferenceField('Network', required=True,
                                reverse_delete_rule=me.CASCADE)
    subnet_id = me.StringField()

    name = me.StringField()
    cidr = me.StringField(required=True)
    description = me.StringField()

    extra = me.DictField()  # The `extra` dictionary returned by libcloud.

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
        # Set `ctl` attribute.
        self.ctl = SubnetController(self)
        # Calculate and store subnet type specific fields.
        self._subnet_specific_fields = [field for field in type(self)._fields
                                        if field not in Subnet._fields]

    @classmethod
    def add(cls, network, cidr, name='', description='', id='', **kwargs):
        """Add a Subnet.

        This is a class method, meaning that it is meant to be called on the
        class itself and not on an instance of the class.

        You're not meant to be calling this directly, but on a network subclass
        instead like this:

            subnet = AmazonSubnet.add(network=network,
                                      name='Ec2Subnet',
                                      cidr='172.31.10.0/24')

        :param network: the Network nn which the subnet is going to be created.
        :param cidr: the CIDR to be assigned to the new subnet.
        :param name: the name to be assigned to the new subnet.
        :param description: an optional description.
        :param id: a custom object id, passed in case of a migration.
        :param kwargs: the kwargs to be passed to the corresponding controller.

        """
        assert isinstance(network, Network)
        if not cidr:
            raise RequiredParameterMissingError('cidr')
        subnet = cls(network=network, cidr=cidr, name=name,
                     description=description)
        if id:
            subnet.id = id
        subnet.ctl.create(**kwargs)
        return subnet

    def clean(self):
        """Checks the CIDR to determine if it maps to a valid IPv4 network."""
        try:
            netaddr.cidr_to_glob(self.cidr)
        except (TypeError, netaddr.AddrFormatError) as err:
            raise me.ValidationError(err)

    def as_dict(self):
        """Returns the API representation of the `Subnet` object."""
        subnet_dict = {
            'id': self.id,
            'cloud': self.network.cloud.id,
            'network': self.network.id,
            'subnet_id': self.subnet_id,
            'name': self.name,
            'cidr': self.cidr,
            'description': self.description,
            'extra': self.extra,
        }
        subnet_dict.update(
            {key: getattr(self, key) for key in self._subnet_specific_fields}
        )
        return subnet_dict

    def __str__(self):
        return '%s "%s" (%s)' % (self.__class__.__name__, self.name, self.id)


class AmazonSubnet(Subnet):
    availability_zone = me.StringField(required=True)


class GoogleSubnet(Subnet):
    region = me.StringField(required=True)

    def clean(self):
        """Extended validation for GCE Subnets."""
        if not re.match('^(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)$', self.name):
            raise me.ValidationError('A **lowercase** name must be specified')
        super(GoogleSubnet, self).clean()


class OpenStackSubnet(Subnet):
    gateway_ip = me.StringField()
    ip_version = me.IntField(default=4)
    enable_dhcp = me.BooleanField(default=True)
    dns_nameservers = me.ListField(default=lambda: [])
    allocation_pools = me.ListField(default=lambda: [])


_populate_class_mapping(NETWORKS, 'Network', Network)
_populate_class_mapping(SUBNETS, 'Subnet', Subnet)
