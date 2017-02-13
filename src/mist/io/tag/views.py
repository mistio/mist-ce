import mongoengine as me
from pyramid.response import Response

from mist.io.keys.models import Key
from mist.io.clouds.models import Cloud
from mist.io.scripts.models import Script
from mist.io.machines.models import Machine
from mist.io.networks.models import Network
from mist.io.schedules.models import Schedule

from mist.io.tag.methods import delete_security_tag
from mist.io.tag.methods import modify_security_tags
from mist.io.tag.methods import add_tags_to_resource
from mist.io.tag.methods import resolve_id_and_get_tags
from mist.io.tag.methods import remove_tags_from_resource
from mist.io.tag.methods import resolve_id_and_delete_tags

from mist.io.auth.methods import auth_context_from_request

from mist.io.helpers import get_resource_model
from mist.io.helpers import view_config, params_from_request

from mist.io.exceptions import RequiredParameterMissingError
from mist.io.exceptions import NotFoundError, BadRequestError

OK = Response("OK", 200)


@view_config(route_name='api_v1_tags', request_method='POST', renderer='json')
def tag_resources(request):
    """
    Batch operation for adding/removing tags from a list of resources.
    This api call provides the ability to modify the tags of a large number
    of resources. For each resource a list of dicts is passed with a key, a
    value and optionally an op field. The op field should be either '+' or '-'
    and defines whether or not the tag should be added or removed from the
    resource. If no op value is defined in the dict then '+' is assumed.
    ---
    tags:
      required: true
      type: list
    resource:
      required: true
      type: dict
    """

    auth_context = auth_context_from_request(request)
    params = params_from_request(request)

    # FIXME: This implementation is far from OK. We need to re-code the way
    # tags are handled and make sure that RBAC is properly enforced on tags

    for resource in params:
        # list of dicts of key-value pairs
        resource_tags = resource.get('tags', '')
        # dict of resource info
        resource_data = resource.get('resource', '')

        if not resource_data:
            raise RequiredParameterMissingError("resources")
        if not resource_tags:
            raise RequiredParameterMissingError("tags")
        if not resource_data.get('type') or not resource_data.get('item_id'):
            raise BadRequestError('No type or rid provided for some of the '
                                  'resources')

        # ui send this var only for machine. image, network, location
        cloud_id = resource_data.get('cloud_id')

        if cloud_id:
            auth_context.check_perm('cloud', 'read', cloud_id)
        elif resource_data['type'] in ['machine', 'image',
                                       'network', 'location']:
            raise RequiredParameterMissingError("cloud_id")
        else:
            del resource_data['cloud_id']

        query = {}
        rtype = resource_data['type']
        rid = resource_data['item_id']
        if rtype == 'machine':
            query['machine_id'] = rid
        else:
            query['id'] = rid
            query['deleted'] = None

        if cloud_id:
            query['cloud'] = cloud_id

        try:
            resource_obj = get_resource_model(rtype).objects.get(**query)
        except me.DoesNotExist:
            # if the resource can not be found just go on and process the next
            continue

        # SEC require EDIT_TAGS permission on resource
        auth_context.check_perm(rtype, 'edit_tags', resource_obj.id)

        # normalized_resources.append(resource_data)
        query['rtype'] = rtype

        # split the tags into two lists: those that will be added and those
        # that will be removed
        tags_to_add = [(tag['key'], tag['value']) for tag in filter(
            lambda tag: tag.get('op', '+') == '+', resource_tags
        )]
        # also extract the keys from all the tags to be deleted
        tags_to_remove = map(lambda tag: tag['key'],
                             filter(lambda tag: tag.get('op', '+') == '-',
                                    resource_tags))

        # SEC only Org Owners may edit the secure tags
        tags = {tag[0]: tag[1] for tag in tags_to_add}
        if not modify_security_tags(auth_context, tags, resource_obj):
            auth_context._raise(rtype, 'edit_security_tags')

        if tags_to_add:
            add_tags_to_resource(auth_context.owner, resource_obj, tags_to_add)
        if tags_to_remove:
            remove_tags_from_resource(auth_context.owner, resource_obj,
                                      tags_to_remove)

    return OK


@view_config(route_name='cloud_tags', request_method='GET', renderer='json')
def get_cloud_tags(request):
    """
    List tags of a cloud
    READ permission required on CLOUD
    ---
    cloud_id:
      in: path
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict["cloud_id"]

    # SEC require READ permission on cloud
    auth_context.check_perm("cloud", "read", cloud_id)

    return resolve_id_and_get_tags(auth_context.owner, 'cloud', cloud_id)


@view_config(route_name='api_v1_machine_tags', request_method='GET',
             renderer='json')
def get_machine_tags(request):
    """
    List tags of a machine
    READ permission required on CLOUD
    READ permission required on MACHINE
    ---
    cloud_id:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    machine_id = request.matchdict["machine_id"]
    cloud_id = request.matchdict["cloud_id"]
    auth_context.check_perm("cloud", "read", cloud_id)

    auth_context.check_perm('cloud', 'read', cloud_id)
    # SEC
    auth_context.check_perm("machine", "read", machine_id)

    return resolve_id_and_get_tags(auth_context.owner, 'machine', machine_id,
                                   cloud_id=cloud_id)


