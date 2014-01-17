"""mist.io.views

Here we define the HTTP API of the app. The view functions here are
responsible for taking parameters from the web requests, passing them on to
functions defined in methods and properly formatting the output. This is the
only source file where we import things from pyramid. View functions should
only check that all required params are provided. Any further checking should
be performed inside the corresponding method functions.

"""


import logging
from datetime import datetime


import requests
import json
import re

from pyramid.response import Response

try:
    from mist.core import config
    from mist.core.helpers import user_from_request
    from mist.core.helpers import view_config
except ImportError:
    from mist.io import config
    from mist.io.helpers import user_from_request
    from pyramid.view import view_config

from mist.io import methods
from mist.io.model import Keypair
from mist.io.shell import Shell
import mist.io.exceptions as exceptions
from mist.io.exceptions import *


log = logging.getLogger(__name__)
OK = Response("OK", 200)


@view_config(context=exceptions.MistError)
def exception_handler_mist(exc, request):
    """Here we catch exceptions and transform them to proper http responses

    This is a special pyramid view that gets triggered whenever an exception
    is raised from any other view. It catches all exceptions exc where
    isinstance(exc, context) is True.

    """

    mapping = {
        exceptions.BadRequestError: 400,
        exceptions.UnauthorizedError: 401,
        exceptions.ForbiddenError: 403,
        exceptions.NotFoundError: 404,
        exceptions.MethodNotAllowedError: 405,
        exceptions.ConflictError: 409,
        exceptions.InternalServerError: 500,
        exceptions.ServiceUnavailableError: 503,
    }

    log.warning("MistError: %r", exc)
    for exc_type in mapping:
        if isinstance(exc, exc_type):
            return Response(str(exc), mapping[exc_type])
    else:
        return Response(str(exc), 500)


## @view_config(context=Exception)
def exception_handler_general(exc, request):
    """This simply catches all exceptions that don't subclass MistError and
    returns an Internal Server Error status code.

    When debugging it may be useful to comment out this function or its
    @view decorator.

    """

    log.error("Exception handler caught non-mist exception %s", exc)
    return Response("Internal Server Error", 500)


@view_config(route_name='home', request_method='GET',
             renderer='templates/home.pt')
def home(request):
    """Home page view"""
    user = user_from_request(request)
    return {
        'project': 'mist.io',
        'email': user.email,
        'supported_providers': config.SUPPORTED_PROVIDERS,
        'core_uri': config.CORE_URI,
        'auth': request.registry.settings.get('auth') and 1 or 0,
        'js_build': config.JS_BUILD,
        'js_log_level': config.JS_LOG_LEVEL,
        'google_analytics_id': config.GOOGLE_ANALYTICS_ID,
        'is_core': 0
    }


@view_config(route_name="check_auth", request_method='POST', renderer="json")
def check_auth(request):
    """Check on the mist.core service if authenticated"""

    params = request.json_body
    email = params.get('email', '').lower()
    password = params.get('password', '')
    # timestamp = params.get('timestamp', '')
    # hash_key = params.get('hash', '')

    payload = {'email': email, 'password': password}
               # 'timestamp': timestamp, 'hash_key': hash_key}
    core_uri = config.CORE_URI
    ret = requests.post(core_uri + '/auth', params=payload, verify=False)

    if ret.status_code == 200:
        ret = json.loads(ret.content)
        user = user_from_request(request)
        with user.lock_n_load():
            user.email = email
            user.password = password
            user.save()
        request.registry.settings['auth'] = 1
        log.info("succesfully check_authed")
        return ret
    else:
        raise UnauthorizedError()


