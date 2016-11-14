import uuid
import logging

import mongoengine as me

log = logging.getLogger(__name__)


class Network(me.Document):
    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    network_id = me.StringField(required=True)
    title = me.StringField(required=True)
    cloud = me.ReferenceField('Cloud', required=True)

    subnets = me.ListField(me.ReferenceField('Subnet'))

    meta = {
        'allow_inheritance': True,
        'collection': 'networks'
    }

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

    def as_dict(self):
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
    gatewayIPv4 = me.StringField()
    mode = me.StringField()
    cidr = me.StringField()

    @classmethod
    def from_libcloud(cls, libcloud_network):
        return GoogleNetwork(title=libcloud_network.name,
                             network_id=libcloud_network.id,
                             cidr=libcloud_network.cidr,
                             IPv4Range=libcloud_network.extra['IPv4Range'],
                             autoCreateSubnetworks=libcloud_network.extra['autoCreateSubnetworks'],
                             creationTimestamp=libcloud_network.extra['creationTimestamp'],
                             description=libcloud_network.extra['description'],
                             gatewayIPv4=libcloud_network.extra['gatewayIPv4'],
                             mode=libcloud_network.extra['mode']
                             )

    def as_dict(self):
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
    status = me.StringField()
    router_external = me.BooleanField()
    admin_state_up = me.BooleanField()
    mtu = me.IntField()
    provider_network_type = me.StringField()
    provider_physical_network = me.StringField()
    provider_segmentation_id = me.IntField()
    shared = me.BooleanField()
    tenant_id = me.StringField()

    @classmethod
    def from_libcloud(cls, libcloud_network):
        return OpenStackNetwork(title=libcloud_network.name,
                                network_id=libcloud_network.id,
                                status=libcloud_network.status,
                                router_external=libcloud_network.router_external,
                                admin_state_up=libcloud_network.extra['admin_state_up'],
                                mtu=libcloud_network.extra['mtu'],
                                provider_network_type=libcloud_network.extra['provider:network_type'],
                                provider_physical_network=libcloud_network.extra['provider:physical_network'],
                                provider_segmentation_id=libcloud_network.extra['provider:segmentation_id'],
                                shared=libcloud_network.extra['shared'],
                                tenant_id=libcloud_network.extra['tenant_id']
                                )

    def as_dict(self):
        return {'name': self.title,
                'id': self.id,
                'network_id': self.network_id,
                'status': self.status,
                'router_external': self.router_external,
                'admin_state_up': self.admin_state_up,
                'mtu': self.mtu,
                'provider_network_type': self.provider_network_type,
                'provider_physical_network': self.provider_physical_network,
                'provider_segmentation_id': self.provider_segmentation_id,
                'shared': self.shared,
                'tenant_id': self.tenant_id}


class Subnet(me.Document):
    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    subnet_id = me.StringField(required=True)
    title = me.StringField(required=True)

    network = me.ReferenceField('Network', required=True)

    meta = {
        'allow_inheritance': True,
        'collection': 'subnets'
    }

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
    cidr_block = me.StringField()
    tags = me.DictField()
    zone = me.StringField()

    @classmethod
    def from_libcloud(cls, libcloud_subnet):
        return AmazonSubnet(title=libcloud_subnet.name,
                            subnet_id=libcloud_subnet.id,
                            state=libcloud_subnet.state,
                            available_ips=libcloud_subnet.extra['available_ips'],
                            cidr_block=libcloud_subnet.extra['cidr_block'],
                            tags=libcloud_subnet.extra['tags'],
                            zone=libcloud_subnet.extra['zone'])

    def as_dict(self):
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
    creationTimestamp = me.StringField()

    @classmethod
    def from_libcloud(cls, libcloud_subnet):
        region = libcloud_subnet.extra['region'].split("/")[-1]

        return GoogleSubnet(title=libcloud_subnet.name,
                            subnet_id=libcloud_subnet.id,
                            region=region,
                            cidr=libcloud_subnet.extra['ipCidrRange'],
                            gateway_ip=libcloud_subnet.extra['gatewayAddress'],
                            creationTimestamp=libcloud_subnet.extra['creationTimestamp'])

    def as_dict(self):
        return {'name': self.title,
                'id': self.id,
                'subnet_id': self.subnet_id,
                'region': self.region,
                'cidr': self.cidr,
                'gateway_ip': self.gateway_ip,
                'creationTimestamp': self.creationTimestamp}


class OpenStackSubnet(Subnet):
    cidr = me.StringField()
    enable_dhcp = me.BooleanField()
    dns_nameservers = me.ListField()
    allocation_pools = me.ListField()
    gateway_ip = me.StringField()
    ip_version = me.IntField()
    host_routes = me.ListField()
    ipv6_address_mode = me.StringField()
    ipv6_ra_mode = me.StringField()
    subnetpool_id = me.StringField()
    tenant_id = me.StringField()

    @classmethod
    def from_libcloud(cls, libcloud_subnet):
        return OpenStackSubnet(title=libcloud_subnet.name,
                               subnet_id=libcloud_subnet.id,
                               cidr=libcloud_subnet.cidr,
                               enable_dhcp=libcloud_subnet.enable_dhcp,
                               dns_nameservers=libcloud_subnet.dns_nameservers,
                               allocation_pools=libcloud_subnet.allocation_pools,
                               gateway_ip=libcloud_subnet.gateway_ip,
                               ip_version=libcloud_subnet.ip_version,
                               host_routes=libcloud_subnet.extra['host_routes'],
                               ipv6_address_mode=libcloud_subnet.extra['ipv6_address_mode'],
                               ipv6_ra_mode=libcloud_subnet.extra['ipv6_ra_mode'],
                               subnetpool_id=libcloud_subnet.extra['subnetpool_id'],
                               tenant_id=libcloud_subnet.extra['tenant_id']
                               )

    def as_dict(self):
        return {'name': self.title,
                'id': self.id,
                'subnet_id': self.subnet_id,
                'enable_dhcp': self.enable_dhcp,
                'dns_nameservers': self.dns_nameservers,
                'allocation_pools': self.allocation_pools,
                'gateway_ip': self.gateway_ip,
                'ip_version': self.ip_version,
                'host_routes': self.host_routes,
                'ipv6_address_mode': self.ipv6_address_mode,
                'ipv6_ra_mode': self.ipv6_ra_mode,
                'subnetpool_id': self.subnetpool_id,
                'tenant_id': self.tenant_id}
