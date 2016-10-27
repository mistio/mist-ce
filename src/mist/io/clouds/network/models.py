import mongoengine as me
import uuid

from mist.io.clouds.models import Cloud


class Network(me.Document):

    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    title = me.StringField(required=True)
    cloud = me.ReferenceField(Cloud, required=True)

    cidr_range = me.StringField()
    subnets = me.ListField(me.ReferenceField('Subnet'))
    machines = me.ListField(me.ReferenceField('Machine'))

    @property
    def owner(self):
        return self.cloud.owner


class Subnet(me.Document):

    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    title = me.StringField(required=True)
    cloud = me.ReferenceField(Cloud, required=True)

    cidr_range = me.StringField()
    base_network = me.ReferenceField(Network)
    machines = me.ListField(me.ReferenceField('Machine'))

    @property
    def owner(self):
        return self.cloud.owner