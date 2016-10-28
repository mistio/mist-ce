"""Schedule entity model."""
import datetime
from uuid import uuid4
import celery.schedules
import mongoengine as me
from mist.core.tag.models import Tag
from mist.core.user.models import Owner
from mist.core.cloud.models import Machine
from celerybeatmongo.schedulers import MongoScheduler


#: Authorized values for Interval.period
PERIODS = ('days', 'hours', 'minutes', 'seconds', 'microseconds')


# scheduler type
class BaseScheduleType(me.EmbeddedDocument):
    meta = {'allow_inheritance': True}

    @property
    def schedule(self):
        raise NotImplementedError()


class Interval(BaseScheduleType):
    meta = {'allow_inheritance': True}

    every = me.IntField(min_value=0, default=0, required=True)
    period = me.StringField(choices=PERIODS)

    @property
    def schedule(self):
        return celery.schedules.schedule(
            datetime.timedelta(**{self.period: self.every}))

    @property
    def period_singular(self):
        return self.period[:-1]

    def __unicode__(self):
        if self.every == 1:
            return 'every {0.period_singular}'.format(self)
        return 'every {0.every} {0.period}'.format(self)


class Crontab(BaseScheduleType):
    meta = {'allow_inheritance': True}

    minute = me.StringField(default='*', required=True)
    hour = me.StringField(default='*', required=True)
    day_of_week = me.StringField(default='*', required=True)
    day_of_month = me.StringField(default='*', required=True)
    month_of_year = me.StringField(default='*', required=True)

    @property
    def schedule(self):
        return celery.schedules.crontab(minute=self.minute,
                                        hour=self.hour,
                                        day_of_week=self.day_of_week,
                                        day_of_month=self.day_of_month,
                                        month_of_year=self.month_of_year)

    def __unicode__(self):
        rfield = lambda f: f and str(f).replace(' ', '') or '*'
        return '{0} {1} {2} {3} {4} (m/h/d/dM/MY)'.format(
            rfield(self.minute), rfield(self.hour),
            rfield(self.day_of_week),
            rfield(self.day_of_month), rfield(self.month_of_year),
        )


# scheduler task
class BaseTaskType(me.EmbeddedDocument):
    meta = {'allow_inheritance': True}

    @property
    def args(self):
        raise NotImplementedError()

    @property
    def task(self):
        raise NotImplementedError()


class ActionTask(BaseTaskType):
    action = me.StringField()

    @property
    def args(self):
        return self.action

    @property
    def task(self):
        return 'mist.core.tasks.group_machines_actions'

    def __str__(self):
        return 'Action: %s' % self.action


class ScriptTask(BaseTaskType):
    script_id = me.StringField()

    @property
    def args(self):
        return self.script_id

    @property
    def task(self):
        return 'mist.core.tasks.group_run_script'

    def __str__(self):
        return 'Run script: %s' % self.script_id


# scheduler machines
class BaseMachines(me.EmbeddedDocument):
    meta = {'allow_inheritance': True}

    def get_machines(self):
        raise NotImplementedError()


class ListOfMachines(BaseMachines):

    machines = me.ListField(me.ReferenceField(Machine, required=True))

    def get_machines(self):
        cloud_machines_pairs = []
        for machine in self.machines:
            machine_id = machine.machine_id
            cloud_id = machine.cloud.id
            cloud_machines_pairs.append((cloud_id, machine_id))

        return cloud_machines_pairs


class TaggedMachines(BaseMachines):
    tags = me.ListField(me.ReferenceField(Tag, required=True))

    def get_machines(self):
        # all machines currently matching the tags
        raise NotImplementedError()


class Schedule(me.Document):
    """mongo database model that base on celery periodic task
       and create new fields for our scheduler
    """

    meta = {
        'collection': 'schedules',
        'allow_inheritance': True,
    }

    id = me.StringField(primary_key=True, default=lambda: uuid4().hex)
    name = me.StringField(required=True, unique_with='owner')
    description = me.StringField()
    owner = me.ReferenceField(Owner, required=True)

    # celery periodic task specific fields
    task = me.StringField(required=True)
    args = me.ListField()
    kwargs = me.DictField()
    queue = me.StringField()
    exchange = me.StringField()
    routing_key = me.StringField()
    soft_time_limit = me.IntField()

    # mist specific fields
    schedule_type = me.EmbeddedDocumentField(BaseScheduleType, required=True)
    machines_match = me.EmbeddedDocumentField(BaseMachines, required=True)
    task_type = me.EmbeddedDocumentField(BaseTaskType, required=True)

    # celerybeat-mongo specific fields
    expires = me.DateTimeField()
    enabled = me.BooleanField(default=False)
    run_immediately = me.BooleanField()
    last_run_at = me.DateTimeField()
    total_run_count = me.IntField(min_value=0)

    # These are used in schedules.methods
    api_fields = ['name', 'task_type', 'machines', 'schedule_type',
                  'enabled', 'expires', 'description', 'run_immediately']

    no_changes = False

    @property
    def schedule(self):
        if self.schedule_type:
            return self.schedule_type.schedule
        else:
            raise Exception("must define interval or crontab schedule")

    @property
    def args(self):
        m = self.machines_match.get_machines()
        fire_up = self.task_type.args

        return [self.owner.id, fire_up, self.name, m]

    @property
    def task(self):
        return self.task_type.task

    # def __unicode__(self):
    #     fmt = '{0.name}: {{no schedule}}'
    #     if self.interval:
    #         fmt = '{0.name}: {0.interval}'
    #     elif self.crontab:
    #         fmt = '{0.name}: {0.crontab}'
    #     else:
    #         raise Exception("must define interval or crontab schedule")
    #     return fmt.format(self)

    def clean(self):
        if not self.schedule_type:
            msg = 'Must defined either interval or crontab schedule.'
            raise me.ValidationError(msg)
        # FIXME action - script_id
        # FIXME machines ids or machines_tags
        # maybe to use clean or validate attrs from add_cronjob_entry

    def update_validate(self, value_dict):
        for key in value_dict:
            if key in self._fields.keys():
                setattr(self, key, value_dict[key])
        self.save()

    def delete(self):
        super(Schedule, self).delete()
        Tag.objects(resource=self).delete()

    def as_dict(self):
        # Return a dict as it will be returned to the API
        machines = [machine.id for machine in self.machines_match.machines]
        return {
            'id': self.id,
            'schedule_name': self.name,
            'description': self.description or '',
            'schedule_type': unicode(self.schedule_type),
            'machines_match': machines,
            'task_type': str(self.task_type),
            'expires': str(self.expires or ''),
            'enabled': self.enabled,
            'run_immediately': self.run_immediately or '',
            'last_run_at': str(self.last_run_at or ''),
            'total_run_count': self.total_run_count or 0,
        }


class MyScheduler(MongoScheduler):
    Model = Schedule