@view_config(route_name='account', request_method='POST', renderer='json')
def update_user_settings(request):
    """try free plan, by communicating to the mist.core service"""

    params = request.json_body
    action = params.get('action', '').lower()
    plan = params.get('plan', '')
    auth_key = get_auth_key(request)
    name = params.get('name', '')
    company_name = params.get('company_name', '')
    country = params.get('country', '')
    number_of_servers = params.get('number_of_servers', '')
    number_of_people = params.get('number_of_people', '')

    payload = {'auth_key': auth_key,
               'action': action,
               'plan': plan,
               'name': name,
               'company_name': company_name,
               'country': country,
               'number_of_servers': number_of_servers,
               'number_of_people': number_of_people}

    core_uri = request.registry.settings['core_uri']
    ret = requests.post(core_uri + '/account', params=payload, verify=False)

    if ret.status_code == 200:
        ret = json.loads(ret.content)
        return ret
    else:
        raise UnauthorizedError()


@view_config(route_name='backends', request_method='GET', renderer='json')
def list_backends(request):
    """Gets the available backends.

    .. note:: Currently, this is only used by the backend controller in js.

    """

    user = user_from_request(request)
    ret = []
    for backend_id in user.backends:
        backend = user.backends[backend_id]
        ret.append({'id': backend_id,
                    'apikey': backend.apikey,
                    'title': backend.title or backend.provider,
                    'provider': backend.provider,
                    'poll_interval': backend.poll_interval,
                    'state': 'wait',
                    # for Provider.RACKSPACE_FIRST_GEN
                    'region': backend.region,
                    # for Provider.RACKSPACE (the new Nova provider)
                    ## 'datacenter': backend.datacenter,
                    'enabled': backend.enabled})
    return ret


@view_config(route_name='backends', request_method='POST', renderer='json')
def add_backend(request):
    """Adds a new backend."""

    params = request.json_body
    title = params.get('title', '')
    provider = params.get('provider', '')
    apikey = params.get('apikey', '')
    apisecret = params.get('apisecret', '')
    apiurl = params.get('apiurl') or ''  # fixes weird issue with none value
    tenant_name = params.get('tenant_name', '')
    # following params are for baremetal
    machine_hostname = params.get('machine_ip_address', '')
    machine_key = params.get('machine_key', '')
    machine_user = params.get('machine_user', '')
    # TODO: check if all necessary information was provided in the request

    user = user_from_request(request)
    backend_id = methods.add_backend(
        user, title, provider, apikey, apisecret, apiurl, tenant_name,
        machine_hostname, machine_key, machine_user
    )
    backend = user.backends[backend_id]
    return {
        'index': len(user.backends) - 1,
        'id': backend_id,
        'apikey': backend.apikey,
        'apiurl': backend.apiurl,
        'tenant_name': backend.tenant_name,
        'title': backend.title,
        'provider': backend.provider,
        'poll_interval': backend.poll_interval,
        'region': backend.region,
        'status': 'off',
        'enabled': backend.enabled,
    }


@view_config(route_name='backend_action', request_method='DELETE')
def delete_backend(request):
    """Deletes a backend.

    .. note:: It assumes the user may re-add it later so it does not remove
              any key associations.

    """

    backend_id = request.matchdict['backend']
    user = user_from_request(request)
    methods.delete_backend(user, backend_id)
    return OK


@view_config(route_name='backend_action', request_method='PUT')
def rename_backend(request):
    """Renames a backend."""

    backend_id = request.matchdict['backend']
    new_name = request.json_body.get('new_name', '')
    if not new_name:
        raise RequiredParameterMissingError('new_name')

    user = user_from_request(request)
    methods.rename_backend(user, backend_id, new_name)
    return OK


@view_config(route_name='backend_action', request_method='POST')
def toggle_backend(request):
    backend_id = request.matchdict['backend']
    new_state = request.json_body.get('new_state', '')
    if not new_state:
        raise RequiredParameterMissingError('new_state')

    if new_state != "1" and new_state != "0":
        raise BadRequestError('Invalid backend state')

    user = user_from_request(request)
    if backend_id not in user.backends:
        raise BackendNotFoundError()
    with user.lock_n_load():
        user.backends[backend_id].enabled = bool(int(new_state))
        user.save()

    return OK


