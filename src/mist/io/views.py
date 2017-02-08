"""mist.io.views

Here we define the HTTP API of the app. The view functions here are
responsible for taking parameters from the web requests, passing them on to
functions defined in methods and properly formatting the output. This is the
only source file where we import things from pyramid. View functions should
only check that all required params are provided. Any further checking should
be performed inside the corresponding method functions.

"""

import requests
import json
import uuid
import traceback
import mongoengine as me
from mongoengine import ValidationError, NotUniqueError

from pyramid.response import Response
from pyramid.renderers import render_to_response

# try:
from mist.io.helpers import view_config
from mist.core.auth.methods import user_from_request
from mist.io.keys.models import Key, SSHKey, SignedSSHKey
from mist.io.scripts.models import CollectdScript
from mist.io.clouds.models import Cloud
from mist.io.machines.models import Machine
from mist.core import config
import mist.core.methods
# except ImportError:
#     from mist.io import config
#     from mist.io.helpers import user_from_request
#     from pyramid.view import view_config

from mist.io import methods

import mist.io.exceptions as exceptions
import pyramid.httpexceptions

from mist.io.helpers import get_auth_header, params_from_request
from mist.io.helpers import trigger_session_update, amqp_publish_user
from mist.io.helpers import transform_key_machine_associations

from mist.core.auth.methods import auth_context_from_request

import logging
logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)

OK = Response("OK", 200)


@view_config(context=Exception)
def exception_handler_mist(exc, request):
    """Here we catch exceptions and transform them to proper http responses

    This is a special pyramid view that gets triggered whenever an exception
    is raised from any other view. It catches all exceptions exc where
    isinstance(exc, context) is True.

    """
    # mongoengine ValidationError
    if isinstance(exc, ValidationError):
        trace = traceback.format_exc()
        log.warning("Uncaught me.ValidationError!\n%s", trace)
        return Response("Validation Error", 400)

    # mongoengine NotUniqueError
    if isinstance(exc, NotUniqueError):
        trace = traceback.format_exc()
        log.warning("Uncaught me.NotUniqueError!\n%s", trace)
        return Response("NotUniqueError", 409)

    # non-mist exceptions. that shouldn't happen! never!
    if not isinstance(exc, exceptions.MistError):
        if not isinstance(exc, (ValidationError, NotUniqueError)):
            trace = traceback.format_exc()
            log.critical("Uncaught non-mist exception? WTF!\n%s", trace)
            return Response("Internal Server Error", 500)

    # mist exceptions are ok.
    log.info("MistError: %r", exc)


    # translate it to HTTP response based on http_code attribute
    return Response(str(exc), exc.http_code)


#@view_config(context='pyramid.httpexceptions.HTTPNotFound',
#             renderer='templates/404.pt')
#def not_found(self, request):
#    return pyramid.httpexceptions.HTTPFound(request.host_url+"/#"+request.path)


@view_config(route_name='home', request_method='GET')
@view_config(route_name='clouds', request_method='GET')
@view_config(route_name='cloud', request_method='GET')
@view_config(route_name='machines', request_method='GET')
@view_config(route_name='machine', request_method='GET')
@view_config(route_name='images', request_method='GET')
@view_config(route_name='image', request_method='GET')
@view_config(route_name='keys', request_method='GET')
@view_config(route_name='key', request_method='GET')
@view_config(route_name='networks', request_method='GET')
@view_config(route_name='network', request_method='GET')
def home(request):
    """Home page view"""
    params = params_from_request(request)
    user = user_from_request(request)
    if params.get('ember'):
        template = 'home.pt'
    else:
        template = 'poly.pt'
    return render_to_response('templates/%s' % template,
        {
        'project': 'mist.io',
        'email': json.dumps(user.email),
        'first_name': json.dumps(""),
        'last_name': json.dumps(""),
        'supported_providers': json.dumps(config.SUPPORTED_PROVIDERS_V_2),
        'core_uri': json.dumps(config.CORE_URI),
        'auth': json.dumps(bool(user.mist_api_token)),
        'js_build': json.dumps(config.JS_BUILD),
        'css_build': config.CSS_BUILD,
        'js_log_level': json.dumps(config.JS_LOG_LEVEL),
        'google_analytics_id': config.GOOGLE_ANALYTICS_ID,
        'is_core': json.dumps(False),
        'csrf_token': json.dumps(""),
        'beta_features': json.dumps(False),
        'last_build': config.LAST_BUILD
        }, request=request)


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
    return mist.core.methods.filter_list_clouds(auth_context)


@view_config(route_name='api_v1_clouds', request_method='POST', renderer='json')
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

    if config.NEW_UI_EXPERIMENT_ENABLE:
        from mist.core.experiments import NewUIExperiment
        from mist.core.auth.methods import session_from_request

        session = session_from_request(request)
        experiment = NewUIExperiment(userid=session.user_id)
        experiment.log_event('add_cloud', {'title': title,
                                           'provider': provider})

    if not provider:
        raise exceptions.RequiredParameterMissingError('provider')

    monitoring = None
    ret = methods.add_cloud_v_2(owner, title, provider, params)

    cloud_id = ret['cloud_id']
    monitoring = ret.get('monitoring')

    cloud = Cloud.objects.get(owner=owner, id=cloud_id)

    if cloud_tags:
        from mist.io.tag.methods import add_tags_to_resource
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
        cloud = Cloud.objects.get(owner=auth_context.owner,
                                  id=cloud_id, deleted=None)
    except Cloud.DoesNotExist:
        raise exceptions.NotFoundError('Cloud does not exist')
    auth_context.check_perm('cloud', 'remove', cloud_id)
    methods.delete_cloud(auth_context.owner, cloud_id)
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
        cloud = Cloud.objects.get(owner=auth_context.owner,
                                  id=cloud_id, deleted=None)
    except Cloud.DoesNotExist:
        raise exceptions.NotFoundError('Cloud does not exist')

    params = params_from_request(request)
    new_name = params.get('new_name', '')
    if not new_name:
        raise exceptions.RequiredParameterMissingError('new_name')
    auth_context.check_perm('cloud', 'edit', cloud_id)

    methods.rename_cloud(auth_context.owner, cloud_id, new_name)
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
        raise exceptions.NotFoundError('Cloud does not exist')

    params = params_from_request(request)
    creds = params

    if not creds:
        raise exceptions.BadRequestError("You should provide your "
                                         "new cloud settings")

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
        raise exceptions.NotFoundError('Cloud does not exist')

    auth_context.check_perm('cloud', 'edit', cloud_id)

    new_state = params_from_request(request).get('new_state')
    if new_state == '1':
        cloud.ctl.enable()
    elif new_state == '0':
        cloud.ctl.disable()
    elif new_state:
        raise exceptions.BadRequestError('Invalid cloud state')
    else:
        raise exceptions.RequiredParameterMissingError('new_state')
    trigger_session_update(auth_context.owner, ['clouds'])
    return OK