@view_config(route_name='script_tags', request_method='GET', renderer='json')
def get_script_tags(request):
    """
    List tags of a script
    READ permission required on SCRIPT
    ---
    script_id:
      in: path
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    script_id = request.matchdict["script_id"]

    # SEC require READ permission on script
    auth_context.check_perm("script", "read", script_id)

    return resolve_id_and_get_tags(auth_context.owner, 'script', script_id)


@view_config(route_name='schedule_tags', request_method='GET', renderer='json')
def get_schedule_tags(request):
    auth_context = auth_context_from_request(request)
    schedule_id = request.matchdict["schedule_id"]

    # SEC require READ permission on script
    auth_context.check_perm("schedule", "read", schedule_id)

    return resolve_id_and_get_tags(auth_context.owner, 'schedule', schedule_id)


@view_config(route_name='key_tags', request_method='GET', renderer='json')
def get_key_tags(request):
    """
    List tags of an ssh keypair
    READ permission required on KEY
    ---
    key_id:
      in: path
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    key_id = request.matchdict["key_id"]

    # SEC require READ permission on key
    auth_context.check_perm("key", "read", key_id)

    return resolve_id_and_get_tags(auth_context.owner, 'key', key_id)


@view_config(route_name='network_tags', request_method='GET', renderer='json')
def get_network_tags(request):
    """
    List tags of a network
    READ permission required on CLOUD
    READ permission required on NETWORK
    ---
    cloud_id:
      in: path
      required: true
      type: string
    network_id:
      in: path
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    network_id = request.matchdict["network_id"]
    cloud_id = request.params.get("cloud_id")

    auth_context.check_perm('cloud', 'read', cloud_id)
    # SEC require READ permission on network
    auth_context.check_perm('network', 'read', network_id)

    return resolve_id_and_get_tags(auth_context.owner, 'network', network_id,
                                   cloud_id=cloud_id)


@view_config(route_name='cloud_tags', request_method='POST', renderer='json')
def set_cloud_tags(request):
    """
    Set tags to owner's cloud
    EDIT_TAGS permission required on SCRIPT
    ---
    tags:
      type: dict
      required: true
    """
    auth_context = auth_context_from_request(request)
    params = params_from_request(request)
    cloud_id = request.matchdict["cloud_id"]

    # SEC require EDIT_TAGS permission on cloud
    auth_context.check_perm("cloud", "edit_tags", cloud_id)
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner,
                                  id=cloud_id, deleted=None)
    except me.DoesNotExist:
        raise NotFoundError('Resource with that id does not exist')

    tags = params.get("tags")
    if type(tags) != dict:
        raise BadRequestError('tags should be dictionary of tags')

    if not modify_security_tags(auth_context, tags, cloud):
        raise auth_context._raise('cloud', 'edit_security_tags')

    return add_tags_to_resource(auth_context.owner, cloud, tags.items())


@view_config(route_name='api_v1_machine_tags', request_method='POST',
             renderer='json')
def set_machine_tags(request):
    """
    Set tags on a machine
    Set tags for a machine, given the cloud and machine id.
    READ permission required on cloud.
    EDIT_TAGS permission required on machine.
    ---
    cloud_id:
      in: path
      required: true
      type: string
    machine_id:
      in: path
      required: true
      type: string
    tags:
      items:
        type: object
      type: array
    """
    auth_context = auth_context_from_request(request)
    params = params_from_request(request)
    cloud_id = request.matchdict["cloud_id"]
    machine_id = request.matchdict["machine_id"]
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
    except me.DoesNotExist:
        raise NotFoundError('Resource with that id does not exist')

    # SEC require EDIT_TAGS permission on machine
    auth_context.check_perm("machine", "edit_tags", machine.id)

    tags = params.get("tags")
    if type(tags) != dict:
        raise BadRequestError('tags should be dictionary of tags')

    if not modify_security_tags(auth_context, tags, machine):
        raise auth_context._raise('machine', 'edit_security_tags')

    # FIXME: This is f***** up! This method is utilized by the Ember UI in
    # order to update a machine's tags by providing the entire list of tags
    # to be re-set. However, `add_tags_to_resource` simply appends the new
    # tags without deleting any.
    return add_tags_to_resource(auth_context.owner, machine, tags.items())


@view_config(route_name='schedule_tags', request_method='POST',
             renderer='json')
def set_schedule_tags(request):
    """
    Set tags to owner's schedule
    EDIT_TAGS permission required on schedule
    ---
    schedule:
      in: path
      required: true
      type: string
    tags:
      type: dict
      required: true
    """
    auth_context = auth_context_from_request(request)
    params = params_from_request(request)
    schedule_id = request.matchdict["schedule_id"]

    # SEC require EDIT_TAGS permission on schedule
    auth_context.check_perm("schedule", "edit_tags", schedule_id)

    schedule = Schedule.objects.get(owner=auth_context.owner,
                                    id=schedule_id, deleted=None)

    tags = params.get("tags")
    if type(tags) != dict:
        raise BadRequestError('tags should be dictionary of tags')

    if not modify_security_tags(auth_context, tags, schedule):
        raise auth_context._raise('schedule', 'edit_security_tags')

    return add_tags_to_resource(auth_context.owner, schedule, tags.items())


@view_config(route_name='script_tags', request_method='POST', renderer='json')
def set_script_tags(request):
    """
    Set tags to owner's script
    EDIT_TAGS permission required on SCRIPT
    ---
    script:
      in: path
      required: true
      type: string
    tags:
      type: dict
      required: true
    """
    auth_context = auth_context_from_request(request)
    params = params_from_request(request)
    script_id = request.matchdict["script_id"]

    # SEC require EDIT_TAGS permission on script
    auth_context.check_perm("script", "edit_tags", script_id)

    script = Script.objects.get(owner=auth_context.owner, id=script_id,
                                deleted=None)

    tags = params.get("tags")
    if type(tags) != dict:
        raise BadRequestError('tags should be dictionary of tags')

    if not modify_security_tags(auth_context, tags, script):
        raise auth_context._raise('script', 'edit_security_tags')

    return add_tags_to_resource(auth_context.owner, script, tags.items())


@view_config(route_name='key_tags', request_method='POST', renderer='json')
def set_key_tags(request):
    """
    Set tags to owner's key
    EDIT_TAGS permission required on KEY
    ---
    key_id:
      in: path
      required: true
      type: string
    tags:
      type: dict
      required: true
    """
    auth_context = auth_context_from_request(request)
    params = params_from_request(request)
    key_id = request.matchdict["key_id"]

    # SEC require EDIT_TAGS permission on key
    auth_context.check_perm("key", "edit_tags", key_id)

    try:
        key = Key.objects.get(owner=auth_context.owner,
                              id=key_id, deleted=None)
    except Key.DoesNotExist:
        raise NotFoundError('Resource with that id does not exist')

    tags = params.get("tags")
    if type(tags) != dict:
        raise BadRequestError('tags should be dictionary of tags')

    if not modify_security_tags(auth_context, tags, key):
        raise auth_context._raise('key', 'edit_security_tags')

    return add_tags_to_resource(auth_context.owner, key, tags.items())


@view_config(route_name='network_tags', request_method='POST', renderer='json')
def set_network_tags(request):
    """
    Set tags on a machine
    Set tags for a machine, given the cloud and machine id.
    READ permission required on cloud.
    EDIT_TAGS permission required on machine.
    ---
    cloud_id:
      in: path
      required: true
      type: string
    machine_id:
      in: path
      required: true
      type: string
    tags:
      items:
        type: object
      type: array
    """
    auth_context = auth_context_from_request(request)
    params = params_from_request(request)
    cloud_id = request.matchdict["cloud_id"]
    network_id = request.matchdict["network_id"]
    auth_context.check_perm('cloud', 'read', cloud_id)
    try:
        network = Network.objects.get(cloud=cloud_id, id=network_id)
    except Network.DoesNotExist:
        raise NotFoundError('Resource with that id does not exist')

    # SEC require EDIT_TAGS permission on network
    auth_context.check_perm("network", "edit_tags", network_id)

    tags = params.get("tags")
    if type(tags) != dict:
        raise BadRequestError('tags should be dictionary of tags')

    if not modify_security_tags(auth_context, tags, network):
        raise auth_context._raise('network', 'edit_security_tags')

    return add_tags_to_resource(auth_context.owner, network, tags.items())


@view_config(route_name='schedule_tag', request_method='DELETE',
             renderer='json')
def delete_schedule_tag(request):
    auth_context = auth_context_from_request(request)
    params = params_from_request(request)
    schedule_id = request.matchdict["schedule_id"]
    tag_key = params.get("tag_key")

    # SEC require EDIT_TAGS permission on schedule
    auth_context.check_perm('schedule', 'edit_tags', schedule_id)
    if not delete_security_tag(auth_context, tag_key):
        raise auth_context._raise('schedule', 'edit_security_tags')

    return resolve_id_and_delete_tags(auth_context.owner, 'schedule',
                                      schedule_id, tags=[tag_key])


@view_config(route_name='cloud_tag', request_method='DELETE', renderer='json')
def delete_cloud_tag(request):
    """
    Delete a tag
    Delete tag in the db for specified resource_type.
    EDIT_TAGS permission required on cloud.
    ---
    tag_key:
      required: true
      type: string
    cloud_id:
      in: path
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    params = params_from_request(request)
    cloud_id = request.matchdict["cloud_id"]
    tag_key = params.get("tag_key")

    # SEC require EDIT_TAGS permission on cloud
    auth_context.check_perm('cloud', 'edit_tags', cloud_id)
    if not delete_security_tag(auth_context, tag_key):
        raise auth_context._raise('cloud', 'edit_security_tags')

    return resolve_id_and_delete_tags(auth_context.owner, 'cloud', cloud_id,
                                      tags=[tag_key])


