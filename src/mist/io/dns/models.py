"""Definition of DNS Zone and Record mongoengine models"""

import uuid

import mongoengine as me

from mist.io.clouds.models import Cloud
#from mist.io.users.models import Organization
from mist.io.dns.controllers import ZoneController, RecordController

class Zone(me.Document):
    """This is the class definition for the Mongo Engine Document related to a
    DNS zone.
    """

    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)
    owner = me.ReferenceField('Organization', required=True)

    zone_id = me.StringField(required=True)
    domain = me.StringField(required=True)
    type = me.StringField(required=True)
    ttl = me.IntField(required=True, default=0)
    extra = me.DictField()
    cloud = me.ReferenceField(Cloud, required=True,
                              reverse_delete_rule=me.CASCADE)
    deleted = me.DateTimeField()

    meta = {
        'collection': 'zones',
        'indexes': [
            'owner',
            {
                'fields': ['cloud', 'zone_id'],
                'sparse': False,
                'unique': True,
                'cls': False,
            }
        ],
    }

    def __init__(self, *args, **kwargs):
        super(Zone, self).__init__(*args, **kwargs)
        self.ctl = ZoneController(self)

    def as_dict(self):
        """Return a dict with the model values."""
        return {
            'id': self.id,
            'zone_id': self.zone_id,
            'domain': self.domain,
            'type': self.type,
            'ttl': self.ttl,
            'extra': self.extra,
            'cloud': self.cloud.id
        }


class Record(me.Document):
    """This is the class definition for the Mongo Engine Document related to a 
    DNS record.
    """

    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)

    record_id = me.StringField(required=True)
    name = me.StringField(required=True)
    type = me.StringField(required=True)
    # The default empty string value here is a hack since even though this
    # field is required we only have that information after a provider
    # specific postparsing of the returned data from the providers.
    rdata = me.ListField(required=True, default=[])
    data = me.DictField()
    extra = me.DictField()
    ttl = me.IntField(default=0)
    # Need to check if DNS providers allow zones to be deleted when there are
    # records under them. If not then the reverse_delete_rule need to change to
    # me.DENY (this however could be a risk since having the DENY could cause
    # machines to become undestructable. Test this <<<<<<<<<<<<<<<<<<< )
    zone = me.ReferenceField(Zone, required=True,
                             reverse_delete_rule=me.CASCADE)
    deleted = me.DateTimeField()

    meta = {
        'collection': 'records',
        'indexes': [
            {
                'fields': ['zone', 'record_id'],
                'sparse': False,
                'unique': True,
                'cls': False,
            }
        ],
    }

    def __init__(self, *args, **kwargs):
        super(Record, self).__init__(*args, **kwargs)
        self.ctl = RecordController(self)

    def as_dict(self):
        """ Return a dict with the model values."""
        return {
            'id': self.id,
            'record_id': self.record_id,
            'name': self.name,
            'type': self.type,
            'data': self.data,
            'ttl': self.ttl,
            'extra': self.extra,
            'zone': self.zone.id
        }