@view_config(route_name='keys', request_method='GET', renderer='json')
def list_keys(request):
    """List keys.

    List all key pairs that are configured on this server. Only the public
    keys are returned.

    """
    user = user_from_request(request)
    return [{'id': key,
             'machines': user.keypairs[key].machines,
             'isDefault': user.keypairs[key].default}
            for key in user.keypairs]


@view_config(route_name='keys', request_method='PUT', renderer='json')
def add_key(request):
    params = request.json_body
    key_id = params.get('id', '')
    private_key = params.get('priv', '')

    user = user_from_request(request)
    key_id = methods.add_key(user, key_id, private_key)

    keypair = user.keypairs[key_id]

    return {'id': key_id,
            'machines': keypair.machines,
            'isDefault': keypair.default}


@view_config(route_name='key_action', request_method='DELETE', renderer='json')
def delete_key(request):
    """Delete key.

    When a keypair gets deleted, it takes its asociations with it so just need
    to remove from the server too.

    If the default key gets deleted, it sets the next one as default, provided
    that at least another key exists. It returns the list of all keys after
    the deletion, excluding the private keys (check also list_keys).

    """

    key_id = request.matchdict.get('key')
    if not key_id:
        raise KeypairParameterMissingError()

    user = user_from_request(request)
    methods.delete_key(user, key_id)
    return list_keys(request)


@view_config(route_name='key_action', request_method='PUT', renderer='json')
def edit_key(request):

    old_id = request.matchdict['key']
    new_id = request.json_body.get('new_id')
    if not new_id:
        raise RequiredParameterMissingError("new_id")

    user = user_from_request(request)
    methods.edit_key(user, new_id, old_id)
    return {'new_id': new_id}


@view_config(route_name='key_action', request_method='POST')
def set_default_key(request):
    key_id = request.matchdict['key']
    user = user_from_request(request)

    methods.set_default_key(user, key_id)
    return OK


@view_config(route_name='key_private', request_method='GET', renderer='json')
def get_private_key(request):
    """Gets private key from keypair name.

    It is used in single key view when the user clicks the display private key
    button.

    """

    user = user_from_request(request)
    key_id = request.matchdict['key']
    if not key_id:
        raise RequiredParameterMissingError("key_id")
    if not key_id in user.keypairs:
        raise KeypairNotFoundError(key_id)
    return user.keypairs[key_id].private


@view_config(route_name='key_public', request_method='GET', renderer='json')
def get_public_key(request):
    user = user_from_request(request)
    key_id = request.matchdict['key']
    if not key_id:
        raise RequiredParameterMissingError("key_id")
    if not key_id in user.keypairs:
        raise KeypairNotFoundError(key_id)
    return user.keypairs[key_id].public


@view_config(route_name='keys', request_method='POST', renderer='json')
def generate_keypair(request):
    keypair = Keypair()
    keypair.generate()
    return {'priv': keypair.private}


@view_config(route_name='key_association', request_method='PUT',
             renderer='json')
def associate_key(request):
    key_id = request.matchdict['key']
    backend_id = request.matchdict['backend']
    machine_id = request.matchdict['machine']
    try:
        host = request.json_body.get('host')
    except:
        host = None
    user = user_from_request(request)
    methods.associate_key(user, key_id, backend_id, machine_id, host)
    return user.keypairs[key_id].machines


@view_config(route_name='key_association', request_method='DELETE',
             renderer='json')
def disassociate_key(request):
    key_id = request.matchdict['key']
    backend_id = request.matchdict['backend']
    machine_id = request.matchdict['machine']
    try:
        host = request.json_body.get('host')
    except:
        host = None
    user = user_from_request(request)
    methods.disassociate_key(user, key_id, backend_id, machine_id, host)
    return user.keypairs[key_id].machines


