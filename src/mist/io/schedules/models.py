"""Schedule entity model."""
import re
import datetime
from uuid import uuid4
import celery.schedules
import mongoengine as me
from mist.io.tag.models import Tag
from mist.io.machines.models import Machine
from mist.io.exceptions import BadRequestError
from mist.io.users.models import Owner, Organization
from celerybeatmongo.schedulers import MongoScheduler
from mist.io.exceptions import ScheduleNameExistsError
from mist.io.exceptions import RequiredParameterMissingError


#: Authorized values for Interval.period
PERIODS = ('days', 'hours', 'minutes', 'seconds', 'microseconds')


class BaseScheduleType(me.EmbeddedDocument):
    """Abstract Base class used as a common interface
    for scheduler types. There are three different types
    for now: Interval, Crontab and OneOff
    """
    meta = {'allow_inheritance': True}

    @property
    def schedule(self):
        raise NotImplementedError()


class Interval(BaseScheduleType):
    meta = {'allow_inheritance': True}

    type = 'interval'
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
            return 'Interval every {0.period_singular}'.format(self)
        return 'Interval every {0.every} {0.period}'.format(self)

    def as_dict(self):
        return {
            'every': self.every,
            'period': self.period
        }


class OneOff(Interval):
    type = 'one_off'
    entry = me.DateTimeField(required=True)

    def __unicode__(self):
        return 'OneOff date to run {0.entry}'.format(self)

    def as_dict(self):
        return {
            'entry': str(self.entry)
        }


class Crontab(BaseScheduleType):
    type = 'crontab'

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

        def rfield(x):
            return str(x).replace(' ', '') or '*'

        return 'Crontab {0} {1} {2} {3} {4} (m/h/d/dM/MY)'.format(
            rfield(self.minute), rfield(self.hour),
            rfield(self.day_of_week),
            rfield(self.day_of_month), rfield(self.month_of_year),
        )

    def as_dict(self):
        return {
            'minute': self.minute,
            'hour': self.hour,
            'day_of_week': self.day_of_week,
            'day_of_month': self.day_of_month,
            'month_of_year': self.month_of_year
        }


class BaseTaskType(me.EmbeddedDocument):
    """Abstract Base class used as a common interface
    for scheduler's tasks types. Action and Script"""

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
        return 'mist.io.tasks.group_machines_actions'

    def __str__(self):
        return 'Action: %s' % self.action


class ScriptTask(BaseTaskType):
    script_id = me.StringField()

    @property
    def args(self):
        return self.script_id

    @property
    def task(self):
        return 'mist.io.tasks.group_run_script'

    def __str__(self):
        return 'Run script: %s' % self.script_id


class BaseMachinesCondition(me.EmbeddedDocument):
    """Abstract Base class used as a common interface
        for scheduler's resource types. List of
        machines_uuids or machines_tags"""

    meta = {'allow_inheritance': True}

    @property
    def sched_machines(self):
        raise NotImplementedError()


class ListOfMachinesSchedule(BaseMachinesCondition):
    machines = me.ListField(me.ReferenceField(Machine, required=True,),
                            required=True)

    @property
    def sched_machines(self):
        cloud_machines_pairs = []
        for machine in self.machines:
            if machine.state != 'terminated':
                machine_id = machine.machine_id
                cloud_id = machine.cloud.id
                cloud_machines_pairs.append((cloud_id, machine_id))

        return cloud_machines_pairs

    # def __str__(self):
    #     return 'Machines: %s' % self.machines


class TaggedMachinesSchedule(BaseMachinesCondition):
    tags = me.DictField(required=True, default={})

    @property
    def sched_machines(self):
        # all machines currently matching the tags
        cloud_machines_pairs = []
        for k, v in self.tags.iteritems():
            machines_from_tags = Tag.objects(owner=self._instance.owner,
                                             resource_type='machines',
                                             key=k)  # value=v
            for m in machines_from_tags:
                #  FIXME this is ugly, but we must refactor tags
                if m.value == v or v is None and m.value == '':
                    if m.resource.state != 'terminated':
                        machine_id = m.resource.machine_id
                        cloud_id = m.resource.cloud.id
                        cloud_machines_pairs.append((cloud_id, machine_id))

        return cloud_machines_pairs

    def validate(self, clean=True):
        if self.tags:
            regex = re.compile(r'^[a-z0-9_-]+$')
            for key, value in self.tags.iteritems():
                if not key:
                    raise me.ValidationError('You cannot add a tag '
                                             'without a key')
                elif not regex.match(key) or (value
                                              and not regex.match(value)):
                    raise me.ValidationError('Tags must be in key=value '
                                             'format and only contain the '
                                             'characters a-z, 0-9, _, -')
        super(TaggedMachinesSchedule, self).validate(clean=True)

    def clean(self):
        if not self.tags:
            self.tags = {}
        elif not isinstance(self.tags, dict):
            raise me.ValidationError('Tags must be a dictionary')

    def __str__(self):
        return 'Tags: %s' % self.tags


