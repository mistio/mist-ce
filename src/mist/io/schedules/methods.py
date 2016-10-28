import json
import datetime
import mongoengine as me
from celery.schedules import crontab_parser
from mist.core.cloud.models import Machine
from mist.core.script.models import Script
import mist.io.schedules.models as schedules
from mist.io.helpers import trigger_session_update

from mist.io.exceptions import NotFoundError
from mist.core.exceptions import InvalidCron
from mist.core.exceptions import BadRequestError
from mist.core.exceptions import ScriptNotFoundError
from mist.core.exceptions import PeriodicTaskNotFound
from mist.core.exceptions import ScheduleOperationError
from mist.core.exceptions import ScheduleNameExistsError
from mist.core.exceptions import RequiredParameterMissingError


def validate_cronjob_entry(cronj_entry):
    try:
        for k, v in cronj_entry.items():
            if k == 'minute':
                crontab_parser(60).parse(v)
            elif k == 'hour':
                crontab_parser(24).parse(v)
            elif k == 'day_of_week':
                crontab_parser(7).parse(v)
            elif k == 'day_of_month':
                crontab_parser(31, 1).parse(v)
            elif k == 'month_of_year':
                crontab_parser(12, 1).parse(v)
    except Exception:
        raise InvalidCron()


def add_schedule_entry(auth_context, params):
    """Add an entry to user schedules in the db"""
    owner = auth_context.owner
    name = params.get('name')

    # TODO
    # validate params, if sth is extra pop it
    if name is None or name == '':
        raise RequiredParameterMissingError('name')

    script_id = params.get('script_id', '')
    action = params.get('action', '')

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

    machines_uuids = params.get('machines_uuids', '')
    machines_tags = params.get('machines_tags', '')

    if not (machines_uuids or machines_tags):
        raise BadRequestError("You must provide a list of machine ids or tags")

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
                auth_context.check_perm("machine", "run_script", machine_uuid)

            machines_obj.append(machine)

    # todo TaggedMachines and also check permissions

    # create a dict for Scheduler
    sched_args = {k: v for k, v in params.items()
                  if k in schedules.Schedule.api_fields}

    sched_args.update({
        'owner': owner,
        'kwargs': {},
    })

    if machines_uuids:
        sched_args['machines_match'] = schedules.ListOfMachines(
                                     **{'machines': machines_obj}
        )
    # todo for TaggedMachines and also check permissions

    if action:
        sched_args['task_type'] = schedules.ActionTask(**{'action': action})
    else:
        sched_args['task_type'] = schedules.ScriptTask(
                                  **{'script_id': script_id})

    schedule_type = params.get('schedule_type')
    if schedule_type not in ['crontab', 'interval', 'one_off']:
        raise BadRequestError('schedule type must be one of these '
                              '(crontab, interval, one_off)]')

    if schedule_type == 'crontab' or schedule_type == 'interval':
        future_date = params.get('expires', '')
    elif schedule_type == 'one_off':
        future_date = params.get('schedule_entry', '')
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
            raise BadRequestError('Date of future task is in the past. Please'
                                  ' contact Marty McFly')

    if schedule_type == 'crontab':
        schedule_entry = json.loads(params.get('schedule_entry', '[]'))
        validate_cronjob_entry(schedule_entry)
        sched_args.update(
            {'schedule_type': schedules.Crontab(**schedule_entry)}
            )

    elif schedule_type == 'interval':
        schedule_entry = json.loads(params.get('schedule_entry', '[]'))
        sched_args.update(
            {'schedule_type': schedules.Interval(**schedule_entry)}
            )

    elif schedule_type == 'one_off':
        delta = future_date - now
        future_date += datetime.timedelta(minutes=1)
        interval = schedules.Interval(**{'period': 'seconds',
                                         'every': delta.seconds})
        sched_args.update({'schedule_type': interval,
                          'expires': future_date.strftime('%Y-%m-%d %H:%M:%S')}
                          )

    ptask = schedules.Schedule(**sched_args)

    # Check if the action succeeded and saved
    try:
        ptask.save()
    except me.ValidationError as e:
        raise BadRequestError({"msg": e.message, "errors": e.to_dict()})
    except me.NotUniqueError:
        raise ScheduleNameExistsError()
    except me.OperationError:
        raise ScheduleOperationError()

    trigger_session_update(owner, ['schedules'])
    return ptask.id