@view_config(route_name='machines', request_method='GET', renderer='json')
def list_machines(request):
    """Gets machines and their metadata from a backend."""

    user = user_from_request(request)
    backend_id = request.matchdict['backend']
    return methods.list_machines(user, backend_id)


@view_config(route_name='machines', request_method='POST', renderer='json')
def create_machine(request):
    """Creates a new virtual machine on the specified backend."""

    backend_id = request.matchdict['backend']

    try:
        key_id = request.json_body.get('key')
        machine_name = request.json_body['name']
        location_id = request.json_body.get('location', None)
        image_id = request.json_body['image']
        size_id = request.json_body['size']
        #deploy_script received as unicode, but ScriptDeployment wants str
        script = str(request.json_body.get('script', ''))
        # these are required only for Linode, passing them anyway
        image_extra = request.json_body['image_extra']
        disk = request.json_body['disk']
    except Exception as e:
        raise RequiredParameterMissingError(e)

    user = user_from_request(request)
    ret = methods.create_machine(user, backend_id, key_id, machine_name,
                                 location_id, image_id, size_id, script,
                                 image_extra, disk)
    return ret


@view_config(route_name='machine', request_method='POST', renderer="json")
def machine_actions(request):
    # TODO: We shouldn't return list_machines, just 200. Save the API!
    backend_id = request.matchdict['backend']
    machine_id = request.matchdict['machine']
    user = user_from_request(request)
    params = request.json_body
    action = params.get('action', '')
    if action in ('start', 'stop', 'reboot', 'destroy'):
        if action == 'start':
            methods.start_machine(user, backend_id, machine_id)
        elif action == 'stop':
            methods.stop_machine(user, backend_id, machine_id)
        elif action == 'reboot':
            methods.reboot_machine(user, backend_id, machine_id)
        elif action == 'destroy':
            methods.destroy_machine(user, backend_id, machine_id)
        ## return OK
        return methods.list_machines(user, backend_id)
    raise BadRequestError()


@view_config(route_name='machine_metadata', request_method='POST',
             renderer='json')
def set_machine_metadata(request):
    """Sets metadata for a machine, given the backend and machine id."""
    backend_id = request.matchdict['backend']
    machine_id = request.matchdict['machine']
    try:
        tag = request.json_body['tag']
    except:
        raise RequiredParameterMissingError('tag')
    user = user_from_request(request)
    methods.set_machine_metadata(user, backend_id, machine_id, tag)
    return OK


@view_config(route_name='machine_metadata', request_method='DELETE',
             renderer='json')
def delete_machine_metadata(request):
    """Deletes metadata for a machine, given the machine id and the tag to be
    deleted.

    """
    backend_id = request.matchdict['backend']
    machine_id = request.matchdict['machine']
    try:
        tag = request.json_body['tag']
    except:
        raise RequiredParameterMissingError('tag')
    user = user_from_request(request)
    methods.delete_machine_metadata(user, backend_id, machine_id, tag)
    return OK


@view_config(route_name='images', request_method='POST', renderer='json')
def list_specific_images(request):
    # FIXME: 1) i shouldn't exist, 2) i shouldn't be a post
    return list_images(request)


@view_config(route_name='images', request_method='GET', renderer='json')
def list_images(request):
    """List images from each backend.
    Furthermore if a search_term is provided, we loop through each
    backend and search for that term in the ids and the names of
    the community images"""

    backend_id = request.matchdict['backend']
    try:
        term = request.json_body.get('search_term', '').lower()
    except:
        term = None
    user = user_from_request(request)
    return methods.list_images(user, backend_id, term)


@view_config(route_name='image', request_method='POST', renderer='json')
def star_image(request):
    """Toggle image as starred."""

    backend_id = request.matchdict['backend']
    image_id = request.matchdict['image']
    user = user_from_request(request)
    with user.lock_n_load():
        if backend_id not in user.backends:
            raise BackendNotFoundError(backend_id)
        backend = user.backends[backend_id]
        if image_id not in backend.starred:
            backend.starred.append(image_id)
        else:
            backend.starred.remove(image_id)
        user.save()
    return image_id in backend.starred


