import mongoengine as me

from mist.core.user.models import User, Organization


class MUser(me.Document):
    """Temporary document to hold migration status for users"""
    user = me.ReferenceField(User, required=True)
    org = me.ReferenceField(Organization, required=True)
    migrated = me.BooleanField(default=False)
