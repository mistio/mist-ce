import uuid
import copy
import logging

import mongoengine as me

from mist.io.exceptions import ConflictError, BadRequestError, RequiredParameterMissingError

log = logging.getLogger(__name__)


class Network(me.Document):
    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    libcloud_id = me.StringField(required=True)
    title = me.StringField(required=True, default='Network')
    cloud = me.ReferenceField('Cloud', required=True)

    subnets = me.ListField(me.ReferenceField('Subnet'))
    machines = me.ListField(me.ReferenceField('Machine'))

    extra = me.DictField()  # Any provider-specific network data goes here

    @property
    def owner(self):
        return self.cloud.owner

    def __repr__(self):
        return '<Network id:{id}, Title:{title}, Cloud:{cloud},' \
               'Cloud API id:{cloud_id}>'.format(id=self.id,
                                                 title=self.title,
                                                 cloud=self.cloud,
                                                 cloud_id=self.libcloud_id)

    @classmethod
    def create(cls, cloud, libcloud_network=None, network_info=None, do_save=True):
        """ Persists a new Network object to the DB.
        Should not be overridden or extended by subclasses"""

        if not libcloud_network and not network_info:
            raise RequiredParameterMissingError('libcloud_network ot network_info')

        if libcloud_network:
            network_object = Network(title=libcloud_network.name,
                                     libcloud_id=libcloud_network.id,
                                     cloud=cloud,
                                     extra=copy.copy(libcloud_network.extra))
        else:
            network_object = Network(title=network_info['name'],
                                     libcloud_id=network_info['id'],
                                     cloud=cloud,
                                     extra={key: value for key, value in network_info.items()
                                            if key not in ['name', 'id']})
        if do_save:
            try:
                network_object.save()
            except me.ValidationError as exc:
                log.error("Error adding network: %s: %s", libcloud_network.name, exc.to_dict())
                raise BadRequestError({"msg": exc.message,
                                       "errors": exc.to_dict()})

        return network_object


class Subnet(me.Document):
    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    libcloud_id = me.StringField(required=True)
    title = me.StringField(required=True, default='Network')
    cloud = me.ReferenceField('Cloud', required=True)

    base_network = me.ReferenceField('Network', required=True)
    machines = me.ListField(me.ReferenceField('Machine'))

    extra = me.DictField()  # All provider-specific subnet data goes here

    @property
    def owner(self):
        return self.cloud.owner

    def __repr__(self):
        return '<Subnet id:{id}, Title:{title}, Cloud:{cloud}, ' \
               'Cloud API id:{cloud_id}, of Network:{parent_network}>'.format(id=self.id,
                                                                              title=self.title,
                                                                              cloud=self.cloud,
                                                                              cloud_id=self.libcloud_id,
                                                                              parent_network=self.base_network)

    @classmethod
    def create(cls, cloud, parent_network, libcloud_subnet=None, subnet_info=None, do_save=True):
        """ Persist a new Subnet object to the DB
            Should not be overridden or extended by subclasses"""

        if not libcloud_subnet and not subnet_info:
            raise RequiredParameterMissingError('libcloud_subnet ot subnet_info')

        if libcloud_subnet:
            subnet_object = Subnet(title=libcloud_subnet.name,
                                   libcloud_id=libcloud_subnet.id,
                                   cloud=cloud,
                                   base_network=parent_network,
                                   extra=copy.copy(libcloud_subnet.extra))
        else:
            subnet_object = Subnet(title=subnet_info['name'],
                                   libcloud_id=subnet_info['id'],
                                   cloud=cloud,
                                   base_network=parent_network,
                                   extra={key: value for key, value in subnet_info.items()
                                          if key not in ['name', 'id']})

        if do_save:
            try:
                subnet_object.save()
            except me.ValidationError as exc:
                log.error("Error adding subnet: %s: %s", libcloud_subnet.name, exc.to_dict())
                raise BadRequestError({"msg": exc.message,
                                       "errors": exc.to_dict()})

        return subnet_object