@view_config(route_name='sizes', request_method='GET', renderer='json')
def list_sizes(request):
    """List sizes (aka flavors) from each backend."""
    backend_id = request.matchdict['backend']
    user = user_from_request(request)
    return methods.list_sizes(user, backend_id)


@view_config(route_name='locations', request_method='GET', renderer='json')
def list_locations(request):
    """List locations from each backend."""
    backend_id = request.matchdict['backend']
    user = user_from_request(request)
    return methods.list_locations(user, backend_id)


@view_config(route_name='probe', request_method='POST', renderer='json')
def probe(request):
    """Probes a machine over ssh, using fabric.

    .. note:: Used for getting uptime and a list of deployed keys.

    """
    machine_id = request.matchdict['machine']
    backend_id = request.matchdict['backend']
    host = request.json_body.get('host', None)
    key = request.json_body.get('key', None)
    # FIXME: simply don't pass a key parameter
    if key == 'undefined':
        key = None

    ssh_user = request.params.get('ssh_user', None)
    command = "sudo -n uptime 2>&1|grep load|wc -l && \
echo -------- && \
uptime && \
echo -------- && \
if [ -f /proc/uptime ]; then cat /proc/uptime; \
else expr `date '+%s'` - `sysctl kern.boottime | sed -En 's/[^0-9]*([0-9]+).*/\\1/p'`; fi; \
echo -------- && \
if [ -f /proc/cpuinfo ]; then grep -c processor /proc/cpuinfo; \
else sysctl hw.ncpu | awk '{print $2}'; fi; \
echo -------- \
cat ~/`grep '^AuthorizedKeysFile' /etc/ssh/sshd_config /etc/sshd_config 2> \
/dev/null |awk '{print $2}'` 2> /dev/null || \
cat ~/.ssh/authorized_keys 2> /dev/null \
"

    user = user_from_request(request)
    cmd_output = methods.ssh_command(user, backend_id, machine_id,
                                     host, command, key_id=key)

    if cmd_output:
        cmd_output = cmd_output.replace('\r\n','').split('--------')
        log.warn(cmd_output)
        uptime_output = cmd_output[1]
        loadavg = re.split('load averages?: ', uptime_output)[1].split(', ')
        users = re.split(' users?', uptime_output)[0].split(', ')[-1].strip()
        uptime = cmd_output[2]
        cores = cmd_output[3]
        ret = {'uptime': uptime,
               'loadavg': loadavg,
               'cores': cores,
               'users': users,
               }
        if len(cmd_output) > 4:
            updated_keys = update_available_keys(user, backend_id,
                                                 machine_id, cmd_output[4])
            ret['updated_keys'] = updated_keys
        return ret



def update_available_keys(user, backend_id, machine_id, authorized_keys):
    keypairs = user.keypairs

    # track which keypairs will be updated
    updated_keypairs = {}
    # get the actual public keys from the blob
    ak = [k for k in authorized_keys.split('\n') if k.startswith('ssh')]

    # for each public key
    for pk in ak:
        exists = False
        pub_key = pk.strip().split(' ')
        for k in keypairs:
            # check if the public key already exists in our keypairs
            if keypairs[k].public.strip().split(' ')[:2] == pub_key[:2]:
                exists = True
                associated = False
                # check if it is already associated with this machine
                for machine in keypairs[k].machines:
                    if machine[:2] == [backend_id, machine_id]:
                        associated = True
                        break
                if not associated:
                    with user.lock_n_load():
                        keypairs[k].machines.append([backend_id, machine_id])
                        user.save()
                    updated_keypairs[k] = keypairs[k]
            if exists:
                break

    if updated_keypairs:
        log.debug('update keypairs')

    ret = [{'name': key,
            'machines': keypairs[key].machines,
            'pub': keypairs[key].public,
            'isDefault': keypairs[key].default
            } for key in updated_keypairs]

    return ret