@view_config(route_name='api_v1_keys', request_method='GET', renderer='json')
def list_keys(request):
    """
    List keys
    Retrieves a list of all added keys
    READ permission required on key.
    ---
    """
    auth_context = auth_context_from_request(request)
    return mist.core.methods.filter_list_keys(auth_context)


@view_config(route_name='api_v1_keys', request_method='PUT', renderer='json')
def add_key(request):
    """
    Add key
    Add key with specific name
    ADD permission required on key.
    ---
    id:
      description: The key name
      required: true
      type: string
    priv:
      description: The private key
      required: true
      type: string
    certificate:
      description: The signed public key, when using signed ssh keys
      required: false
      type: string

    """
    params = params_from_request(request)
    key_name = params.pop('name', None)
    private_key = params.get('priv', None)
    certificate = params.get('certificate', None)
    auth_context = auth_context_from_request(request)
    key_tags = auth_context.check_perm("key", "add", None)

    if not key_name:
        raise exceptions.BadRequestError("Key name is not provided")
    if not private_key:
        raise exceptions.RequiredParameterMissingError("Private key is "
                                                       "not provided")

    if certificate:
        key = SignedSSHKey.add(auth_context.owner, key_name, **params)
    else:
        key = SSHKey.add(auth_context.owner, key_name, **params)

    if key_tags:
        from mist.io.tag.methods import add_tags_to_resource
        add_tags_to_resource(auth_context.owner, key, key_tags.items())
    # since its a new key machines fields should be an empty list

    clouds = Cloud.objects(owner=auth_context.owner, deleted=None)
    machines = Machine.objects(cloud__in=clouds,
                               key_associations__keypair__exact=key)

    assoc_machines = transform_key_machine_associations(machines, key)

    return {'id': key.id,
            'name': key.name,
            'machines': assoc_machines,
            'isDefault': key.default}


@view_config(route_name='api_v1_key_action', request_method='DELETE',
             renderer='json')
