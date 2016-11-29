"""Definition of base classes for Schedules

This currently contains only BaseController. It includes basic functionality
for a given schedule.
Cloud specific controllers are in `mist.io.schedules.controllers`.
"""
import json
import logging
import datetime
import mongoengine as me
from mist.io.scripts.models import Script
from mist.io.exceptions import MistError
from mist.core.rbac.methods import AuthContext
from mist.io.exceptions import InternalServerError
from mist.core.exceptions import BadRequestError
from mist.core.exceptions import ScriptNotFoundError
from mist.core.exceptions import ScheduleOperationError
from mist.core.exceptions import ScheduleNameExistsError


log = logging.getLogger(__name__)


class BaseController(object):
    """Abstract base class for every schedule/kind_of_machines controller

    This base controller factors out all the steps common to all schedules
    into a base class, and defines an interface for kinf_of_machines specific
    schedule controllers

    Subclasses are meant to extend or override methods of this base class to
    account for differencies between different schedule types.
    """
    def __init__(self, schedule, auth_context=None):
        """Initialize schedule controller given a schedule

        Most times one is expected to access a controller from inside the
        schedule. Like this:

          schedule = mist.io.schedules.models.Schedule.objects.get(id=s_id)
          schedule.ctl.add()
        """
        self.schedule = schedule
        self._auth_context = auth_context

    def set_auth_context(self, auth_context):
        assert isinstance(auth_context, AuthContext)
        self._auth_context = auth_context

    @property
    def auth_context(self):
        if self._auth_context is None:
            raise Exception("Forgot to set auth_context")
        elif self._auth_context is False:
            return None
        return self._auth_context

    def add(self, **kwargs):
        """Add an entry to the database

        This is only to be called by `Schedule.add` classmethod to create
        a schedule. Fields `owner` and `name` are already populated in
        `self.schedule`. The `self.schedule` is not yet saved.

        """

        # check if one of these pairs exist
        # script_id/action and machines_uuids/ machines_tags
        if not (kwargs.get('script_id', '') or kwargs.get('action', '')):
            raise BadRequestError("You must provide script_id "
                                  "or machine's action")

        if not (kwargs.get('machines_uuids') or kwargs.get('machines_tags')):
            raise BadRequestError(
                "You must provide a list of machine ids or tags")

        try:
            self.update(**kwargs)
        except me.ValidationError:
            # Propagate original error.
            raise
        return self.schedule.id

    def update(self, **kwargs):

        import mist.io.schedules.models as schedules

        """Edit an existing Schedule
        """
        if self.auth_context is not None:
            auth_context = self.auth_context
        else:
            raise MistError("You are not authorized to update schedule")

        owner = auth_context.owner

        script_id = kwargs.get('script_id', '')
        action = kwargs.get('action', '')

        if action not in ['', 'reboot', 'destroy', 'start', 'stop']:
            raise BadRequestError("Action is not correct")

        if script_id:
            try:
                Script.objects.get(owner=owner, id=script_id)
            except me.DoesNotExist:
                raise ScriptNotFoundError('Script with id %s does not '
                                          'exist' % script_id)
            # SEC require permission RUN on script
            auth_context.check_perm('script', 'run', script_id)

        # set schedule attributes
        for key, value in kwargs.iteritems():
            if key in self.schedule._fields.keys():
                setattr(self.schedule, key, value)

        # Schedule specific kwargs preparsing.
        try:
            self._update__preparse_machines(auth_context, kwargs)
        except MistError as exc:
            log.error("Error while updating schedule %s: %r",
                      self.schedule.id, exc)
            raise
        except Exception as exc:
            log.exception("Error while preparsing kwargs on update %s",
                          self.schedule.id)
            raise InternalServerError(exc=exc)

        if action:
            self.schedule.task_type = schedules.ActionTask(action=action)
        elif script_id:
            self.schedule.task_type = schedules.ScriptTask(script_id=script_id)

        schedule_type = kwargs.get('schedule_type')
        if schedule_type not in ['crontab', 'interval', 'one_off', None]:
            raise BadRequestError('schedule type must be one of these '
                                  '(crontab, interval, one_off)]')

        future_date = None
        if (schedule_type == 'crontab' or
                isinstance(self.schedule.schedule_type, schedules.Crontab)):
            future_date = kwargs.get('expires',
                                     str(self.schedule.expires)) or ''

        elif (schedule_type == 'interval' or
                isinstance(self.schedule.schedule_type, schedules.Interval)):
            future_date = kwargs.get('expires',
                                     str(self.schedule.expires)) or ''

        elif schedule_type == 'one_off':
            future_date = kwargs.get('schedule_entry', '')
            if not future_date:
                raise BadRequestError('one_off schedule requires date '
                                      'given in schedule_entry')

        if future_date:
            try:
                future_date = datetime.datetime.strptime(future_date,
                                                         '%Y-%m-%d %H:%M:%S')
            except ValueError:
                raise BadRequestError('Expiration date value was not valid')
            now = datetime.datetime.now()
            if future_date < now:
                raise BadRequestError('Date of future task is in the past. '
                                      'Please contact Marty McFly')

        if schedule_type == 'crontab':
            schedule_entry = json.loads(kwargs.get('schedule_entry', '{}'))
            for k in schedule_entry.keys():
                if k not in ['minute', 'hour', 'day_of_week', 'day_of_month',
                             'month_of_year']:
                    raise BadRequestError("Invalid key given: %s" % k)
            self.schedule.schedule_type = schedules.Crontab(**schedule_entry)

        elif schedule_type == 'interval':
            schedule_entry = json.loads(kwargs.get('schedule_entry', '{}'))
            for k in schedule_entry.keys():
                if k not in ['period', 'every']:
                    raise BadRequestError("Invalid key given: %s" % k)

            self.schedule.schedule_type = schedules.Interval(**schedule_entry)

        elif schedule_type == 'one_off':
            delta = future_date - now
            future_date += datetime.timedelta(minutes=1)
            interval = schedules.Interval(period='seconds',
                                          every=delta.seconds)
            self.schedule.schedule_type = interval
            self.schedule.expires = future_date.strftime('%Y-%m-%d %H:%M:%S')

        try:
            self.schedule.save()
        except me.ValidationError as e:
            log.error("Error updating %s: %s", self.schedule.name,
                      e.to_dict())
            raise BadRequestError({"msg": e.message, "errors": e.to_dict()})
        except me.NotUniqueError:
            raise ScheduleNameExistsError()
        except me.OperationError:
            raise ScheduleOperationError()

        return self.schedule.id

    # FIXME
    def _update__preparse_machines(self, auth_context, kwargs):
        """Preparse machines arguments to `self.uppdate`

        This is called by `self.update` when adding a new schedule,
        in order to apply pre processing to the given params. Any subclass
        that requires any special pre processing of the params passed to
        `self.update`, SHOULD override this method.

        Params:
        kwargs: A dict of the keyword arguments that will be set as attributes
            to the `Schedule` model instance stored in `self.schedule`.
            This method is expected to modify `kwargs` in place and set the
            specific field of each scheduler.

        Subclasses MAY override this method.

        """
        return
