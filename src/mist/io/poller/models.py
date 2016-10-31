import datetime

import celery

import mongoengine as me


from mist.core.user.models import Owner

from mist.io.clouds.models import Cloud


class Interval(me.EmbeddedDocument):

    name = me.StringField()  # optional field for labeling interval
    every = me.IntField(required=True)  # seconds
    expires = me.DateTimeField()

    @property
    def timedelta(self):
        return datetime.timedelta(seconds=self.every)

    def expired(self):
        return self.expires and self.expires < datetime.datetime.now()

    def __unicode__(self):
        msg = 'every %s' % self.timedelta
        if self.expires is not None:
            msg += ' until %s' % self.expires
        if self.expired():
            msg += ' **EXPIRED**'
        elif self.expires:
            msg += ' (in %s)' % (self.expires - datetime.datetime.now())
        if self.name:
            msg += ' [%s]' % self.name
        return msg


class PollingSchedule(me.Document):

    meta = {
        'allow_inheritance': True,
    }

    # We use a unique name for easy identification and to avoid running the
    # same schedule twice. The name is autopopulated during the invocation of
    # the `clean` method.
    name = me.StringField(unique=True)

    # The following fields are defined in celerybeatmongo.models.PeriodicTask.
    # Here, we define no fields in the base class, and expect subclasses to
    # either define their fields, or simply use properties.
    # task = me.StringField(required=True)
    # args = me.ListField()
    # kwargs = me.DictField()

    # Scheduling information. Don't edit them directly, just use the model
    # methods.
    default_interval = me.EmbeddedDocumentField(Interval, required=True)
    override_intervals = me.EmbeddedDocumentListField(Interval)
    enabled = me.BooleanField(default=True)

    # Optional arguments.
    queue = me.StringField()
    exchange = me.StringField()
    routing_key = me.StringField()
    soft_time_limit = me.IntField()

    # Used internally by the scheduler.
    last_run_at = me.DateTimeField()
    total_run_count = me.IntField(min_value=0)
    run_immediately = me.BooleanField()

    def get_name(self):
        """Construct name based on self.{task,args,kwargs}"""
        parts = []
        for arg in self.args:
            parts.append('%r' % arg)
        for kwarg in self.kwargs.iteritems():
            parts.append('%s=%r' % kwarg)
        print parts
        return '%s(%s)' % (self.task, ', '.join(parts))

    def clean(self):
        """Automatically set value of name"""
        self.name = self.get_name()

    @property
    def task(self):
        """Return task name for this schedule

        Subclasses should define an attribute, property or field to do this.
        """
        raise NotImplementedError()

    @property
    def args(self):
        """Return task args for this schedule

        Subclasses should define an attribute, property or field to do this.
        """
        return []

    @property
    def kwargs(self):
        """Return task kwargs for this schedule

        Subclasses should define an attribute, property or field to do this.
        """
        return {}

    @property
    def interval(self):
        """Merge multiple intervals into one

        Returns a dynamic Interval, with the highest frequency of any override
        schedule or the default schedule.

        """
        interval = self.default_interval
        for i in self.override_intervals:
            if not i.expired() and i.timedelta < interval.timedelta:
                interval = i
        return interval

    @property
    def schedule(self):
        """Return a celery schedule instance

        This is used internally by celerybeatmongo scheduler
        """
        return celery.schedules.schedule(self.interval.timedelta)

    @property
    def expires(self):
        return None

    def add_interval(self, interval, ttl, name=''):
        """Add an override schedule to the scheduled task

        Override schedules must define an interval in seconds, as well as a
        TTL (time to live), also in seconds. Override schedules cannot be
        removed, so short TTL's should be used. You can however add a new
        override schedule again, thus practically extending the time where an
        override is in effect.

        Override schedules can only increase, not decrease frequency of the
        schedule, in relation to that define in the `default_interval`.
        """
        expires = datetime.datetime.now() + datetime.timedelta(seconds=ttl)
        self.override_intervals.append(Interval(name=name, expires=expires,
                                                every=interval))

    def set_default_interval(self, interval):
        """Set default interval

        This is the interval used for this schedule, if there is no active
        override schedule with a smaller interval. The default interval never
        expires. To disable a task, simply set `enabled` equal to False.
        """
        self.default_interval = Interval(name='default', every=interval)

    def __unicode__(self):
        return "%s %s" % (self.get_name(), self.interval or '(no interval)')


class DebugPollingSchedule(PollingSchedule):

    value = me.StringField()

    @property
    def task(self):
        return 'mist.io.poller.tasks.debug'

    @property
    def args(self):
        return [self.value]


class ListMachinesPollingSchedule(PollingSchedule):

    owner = me.ReferenceField(Owner)
    cloud = me.ReferenceField(Cloud)

    # Redefine default_interval to give it a default value.
    default_interval = me.EmbeddedDocumentField(Interval, required=True,
                                                default=Interval(every=3600))

    @property
    def task(self):
        return 'mist.io.poller.tasks.list_machines'

    @property
    def args(self):
        return [self.cloud.id]