@view_config(route_name='api_v1_machine_tag', request_method='DELETE',
             renderer='json')
def delete_machine_tag(request):
    """
    Delete a tag
    Delete tag in the db for specified resource_type.
    READ permission required on cloud.
    EDIT_TAGS permission required on machine.
    ---
    tag_key:
      required: true
      type: string
    cloud_id:
      in: path
      required: true
      type: string
    machine_id:
      in: path
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    params =params_from_request(request)
    cloud_id = request.matchdict["cloud_id"]
    machine_id = request.matchdict["machine_id"]
    tag_key = params.get("tag_key")

    # SEC require READ permission on cloud
    auth_context.check_perm("cloud", "read", cloud_id)

    # SEC require EDIT_TAGS permission on machine
    auth_context.check_perm("machine", "edit_tags", machine_id)
    if not delete_security_tag(auth_context, tag_key):
        raise auth_context._raise('machine', 'edit_security_tags')

    return resolve_id_and_delete_tags(auth_context.owner,
                                      'machine', machine_id,
                                      tags=[tag_key], cloud_id=cloud_id)


@view_config(route_name='script_tag', request_method='DELETE', renderer='json')
def delete_script_tag(request):
    """
    Delete a tag
    Delete tag in the db for specified resource_type.
    EDIT_TAGS permission required on script.
    ---
    tag_key:
      required: true
      type: string
    script_id:
      in: path
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    params = params_from_request(request)
    script_id = request.matchdict["script_id"]
    tag_key = params.get("tag_key")

    # SEC require EDIT_TAGS permission on script
    auth_context.check_perm('script', 'edit_tags', script_id)
    if not delete_security_tag(auth_context, tag_key):
        raise auth_context._raise('script', 'edit_security_tags')

    return resolve_id_and_delete_tags(auth_context.owner, 'script', script_id,
                                      tags=[tag_key])