def delete_key(request):
    """
    Delete key
    Delete key. When a key gets deleted, it takes its associations with it
    so just need to remove from the server too. If the default key gets deleted,
    it sets the next one as default, provided that at least another key exists.
    It returns the list of all keys after the deletion, excluding the private
    keys (check also list_keys).
    REMOVE permission required on key.
    ---
    key:
      in: path
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    key_id = request.matchdict.get('key')
    if not key_id:
        raise exceptions.KeyParameterMissingError()

    try:
        key = Key.objects.get(owner=auth_context.owner, id=key_id,
                              deleted=None)
    except me.DoesNotExist:
        raise exceptions.NotFoundError('Key id does not exist')

    auth_context.check_perm('key', 'remove', key.id)
    methods.delete_key(auth_context.owner, key_id)
    return list_keys(request)


@view_config(route_name='api_v1_keys', request_method='DELETE', renderer='json')
@view_config(route_name='keys', request_method='DELETE', renderer='json')
def delete_keys(request):
    """
    Delete multiple keys.
    Provide a list of key ids to be deleted. The method will try to delete
    all of them and then return a json that describes for each key id
    whether or not it was deleted or not_found if the key id could not
    be located. If no key id was found then a 404(Not Found) response will
    be returned.
    REMOVE permission required on each key.
    ---
    key_ids:
      required: true
      type: array
      items:
        type: string
        name: key_id
    """
    auth_context = auth_context_from_request(request)

    params = params_from_request(request)
    key_ids = params.get('key_ids', [])
    if type(key_ids) != list or len(key_ids) == 0:
        raise exceptions.RequiredParameterMissingError('No key ids provided')
    # remove duplicate ids if there are any
    key_ids = set(key_ids)

    report = {}
    for key_id in key_ids:
        try:
            key = Key.objects.get(owner=auth_context.owner,
                                  id=key_id, deleted=None)
        except me.DoesNotExist:
            report[key_id] = 'not_found'
            continue
        try:
            auth_context.check_perm('key', 'remove', key.id)
        except exceptions.PolicyUnauthorizedError:
            report[key_id] = 'unauthorized'
        else:
            methods.delete_key(auth_context.owner, key_id)
            report[key_id] = 'deleted'

    # if no key id was valid raise exception
    if len(filter(lambda key_id: report[key_id] == 'not_found',
                  report)) == len(key_ids):
        raise exceptions.NotFoundError('No valid key id provided')
    # if user was unauthorized for all keys
    if len(filter(lambda key_id: report[key_id] == 'unauthorized',
                  report)) == len(key_ids):
        raise exceptions.NotFoundError('Unauthorized to modify any of the keys')
    return report


@view_config(route_name='api_v1_key_action', request_method='PUT', renderer='json')
def edit_key(request):
    """
    Edit a key
    Edits a given key's name  to new_name
    EDIT permission required on key.
    ---
    new_name:
      description: The new key name
      type: string
    key_id:
      description: The key id
      in: path
      required: true
      type: string
    """
    key_id = request.matchdict['key']
    params = params_from_request(request)
    new_name = params.get('new_name')
    if not new_name:
        raise exceptions.RequiredParameterMissingError("new_name")

    auth_context = auth_context_from_request(request)
    try:
        key = Key.objects.get(owner=auth_context.owner,
                              id=key_id, deleted=None)
    except me.DoesNotExist:
        raise exceptions.NotFoundError('Key with that id does not exist')
    auth_context.check_perm('key', 'edit', key.id)
    key.ctl.rename(new_name)

    return {'new_name': new_name}


@view_config(route_name='api_v1_key_action', request_method='POST')
def set_default_key(request):
    """
    Set default key
    Sets a new default key
    EDIT permission required on key.
    ---
    key:
      description: The key id
      in: path
      required: true
      type: string
    """
    key_id = request.matchdict['key']

    auth_context = auth_context_from_request(request)
    try:
        key = Key.objects.get(owner=auth_context.owner,
                              id=key_id, deleted=None)
    except me.DoesNotExist:
        raise exceptions.NotFoundError('Key id does not exist')

    auth_context.check_perm('key', 'edit', key.id)

    key.ctl.set_default()
    return OK


@view_config(route_name='api_v1_key_private', request_method='GET',
             renderer='json')
def get_private_key(request):
    """
    Gets private key from key name.
    It is used in single key view when the user clicks the display private key
    button.
    READ_PRIVATE permission required on key.
    ---
    key:
      description: The key id
      in: path
      required: true
      type: string
    """

    key_id = request.matchdict['key']
    if not key_id:
        raise exceptions.RequiredParameterMissingError("key_id")

    auth_context = auth_context_from_request(request)
    try:
        key = SSHKey.objects.get(owner=auth_context.owner,
                                 id=key_id, deleted=None)
    except me.DoesNotExist:
        raise exceptions.NotFoundError('Key id does not exist')

    auth_context.check_perm('key', 'read_private', key.id)
    return key.private


@view_config(route_name='api_v1_key_public', request_method='GET',
             renderer='json')
def get_public_key(request):
    """
    Get public key
    Gets public key from key name.
    READ permission required on key.
    ---
    key:
      description: The key id
      in: path
      required: true
      type: string
    """
    key_id = request.matchdict['key']
    if not key_id:
        raise exceptions.RequiredParameterMissingError("key_id")

    auth_context = auth_context_from_request(request)
    try:
        key = SSHKey.objects.get(owner=auth_context.owner,
                                 id=key_id, deleted=None)
    except me.DoesNotExist:
        raise exceptions.NotFoundError('Key id does not exist')

    auth_context.check_perm('key', 'read', key.id)
    return key.public


@view_config(route_name='api_v1_keys', request_method='POST', renderer='json')
@view_config(route_name='keys', request_method='POST', renderer='json')
def generate_keypair(request):
    """
    Generate key
    Generate key pair
    ---
    """
    key = SSHKey()
    key.ctl.generate()
    return {'priv': key.private, 'public': key.public}


@view_config(route_name='api_v1_key_association', request_method='PUT',
             renderer='json')
def associate_key(request):
    """
    Associate a key to a machine
    Associates a key with a machine. If host is set it will also attempt to
    actually deploy it to the machine. To do that it requires another key
    (existing_key) that can connect to the machine.
    READ permission required on cloud.
    READ_PRIVATE permission required on key.
    ASSOCIATE_KEY permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    key:
      in: path
      required: true
      type: string
    port:
      default: 22
      type: integer
    user:
      description: The ssh user
      type: string
    """
    key_id = request.matchdict['key']
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    params = params_from_request(request)
    ssh_user = params.get('user', None)
    try:
        ssh_port = int(request.json_body.get('port', 22))
    except:
        ssh_port = 22

    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    key = Key.objects.get(owner=auth_context.owner, id=key_id, deleted=None)
    auth_context.check_perm('key', 'read_private', key.id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
    except me.DoesNotExist:
        raise exceptions.NotFoundError("Machine %s doesn't exist" % machine_id)

    auth_context.check_perm("machine", "associate_key", machine.id)

    key.ctl.associate(machine, username=ssh_user, port=ssh_port)
    clouds = Cloud.objects(owner=auth_context.owner, deleted=None)
    machines = Machine.objects(cloud__in=clouds,
                               key_associations__keypair__exact=key)

    assoc_machines = transform_key_machine_associations(machines, key)
    return assoc_machines


@view_config(route_name='api_v1_key_association', request_method='DELETE',
             renderer='json')
def disassociate_key(request):
    """
    Disassociate a key from a machine
    Disassociates a key from a machine. If host is set it will also attempt to
    actually remove it from the machine.
    READ permission required on cloud.
    DISASSOCIATE_KEY permission required on machine.
    ---
    key:
      in: path
      required: true
      type: string
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    """
    key_id = request.matchdict['key']
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']

    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
    except me.DoesNotExist:
        raise exceptions.NotFoundError("Machine %s doesn't exist" % machine_id)
    auth_context.check_perm("machine", "disassociate_key", machine.id)

    key = Key.objects.get(owner=auth_context.owner, id=key_id, deleted=None)
    key.ctl.disassociate(machine)
    clouds = Cloud.objects(owner=auth_context.owner, deleted=None)
    machines = Machine.objects(cloud__in=clouds,
                               key_associations__keypair__exact=key)

    assoc_machines = transform_key_machine_associations(machines, key)
    return assoc_machines

@view_config(route_name='api_v1_zones', request_method='GET', renderer='json')
def list_dns_zones(request):
    """
    List all DNS zones.
    Retrieves a list of all DNS zones based on the user Clouds.
    For each cloud that supports DNS functionality, we get all available zones.
    ---
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']

    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise exceptions.NotFoundError('Cloud does not exist')

    return cloud.ctl.dns.list_zones()


@view_config(route_name='api_v1_records', request_method='GET', renderer='json')
def list_dns_records(request):
    """
    List all DNS zone records for a particular zone.
    ---
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    zone_id = request.matchdict['zone']
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise exceptions.NotFoundError('Cloud does not exist')
    return cloud.ctl.dns.list_records(zone_id)

@view_config(route_name='api_v1_zones', request_method='POST', renderer='json')
def create_dns_zone(request):
    """
    Create a new DNS zone under a specific cloud.
    ---
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    # Try to get the specific cloud for which we will create the zone.
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise exceptions.NotFoundError('Cloud does not exist')
    # Get the rest of the params
    # domain is required and must contain a trailing period(.)
    # type should be master or slave, and defaults to master.
    # ttl is the time for which the zone should be valid for. Defaults to None.
    # Should be an integer value.
    # extra is a dictionary with extra details. Defaults to None.
    params = params_from_request(request)
    domain = params.get('domain', '')
    if not domain:
        raise exceptions.RequiredParameterMissingError('domain')
    type = params.get('type', '')
    ttl = params.get('ttl', 0)
    extra = params.get('extra', '')

    return cloud.ctl.dns.create_zone(domain, type, ttl, extra)