def edit_schedule_entry(auth_context, schedule_id, params):
    """Edit a schedule entry in the db"""
    owner = auth_context.owner
    # Check if entry exists
    try:
        ptask = schedules.Schedule.objects.get(id=schedule_id, owner=owner)
    except schedules.Schedule.DoesNotExist:
        raise PeriodicTaskNotFound()

    script_id = params.get('script_id', '')
    action = params.get('action', '')

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

    machines_uuids = params.get('machines_uuids')
    if machines_uuids:
        machines_obj = []
        for machine_uuid in machines_uuids:
            try:
                machine = Machine.objects.get(id=machine_uuid)
            except me.DoesNotExist:
                raise NotFoundError('Machine with that machine id '
                                    'does not exist')

            cloud_id = machine.cloud.id
            # SEC require permission READ on cloud
            auth_context.check_perm("cloud", "read", cloud_id)

            if action:
                # SEC require permission ACTION on machine
                auth_context.check_perm("machine", action, machine_uuid)
            else:
                # SEC require permission RUN_SCRIPT on machine
                auth_context.check_perm("machine", "run_script", machine_uuid)
            # pair = (cloud_id, machine.machine_id)
            # cloud_machines_pairs.append(pair)
            machines_obj.append(machine)

    # check what the user previous has, script or action
    if ptask.script_id and params.get('action'):
        raise BadRequestError("You cannot change from script to action")
    if ptask.action and script_id:
        raise BadRequestError("You cannot change from action to script")

    sched_args = {k: v for k, v in params.items()
                  if k in schedules.Schedule.api_fields}

    if machines_uuids:
        sched_args['machines_match'] = machines_obj

    name = params.get('name') or ptask.name
    if name is not None and name != '':
        sched_args.update({'name': name})

    if params.get('description'):
        sched_args.update({'description': params.get('description')})

    if params.get('enabled'):
        sched_args.update({'enabled': params.get('enabled')})

    if params.get('run_immediately'):
        sched_args.update({'run_immediately': params.get('run_immediately')})

    schedule_type = params.get('schedule_type', '')

    # schedule_type not empty string
    if schedule_type not in ['crontab', 'interval', 'one_off']:
        raise BadRequestError('schedule type must be one off these '
                              '(crontab, interval, one_off)]')

    if schedule_type == 'crontab' or schedule_type == 'interval':
        future_date = params.get('expires')
    elif schedule_type == 'one_off':
        future_date = params.get('schedule_entry')
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
            raise BadRequestError('Date of future task is in the past. Please'
                                  ' contact Marty McFly')

    # TODO check these with test
    if action:
        sched_args['task_type'] = schedules.ActionTask(**{'action': action})
    else:
        sched_args['task_type'] = schedules.ScriptTask(
                               **{'script_id': script_id})

    if schedule_type == 'crontab':
        schedule_entry = json.loads(params.get('schedule_entry', '[]'))
        validate_cronjob_entry(schedule_entry)
        sched_args.update({'expires': future_date.strftime(
            '%Y-%m-%d %H:%M:%S'),
            'schedule_type': schedules.Crontab(**schedule_entry)}
            )

    elif schedule_type == 'interval':
        schedule_entry = json.loads(params.get('schedule_entry', '[]'))
        sched_args.update(
                {'schedule_type': schedules.Interval(**schedule_entry)}
                )

    elif schedule_type == 'one_off':
        delta = future_date - datetime.datetime.now()
        future_date += datetime.timedelta(minutes=1)
        interval = schedules.Interval(**{'period': 'seconds',
                                         'every': delta.seconds}
                                      )
        sched_args.update({'schedule_type': interval,
                           'expires': future_date.strftime('%Y-%m-%d %H:%M:%S'
                                                           )})

    try:
        ptask.update_validate(sched_args)
    except me.ValidationError as e:
        raise BadRequestError({"msg": e.message, "errors": e.to_dict()})

    trigger_session_update(owner, ['schedules'])
    return ptask.id
