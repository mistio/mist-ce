"""mist.io.views

Here we define the HTTP API of the app. The view functions here are
responsible for taking parameters from the web requests, passing them on to
functions defined in methods and properly formatting the output. This is the
only source file where we import things from pyramid. View functions should
only check that all required params are provided. Any further checking should
be performed inside the corresponding method functions.

"""

import re
import requests
import json

from pyramid.response import Response

try:
    from mist.core import config
    from mist.core.helpers import view_config
    from mist.core.auth.methods import user_from_request
except ImportError:
    from mist.io import config
    from mist.io.helpers import user_from_request
    from pyramid.view import view_config

from mist.io import methods
from mist.io.model import Keypair
import mist.io.exceptions as exceptions
from mist.io.exceptions import *
import pyramid.httpexceptions

from mist.io.helpers import get_auth_header, params_from_request
from mist.io.helpers import trigger_session_update

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

    # non-mist exceptions. that shouldn't happen! never!
    if not isinstance(exc, exceptions.MistError):
        trace = traceback.format_exc()
        log.critical("Uncaught non-mist exception? WTF!\n%s", trace)
        return Response("Internal Server Error", 500)

    # mist exceptions are ok.
    log.info("MistError: %r", exc)

    # translate it to HTTP response based on http_code attribute
    return Response(str(exc), exc.http_code)


@view_config(context='pyramid.httpexceptions.HTTPNotFound',
             renderer='templates/404.pt')
def not_found(self, request):

    return pyramid.httpexceptions.HTTPFound(request.host_url+"/#"+request.path)



@view_config(route_name='home', request_method='GET',
             renderer='templates/home.pt')
def home(request):
    """Home page view"""
    user = user_from_request(request)
    return {
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
    }


@view_config(route_name="check_auth", request_method='POST', renderer="json")
def check_auth(request):
    """Check on the mist.core service if authenticated"""

    params = params_from_request(request)
    email = params.get('email', '').lower()
    password = params.get('password', '')

    payload = {'email': email, 'password': password}
    try:
        ret = requests.post(config.CORE_URI + '/auth', params=payload,
                            verify=config.SSL_VERIFY)
    except requests.exceptions.SSLError as exc:
        log.error("%r", exc)
        raise SSLError()
    if ret.status_code == 200:
        ret_dict = json.loads(ret.content)
        user = user_from_request(request)
        with user.lock_n_load():
            user.email = email
            user.mist_api_token = ret_dict.pop('token', '')
            user.save()
        log.info("succesfully check_authed")
        return ret_dict
    else:
        log.error("Couldn't check_auth to mist.io: %r", ret)
        raise UnauthorizedError()


@view_config(route_name='account', request_method='POST', renderer='json')
def update_user_settings(request):
    """try free plan, by communicating to the mist.core service"""

    params = params_from_request(request)
    action = params.get('action', '').lower()
    plan = params.get('plan', '')
    name = params.get('name', '')
    company_name = params.get('company_name', '')
    country = params.get('country', '')
    number_of_servers = params.get('number_of_servers', '')
    number_of_people = params.get('number_of_people', '')

    user = user_from_request(request)

    payload = {'action': action,
               'plan': plan,
               'name': name,
               'company_name': company_name,
               'country': country,
               'number_of_servers': number_of_servers,
               'number_of_people': number_of_people}

    try:
        ret = requests.post(config.CORE_URI + '/account',
                            params=payload,
                            headers={'Authorization': get_auth_header(user)},
                            verify=config.SSL_VERIFY)
    except requests.exceptions.SSLError as exc:
        log.error("%r", exc)
        raise SSLError()
    if ret.status_code == 200:
        ret = json.loads(ret.content)
        return ret
    else:
        raise UnauthorizedError()


@view_config(route_name='api_v1_clouds', request_method='GET', renderer='json')
@view_config(route_name='clouds', request_method='GET', renderer='json')
def list_clouds(request):
    """
    Request a list of all added clouds.
    ---
    """

    user = user_from_request(request)
    return methods.list_clouds(user)