@view_config(route_name='api_v1_records', request_method='POST', renderer='json')
def create_dns_record(request):
    """
    Create a new record under a specific zone
    ---
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    # Try to get the specific cloud for which we will create the zone.
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise exceptions.NotFoundError('Cloud does not exist')

    zone_id = request.matchdict['zone']
    # Get the rest of the params
    # name is required and must contain a trailing period(.)
    # type should be the type of the record we want to create (A,MX,CNAME etc),
    # and it is required.
    # ttl is the time for which the record should be valid for. Defaults to 0.
    # Should be an integer value.
    params = params_from_request(request)
    name = params.get('name', '')
    if not name:
        raise exceptions.RequiredParameterMissingError('name')
    type = params.get('type', '')
    if not type:
        raise exceptions.RequiredParameterMissingError('type')
    data = params.get('data', '')
    if not data:
        raise exceptions.RequiredParameterMissingError('data')
    ttl = params.get('ttl', 0)

    return cloud.ctl.dns.create_record(zone_id, name, type, data, ttl)

@view_config(route_name='api_v1_zone', request_method='DELETE', renderer='json')
def delete_dns_zone(request):
    """
    Delete a specific DNS zone under a cloud.
    ---
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    zone_id = request.matchdict['zone']
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise exceptions.NotFoundError('Cloud does not exist')

    return cloud.ctl.dns.delete_zone(zone_id)

@view_config(route_name='api_v1_record', request_method='DELETE', renderer='json')
def delete_dns_record(request):
    """
    Delete a specific DNS record under a zone.
    ---
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    zone_id = request.matchdict['zone']
    record_id = request.matchdict['record']
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise exceptions.NotFoundError('Cloud does not exist')

    return cloud.ctl.dns.delete_record(zone_id, record_id)

@view_config(route_name='api_v1_machines', request_method='GET', renderer='json')
def list_machines(request):
    """
    List machines on cloud
    Gets machines and their metadata from a cloud
    READ permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    """

    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    return mist.core.methods.filter_list_machines(auth_context, cloud_id)


@view_config(route_name='api_v1_machines', request_method='POST',
             renderer='json')
def create_machine(request):
    """
    Create machine(s) on cloud
    Creates one or more machines on the specified cloud. If async is true, a
    jobId will be returned.
    READ permission required on cloud.
    CREATE_RESOURCES permissn required on cloud.
    CREATE permission required on machine.
    RUN permission required on script.
    READ permission required on key.

    ---
    cloud:
      in: path
      required: true
      type: string
    async:
      description: ' Create machines asynchronously, returning a jobId'
      type: boolean
    quantity:
      description: ' The number of machines that will be created, async only'
      type: integer
    azure_port_bindings:
      type: string
    cloud_id:
      description: The Cloud ID
      required: true
      type: string
    disk:
      description: ' Only required by Linode cloud'
      type: string
    docker_command:
      type: string
    docker_env:
      items:
        type: string
      type: array
    docker_exposed_ports:
      type: object
    docker_port_bindings:
      type: object
    hostname:
      type: string
    image_extra:
      description: ' Needed only by Linode cloud'
      type: string
    image:
      description: ' Id of image to be used with the creation'
      required: true
      type: string
    image_name:
      type: string
    ips:
      type: string
    job_id:
      type: string
    key_id:
      description: ' Associate machine with this key_id'
      required: true
      type: string
    location_id:
      description: ' Id of the cloud''s location to create the machine'
      required: true
      type: string
    location_name:
      type: string
    machine_name:
      required: true
      type: string
    monitoring:
      type: string
    networks:
      items:
        type: string
      type: array
    plugins:
      items:
        type: string
      type: array
    post_script_id:
      type: string
    post_script_params:
      type: string
    script:
      type: string
    script_id:
      type: string
    script_params:
      type: string
    size_id:
      description: ' Id of the size of the machine'
      required: true
      type: string
    size_name:
      type: string
    ssh_port:
      type: integer
    softlayer_backend_vlan_id:
      description: 'Specify id of a backend(private) vlan'
      type: integer
    project_id:
      description: ' Needed only by Packet.net cloud'
      type: string
    billing:
      description: ' Needed only by SoftLayer cloud'
      type: string
    bare_metal:
      description: ' Needed only by SoftLayer cloud'
      type: string
    """
    # TODO add schedule in docstring

    params = params_from_request(request)
    cloud_id = request.matchdict['cloud']

    for key in ('name', 'size'):
        if key not in params:
            raise exceptions.RequiredParameterMissingError(key)

    key_id = params.get('key')
    machine_name = params['name']
    location_id = params.get('location', None)
    image_id = params.get('image')
    if not image_id:
        raise RequiredParameterMissingError("image")
    # this is used in libvirt
    disk_size = int(params.get('libvirt_disk_size', 4))
    disk_path = params.get('libvirt_disk_path', '')
    size_id = params['size']
    # deploy_script received as unicode, but ScriptDeployment wants str
    script = str(params.get('script', ''))
    # these are required only for Linode/GCE, passing them anyway
    image_extra = params.get('image_extra', None)
    disk = params.get('disk', None)
    image_name = params.get('image_name', None)
    size_name = params.get('size_name', None)
    location_name = params.get('location_name', None)
    ips = params.get('ips', None)
    monitoring = params.get('monitoring', False)
    networks = params.get('networks', [])
    docker_env = params.get('docker_env', [])
    docker_command = params.get('docker_command', None)
    script_id = params.get('script_id', '')
    script_params = params.get('script_params', '')
    post_script_id = params.get('post_script_id', '')
    post_script_params = params.get('post_script_params', '')
    async = params.get('async', False)
    quantity = params.get('quantity', 1)
    persist = params.get('persist', False)
    docker_port_bindings = params.get('docker_port_bindings', {})
    docker_exposed_ports = params.get('docker_exposed_ports', {})
    azure_port_bindings = params.get('azure_port_bindings', '')
    # hostname: if provided it will be attempted to assign a DNS name
    hostname = params.get('hostname', '')
    plugins = params.get('plugins')
    cloud_init = params.get('cloud_init', '')
    associate_floating_ip = params.get('associate_floating_ip', False)
    associate_floating_ip_subnet = params.get('attach_floating_ip_subnet', None)
    project_id = params.get('project', None)
    bare_metal = params.get('bare_metal', False)
    # bare_metal True creates a hardware server in SoftLayer,
    # whule bare_metal False creates a virtual cloud server
    # hourly True is the default setting for SoftLayer hardware
    # servers, while False means the server has montly pricing
    softlayer_backend_vlan_id = params.get('softlayer_backend_vlan_id', None)
    hourly = params.get('billing', True)
    job_id = params.get('job_id', uuid.uuid4().hex)

    auth_context = auth_context_from_request(request)

    # compose schedule as a dict from relative parameters
    if not params.get('schedule_type'):
        schedule = {}
    else:
        if params.get('schedule_type') not in ['crontab',
                                               'interval', 'one_off']:
            raise exceptions.BadRequestError('schedule type must be one of '
                                             'these (crontab, interval, '
                                             'one_off)]')
        if params.get('schedule_entry') == {}:
            raise exceptions.RequiredParameterMissingError('schedule_entry')

        schedule = {
            'name': 'scheduler_' + params.get('name'),
            'description': params.get('description', ''),
            'action': params.get('action', ''),
            'script_id': params.get('schedule_script_id', ''),
            'schedule_type': params.get('schedule_type'),
            'schedule_entry': params.get('schedule_entry'),
            'expires': params.get('expires', ''),
            'start_after': params.get('start_after', ''),
            'max_run_count': params.get('max_run_count'),
            'task_enabled': bool(params.get('task_enabled', True)),
            'auth_context': auth_context.serialize(),
        }

    auth_context.check_perm("cloud", "read", cloud_id)
    auth_context.check_perm("cloud", "create_resources", cloud_id)
    tags = auth_context.check_perm("machine", "create", None)
    if script_id:
        auth_context.check_perm("script", "run", script_id)
    if key_id:
        auth_context.check_perm("key", "read", key_id)

    from mist.io import tasks
    args = (cloud_id, key_id, machine_name,
            location_id, image_id, size_id,
            image_extra, disk, image_name, size_name,
            location_name, ips, monitoring, networks,
            docker_env, docker_command)
    kwargs = {'script_id': script_id, 'script_params': script_params, 'script': script,
              'job_id': job_id, 'docker_port_bindings': docker_port_bindings,
              'docker_exposed_ports': docker_exposed_ports,
              'azure_port_bindings': azure_port_bindings,
              'hostname': hostname, 'plugins': plugins,
              'post_script_id': post_script_id,
              'post_script_params': post_script_params,
              'disk_size': disk_size,
              'disk_path': disk_path,
              'cloud_init': cloud_init,
              'associate_floating_ip': associate_floating_ip,
              'associate_floating_ip_subnet': associate_floating_ip_subnet,
              'project_id': project_id,
              'bare_metal': bare_metal,
              'tags': tags,
              'hourly': hourly,
              'schedule': schedule,
              'softlayer_backend_vlan_id': softlayer_backend_vlan_id}
    if not async:
        ret = methods.create_machine(auth_context.owner, *args, **kwargs)
    else:
        args = (auth_context.owner.id, ) + args
        kwargs.update({'quantity': quantity, 'persist': persist})
        tasks.create_machine_async.apply_async(args, kwargs, countdown=2)
        ret = {'job_id': job_id}
    return ret


@view_config(route_name='api_v1_machine', request_method='POST', renderer='json')
def machine_actions(request):
    """
    Call an action on machine
    Calls a machine action on cloud that support it
    READ permission required on cloud.
    ACTION permission required on machine(ACTION can be START,
    STOP, DESTROY, REBOOT).
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    action:
      enum:
      - start
      - stop
      - reboot
      - destroy
      - resize
      - rename
      required: true
      type: string
    name:
      description: The new name of the renamed machine
      type: string
    size:
      description: The size id of the plan to resize
      type: string
    """
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    params = params_from_request(request)
    action = params.get('action', '')
    plan_id = params.get('plan_id', '')
    name = params.get('name', '')
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)

    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
    except me.DoesNotExist:
        raise exceptions.NotFoundError("Machine %s doesn't exist" % machine_id)

    if machine.cloud.owner != auth_context.owner:
        raise exceptions.NotFoundError("Machine %s doesn't exist" % machine_id)

    auth_context.check_perm("machine", action, machine.id)

    actions = ('start', 'stop', 'reboot', 'destroy', 'resize',
               'rename', 'undefine', 'suspend', 'resume')

    if action not in actions:
        raise exceptions.BadRequestError("Action '%s' should be "
                                         "one of %s" % (action, actions))

    if action == 'destroy':
        methods.destroy_machine(auth_context.owner, cloud_id, machine_id)
    elif action in ('start', 'stop', 'reboot',
                    'undefine', 'suspend', 'resume'):
        getattr(machine.ctl, action)()
    elif action == 'rename':
        if not name:
            raise exceptions.BadRequestError("You must give a name!")
        getattr(machine.ctl, action)(name)
    elif action == 'resize':
        getattr(machine.ctl, action)(plan_id)

    # TODO: We shouldn't return list_machines, just OK. Save the API!
    return mist.core.methods.filter_list_machines(auth_context, cloud_id)


@view_config(route_name='api_v1_machine_rdp', request_method='GET',
             renderer='json')
def machine_rdp(request):
    """
    Rdp file for windows machines
    Generate and return an rdp file for windows machines
    READ permission required on cloud.
    READ permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    rdp_port:
      default: 3389
      in: query
      required: true
      type: integer
    host:
      in: query
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "read", machine_uuid)
    rdp_port = request.params.get('rdp_port', 3389)
    host = request.params.get('host')

    if not host:
        raise exceptions.BadRequestError('no hostname specified')
    try:
        1 < int(rdp_port) < 65535
    except:
        rdp_port = 3389

    from mist.core.vpn.methods import destination_nat
    host, rdp_port = destination_nat(auth_context.owner, host, rdp_port)

    rdp_content = 'full address:s:%s:%s\nprompt for credentials:i:1' % \
                  (host, rdp_port)
    return Response(content_type='application/octet-stream',
                    content_disposition='attachment; filename="%s.rdp"' % host,
                    charset='utf8',
                    pragma='no-cache',
                    body=rdp_content)


