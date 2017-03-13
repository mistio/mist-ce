import logging
import datetime

import celery

import mongoengine as me


from mist.io.clouds.models import Cloud


log = logging.getLogger(__name__)


class PollingInterval(me.EmbeddedDocument):

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
    default_interval = me.EmbeddedDocumentField(
        PollingInterval, required=True, default=PollingInterval(every=0)
    )
    override_intervals = me.EmbeddedDocumentListField(PollingInterval)

    # Optional arguments.
    queue = me.StringField()
    exchange = me.StringField()
    routing_key = me.StringField()
    soft_time_limit = me.IntField()

    # Used internally by the scheduler.
    last_run_at = me.DateTimeField()
    total_run_count = me.IntField(min_value=0)
    run_immediately = me.BooleanField()

    # Extra fields used by poller.
    last_success = me.DateTimeField()
    last_failure = me.DateTimeField()
    last_attempt_started = me.DateTimeField()
    failure_count = me.IntField(default=0)

    def get_name(self):
        """Construct name based on self.task"""
        try:
            return self.task.split('.')[-1]
        except NotImplementedError:
            return '%s: No task specified.' % self.__class__.__name__

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
        """Return task args for this schedule"""
        return [str(self.id)]

    @property
    def kwargs(self):
        """Return task kwargs for this schedule"""
        return {}

    @property
    def enabled(self):
        """Whether this task is currently enabled or not"""
        return bool(self.interval.timedelta)

    @property
    def interval(self):
        """Merge multiple intervals into one

        Returns a dynamic PollingInterval, with the highest frequency of any
        override schedule or the default schedule.

        """
        interval = self.default_interval
        for i in self.override_intervals:
            if not i.expired():
                if not interval.timedelta or i.timedelta < interval.timedelta:
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

    def add_interval(self, interval, ttl=300, name=''):
        """Add an override schedule to the scheduled task

        Override schedules must define an interval in seconds, as well as a
        TTL (time to live), also in seconds. Override schedules cannot be
        removed, so short TTL's should be used. You can however add a new
        override schedule again, thus practically extending the time where an
        override is in effect.

        Override schedules can only increase, not decrease frequency of the
        schedule, in relation to that define in the `default_interval`.
        """
        assert isinstance(interval, int) and interval > 0
        assert isinstance(ttl, int) and 0 < ttl < 3600
        expires = datetime.datetime.now() + datetime.timedelta(seconds=ttl)
        self.override_intervals.append(
            PollingInterval(name=name, expires=expires, every=interval)
        )

    def cleanup_expired_intervals(self):
        """Remove override schedules that have expired"""
        self.override_intervals = [override
                                   for override in self.override_intervals
                                   if not override.expired()]

    def set_default_interval(self, interval):
        """Set default interval

        This is the interval used for this schedule, if there is no active
        override schedule with a smaller interval. The default interval never
        expires. To disable a task, simply set `enabled` equal to False.
        """
        self.default_interval = PollingInterval(name='default', every=interval)

    def __unicode__(self):
        return "%s %s" % (self.get_name(), self.interval or '(no interval)')


class DebugPollingSchedule(PollingSchedule):

    task = 'mist.io.poller.tasks.debug'

    value = me.StringField()


class CloudPollingSchedule(PollingSchedule):

    cloud = me.ReferenceField(Cloud, reverse_delete_rule=me.CASCADE)

    def get_name(self):
        return '%s(%s)' % (super(CloudPollingSchedule, self).get_name(),
                           self.cloud)

    @classmethod
    def add(cls, cloud, interval=None, ttl=300):
        try:
            schedule = cls.objects.get(cloud=cloud)
        except cls.DoesNotExist:
            schedule = cls(cloud=cloud)
        schedule.set_default_interval(cloud.polling_interval)
        if interval is not None:
            schedule.add_interval(interval, ttl)
        schedule.run_immediately = True
        schedule.cleanup_expired_intervals()
        schedule.save()
        return schedule

    @property
    def enabled(self):
        try:
            return (super(CloudPollingSchedule, self).enabled
                    and self.cloud.enabled
                    and not self.cloud.deleted)
        except me.DoesNotExist:
            log.error('Cannot get cloud for polling schedule.')
            return False

    @property
    def interval(self):
        try:
            if self.default_interval.every != self.cloud.polling_interval:
                log.warning("Schedule has different interval from cloud, "
                            "fixing")
                self.default_interval.every = self.cloud.polling_interval
                self.save()
            return super(CloudPollingSchedule, self).interval
        except me.DoesNotExist:
            log.error('Cannot get interval. Cloud is missing')
            return PollingInterval(every=0)


class ListMachinesPollingSchedule(CloudPollingSchedule):

    task = 'mist.io.poller.tasks.list_machines'
