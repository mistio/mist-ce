from mist.io.schedules.models import Schedule
from mist.io.tag.methods import get_tags_for_resource


def list_schedules(owner):
    schedules = Schedule.objects(owner=owner, deleted=None).order_by('-_id')
    schedule_objects = []
    for schedule in schedules:
        schedule_object = schedule.as_dict()
        schedule_object["tags"] =  get_tags_for_resource(owner, schedule)
        schedule_objects.append(schedule_object)
    return schedule_objects


def filter_list_schedules(auth_context, perm='read'):
    """List scheduler entries based on the permissions granted to the user."""
    schedules = list_schedules(auth_context.owner)
    if not auth_context.is_owner():
        schedules = [schedule for schedule in schedules if schedule['id']
                     in auth_context.get_allowed_resources(rtype='schedules')]
    return schedules