@view_config(route_name='api_v1_clouds', request_method='POST', renderer='json')
@view_config(route_name='clouds', request_method='POST', renderer='json')
def add_cloud(request):
    """
    Add a new cloud
     Adds a new cloud to the user and returns the cloud_id
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
      - coreos
      - ec2
      - rackspace
      - nephoscale
      - digitalocean
      - softlayer
      - gce
      - azure
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
    params = params_from_request(request)
    # remove spaces from start/end of string fields that are often included
    # when pasting keys, preventing thus succesfull connection with the
    # cloud
    for key in params.keys():
        if type(params[key]) in [unicode, str]:
            params[key] = params[key].rstrip().lstrip()

    api_version = request.headers.get('Api-Version', 1)
    title = params.get('title', '')
    provider = params.get('provider', '')

    if not provider:
        raise RequiredParameterMissingError('provider')

    user = user_from_request(request)

    monitoring = None
    if int(api_version) == 2:
        ret = methods.add_cloud_v_2(user, title, provider, params)
        cloud_id = ret['cloud_id']
        monitoring = ret.get('monitoring')
    else:
        apikey = params.get('apikey', '')
        apisecret = params.get('apisecret', '')
        apiurl = params.get('apiurl') or ''  # fixes weird issue w/ none value
        tenant_name = params.get('tenant_name', '')
        # following params are for baremetal
        machine_hostname = params.get('machine_ip', '')
        machine_key = params.get('machine_key', '')
        machine_user = params.get('machine_user', '')
        remove_on_error = params.get('remove_on_error', True)
        try:
            docker_port = int(params.get('docker_port', 4243))
        except:
            docker_port = 4243
        try:
            ssh_port = int(params.get('machine_port', 22))
        except:
            ssh_port = 22
        region = params.get('region', '')
        compute_endpoint = params.get('compute_endpoint', '')
        # TODO: check if all necessary information was provided in the request

        cloud_id = methods.add_cloud(
            user, title, provider, apikey, apisecret, apiurl,
            tenant_name=tenant_name,
            machine_hostname=machine_hostname, machine_key=machine_key,
            machine_user=machine_user, region=region,
            compute_endpoint=compute_endpoint, port=ssh_port,
            docker_port=docker_port,
            remove_on_error=remove_on_error,
        )

    cloud = user.clouds[cloud_id]
    ret = {
        'index': len(user.clouds) - 1,
        'id': cloud_id,
        'apikey': cloud.apikey,
        'apiurl': cloud.apiurl,
        'tenant_name': cloud.tenant_name,
        'title': cloud.title,
        'provider': cloud.provider,
        'poll_interval': cloud.poll_interval,
        'region': cloud.region,
        'status': 'off',
        'enabled': cloud.enabled,
    }
    if monitoring:
        ret['monitoring'] = monitoring
    return ret


@view_config(route_name='api_v1_cloud_action', request_method='DELETE')
@view_config(route_name='cloud_action', request_method='DELETE')
def delete_cloud(request):
    """
    Delete a cloud
    Deletes cloud with given cloud_id.
    ---
    cloud:
      in: path
      required: true
      type: string
    """

    cloud_id = request.matchdict['cloud']
    user = user_from_request(request)
    methods.delete_cloud(user, cloud_id)
    return OK


@view_config(route_name='api_v1_cloud_action', request_method='PUT')
@view_config(route_name='cloud_action', request_method='PUT')
def rename_cloud(request):
    """
    Rename a cloud
    Renames cloud with given cloud_id.
    ---
    cloud:
      in: path
      required: true
      type: string
    new_name:
      description: ' New name for the key (will also serve as the key''s id)'
      type: string
    """
    cloud_id = request.matchdict['cloud']
    params = params_from_request(request)
    new_name = params.get('new_name', '')
    if not new_name:
        raise RequiredParameterMissingError('new_name')

    user = user_from_request(request)
    methods.rename_cloud(user, cloud_id, new_name)
    return OK


@view_config(route_name='api_v1_cloud_action', request_method='POST')
@view_config(route_name='cloud_action', request_method='POST')
def toggle_cloud(request):
    """
    Toggle a cloud
    Toggles cloud with given cloud_id.
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
    cloud_id = request.matchdict['cloud']
    params = params_from_request(request)
    new_state = params.get('new_state', '')
    if not new_state:
        raise RequiredParameterMissingError('new_state')

    if new_state != "1" and new_state != "0":
        raise BadRequestError('Invalid cloud state')

    user = user_from_request(request)
    if cloud_id not in user.clouds:
        raise CloudNotFoundError()
    with user.lock_n_load():
        user.clouds[cloud_id].enabled = bool(int(new_state))
        user.save()
    trigger_session_update(user.email, ['clouds'])
    return OK


