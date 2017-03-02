import mongoengine as me

from mist.core import config
from mist.io.users.models import Owner


class Tag(me.Document):

    owner = me.ReferenceField(Owner, required=True)
    key = me.StringField(regex=r'^[a-zA-Z0-9_]+(?:[ :.-][a-zA-Z0-9_]+)*$',
                         required=True)

    resource_type = me.StringField(choices=['cloud', 'clouds', 'keys',
                                            'scripts', 'machine', 'machines',
                                            'template', 'stack', 'image',
                                            'network', 'tunnel', 'schedules',
                                            'zone'])

    value = me.StringField()
    resource = me.GenericReferenceField()

    meta = {
        'indexes': [
            {
                'fields': ['resource', 'key'],
                'sparse': False,
                'unique': True,
                'cls': False,
            },
        ],
    }

    def clean(self):
        self.resource_type = self.resource._meta["collection"]

    def __str__(self):
        return 'Tag %s:%s for %s' % (self.key, self.value, self.resource)

    def as_dict(self):
        return {
            'key': self.key,
            'value': self.value,
            'owner': self.owner.id,
            'resource_type': self.resource_type,
            'resource': str(self.resource),
        }