# Views set_machine_tags and delete_machine_tags are defined in core.views
#
# @view_config(route_name='api_v1_machine_tags', request_method='POST',
#              renderer='json')
# @view_config(route_name='machine_tags', request_method='POST', renderer='json')
# def set_machine_tags(request):
#     """
#     Set tags on a machine
#     Set tags for a machine, given the cloud and machine id.
#     ---
#     cloud:
#       in: path
#       required: true
#       type: string
#     machine:
#       in: path
#       required: true
#       type: string
#     tags:
#       items:
#         type: object
#       type: array
#     """
#     cloud_id = request.matchdict['cloud']
#     machine_id = request.matchdict['machine']
#     try:
#         tags = request.json_body['tags']
#     except:
#         raise exceptions.BadRequestError('tags should be list of tags')
#     if type(tags) != list:
#         raise exceptions.BadRequestError('tags should be list of tags')
#
#     auth_context = auth_context_from_request(request)
#     cloud_tags = mist.core.methods.get_cloud_tags(auth_context.owner, cloud_id)
#     if not auth_context.has_perm("cloud", "read", cloud_id, cloud_tags):
#         raise UnauthorizedError()
#     machine_tags = mist.core.methods.get_machine_tags(auth_context.owner,
#                                                       cloud_id, machine_id)
#     try:
#         machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
#         machine_uuid = machine.id
#     except me.DoesNotExist:
#         machine_uuid = ""
#     if not auth_context.has_perm("machine", "edit_tags", machine_uuid,
#                                  machine_tags):
#         raise UnauthorizedError()
#
#     methods.set_machine_tags(auth_context.owner, cloud_id, machine_id, tags)
#     return OK
#
#
# @view_config(route_name='api_v1_machine_tag', request_method='DELETE',
#              renderer='json')
# @view_config(route_name='machine_tag', request_method='DELETE',
#              renderer='json')
# def delete_machine_tag(request):
#     """
#     Delete a tag
#     Delete tag in the db for specified resource_type
#     ---
#     tag:
#       in: path
#       required: true
#       type: string
#     cloud:
#       in: path
#       required: true
#       type: string
#     machine:
#       in: path
#       required: true
#       type: string
#     """
#
#     cloud_id = request.matchdict['cloud']
#     machine_id = request.matchdict['machine']
#     tag = request.matchdict['tag']
#     auth_context = auth_context_from_request(request)
#     cloud_tags = mist.core.methods.get_cloud_tags(auth_context.owner, cloud_id)
#     if not auth_context.has_perm("cloud", "read", cloud_id, cloud_tags):
#         raise UnauthorizedError()
#     machine_tags = mist.core.methods.get_machine_tags(auth_context.owner,
#                                                       cloud_id, machine_id)
#     try:
#         machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
#         machine_uuid = machine.id
#     except me.DoesNotExist:
#         machine_uuid = ""
#     if not auth_context.has_perm("machine", "edit_tags", machine_uuid,
#                                  machine_tags):
#         raise UnauthorizedError()
#     methods.delete_machine_tag(auth_context.owner, cloud_id, machine_id, tag)
#     return OK


