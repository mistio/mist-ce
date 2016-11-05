#  FIXME add docstring abstract bla bla
import json
import logging
import datetime
import mongoengine as me
from mist.core.cloud.models import Machine
from mist.core.script.models import Script
import mist.io.schedules.models as schedules
from mist.io.exceptions import NotFoundError
from mist.core.exceptions import BadRequestError
from mist.core.exceptions import ScriptNotFoundError
from mist.core.exceptions import ScheduleOperationError
from mist.core.exceptions import ScheduleNameExistsError

log = logging.getLogger(__name__)


class BaseController(object):
    def __init__(self, schedule):
        """Initialize schedule controller given a schedule

        Most times one is expected to access a controller from inside the
        schedule. Like this:

          schedule = mist.io.schedules.models.Schedule.objects.get(id=s_id)
          schedule.ctl.add_entry
        """
        self.schedule = schedule

    def add(self, auth_context, **kwargs):
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
            self.update(auth_context, **kwargs)
        except me.ValidationError:
            # Propagate original error.
            raise
        return self.schedule.id

    def update(self, auth_context, **kwargs):

        """Edit an existing Schedule
        """
        owner = auth_context.owner

        script_id = kwargs.get('script_id', '')
        action = kwargs.get('action', '')

        if action not in ['', 'reboot', 'destroy', 'start', 'stop']:
            raise BadRequestError("Action is not correct")

        if (isinstance(self.schedule.task_type, schedules.ScriptTask)
                and action):
            raise BadRequestError("You cannot change from script to action")
        if (isinstance(self.schedule.task_type, schedules.ActionTask)
                and script_id):
            raise BadRequestError("You cannot change from action to script")

        if script_id:
            try:
                Script.objects.get(owner=owner, id=script_id)
            except me.DoesNotExist:
                raise ScriptNotFoundError('Script with id %s does not '
                                          'exist' % script_id)
            # SEC require permission RUN on script
            auth_context.check_perm('script', 'run', script_id)

        machines_uuids = kwargs.get('machines_uuids', '')
        machines_tags = kwargs.get('machines_tags', '')

        # convert machines' uuids to machine objects
        # and check permissions
        if machines_uuids:
            machines_obj = []
            for machine_uuid in machines_uuids:
                try:
                    machine = Machine.objects.get(id=machine_uuid,
                                                  state__ne='terminated')
                except me.DoesNotExist:
                    raise NotFoundError('Machine state is terminated')

                cloud_id = machine.cloud.id
                # SEC require permission READ on cloud
                auth_context.check_perm("cloud", "read", cloud_id)

                if action:
                    # SEC require permission ACTION on machine
                    auth_context.check_perm("machine", action, machine_uuid)
                else:
                    # SEC require permission RUN_SCRIPT on machine
                    auth_context.check_perm("machine", "run_script",
                                            machine_uuid)

                machines_obj.append(machine)

        # check permissions for machines' tags
        if machines_tags:
            if action:
                # SEC require permission ACTION on machine
                auth_context.check_perm("machine", action, None)
            else:
                # SEC require permission RUN_SCRIPT on machine
                auth_context.check_perm("machine", "run_script", None)

        # set schedule attributes
        for key, value in kwargs.iteritems():
            if key in self.schedule._fields.keys():
                setattr(self.schedule, key, value)

        if machines_uuids:
            self.schedule.machines_match = schedules.ListOfMachines(
                machines=machines_obj)
        elif machines_tags:
            self.schedule.machines_match = schedules.TaggedMachines(
                tags=machines_tags,
                owner=owner)

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
                      e.ti_dict())
            raise BadRequestError({"msg": e.message, "errors": e.to_dict()})
        except me.NotUniqueError:
            raise ScheduleNameExistsError()
        except me.OperationError:
            raise ScheduleOperationError()

        return self.schedule.id