@view_config(route_name='api_v1_keys', request_method='GET', renderer='json')
@view_config(route_name='keys', request_method='GET', renderer='json')
def list_keys(request):
    """
    List keys
    Retrieves a list of all added Keys
    ---
    """
    user = user_from_request(request)
    return methods.list_keys(user)


@view_config(route_name='api_v1_keys', request_method='PUT', renderer='json')
@view_config(route_name='keys', request_method='PUT', renderer='json')
def add_key(request):
    """
    Add key
    Add key with specific id
    ---
    id:
      description: ' The Key name (id)'
      required: true
      type: string
    priv:
      description: ' The private key'
      required: true
      type: string
    """
    params = params_from_request(request)
    key_id = params.get('id', '')
    private_key = params.get('priv', '')

    user = user_from_request(request)
    key_id = methods.add_key(user, key_id, private_key)

    keypair = user.keypairs[key_id]

    return {'id': key_id,
            'machines': keypair.machines,
            'isDefault': keypair.default}


@view_config(route_name='api_v1_key_action', request_method='DELETE', renderer='json')
@view_config(route_name='key_action', request_method='DELETE', renderer='json')
def delete_key(request):
    """
    Delete key
    Delete key. When a keypair gets deleted, it takes its asociations with it
    so just need to remove from the server too. If the default key gets delet-
    ed, it sets the next one as default, provided that at least another key e-
    xists. It returns the list of all keys after the deletion, excluding the
    private keys (check also list_keys).
    ---
    key:
      in: path
      required: true
      type: string
    """

    key_id = request.matchdict.get('key')
    if not key_id:
        raise KeypairParameterMissingError()

    user = user_from_request(request)
    methods.delete_key(user, key_id)
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
    ---
    key_ids:
      required: true
      type: array
      items:
        type: string
        name: key_id
    """
    user = user_from_request(request)
    params = params_from_request(request)
    key_ids = params.get('key_ids', [])
    if type(key_ids) != list or len(key_ids) == 0:
        raise RequiredParameterMissingError('No key ids provided')
    # remove duplicate ids if there are any
    key_ids = sorted(key_ids)
    i = 1
    while i < len(key_ids):
        if key_ids[i] == key_ids[i - 1]:
            key_ids = key_ids[:i] + key_ids[i + 1:]
        else:
            i += 1
    report = {}
    for key_id in key_ids:
        try:
            methods.delete_key(user, key_id)
        except KeypairNotFoundError:
            report[key_id] = 'not_found'
        else:
            report[key_id] = 'deleted'
    # if no script id was valid raise exception
    if len(filter(lambda key_id: report[key_id] == 'not_found',
                  report)) == len(key_ids):
        raise NotFoundError('No valid script id provided')
    return report


@view_config(route_name='api_v1_key_action', request_method='PUT', renderer='json')
@view_config(route_name='key_action', request_method='PUT', renderer='json')
def edit_key(request):
    """
    Edit a key
    Edits a given key's name from old_key -> new_key
    ---
    new_id:
      description: The new Key name (id)
      type: string
    key:
      description: ' The old key name (id)'
      in: path
      required: true
      type: string
    """
    old_id = request.matchdict['key']
    params = params_from_request(request)
    new_id = params.get('new_id')
    if not new_id:
        raise RequiredParameterMissingError("new_id")

    user = user_from_request(request)
    methods.edit_key(user, new_id, old_id)
    return {'new_id': new_id}


@view_config(route_name='api_v1_key_action', request_method='POST')
@view_config(route_name='key_action', request_method='POST')
def set_default_key(request):
    """
    Set default key
    Sets a new default key
    ---
    key:
      description: The key id
      in: path
      required: true
      type: string
    """
    key_id = request.matchdict['key']
    user = user_from_request(request)

    methods.set_default_key(user, key_id)
    return OK


@view_config(route_name='api_v1_key_private', request_method='GET', renderer='json')
@view_config(route_name='key_private', request_method='GET', renderer='json')
def get_private_key(request):
    """
    Gets private key from keypair name.
    It is used in single key view when the user clicks the display private key
    button.
    ---
    key:
      description: ' The key id'
      in: path
      required: true
      type: string
    """

    user = user_from_request(request)
    key_id = request.matchdict['key']
    if not key_id:
        raise RequiredParameterMissingError("key_id")
    if key_id not in user.keypairs:
        raise KeypairNotFoundError(key_id)
    return user.keypairs[key_id].private


@view_config(route_name='api_v1_key_public', request_method='GET', renderer='json')
@view_config(route_name='key_public', request_method='GET', renderer='json')
def get_public_key(request):
    """
    Get public key
    Gets public key from keypair name.
    ---
    key:
      description: ' The key id'
      in: path
      required: true
      type: string
    """
    user = user_from_request(request)
    key_id = request.matchdict['key']
    if not key_id:
        raise RequiredParameterMissingError("key_id")
    if key_id not in user.keypairs:
        raise KeypairNotFoundError(key_id)
    return user.keypairs[key_id].public


@view_config(route_name='api_v1_keys', request_method='POST', renderer='json')
@view_config(route_name='keys', request_method='POST', renderer='json')
def generate_keypair(request):
    """
    Generate key
    Generate key pair
    ---
    """
    keypair = Keypair()
    keypair.generate()
    return {'priv': keypair.private, 'public': keypair.public}


@view_config(route_name='api_v1_key_association', request_method='PUT', renderer='json')
@view_config(route_name='key_association', request_method='PUT', renderer='json')
def associate_key(request):
    """
    Associate a key to a machine
    Associates a key with a machine. If host is set it will also attempt to ac-
    tually deploy it to the machine. To do that it requires another keypair (-
    existing_key) that can connect to the machine.
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
    host:
      type: string
    port:
      default: 22
      type: integer
    ssh_user:
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
    try:
        host = request.json_body.get('host')
    except:
        host = None
    if not host:
        raise RequiredParameterMissingError('host')
    user = user_from_request(request)
    methods.associate_key(user, key_id, cloud_id, machine_id, host,
                          username=ssh_user, port=ssh_port)
    return user.keypairs[key_id].machines


