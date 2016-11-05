import mongoengine as me
import uuid


class Network(me.Document):
    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    libcloud_id = me.StringField(required=True)
    title = me.StringField(required=True, default='Network')
    cloud = me.ReferenceField('Cloud', required=True)

    subnets = me.ListField(me.ReferenceField('Subnet'))
    machines = me.ListField(me.ReferenceField('Machine'))

    @property
    def owner(self):
        return self.cloud.owner

    def __repr__(self):
        return '<Network id:{id}, Title:{title}, Cloud:{cloud},' \
               ' Cloud API id:{cloud_id}>'.format(id=self.id,
                                                  title=self.title,
                                                  cloud=self.cloud,
                                                  cloud_id=self.libcloud_id)


class Subnet(me.Document):
    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    libcloud_id = me.StringField(required=True)
    title = me.StringField(required=True, default='Network')
    cloud = me.ReferenceField('Cloud', required=True)

    base_network = me.ReferenceField('Network', required=True)
    machines = me.ListField(me.ReferenceField('Machine'))

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
