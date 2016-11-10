import uuid
import copy
import logging

import mongoengine as me

from mist.io.exceptions import BadRequestError, RequiredParameterMissingError

log = logging.getLogger(__name__)


class Network(me.Document):
    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    network_id = me.StringField(required=True)
    title = me.StringField(required=True, unique_with='cloud')
    cloud = me.ReferenceField('Cloud', required=True)

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
    dhcp_options_id = me.StringField()
    tags = me.DictField()

    @classmethod
    def from_libcloud(cls, libcloud_network):
        return AmazonNetwork(title=libcloud_network.name,
                             network_id=libcloud_network.id,
                             is_default=libcloud_network.extra['is_default'],
                             state=libcloud_network.extra['state'],
                             instance_tenancy=libcloud_network.extra['instance_tenancy'],
                             dhcp_options_id=libcloud_network.extra['dhcp_options_id'],
                             tags=libcloud_network.extra['tags'])

    def to_dict(self):
        return {'name': self.title,
                'id': self.id,
                'network_id': self.network_id,
                'is_default': self.is_default,
                'state': self.state,
                'instance_tenancy': self.instance_tenancy,
                'dhcp_options_id': self.dhcp_options_id,
                'tags': self.tags}


class GoogleNetwork(Network):

    IPv4Range = me.BooleanField()
    autoCreateSubnetworks = me.BooleanField()
    creationTimestamp = me.StringField()
    description = me.StringField()
    gatewayIPv4 = me.DictField()
    mode = me.StringField()

    @classmethod
    def from_libcloud(cls, libcloud_network):
        return GoogleNetwork(title=libcloud_network.name,
                             network_id=libcloud_network.id,
                             IPv4Range=libcloud_network.extra['IPv4Range'],
                             autoCreateSubnetworks=libcloud_network.extra['autoCreateSubnetworks'],
                             creationTimestamp=libcloud_network.extra['creationTimestamp'],
                             description=libcloud_network.extra['description'],
                             gatewayIPv4=libcloud_network.extra['gatewayIPv4'],
                             mode=libcloud_network.extra['mode'])

    def to_dict(self):
        return {'name': self.title,
                'id': self.id,
                'network_id': self.network_id,
                'IPv4Range': self.IPv4Range,
                'autoCreateSubnetworks': self.autoCreateSubnetworks,
                'creationTimestamp': self.creationTimestamp,
                'description': self.description,
                'gatewayIPv4': self.gatewayIPv4,
                'mode': self.mode}





class OpenStackNetwork(Network):

    is_default = me.BooleanField()
    state = me.StringField()
    instance_tenancy = me.StringField()
    dhcp_options_id = me.StringField()
    tags = me.DictField()

    @classmethod
    def from_libcloud(cls, libcloud_network):
        return AmazonNetwork(title=libcloud_network.name,
                             network_id=libcloud_network.id,
                             is_default=libcloud_network.extra['id_default'],
                             state=libcloud_network.extra['state'],
                             instance_tenancy=libcloud_network.extra['instance_tenancy'],
                             dhcp_options_id=libcloud_network.extra['dhcp_options_id'],
                             tags=libcloud_network.extra['tags'])

    def to_dict(self):
        return {'name': self.title,
                'id': self.id,
                'network_id': self.network_id,
                'is_default': self.is_default,
                'state': self.state,
                'instance_tenancy': self.instance_tenancy,
                'dhcp_options_id': self.dhcp_options_id,
                'tags': self.tags}


class Subnet(me.Document):
    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    subnet_id = me.StringField(required=True)
    title = me.StringField(required=True)

    network = me.ReferenceField('Network', required=True)

    def __repr__(self):
        return '<Subnet id:{id}, Title:{title}, Cloud:{cloud}, ' \
               'Cloud API id:{cloud_id}, of Network:{parent_network}>'.format(id=self.id,
                                                                              title=self.title,
                                                                              cloud=self.network.cloud,
                                                                              cloud_id=self.libcloud_id,
                                                                              parent_network=self.network)

    def __str__(self):
        return '{class_name} {title} ({id})'.format(class_name=self.__class__.__name__,
                                                    title=self.title,
                                                    id=self.id)


class AmazonSubnet(Subnet):
    state = me.StringField()
    available_ips = me.IntField()
    cidr_block = me.StringField()
    tags = me.DictField()
    zone = me.StringField()

    @classmethod
    def from_libcloud(cls, libcloud_subnet):
        return AmazonSubnet(title=libcloud_subnet.name,
                            subnet_id=libcloud_subnet.id,
                            state=libcloud_subnet.extra['state'],
                            available_ips=libcloud_subnet.extra['available_ips'],
                            cidr_block=libcloud_subnet.extra['cidr_block'],
                            tags=libcloud_subnet.extra['tags'],
                            zone=libcloud_subnet.extra['tags'])

    def to_dict(self):
        return {'name': self.title,
                'id': self.id,
                'subnet_id': self.subnet_id,
                'state': self.state,
                'available_ips': self.available_ips,
                'cidr_block': self.cidr_block,
                'tags': self.tags,
                'zone': self.zone}


class GoogleSubnet(Subnet):
    region = me.StringField()
    cidr = me.StringField()
    gateway_ip = me.StringField()
    creation_timestamp = me.StringField()

    @classmethod
    def from_libcloud(cls, libcloud_subnet):
        return GoogleSubnet(title=libcloud_subnet.name,
                            subnet_id=libcloud_subnet.id,
                            state=libcloud_subnet.extra['state'],
                            available_ips=libcloud_subnet.extra['available_ips'],
                            cidr_block=libcloud_subnet.extra['cidr_block'],
                            tags=libcloud_subnet.extra['tags'],
                            zone=libcloud_subnet.extra['tags'])

    def to_dict(self):
        return {'name': self.title,
                'id': self.id,
                'subnet_id': self.subnet_id,
                'state': self.state,
                'available_ips': self.available_ips,
                'cidr_block': self.cidr_block,
                'tags': self.tags,
                'zone': self.zone}

    {
        'id': libcloud_network.id,
        'name': libcloud_network.name,
        'network': network,
        'region': region,
        'cidr': libcloud_network.extra['ipCidrRange'],
        'gateway_ip': libcloud_network.extra['gatewayAddress'],
        'creation_timestamp': libcloud_network.extra['creationTimestamp']
    }