class Schedule(me.Document):
    """Abstract base class for every schedule attr mongoengine model.
    This model is based on celery periodic task and creates defines the fields
    common to all schedules of all types. For each different schedule type, a
    subclass should be created adding any schedule specific fields and methods.

     Documents of all Schedule subclasses will be stored on the same mongo
    collection.

    One can perform a query directly on Schedule to fetch all cloud types, like
    this:

        Schedule.objects(owner=owner).count()

    """

    meta = {
        'collection': 'schedules',
        'allow_inheritance': True,
        'indexes': [
            {
                'fields': ['owner', 'name', 'deleted'],
                'sparse': False,
                'unique': True,
                'cls': False,
            },
        ],
    }

    id = me.StringField(primary_key=True, default=lambda: uuid4().hex)
    name = me.StringField(required=True)
    description = me.StringField()
    deleted = me.DateTimeField()
    owner = me.ReferenceField(Owner, required=True)

    # celery periodic task specific fields
    queue = me.StringField()
    exchange = me.StringField()
    routing_key = me.StringField()
    soft_time_limit = me.IntField()

    # mist specific fields
    schedule_type = me.EmbeddedDocumentField(BaseScheduleType, required=True)
    task_type = me.EmbeddedDocumentField(BaseTaskType, required=True)
    machines_condition = me.EmbeddedDocumentField(BaseMachinesCondition,
                                                  required=True)

    # celerybeat-mongo specific fields
    expires = me.DateTimeField()
    start_after = me.DateTimeField()
    task_enabled = me.BooleanField(default=False)
    run_immediately = me.BooleanField()
    last_run_at = me.DateTimeField()
    total_run_count = me.IntField(min_value=0, default=0)
    max_run_count = me.IntField(min_value=0, default=0)

    no_changes = False

    # _controller_cls = None

    def __init__(self, *args, **kwargs):
        # FIXME
        import mist.io.schedules.base
        super(Schedule, self).__init__(*args, **kwargs)
        self.ctl = mist.io.schedules.base.BaseController(self)

    @classmethod
    def add(cls, auth_context, name, **kwargs):
        """Add schedule

        This is a class method, meaning that it is meant to be called on the
        class itself and not on an instance of the class.

        You're not meant to be calling this directly, but on a schedule class
        instead like this:

            schedule = Schedule.add(owner=owner, **kwargs)
        """
        owner = auth_context.owner

        if not name:
            raise RequiredParameterMissingError('name')
        if not owner or not isinstance(owner, Organization):
            raise BadRequestError('owner')
        if Schedule.objects(owner=owner, name=name, deleted=None):
            raise ScheduleNameExistsError()
        schedule = cls(owner=owner, name=name)
        schedule.ctl.set_auth_context(auth_context)
        schedule.ctl.add(**kwargs)

        return schedule

    @property
    def schedule(self):
        if self.schedule_type:
            return self.schedule_type.schedule
        else:
            raise Exception("must define interval, crontab, one_off schedule")

    @property
    def args(self):
        m = self.machines_condition.sched_machines
        fire_up = self.task_type.args

        return [self.owner.id, fire_up, self.name, m]

    @property
    def kwargs(self):
        return {}

    @property
    def task(self):
        return self.task_type.task

    @property
    def enabled(self):
        if self.deleted:
            return False
        if not self.machines_condition.sched_machines:
            return False
        if self.expires and self.expires < datetime.datetime.now():
            return False
        # if self.start_after and self.start_after < datetime.datetime.now():
        #     return False
        if self.max_run_count and (
                    (self.total_run_count or 0) >= self.max_run_count
        ):
            return False
        else:
            return self.task_enabled

    def __unicode__(self):
        fmt = '{0.name}: {{no schedule}}'
        if self.schedule_type:
            fmt = 'name: {0.name} type: {0.schedule_type._cls}'
        else:
            raise Exception("must define interval or crontab schedule")
        return fmt.format(self)

    def validate(self, clean=True):

        """
        Override mongoengine validate. We should validate crontab entry.
            Use crontab_parser for crontab expressions.
            The parser is a general purpose one, useful for parsing hours,
            minutes and day_of_week expressions.

            example for minutes:
                minutes = crontab_parser(60).parse('*/15')
                [0, 15, 30, 45]

        """
        if isinstance(self.schedule_type, Crontab):
            cronj_entry = self.schedule_type.as_dict()
            try:
                for k, v in cronj_entry.items():
                    if k == 'minute':
                        celery.schedules.crontab_parser(60).parse(v)
                    elif k == 'hour':
                        celery.schedules.crontab_parser(24).parse(v)
                    elif k == 'day_of_week':
                        celery.schedules.crontab_parser(7).parse(v)
                    elif k == 'day_of_month':
                        celery.schedules.crontab_parser(31, 1).parse(v)
                    elif k == 'month_of_year':
                        celery.schedules.crontab_parser(12, 1).parse(v)
                    else:
                        raise me.ValidationError(
                            'You should provide valid period of time')
            except celery.schedules.ParseException:
                raise me.ValidationError('Crontab entry is not valid')
            except Exception as exc:
                raise me.ValidationError('Crontab entry is not valid:%s'
                                         % exc.message)
        super(Schedule, self).validate(clean=True)

    def delete(self):
        super(Schedule, self).delete()
        Tag.objects(resource=self).delete()
        self.owner.mapper.remove(self)

    def as_dict(self):
        # Return a dict as it will be returned to the API
        sdict = {
            'id': self.id,
            'name': self.name,
            'description': self.description or '',
            'schedule': unicode(self.schedule_type),
            'schedule_type': self.schedule_type.type,
            'schedule_entry': self.schedule_type.as_dict(),
            'task_type': str(self.task_type),
            'expires': str(self.expires or ''),
            'start_after': str(self.start_after or ''),
            'task_enabled': self.task_enabled,
            'active': self.enabled,
            'run_immediately': self.run_immediately or '',
            'last_run_at': str(self.last_run_at or ''),
            'total_run_count': self.total_run_count or 0,
            'max_run_count': self.max_run_count or 0,
        }

        if isinstance(self.machines_condition, ListOfMachinesSchedule):
            machines_uuids = [machine.id for machine in
                              self.machines_condition.machines]
            sdict.update({'machines_uuids': machines_uuids})
        else:
            sdict.update({'machines_tags': self.machines_condition.tags})

        return sdict


class UserScheduler(MongoScheduler):
    Model = Schedule
