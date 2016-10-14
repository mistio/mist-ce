import json
import datetime
import mongoengine as me

from mongoengine import ValidationError
from mongoengine import NotUniqueError
from mongoengine import OperationError

from mist.core.cloud.models import Machine
from mist.core.script.models import Script
from mist.io.cronjobs.models import UserPeriodicTask

from mist.core.exceptions import BadRequestError
from mist.core.exceptions import RequiredParameterMissingError
from mist.core.exceptions import ScriptNotFoundError
from mist.core.exceptions import CronjobNameExistsError
from mist.core.exceptions import CronjobOperationError
from mist.core.exceptions import PeriodicTaskNotFound
from mist.core.exceptions import InvalidCron

from celery.schedules import crontab_parser


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


def add_cronjob_entry(auth_context, params):
    """Add an entry to user cronjobs in the db"""
    owner = auth_context.owner
    name = params.get('name')
    if name is None or name == '':
        raise RequiredParameterMissingError('name')

    script_id = params.get('script_id', '')
    action = params.get('action', '')

    if action not in ['', 'reboot', 'destroy', 'start', 'shutdown']:
        raise BadRequestError("Action is not correct")

    if script_id:
        try:
            Script.objects.get(owner=owner, id=script_id)
        except me.DoesNotExist:
            raise ScriptNotFoundError('Script with id %s does not '
                                      'exist' % script_id)
        # SEC require permission RUN on script
        auth_context.check_perm('script', 'run', script_id)

    machines_per_cloud = params.get('machines_per_cloud')
    for pair in machines_per_cloud:
        cloud_id = pair[0]
        machine_id = pair[1]

        # SEC require permission READ on cloud
        auth_context.check_perm("cloud", "read", cloud_id)
        try:
            machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
            machine_uuid = machine.id
        except me.DoesNotExist:
            machine_uuid = ""

        if action:
            # SEC require permission ACTION on machine
            auth_context.check_perm("machine", action, machine_uuid)
        else:
            # SEC require permission RUN_SCRIPT on machine
            auth_context.check_perm("machine", "run_script", machine_uuid)

    pt_args = {k: v for k, v in params.items()
               if k in UserPeriodicTask.api_fields}
    pt_args.update({
        'owner': owner,
        'kwargs': {},
    })

    if params.get('action'):
        pt_args.update({
            'task': 'mist.core.tasks.group_machines_actions',
            'args': [owner.id, params.get('action'),
                     params.get('name'),
                     params.get('machines_per_cloud')],
        })
    else:
        pt_args.update({
            'task': 'mist.core.tasks.group_run_script',
            'args': [owner.id, script_id, params.get('name'),
                     params.get('machines_per_cloud')],
        })

    cronjob_type = params.get('cronjob_type')
    if cronjob_type not in ['crontab', 'interval', 'one_off']:
        raise BadRequestError('Cronjob type must be one off these '
                              '(crontab, interval, one_off)]')

    if cronjob_type == 'crontab' or cronjob_type == 'interval':
        future_date = params.get('expires')
    elif cronjob_type == 'one_off':
        future_date = params.get('cronjob_entry')

    try:
        future_date = datetime.datetime.strptime(future_date,
                                                 '%Y-%m-%d %H:%M:%S')
    except ValueError:
        raise BadRequestError('Expiration date value was not valid')
    now = datetime.datetime.now()
    if future_date < now:
        raise BadRequestError('Date of future task is in the past. Please'
                              ' contact Marty McFly')

    if cronjob_type == 'crontab':
        cronj_entry = json.loads(params.get('cronjob_entry', '[]'))
        validate_cronjob_entry(cronj_entry)
        pt_args.update({'crontab': UserPeriodicTask.UserCrontab(**cronj_entry)})

    elif cronjob_type == 'interval':
        cronj_entry = json.loads(params.get('cronjob_entry', '[]'))
        pt_args.update(
            {'interval': UserPeriodicTask.UserInterval(**cronj_entry)})

    elif cronjob_type == 'one_off':
        delta = future_date - now
        future_date += datetime.timedelta(minutes=1)
        interval = UserPeriodicTask.UserInterval(**{'period': 'seconds',
                                                    'every': delta.seconds})
        pt_args.update({'interval': interval,
                        'expires': future_date.strftime('%Y-%m-%d %H:%M:%S')
                        })

    ptask = UserPeriodicTask(**pt_args)

    # Check if the action succeeded and saved
    try:
        ptask.save()
    except ValidationError as e:
        raise BadRequestError({"msg": e.message, "errors": e.to_dict()})
    except NotUniqueError:
        raise CronjobNameExistsError()
    except OperationError:
        raise CronjobOperationError()
    return ptask