@view_config(route_name='api_v1_key_association', request_method='DELETE', renderer='json')
@view_config(route_name='key_association', request_method='DELETE', renderer='json')
def disassociate_key(request):
    """
    Disassociate a key from a machine
    Disassociates a key from a machine. If host is set it will also attempt to
     actually remove it from the machine.
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
    host:
      type: string
    """
    key_id = request.matchdict['key']
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    try:
        host = request.json_body.get('host')
    except:
        host = None
    user = user_from_request(request)
    methods.disassociate_key(user, key_id, cloud_id, machine_id, host)
    return user.keypairs[key_id].machines


@view_config(route_name='api_v1_machines', request_method='GET', renderer='json')
@view_config(route_name='machines', request_method='GET', renderer='json')
def list_machines(request):
    """
    List machines on cloud
    Gets machines and their metadata from a cloud
    ---
    cloud:
      in: path
      required: true
      type: string
    """

    user = user_from_request(request)
    cloud_id = request.matchdict['cloud']
    return methods.list_machines(user, cloud_id)


@view_config(route_name='api_v1_machines', request_method='POST', renderer='json')
@view_config(route_name='machines', request_method='POST', renderer='json')
def create_machine(request):
    """
    Create machine(s) on cloud
    Creates one or more machines on the specified cloud. If async is true, a
    jobId will be returned.
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
    image_id:
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
      description: ' If of the size of the machine'
      required: true
      type: string
    size_name:
      type: string
    ssh_port:
      type: integer
    """
    params = params_from_request(request)
    cloud_id = request.matchdict['cloud']

    for key in ('name', 'size'):
        if key not in params:
            raise RequiredParameterMissingError(key)

    key_id = params.get('key')
    machine_name = params['name']
    location_id = params.get('location', None)
    if params.get('provider') == 'libvirt':
        image_id = params.get('image')
        disk_size = int(params.get('libvirt_disk_size', 4))
        disk_path = params.get('libvirt_disk_path', '')
    else:
        image_id = params['image']
        if not image_id:
            raise RequiredParameterMissingError("machine_name")
        disk_size = disk_path = None
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
    docker_port_bindings = params.get('docker_port_bindings',
                                                 {})
    docker_exposed_ports = params.get('docker_exposed_ports',
                                                 {})
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
    hourly = params.get('hourly', True)

    # only for mist.core, parameters for cronjob
    if not params.get('cronjob_type'):
        cronjob = {}
    else:
        for key in ('cronjob_name', 'cronjob_type', 'cronjob_entry'):
            if key not in params:
                raise RequiredParameterMissingError(key)

        cronjob= {
            'name': params.get('cronjob_name'),
            'description': params.get('description', ''),
            'action': params.get('cronjob_action', ''),
            'script_id': params.get('cronjob_script_id', ''),
            'cronjob_type': params.get('cronjob_type'),
            'cronjob_entry': params.get('cronjob_entry'),
            'expires': params.get('expires', ''),
            'enabled': bool(params.get('cronjob_enabled', False)),
            'run_immediately': params.get('run_immediately', False),
            }

    user = user_from_request(request)
    import uuid
    job_id = uuid.uuid4().hex
    from mist.io import tasks
    args = (cloud_id, key_id, machine_name,
            location_id, image_id, size_id, script,
            image_extra, disk, image_name, size_name,
            location_name, ips, monitoring, networks,
            docker_env, docker_command)
    kwargs = {'script_id': script_id, 'script_params': script_params,
              'job_id': job_id, 'docker_port_bindings': docker_port_bindings,
              'docker_exposed_ports': docker_exposed_ports,
              'azure_port_bindings': azure_port_bindings,
              'hostname': hostname, 'plugins': plugins,
              'post_script_id': post_script_id,
              'post_script_params': post_script_params, 'disk_size': disk_size,
              'disk_path': disk_path,
              'cloud_init': cloud_init,
              'associate_floating_ip': associate_floating_ip,
              'associate_floating_ip_subnet': associate_floating_ip_subnet,
              'project_id': project_id, 'bare_metal': bare_metal, 'hourly': hourly, 'cronjob': cronjob}
    if not async:
        ret = methods.create_machine(user, *args, **kwargs)
    else:

        args = (user.email, ) + args
        kwargs.update({'quantity': quantity, 'persist': persist})
        tasks.create_machine_async.apply_async(args, kwargs, countdown=2)
        ret = {'job_id': job_id}

    return ret