@view_config(route_name='monitoring', request_method='GET', renderer='json')
def check_monitoring(request):
    """Ask the mist.io service if monitoring is enabled for this machine.

    """
    core_uri = config.CORE_URI
    user = user_from_request(request)
    email = user.email
    password = user.password

    timestamp = datetime.utcnow().strftime("%s")
    auth_key = get_auth_key(request)

    payload = {'auth_key': auth_key}
    ret = requests.get(core_uri+request.path, params=payload, verify=False)
    if ret.status_code == 200:
        return ret.json()
    else:
        log.error("Error getting stats %d:%s", ret.status_code, ret.text)
        raise ServiceUnavailableError()


@view_config(route_name='update_monitoring', request_method='POST',
             renderer='json')
def update_monitoring(request):
    """Enable/disable monitoring for this machine using the hosted mist.io
    service.

    """
    user = user_from_request(request)
    core_uri = config.CORE_URI
    try:
        email = request.json_body['email']
        password = request.json_body['pass']
        payload = {'email': email, 'password': password}
        ret = requests.post(core_uri + '/auth',
                            params=payload,
                            verify=False)
        if ret.status_code == 200:
            request.registry.settings['auth'] = 1
            with user.lock_n_load():
                user.email = email
                user.password = password
                user.save()
    except:
        pass
    auth_key = get_auth_key(request)

    name = request.json_body.get('name', '')
    public_ips = request.json_body.get('public_ips', [])
    dns_name = request.json_body.get('dns_name', '')

    action = request.json_body['action'] or 'enable'
    payload = {'auth_key': auth_key,
               'action': action,
               'name': name,
               'public_ips': public_ips,
               'dns_name': dns_name,
               }

    if action == 'enable':
        backend = user.backends[request.matchdict['backend']]
        payload['backend_title'] = backend.title
        payload['backend_provider'] = backend.provider
        payload['backend_region'] = backend.region
        payload['backend_apikey'] = backend.apikey
        payload['backend_apisecret'] = backend.apisecret
        payload['backend_apiurl'] = backend.apiurl
        payload['backend_tenant_name'] = backend.tenant_name

    #TODO: make ssl verification configurable globally,
    # set to true by default
    ret = requests.post(core_uri+request.path,
                        params=payload,
                        verify=False)
    if ret.status_code == 402:
        raise PaymentRequiredError(ret.text)
    elif ret.status_code != 200:
        log.error("Error getting stats %d:%s", ret.status_code, ret.text)
        raise ServiceUnavailableError()

    return ret.json()

@view_config(route_name='stats', request_method='GET', renderer='json')
def get_stats(request):
    core_uri = config.CORE_URI
    user = user_from_request(request)
    email = user.email
    password = user.password
    params = request.params
    start = params.get('start', '')
    stop = params.get('stop', '')
    step = params.get('step', '')
    expression = params.get('expression', '')

    timestamp = datetime.utcnow().strftime("%s")
    auth_key = get_auth_key(request)

    payload = {
        'auth_key': auth_key,
        'start': start,
        'stop': stop,
        'step': step,
        'expression': expression
    }
    ret = requests.get(core_uri+request.path, params=payload, verify=False)
    if ret.status_code == 200:
        return ret.json()
    else:
        log.error("Error getting stats %d:%s", ret.status_code, ret.text)
        raise ServiceUnavailableError()


@view_config(route_name='loadavg', request_method='GET')
def get_loadavg(request, action=None):
    """Get the loadavg png displayed in the machines list view."""
    params = request.params
    start = params.get('start', '')
    stop = params.get('stop', '')
    user = user_from_request(request)
    auth_key = get_auth_key(request)
    core_uri = config.CORE_URI
    payload = {
        'auth_key': auth_key,
        'start': start,
        'stop': stop,
    }
    headers = {'Content-type': 'image/png', 'Accept': '*/*'}
    ret = requests.get(core_uri+request.path, params=payload,
                       headers=headers, verify=False)
    if ret.status_code != 200:
        log.error("Error getting loadavg %d:%s", ret.status_code, ret.text)
        raise ServiceUnavailableError()
    return Response(ret.content, content_type='image/png', request=request)


