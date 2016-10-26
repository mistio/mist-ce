"""UserPeriodicTask entity model."""
import json
from uuid import uuid4
import mongoengine as me
import mist.core.tag.models
from mist.core.user.models import Owner
from celerybeatmongo.models import PeriodicTask
from mist.core.cloud.models import Machine


class UserPeriodicTask(PeriodicTask):
    """mongo database model that base on celery periodic task
       and create new fields for our cronjob scheduler

    Attributes:
        attr1 (ReferenceField): owner
        attr2(StringField): script id
        attr3(ListField): machines_per_cloud
        attr4(StringField): cronjob name
        attr5(UserInterval): interval
        attr6(UserCrontab): crontab
        attr7(BooleanField): enabled
        attr8(StringField): description
        attr9(DateTimeField): expires

    """

    # These exist here for return response class to the user
    # so he can see his cronjob,
    # ex. interval {'period': 'bla', every: 'bla'}
    class UserInterval(PeriodicTask.Interval):
        def __unicode__(self):
            return str(dict((k, getattr(self, k)) for k, v
                            in self._fields.iteritems() if k is not '_cls'))

    class UserCrontab(PeriodicTask.Crontab):
        def __unicode__(self):
            return str(dict((k, getattr(self, k)) for k, v
                            in self._fields.iteritems()))

    interval = me.EmbeddedDocumentField(UserInterval)
    crontab = me.EmbeddedDocumentField(UserCrontab)

    machines = me.ListField(me.ReferenceField(Machine, required=True))

    id = me.StringField(primary_key=True,
                        default=lambda: uuid4().hex)

    name = me.StringField(required=True,
                          unique_with='owner')  # empty string pass
    description = me.StringField()

    owner = me.ReferenceField(Owner, required=True)

    script_id = me.StringField()
    action = me.StringField()

    expires = me.DateTimeField()
    enabled = me.BooleanField(default=False)
    run_immediately = me.BooleanField()
    last_run_at = me.DateTimeField()
    total_run_count = me.IntField(min_value=0)

    # i use these in cronjobs.methods
    api_fields = ['name', 'script_id', 'action', 'machines',
                  'enabled', 'expires', 'description', 'run_immediately']

    def update_validate(self, value_dict):
        for key in value_dict:
            if key in self._fields.keys():
                setattr(self, key, value_dict[key])
        self.save()

    def delete(self):
        super(UserPeriodicTask, self).delete()
        mist.core.tag.models.Tag.objects(resource=self).delete()

    def as_dict(self):
        # Return a dict as it will be returned to the API
        machines = [machine.id for machine in self.machines]
        return {
            'id': self.id,
            'cron_name': self.name,
            'description': self.description or '',
            'interval': unicode(self.interval or ''),
            'crontab': unicode(self.crontab or ''),
            'machines': machines,
            'script_id': self.script_id or '',
            'action': self.action or '',
            'expires': str(self.expires or ''),
            'enabled': self.enabled,
            'run_immediately': self.run_immediately or '',
            'last_run_at': str(self.last_run_at or ''),
            'total_run_count': self.total_run_count or 0,
        }