@view_config(route_name='api_v1_machine', request_method='POST', renderer='json')
@view_config(route_name='machine', request_method='POST', renderer='json')
def machine_actions(request):
    """
    Call an action on machine
    Calls a machine action on clouds that support it
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
      type: string
    size:
      description: The size id of the plan to resize
      type: string
    """
    # TODO: We shouldn't return list_machines, just 200. Save the API!
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    user = user_from_request(request)
    params = params_from_request(request)
    action = params.get('action', '')
    plan_id = params.get('plan_id', '')
    # plan_id is the id of the plan to resize
    name = params.get('name', '')

    if action in ('start', 'stop', 'reboot', 'destroy', 'resize', 'rename', 'undefine', 'suspend', 'resume'):
        if action == 'start':
            methods.start_machine(user, cloud_id, machine_id)
        elif action == 'stop':
            methods.stop_machine(user, cloud_id, machine_id)
        elif action == 'reboot':
            methods.reboot_machine(user, cloud_id, machine_id)
        elif action == 'destroy':
            methods.destroy_machine(user, cloud_id, machine_id)
        elif action == 'resize':
            methods.resize_machine(user, cloud_id, machine_id, plan_id)
        elif action == 'rename':
            methods.rename_machine(user, cloud_id, machine_id, name)
        elif action == 'undefine':
            methods.undefine_machine(user, cloud_id, machine_id)
        elif action == 'resume':
            methods.resume_machine(user, cloud_id, machine_id)
        elif action == 'suspend':
            methods.suspend_machine(user, cloud_id, machine_id)

        # return OK
        return methods.list_machines(user, cloud_id)
    raise BadRequestError()


