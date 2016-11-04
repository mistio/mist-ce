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