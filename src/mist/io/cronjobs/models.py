import json
import mongoengine as me

from uuid import uuid4

from celerybeatmongo.models import PeriodicTask

from mist.core import config
from mist.core.user.models import Owner

# FIXME: Define db to use in model definition?
# db=config.CELERY_SETTINGS.get('CELERY_MONGODB_SCHEDULER_DB')


class UserPeriodicTask(PeriodicTask):
    """mongo database model that base on periodic task
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
        attr10(StringFiled): name

    """

    # TODO change the __unicode__ return what user give for data input

    class UserInterval(PeriodicTask.Interval):
        def __unicode__(self):
            return str(dict((k, getattr(self, k)) for k, v
                            in self._fields.iteritems()))

    class UserCrontab(PeriodicTask.Crontab):
        def __unicode__(self):
            return str(dict((k, getattr(self, k)) for k, v
                            in self._fields.iteritems()))

    interval = me.EmbeddedDocumentField(UserInterval)
    crontab = me.EmbeddedDocumentField(UserCrontab)
    # use cloud_id as key
    machines_per_cloud = \
        me.ListField(me.ListField(me.StringField(required=True), required=True),
                     required=True)

    id = me.StringField(primary_key=True,
                        default=lambda: uuid4().hex)
    # user = me.StringField(required=True)
    owner = me.ReferenceField(Owner, required=True)

    script_id = me.StringField()
    action = me.StringField()
    name = me.StringField(required=True,
                          unique_with='owner')  # empty string pass
    expires = me.DateTimeField()
    enabled = me.BooleanField(default=False)
    description = me.StringField()
    run_immediately = me.BooleanField()

    excluded_fields = ['task', 'args', 'kwargs', '_cls', 'queue', 'exchange',
                       'routing_key', 'date_changed', 'total_run_count',
                       'last_run_at']
    api_fields = ['name', 'script_id', 'action', 'machines_per_cloud',
                  'enabled', 'expires', 'description', 'run_immediately']

    def __json__(self, request):
        """this is a search for pyramid
           Returns only the fields that refer to our api"""
        return dict((k, getattr(self, k)) for k in self._fields.keys() if
                    k not in self.excluded_fields)

    def clean(self):
        """Validation to ensure that user gives future date"""
        super(UserPeriodicTask, self).clean()

    def update_validate(self, value_dict):
        for key in value_dict:
            if key in self._fields.keys():
                setattr(self, key, value_dict[key])
        self.save()

    def as_dict(self):
        return json.loads(self.to_json())