@view_config(route_name='api_v1_machine_rdp', request_method='GET', renderer='json')
@view_config(route_name='machine_rdp', request_method='GET', renderer='json')
def machine_rdp(request):
    """
    Rdp file for windows machines
    Generate and return an rdp file for windows machines
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
    user = user_from_request(request)
    rdp_port = request.params.get('rdp_port', 3389)
    host = request.params.get('host')

    if not host:
        raise BadRequestError('no hostname specified')
    try:
        1 < int(rdp_port) < 65535
    except:
        rdp_port = 3389

    rdp_content = 'full address:s:%s:%s\nprompt for credentials:i:1' % \
                  (host, rdp_port)
    return Response(content_type='application/octet-stream',
                    content_disposition='attachment; filename="%s.rdp"' % host,
                    charset='utf8',
                    pragma='no-cache',
                    body=rdp_content)


@view_config(route_name='api_v1_machine_tags', request_method='POST', renderer='json')
@view_config(route_name='machine_tags', request_method='POST', renderer='json')
def set_machine_tags(request):
    """
    Set tags on a machine
    Set tags for a machine, given the cloud and machine id.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    tags:
      items:
        type: object
      type: array
    """
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    try:
        tags = request.json_body['tags']
    except:
        raise BadRequestError('tags should be list of tags')
    if type(tags) != list:
        raise BadRequestError('tags should be list of tags')

    user = user_from_request(request)
    methods.set_machine_tags(user, cloud_id, machine_id, tags)
    return OK


@view_config(route_name='api_v1_machine_tag', request_method='DELETE', renderer='json')
@view_config(route_name='machine_tag', request_method='DELETE', renderer='json')
def delete_machine_tag(request):
    """
    Delete a tag
    Delete tag in the db for specified resource_type
    ---
    tag:
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

    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    tag = request.matchdict['tag']
    user = user_from_request(request)
    methods.delete_machine_tag(user, cloud_id, machine_id, tag)
    return OK


@view_config(route_name='api_v1_images', request_method='POST', renderer='json')
@view_config(route_name='images', request_method='POST', renderer='json')
def list_specific_images(request):
    # FIXME: 1) i shouldn't exist, 2) i shouldn't be a post
    return list_images(request)


@view_config(route_name='api_v1_images', request_method='GET', renderer='json')
@view_config(route_name='images', request_method='GET', renderer='json')
def list_images(request):
    """
    List images of specified cloud
    List images from each cloud. Furthermore if a search_term is provided, we
    loop through each cloud and search for that term in the ids and the names
     of the community images
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
        term = request.json_body.get('search_term', '').lower()
    except:
        term = None
    user = user_from_request(request)
    return methods.list_images(user, cloud_id, term)


@view_config(route_name='api_v1_image', request_method='POST', renderer='json')
@view_config(route_name='image', request_method='POST', renderer='json')
def star_image(request):
    """
    Star/unstar an image
    Toggle image star (star/unstar)
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
    user = user_from_request(request)
    return methods.star_image(user, cloud_id, image_id)


@view_config(route_name='api_v1_sizes', request_method='GET', renderer='json')
@view_config(route_name='sizes', request_method='GET', renderer='json')
def list_sizes(request):
    """
    List sizes of a cloud
    List sizes (aka flavors) from each cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    user = user_from_request(request)
    return methods.list_sizes(user, cloud_id)


@view_config(route_name='api_v1_locations', request_method='GET', renderer='json')
@view_config(route_name='locations', request_method='GET', renderer='json')
def list_locations(request):
    """
    List locations of cloud
    List locations from each cloud. Locations mean different things in each cl-
    oud. e.g. EC2 uses it as a datacenter in a given availability zone, where-
    as Linode lists availability zones. However all responses share id, name
    and country eventhough in some cases might be empty, e.g. Openstack. In E-
    C2 all locations by a provider have the same name, so the availability zo-
    nes are listed instead of name.
    ---
    cloud:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    user = user_from_request(request)
    return methods.list_locations(user, cloud_id)


