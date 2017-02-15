import mongoengine as me
from datetime import datetime
from pyramid.response import Response

from mist.io.schedules.models import Schedule

from mist.io.auth.methods import auth_context_from_request

from mist.io.exceptions import ScheduleTaskNotFound
from mist.io.exceptions import RequiredParameterMissingError

from mist.io.helpers import trigger_session_update
from mist.io.helpers import view_config, params_from_request

from mist.io.methods import filter_list_schedules

from mist.io.tag.methods import resolve_id_and_set_tags


OK = Response("OK", 200)


# SEC
@view_config(route_name='api_v1_schedules', request_method='POST',
             renderer='json')
def add_schedule_entry(request):
    """
    Add an entry to user schedules
    Add permission required on schedule.
    READ permission required on cloud.
    RUN_SCRIPT permission required on machine.
    RUN permission required on script.
    ---
    script_id:
      type: string
    action:
      type: string
    machines_uuids:
      required: true
      type: array
      description: list of machines_uuids
    machines_tags:
      required: true
      type: array
      description: list of machines_tags
    name:
      required:true
      type:string
      description: schedule name
    task_enabled:
      type: boolean
      description: schedule is ready to run
    run_immediately:
      type: boolean
      description: run immediately only  the first time
    expires:
      type: string
      description: expiration date
    description:
      type: string
      description: describe schedule
    schedule_type:
      type: string
      description: three different types, interval, crontab, one_off
    schedule_entry:
      type: object
      description: period of time
    params:
      type: string
    """
    params = params_from_request(request)

    # SEC
    auth_context = auth_context_from_request(request)
    # SEC require ADD permission on schedule
    schedule_tags = auth_context.check_perm("schedule", "add", None)

    name = params.pop('name')

    schedule = Schedule.add(auth_context, name, **params)

    if schedule_tags:
        resolve_id_and_set_tags(auth_context.owner, 'schedule', schedule.id,
                                schedule_tags.items())
    trigger_session_update(auth_context.owner, ['schedules'])
    return schedule.as_dict()


@view_config(route_name='api_v1_schedules', request_method='GET',
             renderer='json')
def list_schedules_entries(request):
    """
    List user schedules entries, order by _id
    READ permission required on schedules
    ---
    """

    auth_context = auth_context_from_request(request)

    # SEC
    schedules_list = filter_list_schedules(auth_context)

    return [schedule for schedule in schedules_list]


# SEC
@view_config(route_name='api_v1_schedule', request_method='GET',
             renderer='json')
def show_schedule_entry(request):
    """
    Show a schedule details of a user
    READ permission required on schedule
    ---
    schedule_id:
      type: string
    """
    schedule_id = request.matchdict['schedule_id']
    auth_context = auth_context_from_request(request)

    if not schedule_id:
        raise RequiredParameterMissingError('No schedule id provided')

    try:
        schedule = Schedule.objects.get(id=schedule_id, deleted=None,
                                        owner=auth_context.owner)
    except me.DoesNotExist:
        raise ScheduleTaskNotFound()

    # SEC require READ permission on schedule
    auth_context.check_perm('schedule', 'read', schedule_id)

    return schedule.as_dict()


@view_config(route_name='api_v1_schedule', request_method='DELETE',
             renderer='json')
def delete_schedule(request):
    """
    Delete a schedule entry of a user
    REMOVE permission required on schedule
    ---
    schedule_id:
      type: string
    """
    schedule_id = request.matchdict['schedule_id']
    auth_context = auth_context_from_request(request)

    if not schedule_id:
        raise RequiredParameterMissingError('No schedule id provided')

    # Check if entry exists
    try:
        schedule = Schedule.objects.get(id=schedule_id, deleted=None)
    except me.DoesNotExist:
        raise ScheduleTaskNotFound()

    # SEC
    auth_context.check_perm('schedule', 'remove', schedule_id)

    # NOTE: Do not perform an atomic operation when marking a schedule as
    # deleted, since we do not wish to bypass pre-save validation/cleaning.
    schedule.deleted = datetime.utcnow()
    schedule.save()

    trigger_session_update(auth_context.owner, ['schedules'])
    return OK


# SEC
@view_config(route_name='api_v1_schedule',
             request_method='PATCH', renderer='json')
def edit_schedule_entry(request):
    """
    Edit a schedule entry
    EDIT permission required on schedule
    READ permission required on cloud.
    RUN_SCRIPT permission required on machine.
    RUN permission required on script.

    ---
    script_id:
      type: string
    action:
      type: string
     machines_uuids:
      required: true
      type: array
      description: list of machines_uuids
    machines_tags:
      required: true
      type: array
      description: list of machines_tags
    name:
      required:true
      type:string
      description: schedule name
    enabled:
      type: boolean
      description: schedule is ready to run
    run_immediately:
      type: boolean
      description: run immediately only  the first time
    expires:
      type: string
      description: expiration date
    description:
      type: string
      description: describe schedule
    schedule_type:
      type: string
      description: three different types, interval, crontab, one_off
    schedule_entry:
      type: object
      description: period of time
    schedule_id:
      type: string
    params:
      type: string
    """

    auth_context = auth_context_from_request(request)
    params = params_from_request(request)
    schedule_id = request.matchdict['schedule_id']

    if not schedule_id:
        raise RequiredParameterMissingError('No schedule id provided')

    # SEC require EDIT permission on schedule
    auth_context.check_perm('schedule', 'edit', schedule_id)

    owner = auth_context.owner
    # Check if entry exists
    try:
        schedule = Schedule.objects.get(id=schedule_id, owner=owner,
                                        deleted=None)
    except me.DoesNotExist:
        raise ScheduleTaskNotFound()

    schedule.ctl.set_auth_context(auth_context)
    schedule.ctl.update(**params)

    trigger_session_update(auth_context.owner, ['schedules'])
    return schedule.as_dict()