@view_config(route_name='api_v1_images', request_method='POST', renderer='json')
def list_specific_images(request):
    # FIXME: 1) i shouldn't exist, 2) i shouldn't be a post
    return list_images(request)


@view_config(route_name='api_v1_images', request_method='GET', renderer='json')
def list_images(request):
    """
    List images of specified cloud
    List images from each cloud. Furthermore if a search_term is provided, we
    loop through each cloud and search for that term in the ids and the names
    of the community images
    READ permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    search_term:
      type: string
    """

    cloud_id = request.matchdict['cloud']
    try:
        term = request.json_body.get('search_term', '')
    except:
        term = None
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    return methods.list_images(auth_context.owner, cloud_id, term)


@view_config(route_name='api_v1_image', request_method='POST', renderer='json')
def star_image(request):
    """
    Star/unstar an image
    Toggle image star (star/unstar)
    EDIT permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    image:
      description: Id of image to be used with the creation
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    image_id = request.matchdict['image']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "edit", cloud_id)
    return methods.star_image(auth_context.owner, cloud_id, image_id)


@view_config(route_name='api_v1_sizes', request_method='GET', renderer='json')
def list_sizes(request):
    """
    List sizes of a cloud
    List sizes (aka flavors) from each cloud.
    READ permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    return methods.list_sizes(auth_context.owner, cloud_id)


@view_config(route_name='api_v1_locations', request_method='GET', renderer='json')
def list_locations(request):
    """
    List locations of cloud
    List locations from each cloud. Locations mean different things in each cl-
    oud. e.g. EC2 uses it as a datacenter in a given availability zone, where-
    as Linode lists availability zones. However all responses share id, name
    and country eventhough in some cases might be empty, e.g. Openstack. In E-
    C2 all locations by a provider have the same name, so the availability zo-
    nes are listed instead of name.
    READ permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    return methods.list_locations(auth_context.owner, cloud_id)


@view_config(route_name='api_v1_networks', request_method='GET', renderer='json')
def list_networks(request):
    """
    List networks of a cloud
    List networks from each cloud.
    Currently NephoScale and Openstack networks
    are supported. For other providers this returns an empty list.
    READ permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    return methods.list_networks(auth_context.owner, cloud_id)


@view_config(route_name='api_v1_networks', request_method='POST', renderer='json')
def create_network(request):
    """
    Create network on a cloud
    Creates a new network. If subnet dict is specified, after creating the net-
    work it will use the new network's id to create a subnet
    CREATE_RESOURCES permission required on cloud.
    ---
    cloud_id:
      in: path
      required: true
      description: The Cloud ID
      type: string
    network:
      required: true
      type: string
    router:
      type: string
    subnet:
      type: string
    """
    cloud_id = request.matchdict['cloud']

    try:
        network = request.json_body.get('network')
    except Exception as e:
        raise exceptions.RequiredParameterMissingError(e)

    subnet = request.json_body.get('subnet', None)
    router = request.json_body.get('router', None)
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "create_resources", cloud_id)
    return methods.create_network(auth_context.owner, cloud_id,
                                  network, subnet, router)


@view_config(route_name='api_v1_network', request_method='DELETE')
def delete_network(request):
    """
    Delete a network
    Delete a network
    CREATE_RESOURCES permission required on cloud.
    ---
    cloud_id:
      in: path
      required: true
      type: string
    network:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    network_id = request.matchdict['network']

    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "create_resources", cloud_id)
    methods.delete_network(auth_context.owner, cloud_id, network_id)

    return OK


@view_config(route_name='api_v1_network', request_method='POST')
def associate_ip(request):
    """
    Associate ip
    Associate ip with the specific network and machine
    READ permission required on cloud.
    EDIT permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    network:
      in: path
      required: true
      type: string
    assign:
      default: true
      type: boolean
    ip:
      required: true
      type: string
    machine:
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    network_id = request.matchdict['network']
    params = params_from_request(request)
    ip = params.get('ip')
    machine_id = params.get('machine')
    assign = params.get('assign', True)
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "edit", machine_uuid)

    ret = methods.associate_ip(auth_context.owner, cloud_id, network_id,
                               ip, machine_id, assign)
    if ret:
        return OK
    else:
        return Response("Bad Request", 400)


