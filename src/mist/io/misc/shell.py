"""Shell related class"""

import mongoengine as me
from mist.core.user.models import Owner


class ShellCapture(me.Document):
    owner = me.ReferenceField(Owner, required=True)
    capture_id = me.StringField()
    cloud_id = me.StringField()
    machine_id = me.StringField()
    key_id = me.StringField()
    host = me.StringField()
    ssh_user = me.StringField()
    started_at = me.FloatField()
    finished_at = me.FloatField()
    columns = me.IntField()
    rows = me.IntField()