@view_config(route_name='api_v1_networks', request_method='GET', renderer='json')
@view_config(route_name='networks', request_method='GET', renderer='json')
def list_networks(request):
    """
    List networks of a cloud
    List networks from each cloud.
    Currently NephoScale and Openstack networks
     are supported. For other providers this returns an empty list.
    ---
    cloud:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    user = user_from_request(request)
    return methods.list_networks(user, cloud_id)


@view_config(route_name='api_v1_networks', request_method='POST', renderer='json')
@view_config(route_name='networks', request_method='POST', renderer='json')
def create_network(request):
    """
    Create network on a cloud
    Creates a new network. If subnet dict is specified, after creating the net-
    work it will use the new network's id to create a subnet
    ---
    cloud:
      in: path
      required: true
      type: string
    cloud_id:
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
        raise RequiredParameterMissingError(e)

    subnet = request.json_body.get('subnet', None)
    router = request.json_body.get('router', None)
    user = user_from_request(request)
    return methods.create_network(user, cloud_id, network, subnet, router)


@view_config(route_name='api_v1_network', request_method='DELETE')
@view_config(route_name='network', request_method='DELETE')
def delete_network(request):
    """
    Delete a network
    Delete a network
    ---
    cloud:
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

    user = user_from_request(request)
    methods.delete_network(user, cloud_id, network_id)

    return OK


@view_config(route_name='api_v1_network', request_method='POST')
@view_config(route_name='network', request_method='POST')
def associate_ip(request):
    """
    Associate ip
    Associate ip with the specific network and machine
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
    machine = params.get('machine')
    assign = params.get('assign', True)
    user = user_from_request(request)

    ret = methods.associate_ip(user, cloud_id, network_id, ip, machine,
                               assign)
    if ret:
        return OK
    else:
        return Response("Bad Request", 400)


@view_config(route_name='api_v1_probe', request_method='POST', renderer='json')
@view_config(route_name='probe', request_method='POST', renderer='json')
def probe(request):
    """
    Probe a machine
    Ping and SSH to machine and collect various metrics.
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
    user = user_from_request(request)
    ret = methods.probe(user, cloud_id, machine_id, host, key_id, ssh_user)
    return ret


@view_config(route_name='api_v1_monitoring', request_method='GET', renderer='json')
@view_config(route_name='monitoring', request_method='GET', renderer='json')
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
@view_config(route_name='update_monitoring', request_method='POST', renderer='json')
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
            raise UnauthorizedError("You need to authenticate to mist.io.")
        payload = {'email': email, 'password': password}
        try:
            ret = requests.post(config.CORE_URI + '/auth', params=payload,
                                verify=config.SSL_VERIFY)
        except requests.exceptions.SSLError as exc:
            log.error("%r", exc)
            raise SSLError()
        if ret.status_code == 200:
            ret_dict = json.loads(ret.content)
            with user.lock_n_load():
                user.email = email
                user.mist_api_token = ret_dict.pop('token', '')
                user.save()
            log.info("succesfully check_authed")
        elif ret.status_code in [400, 401]:
            with user.lock_n_load():
                user.email = ""
                user.mist_api_token = ""
                user.save()
            raise UnauthorizedError("You need to authenticate to mist.io.")
        else:
            raise UnauthorizedError("You need to authenticate to mist.io.")

    action = params.get('action') or 'enable'
    name = params.get('name', '')
    public_ips = params.get('public_ips', [])
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
        raise BadRequestError()

    return ret_dict


@view_config(route_name='api_v1_stats', request_method='GET', renderer='json')
@view_config(route_name='stats', request_method='GET', renderer='json')
def get_stats(request):
    """
    Get monitor data for a machine
    Get all monitor data for this machine
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
    data = methods.get_stats(
        user_from_request(request),
        request.matchdict['cloud'],
        request.matchdict['machine'],
        request.params.get('start'),
        request.params.get('stop'),
        request.params.get('step'),
        request.params.get('metrics')
    )
    data['request_id'] = request.params.get('request_id')
    return data


@view_config(route_name='api_v1_metrics', request_method='GET', renderer='json')
@view_config(route_name='metrics', request_method='GET', renderer='json')
def find_metrics(request):
    """
    Get metrics of a machine
    Get all metrics associated with specific machine
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
    user = user_from_request(request)
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    return methods.find_metrics(user, cloud_id, machine_id)


@view_config(route_name='api_v1_metrics', request_method='PUT', renderer='json')
@view_config(route_name='metrics', request_method='PUT', renderer='json')
def assoc_metric(request):
    """
    Associate metric with machine
    Associate metric with specific machine
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
    user = user_from_request(request)
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    params = params_from_request(request)
    metric_id = params.get('metric_id')
    if not metric_id:
        raise RequiredParameterMissingError('metric_id')
    methods.assoc_metric(user, cloud_id, machine_id, metric_id)
    return {}