@view_config(route_name='key_tag', request_method='DELETE', renderer='json')
def delete_key_tag(request):
    """
    Delete a tag
    Delete tag in the db for specified resource_type.
    EDIT_TAGS permission required on key.
    ---
    tag_key:
      required: true
      type: string
    key_id:
      in: path
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    params = params_from_request(request)
    key_id = request.matchdict["key_id"]
    tag_key = params.get("tag_key")

    # SEC require EDIT_TAGS permission on key
    auth_context.check_perm('key', 'edit_tags', key_id)
    if not delete_security_tag(auth_context, tag_key):
        raise auth_context._raise('key', 'edit_security_tags')

    return resolve_id_and_delete_tags(auth_context.owner, 'key', key_id,
                                      tags=[tag_key])


@view_config(route_name='network_tag', request_method='DELETE',
             renderer='json')
def delete_network_tag(request):
    """
    Delete a tag
    Delete tag in the db for specified resource_type.
    READ permission required on cloud.
    EDIT_TAGS permission required on network.
    ---
    tag_key:
      in: path
      required: true
      type: string
    cloud_id:
      in: path
      required: true
      type: string
    network_id:
      in: path
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    params = params_from_request(request)
    cloud_id = request.matchdict["cloud_id"]
    network_id = request.matchdict["network_id"]
    tag_key = request.matchdict["tag_key"]

    auth_context.check_perm('cloud', 'read', cloud_id)
    # SEC require EDIT_TAGS permission on network
    auth_context.check_perm('network', 'edit_tags', network_id)
    if not delete_security_tag(auth_context, tag_key):
        raise auth_context._raise('network', 'edit_security_tags')

    return resolve_id_and_delete_tags(auth_context.owner,
                                      'network', network_id,
                                      tags=[tag_key], cloud_id=cloud_id)
