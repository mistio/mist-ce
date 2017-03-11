import logging

from pyramid.response import Response
from mist.io.clouds.models import Cloud
from mist.io.auth.methods import auth_context_from_request

from mist.io.helpers import trigger_session_update
from mist.io.helpers import view_config, params_from_request

from mist.io.exceptions import BadRequestError
from mist.io.exceptions import RequiredParameterMissingError, NotFoundError

from mist.io.clouds.methods import filter_list_clouds, add_cloud_v_2
from mist.io.clouds.methods import rename_cloud as m_rename_cloud
from mist.io.clouds.methods import delete_cloud as m_delete_cloud

from mist.io.tag.methods import add_tags_to_resource

from mist.io import config

logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)

OK = Response("OK", 200)


@view_config(route_name='api_v1_clouds', request_method='GET', renderer='json')
def list_clouds(request):
    """
    Request a list of all added clouds.
    READ permission required on cloud.
    ---
    """
    auth_context = auth_context_from_request(request)
    # to prevent iterate throw every cloud
    auth_context.check_perm("cloud", "read", None)
    return filter_list_clouds(auth_context)


@view_config(route_name='api_v1_clouds',
             request_method='POST', renderer='json')
def add_cloud(request):
    """
    Add a new cloud
    Adds a new cloud to the user and returns the cloud_id
    ADD permission required on cloud.

    ---
    api_key:
      type: string
    api_secret:
      type: string
    apiurl:
      type: string
    docker_port:
      type: string
    machine_key:
      type: string
    machine_port:
      type: string
    machine_user:
      type: string
    provider:
      description: The id of the cloud provider.
      enum:
      - vcloud
      - bare_metal
      - docker
      - libvirt
      - openstack
      - vsphere
      - ec2
      - rackspace
      - nephoscale
      - digitalocean
      - softlayer
      - gce
      - azure
      - azure_arm
      - linode
      - indonesian_vcloud
      - hostvirtual
      - vultr
      required: true
      type: string
    remove_on_error:
      type: string
    tenant_name:
      type: string
    title:
      description: The human readable title of the cloud.
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    cloud_tags = auth_context.check_perm("cloud", "add", None)
    owner = auth_context.owner
    params = params_from_request(request)
    # remove spaces from start/end of string fields that are often included
    # when pasting keys, preventing thus succesfull connection with the
    # cloud
    for key in params.keys():
        if type(params[key]) in [unicode, str]:
            params[key] = params[key].rstrip().lstrip()

    # api_version = request.headers.get('Api-Version', 1)
    title = params.get('title', '')
    provider = params.get('provider', '')

    if not provider:
        raise RequiredParameterMissingError('provider')

    monitoring = None
    ret = add_cloud_v_2(owner, title, provider, params)

    cloud_id = ret['cloud_id']
    monitoring = ret.get('monitoring')

    cloud = Cloud.objects.get(owner=owner, id=cloud_id)

    # If insights enabled on org, set poller with half hour period.
    if auth_context.org.insights_enabled:
        cloud.ctl.set_polling_interval(1800)

    if cloud_tags:
        add_tags_to_resource(owner, cloud, cloud_tags.items())

    c_count = Cloud.objects(owner=owner, deleted=None).count()
    ret = cloud.as_dict()
    ret['index'] = c_count - 1
    if monitoring:
        ret['monitoring'] = monitoring
    return ret


@view_config(route_name='api_v1_cloud_action', request_method='DELETE')
def delete_cloud(request):
    """
    Delete a cloud
    Deletes cloud with given cloud_id.
    REMOVE permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    try:
        Cloud.objects.get(owner=auth_context.owner, id=cloud_id, deleted=None)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')
    auth_context.check_perm('cloud', 'remove', cloud_id)
    m_delete_cloud(auth_context.owner, cloud_id)
    return OK


@view_config(route_name='api_v1_cloud_action', request_method='PUT')
def rename_cloud(request):
    """
    Rename a cloud
    Renames cloud with given cloud_id.
    EDIT permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    new_name:
      description: ' New name for the key (will also serve as the key''s id)'
      type: string
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    try:
        Cloud.objects.get(owner=auth_context.owner, id=cloud_id, deleted=None)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')

    params = params_from_request(request)
    new_name = params.get('new_name', '')
    if not new_name:
        raise RequiredParameterMissingError('new_name')
    auth_context.check_perm('cloud', 'edit', cloud_id)

    m_rename_cloud(auth_context.owner, cloud_id, new_name)
    return OK


@view_config(route_name='api_v1_cloud_action', request_method='PATCH')
def update_cloud(request):
    """
    UPDATE cloud with given cloud_id.
    EDIT permission required on cloud.
    Not all fields need to be specified, only the ones being modified
    ---
    cloud:
      in: path
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner,
                                  id=cloud_id, deleted=None)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')

    params = params_from_request(request)
    creds = params

    if not creds:
        raise BadRequestError("You should provide your new cloud settings")

    auth_context.check_perm('cloud', 'edit', cloud_id)

    log.info("Updating cloud: %s", cloud_id)

    fail_on_error = params.pop('fail_on_error', True)
    fail_on_invalid_params = params.pop('fail_on_invalid_params', True)
    polling_interval = params.pop('polling_interval', None)

    # Edit the cloud
    cloud.ctl.update(fail_on_error=fail_on_error,
                     fail_on_invalid_params=fail_on_invalid_params, **creds)

    try:
        polling_interval = int(polling_interval)
    except (ValueError, TypeError):
        pass
    else:
        cloud.ctl.set_polling_interval(polling_interval)

    log.info("Cloud with id '%s' updated successfully.", cloud.id)
    trigger_session_update(auth_context.owner, ['clouds'])
    return OK


@view_config(route_name='api_v1_cloud_action', request_method='POST')
def toggle_cloud(request):
    """
    Toggle a cloud
    Toggles cloud with given cloud_id.
    EDIT permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    new_state:
      enum:
      - '0'
      - '1'
      type: string
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner,
                                  id=cloud_id, deleted=None)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')

    auth_context.check_perm('cloud', 'edit', cloud_id)

    new_state = params_from_request(request).get('new_state')
    if new_state == '1':
        cloud.ctl.enable()
    elif new_state == '0':
        cloud.ctl.disable()
    elif new_state:
        raise BadRequestError('Invalid cloud state')
    else:
        raise RequiredParameterMissingError('new_state')
    trigger_session_update(auth_context.owner, ['clouds'])
    return OK