@view_config(route_name='rules', request_method='POST', renderer='json')
def update_rule(request):
    """Creates or updates a rule.

    """
    core_uri = config.CORE_URI
    payload = request.json_body.copy()
    payload['auth_key'] = get_auth_key(request)

    #TODO: make ssl verification configurable globally, set to true by default
    ret = requests.post(core_uri+request.path, params=payload, verify=False)

    if ret.status_code != 200:
        log.error("Error updating rule %d:%s", ret.status_code, ret.text)
        raise ServiceUnavailableError()

    return ret.json()


@view_config(route_name='rule', request_method='DELETE')
def delete_rule(request):
    """Deletes a rule.

    """
    # TODO: factor out common code in a shared function
    core_uri = config.CORE_URI
    payload = {}
    payload['auth_key'] = get_auth_key(request)

    #TODO: make ssl verification configurable globally, set to true by default
    ret = requests.delete(core_uri+request.path, params=payload, verify=False)

    if ret.status_code != 200:
        log.error("Error deleting rule %d:%s", ret.status_code, ret.text)
        raise ServiceUnavailableError()

    return OK


@view_config(route_name='shell', request_method='GET')
def shell_stream(request):
    """Execute command via SSH and stream output

    Streams output using the hidden iframe technique.

    """

    def parse(lines):
        """Generator function that converts stdout_lines to html with
        js which it streams in a hidden iframe.

        """
        # send some blank data to get webkit browsers
        # to display what's sent
        yield 1024*'\0'  # really necessary?
        # start the html response
        yield "<html><body>\n"
        js = "<script type='text/javascript'>"
        js += "parent.appendShell('%s', '%s');</script>\n"
        for line in lines:
            # get commands output, line by line
            clear_line = line.replace('\'', '\\\'')
            clear_line = clear_line.replace('\n', '<br/>')
            clear_line = clear_line.replace('\r', '')
            #.replace('<','&lt;').replace('>', '&gt;')
            yield js % (clear_line, cmd_id)
        js = "<script type='text/javascript'>"
        js += "parent.completeShell(%s, '%s');</script>\n"
        yield js % (1, cmd_id)  # FIXME
        yield "</body></html>\n"

    log.info("got shell_stream request")
    backend_id = request.matchdict['backend']
    machine_id = request.matchdict['machine']
    cmd = request.params.get('command')
    cmd_id = request.params.get('command_id')
    host = request.params.get('host')
    if not cmd:
        raise RequiredParameterMissingError("command")
    if not host:
        raise RequiredParameterMissingError("host")

    user = user_from_request(request)
    shell = Shell(host)
    shell.autoconfigure(user, backend_id, machine_id)
    # stdout_lines is a generator that spits out lines of combined
    # stdout and stderr output. cmd is executed via the shell on the background
    # and the stdout_lines generator is immediately available. stdout_lines
    # will block if no line is in the buffer and will stop iterating once the
    # command is completed and the pipe is closed.
    stdout_lines = shell.command_stream(cmd)
    return Response(status=200, app_iter=parse(stdout_lines))


# FIXME
def get_auth_key(request):
    user = user_from_request(request)
    from base64 import urlsafe_b64encode
    auth_key = "%s:%s" % (user.email, user.password)
    auth_key = urlsafe_b64encode(auth_key)
    return auth_key


@view_config(route_name='providers', request_method='GET', renderer='json')
def list_supported_providers(request):
    """
    @param request: A simple GET request
    @return: Return all of our SUPPORTED PROVIDERS
    """
    return {
        'supported_providers': config.SUPPORTED_PROVIDERS
    }