def edit_cronjob_entry(auth_context, cronjob_id, params):
    """Edit a cronjob entry in the db"""
    owner = auth_context.owner
    # Check if entry exists
    try:
        ptask = UserPeriodicTask.objects.get(id=cronjob_id, owner=owner)
    except UserPeriodicTask.DoesNotExist:
        raise PeriodicTaskNotFound()

    script_id = params.get('script_id', '')
    action = params.get('action', '')

    if action not in ['', 'reboot', 'destroy', 'start', 'shutdown']:
        raise BadRequestError("Action is not correct")

    if script_id:
        try:
            Script.objects.get(owner=owner, id=script_id)
        except me.DoesNotExist:
            raise ScriptNotFoundError('Script with id %s does not '
                                      'exist' % script_id)
        # SEC require permission RUN on script
        auth_context.check_perm('script', 'run', script_id)

    machines_per_cloud = params.get('machines_per_cloud')
    for pair in machines_per_cloud:
        cloud_id = pair[0]
        machine_id = pair[1]

        # SEC require permission READ on cloud
        auth_context.check_perm("cloud", "read", cloud_id)
        try:
            machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
            machine_uuid = machine.id
        except me.DoesNotExist:
            machine_uuid = ""

        if action:
            # SEC require permission ACTION on machine
            auth_context.check_perm("machine", action, machine_uuid)
        else:
            # SEC require permission RUN_SCRIPT on machine
            auth_context.check_perm("machine", "run_script", machine_uuid)

    # check what the user previous has, script or action
    if ptask.script_id and params.get('action'):
        raise BadRequestError("You cannot change from script to action")
    if ptask.action and script_id:
        raise BadRequestError("You cannot change from action to script")

    pt_args = {k: v for k, v in params.items()
               if k in UserPeriodicTask.api_fields}

    name = params.get('name')
    if name is not None and name != '':
        pt_args.update({'name': name})

    if params.get('description'):
        pt_args.update({'description': params.get('description')})

    if params.get('enabled'):
        pt_args.update({'enabled': params.get('enabled')})

    if params.get('run_immediately'):
        pt_args.update({'run_immediately': params.get('run_immediately')})

    cronjob_type = params.get('cronjob_type', '')

    # cronjob_type not empty string
    if cronjob_type not in ['crontab', 'interval', 'one_off']:
        raise BadRequestError('Cronjob type must be one off these '
                              '(crontab, interval, one_off)]')

    if cronjob_type == 'crontab' or cronjob_type == 'interval':
        future_date = params.get('expires')
    elif cronjob_type == 'one_off':
        future_date = params.get('cronjob_entry')

    try:
        future_date = datetime.datetime.strptime(future_date,
                                                 '%Y-%m-%d %H:%M:%S')
    except ValueError:
        raise BadRequestError('Expiration date value was not valid')
    now = datetime.datetime.now()
    if future_date < now:
        raise BadRequestError('Date of future task is in the past. Please'
                              ' contact Marty McFly')

    if params.get('action') or params.get('machines_per_cloud'):

        pt_args.update({'args': [owner, params.get('action', ptask.action),
                                 params.get('machines_per_cloud',
                                            ptask.machines_per_cloud)]})

    if params.get('script_id') or params.get('machines_per_cloud'):
        pt_args.update({'args': [owner, params.get('script_id',
                                                        ptask.script_id),
                                 params.get('machines_per_cloud',
                                            ptask.machines_per_cloud)]})

    if cronjob_type == 'crontab':
        cronj_entry = json.loads(params.get('cronjob_entry', '[]'))
        validate_cronjob_entry(cronj_entry)
        pt_args.update({'expires': future_date.strftime('%Y-%m-%d %H:%M:%S'),
                        'interval': None,
                        'crontab': UserPeriodicTask.UserCrontab(**cronj_entry)})

    elif cronjob_type == 'interval':
        cronj_entry = json.loads(params.get('cronjob_entry', '[]'))
        pt_args.update({'crontab': None,
                        'interval': UserPeriodicTask.UserInterval(**cronj_entry)})

    elif cronjob_type == 'one_off':
        delta = future_date - datetime.datetime.now()
        future_date += datetime.timedelta(minutes=1)
        interval = UserPeriodicTask.UserInterval(**{'period': 'seconds',
                                                    'every': delta.seconds})
        pt_args.update({'interval': interval,
                        'crontab': None,
                        'expires': future_date.strftime('%Y-%m-%d %H:%M:%S')
                        })

    try:
        ptask.update_validate(pt_args)
    except ValidationError as e:
        raise BadRequestError({"msg": e.message, "errors": e.to_dict()})

    return ptask