@view_config(route_name='api_v1_metrics', request_method='DELETE', renderer='json')
@view_config(route_name='metrics', request_method='DELETE', renderer='json')
def disassoc_metric(request):
    """
    Disassociate metric from machine
    Disassociate metric from specific machine
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
    user = user_from_request(request)
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    params = params_from_request(request)
    metric_id = params.get('metric_id')
    if not metric_id:
        raise RequiredParameterMissingError('metric_id')
    methods.disassoc_metric(user, cloud_id, machine_id, metric_id)
    return {}


@view_config(route_name='api_v1_metric', request_method='PUT', renderer='json')
@view_config(route_name='metric', request_method='PUT', renderer='json')
def update_metric(request):
    """
    Update a metric configuration
    Update a metric configuration
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
    user = user_from_request(request)
    metric_id = request.matchdict['metric']
    params = params_from_request(request)
    methods.update_metric(
        user,
        metric_id,
        name=params.get('name'),
        unit=params.get('unit'),
        cloud_id=params.get('cloud_id'),
        machine_id=params.get('machine_id'),
    )
    return {}


@view_config(route_name='api_v1_deploy_plugin', request_method='POST', renderer='json')
@view_config(route_name='deploy_plugin', request_method='POST', renderer='json')
def deploy_plugin(request):
    """
    Deploy a plugin on a machine.
    Deploy a plugin on the specific machine.
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
    user = user_from_request(request)
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    plugin_id = request.matchdict['plugin']
    params = params_from_request(request)
    plugin_type = params.get('plugin_type')
    host = params.get('host')
    if plugin_type == 'python':
        ret = methods.deploy_python_plugin(
            user, cloud_id, machine_id, plugin_id,
            value_type=params.get('value_type', 'gauge'),
            read_function=params.get('read_function'),
            host=host,
        )
        methods.update_metric(
            user,
            metric_id=ret['metric_id'],
            name=params.get('name'),
            unit=params.get('unit'),
            cloud_id=cloud_id,
            machine_id=machine_id,
        )
        return ret
    else:
        raise BadRequestError("Invalid plugin_type: '%s'" % plugin_type)


@view_config(route_name='api_v1_deploy_plugin', request_method='DELETE', renderer='json')
@view_config(route_name='deploy_plugin', request_method='DELETE', renderer='json')
def undeploy_plugin(request):
    """
    Undeploy a plugin on a machine.
    Undeploy a plugin on the specific machine.
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
    user = user_from_request(request)
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    plugin_id = request.matchdict['plugin']
    params = params_from_request(request)
    plugin_type = params.get('plugin_type')
    host = params.get('host')
    if plugin_type == 'python':
        ret = methods.undeploy_python_plugin(user, cloud_id,
                                             machine_id, plugin_id, host)
        return ret
    else:
        raise BadRequestError("Invalid plugin_type: '%s'" % plugin_type)


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
        # raise ServiceUnavailableError()
    # if not resp.ok:
        # log.error("Error removing metric %d:%s", resp.status_code, resp.text)
        # raise BadRequestError(resp.text)
    # return resp.json()


@view_config(route_name='api_v1_rules', request_method='POST', renderer='json')
@view_config(route_name='rules', request_method='POST', renderer='json')
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
        raise SSLError()
    if ret.status_code != 200:
        log.error("Error updating rule %d:%s", ret.status_code, ret.text)
        raise ServiceUnavailableError()
    trigger_session_update(user.email, ['monitoring'])
    return ret.json()


@view_config(route_name='api_v1_rule', request_method='DELETE')
@view_config(route_name='rule', request_method='DELETE')
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
        raise SSLError()
    if ret.status_code != 200:
        log.error("Error deleting rule %d:%s", ret.status_code, ret.text)
        raise ServiceUnavailableError()
    trigger_session_update(user.email, ['monitoring'])
    return OK


@view_config(route_name='api_v1_providers', request_method='GET', renderer='json')
@view_config(route_name='providers', request_method='GET', renderer='json')
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