@view_config(route_name='api_v1_probe', request_method='POST', renderer='json')
def probe(request):
    """
    Probe a machine
    Ping and SSH to machine and collect various metrics.
    READ permission required on cloud.
    READ permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    host:
      type: string
    key:
      type: string
    ssh_user:
      default: ''
      description: ' Optional. Give if you explicitly want a specific user'
      in: query
      required: false
      type: string
    """
    machine_id = request.matchdict['machine']
    cloud_id = request.matchdict['cloud']
    params = params_from_request(request)
    host = params.get('host', None)
    key_id = params.get('key', None)
    ssh_user = params.get('ssh_user', '')
    # FIXME: simply don't pass a key parameter
    if key_id == 'undefined':
        key_id = ''
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "read", machine_uuid)

    ret = methods.probe(auth_context.owner, cloud_id, machine_id, host, key_id,
                        ssh_user)
    amqp_publish_user(auth_context.owner, "probe",
                 {
                    'cloud_id': cloud_id,
                    'machine_id': machine_id,
                    'result': ret
                 })
    return ret


@view_config(route_name='api_v1_monitoring', request_method='GET', renderer='json')
def check_monitoring(request):
    """
    Check monitoring
    Ask the mist.io service if monitoring is enabled for this machine.
    ---
    """
    user = user_from_request(request)
    ret = methods.check_monitoring(user)
    return ret


@view_config(route_name='api_v1_update_monitoring', request_method='POST', renderer='json')
def update_monitoring(request):
    """
    Enable monitoring
    Enable monitoring for a machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    action:
      enum:
      - enable
      - disable
      type: string
    dns_name:
      type: string
    dry:
      default: false
      type: boolean
    name:
      description: ' Name of the plugin'
      type: string
    no_ssh:
      default: false
      type: boolean
    public_ips:
      items:
        type: string
      type: array
    """
    user = user_from_request(request)
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    params = params_from_request(request)
    if not user.mist_api_token:
        log.info("trying to authenticate to service first")
        email = params.get('email')
        password = params.get('password')
        if not email or not password:
            raise exceptions.UnauthorizedError("You need to authenticate "
                                               "to mist.io.")
        payload = {'email': email, 'password': password}
        try:
            ret = requests.post(config.CORE_URI + '/auth', params=payload,
                                verify=config.SSL_VERIFY)
        except requests.exceptions.SSLError as exc:
            log.error("%r", exc)
            raise exceptions.SSLError()
        if ret.status_code == 200:
            ret_dict = json.loads(ret.content)
            user.email = email
            user.mist_api_token = ret_dict.pop('token', '')
            user.save()
            log.info("succesfully check_authed")
        elif ret.status_code in [400, 401]:
            user.email = ""
            user.mist_api_token = ""
            user.save()
            raise exceptions.UnauthorizedError("You need to authenticate "
                                               "to mist.io.")
        else:
            raise exceptions.UnauthorizedError("You need to authenticate "
                                               "to mist.io.")

    action = params.get('action') or 'enable'
    name = params.get('name', '')
    public_ips = params.get('public_ips', [])  # TODO priv IPs?
    dns_name = params.get('dns_name', '')
    no_ssh = bool(params.get('no_ssh', False))
    dry = bool(params.get('dry', False))

    if action == 'enable':
        ret_dict = methods.enable_monitoring(
            user, cloud_id, machine_id, name, dns_name, public_ips,
            no_ssh=no_ssh, dry=dry
        )
    elif action == 'disable':
        methods.disable_monitoring(user, cloud_id, machine_id, no_ssh=no_ssh)
        ret_dict = {}
    else:
        raise exceptions.BadRequestError()

    return ret_dict


@view_config(route_name='api_v1_stats', request_method='GET', renderer='json')
def get_stats(request):
    """
    Get monitor data for a machine
    Get all monitor data for this machine
    READ permission required on cloud.
    READ permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    start:
      description: ' Time formatted as integer, from when to fetch stats (default now)'
      in: query
      required: false
      type: string
    stop:
      default: ''
      description: Time formatted as integer, until when to fetch stats (default +10 seconds)
      in: query
      required: false
      type: string
    step:
      default: ''
      description: ' Step to fetch stats (default 10 seconds)'
      in: query
      required: false
      type: string
    metrics:
      default: ''
      in: query
      required: false
      type: string
    request_id:
      default: ''
      in: query
      required: false
      type: string
    """
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']

    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "read", machine_uuid)

    data = methods.get_stats(
        auth_context.owner,
        cloud_id,
        machine_id,
        request.params.get('start'),
        request.params.get('stop'),
        request.params.get('step'),
        request.params.get('metrics')
    )
    data['request_id'] = request.params.get('request_id')
    return data


