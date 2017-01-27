import mongoengine as me
from mist.io.users.models import Organization


class MOrg(me.Document):
    """Temporary Document to hold migration status for users"""
    org = me.ReferenceField(Organization, required=True)
    migrated = me.BooleanField(default=False)