@view_config(route_name='api_v1_metrics', request_method='GET', renderer='json')
def find_metrics(request):
    """
    Get metrics of a machine
    Get all metrics associated with specific machine
    READ permission required on cloud.
    READ permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "read", machine_uuid)
    return methods.find_metrics(auth_context.owner, cloud_id, machine_id)


@view_config(route_name='api_v1_metrics', request_method='PUT', renderer='json')
def assoc_metric(request):
    """
    Associate metric with machine
    Associate metric with specific machine
    READ permission required on cloud.
    EDIT_GRAPHS permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    metric_id:
      description: ' Metric_id '
      type: string
    """
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    params = params_from_request(request)
    metric_id = params.get('metric_id')
    if not metric_id:
        raise exceptions.RequiredParameterMissingError('metric_id')
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "edit_graphs", machine_uuid)
    methods.assoc_metric(auth_context.owner, cloud_id, machine_id, metric_id)
    return {}


@view_config(route_name='api_v1_metrics', request_method='DELETE', renderer='json')
def disassoc_metric(request):
    """
    Disassociate metric from machine
    Disassociate metric from specific machine
    READ permission required on cloud.
    EDIT_GRAPHS permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    metric_id:
      description: ' Metric_id '
      type: string
    """
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    params = params_from_request(request)
    metric_id = params.get('metric_id')
    if not metric_id:
        raise exceptions.RequiredParameterMissingError('metric_id')
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "edit_graphs", machine_uuid)
    methods.disassoc_metric(auth_context.owner, cloud_id, machine_id,
                            metric_id)
    return {}


@view_config(route_name='api_v1_metric', request_method='PUT', renderer='json')
def update_metric(request):
    """
    Update a metric configuration
    Update a metric configuration
    READ permission required on cloud.
    EDIT_CUSTOM_METRICS required on machine.
    ---
    metric:
      description: ' Metric_id (provided by self.get_stats() )'
      in: path
      required: true
      type: string
    cloud_id:
      required: true
      type: string
    host:
      type: string
    machine_id:
      required: true
      type: string
    name:
      description: Name of the plugin
      type: string
    plugin_type:
      type: string
    unit:
      description: ' Optional. If given the new plugin will be measured according to this
        unit'
      type: string
    """
    metric_id = request.matchdict['metric']
    params = params_from_request(request)
    machine_id = params.get('machine_id')
    cloud_id = params.get('cloud_id')
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "edit_custom_metrics", machine_uuid)
    methods.update_metric(
        auth_context.owner,
        metric_id,
        name=params.get('name'),
        unit=params.get('unit'),
        cloud_id=cloud_id,
        machine_id=machine_id
    )
    return {}


@view_config(route_name='api_v1_deploy_plugin', request_method='POST', renderer='json')
def deploy_plugin(request):
    """
    Deploy a plugin on a machine.
    Deploy a plugin on the specific machine.
    READ permission required on cloud.
    EDIT_CUSTOM_METRICS required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    plugin:
      in: path
      required: true
      type: string
    name:
      required: true
      type: string
    plugin_type:
      default: python
      enum:
      - python
      required: true
      type: string
    read_function:
      required: true
      type: string
    unit:
      type: string
    value_type:
      default: gauge
      type: string
    """
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    plugin_id = request.matchdict['plugin']
    params = params_from_request(request)
    plugin_type = params.get('plugin_type')
    auth_context = auth_context_from_request(request)
    # SEC check permission READ on cloud
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
    except me.DoesNotExist:
        raise exceptions.NotFoundError("Machine %s doesn't exist" % machine_id)

    # SEC check permission EDIT_CUSTOM_METRICS on machine
    auth_context.check_perm("machine", "edit_custom_metrics", machine.id)

    try:
        Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except me.DoesNotExist:
        raise exceptions.NotFoundError('Cloud id %s does not exist' % cloud_id)

    if not machine.monitoring.hasmonitoring:
        raise exceptions.NotFoundError("Machine doesn't seem to "
                                           "have monitoring enabled")

    # create a collectdScript
    extra = {'value_type': params.get('value_type', 'gauge'),
             'value_unit': ''}
    name = plugin_id
    kwargs = {'location_type': 'inline',
              'script': params.get('read_function'),
              'extra': extra}
    script = CollectdScript.add(auth_context.owner, name, **kwargs)

    if plugin_type == 'python':
        ret = script.ctl.deploy_python_plugin(machine)
        methods.update_metric(
            auth_context.owner,
            metric_id=ret['metric_id'],
            name=params.get('name'),
            unit=params.get('unit'),
            cloud_id=cloud_id,
            machine_id=machine_id,
        )
        return ret
    else:
        raise exceptions.BadRequestError("Invalid plugin_type: "
                                            "'%s'" % plugin_type)


@view_config(route_name='api_v1_deploy_plugin',
             request_method='DELETE', renderer='json')
def undeploy_plugin(request):
    """
    Undeploy a plugin on a machine.
    Undeploy a plugin on the specific machine.
    READ permission required on cloud.
    EDIT_CUSTOM_METRICS required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    plugin:
      in: path
      required: true
      type: string
    host:
      required: true
      type: string
    plugin_type:
      default: python
      enum:
      - python
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    plugin_id = request.matchdict['plugin']
    params = params_from_request(request)
    plugin_type = params.get('plugin_type')
    host = params.get('host')
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "edit_custom_metrics", machine_uuid)
    if plugin_type == 'python':
        ret = methods.undeploy_python_plugin(auth_context.owner, cloud_id,
                                             machine_id, plugin_id, host)
        return ret
    else:
        raise exceptions.BadRequestError("Invalid plugin_type: '%s'"
                                         % plugin_type)


# @view_config(route_name='metric', request_method='DELETE', renderer='json')
# def remove_metric(request):
    # user = user_from_request(request)
    # metric_id = request.matchdict['metric']
    # url = "%s/metrics/%s" % (config.CORE_URI, metric_id)
    # headers={'Authorization': get_auth_header(user)}
    # try:
        # resp = requests.delete(url, headers=headers,
        #                        verify=config.SSL_VERIFY)
    # except requests.exceptions.SSLError as exc:
        # raise SSLError()
    # except Exception as exc:
        # log.error("Exception removing metric: %r", exc)
        # raise exceptions.ServiceUnavailableError()
    # if not resp.ok:
        # log.error("Error removing metric %d:%s", resp.status_code, resp.text)
        # raise exceptions.BadRequestError(resp.text)
    # return resp.json()


@view_config(route_name='api_v1_rules', request_method='POST', renderer='json')
def update_rule(request):
    """
    Creates or updates a rule.
    ---
    """
    user = user_from_request(request)
    params = params_from_request(request)
    try:
        ret = requests.post(
            config.CORE_URI + request.path,
            params=params,
            headers={'Authorization': get_auth_header(user)},
            verify=config.SSL_VERIFY
        )
    except requests.exceptions.SSLError as exc:
        log.error("%r", exc)
        raise exceptions.SSLError()
    if ret.status_code != 200:
        log.error("Error updating rule %d:%s", ret.status_code, ret.text)
        raise exceptions.ServiceUnavailableError()
    trigger_session_update(user, ['monitoring'])
    return ret.json()


@view_config(route_name='api_v1_rule', request_method='DELETE')
def delete_rule(request):
    """
    Delete rule
    Deletes a rule.
    ---
    rule:
      description: ' Rule id '
      in: path
      required: true
      type: string
    """
    user = user_from_request(request)
    try:
        ret = requests.delete(
            config.CORE_URI + request.path,
            headers={'Authorization': get_auth_header(user)},
            verify=config.SSL_VERIFY
        )
    except requests.exceptions.SSLError as exc:
        log.error("%r", exc)
        raise exceptions.SSLError()
    if ret.status_code != 200:
        log.error("Error deleting rule %d:%s", ret.status_code, ret.text)
        raise exceptions.ServiceUnavailableError()
    trigger_session_update(user, ['monitoring'])
    return OK


@view_config(route_name='api_v1_providers', request_method='GET', renderer='json')
def list_supported_providers(request):
    """
    List supported providers
    Return all of our SUPPORTED PROVIDERS
    ---
    api_version:
      enum:
      - 1
      - 2
      in: header
      type: integer
    """
    api_version = request.headers.get('Api-Version', 1)
    if int(api_version) == 2:
        return {'supported_providers': config.SUPPORTED_PROVIDERS_V_2}
    else:
        return {'supported_providers': config.SUPPORTED_PROVIDERS}
