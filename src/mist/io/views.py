"""mist.io views"""

import logging
from time import time

from datetime import datetime

import requests
import json

from pyramid.response import Response
from pyramid.view import view_config

from libcloud.compute.base import Node, NodeLocation
from libcloud.compute.types import Provider
from mist.io.shell import Shell

from mist.io.config import SUPPORTED_PROVIDERS
from mist.io.config import EC2_IMAGES, EC2_PROVIDERS

from mist.io.helpers import connect
from mist.io.helpers import get_preferred_keypairs
from mist.io.helpers import run_command

from mist.io.helpers import get_ssh_user_from_keypair, get_auth_key

from mist.io import methods
from mist.io.exceptions import *
from mist.io.model import User, Keypair

try:
    from mist.core.helpers import get_user
except ImportError:
    from mist.io.helpers import get_user

log = logging.getLogger(__name__)


def user_from_request(request):
    return User()


OK = Response("OK", 200)


@view_config(context=BaseError)
def exception_handler_mist(exc, request):
    """Here we catch exceptions and transform them to proper http responses

    This is a special pyramid view that gets triggered whenever an exception
    is raised from any other view. It catches all exceptions exc where
    isinstance(exc, context) is True.

    """

    log.warning("Exception: %r", exc)
    if isinstance(exc, NotFoundError):
        return Response(str(exc), 404)
    elif isinstance(exc, BadRequestError):
        return Response(str(exc), 502)
    elif isinstance(exc, UnauthorizedError):
        return Response(str(exc), 401)
    else:
        return Response("Internal Server Error", 503)


#~ @view_config(context=Exception)
def exception_handler_general(exc, request):
    """This simply catches all exceptions that don't subclass BaseError and
    returns an Internal Server Error status code.

    When debugging it may be useful to comment out this function or its
    @view decorator.

    """

    log.error("Exception handler caught non-mist exception %s", exc)
    return Response("Internal Server Error", 503)


@view_config(route_name='home', request_method='GET',
             renderer='templates/home.pt')
def home(request):
    """Gets all the basic data for backends, project name and session status.

    """
    user = user_from_request(request)
    core_uri = request.registry.settings['core_uri']
    auth = request.registry.settings.get('auth', 0)
    js_build = request.registry.settings['js_build']
    js_log_level = request.registry.settings['js_log_level']
    google_analytics_id = request.registry.settings['google_analytics_id']

    return {'project': 'mist.io',
            'email': user.email,
            'supported_providers': SUPPORTED_PROVIDERS,
            'core_uri': core_uri,
            'auth': auth,
            'js_build': js_build,
            'js_log_level': js_log_level,
            'google_analytics_id': google_analytics_id}


@view_config(route_name="check_auth", request_method='POST', renderer="json")
def check_auth(request):
    """Check on the mist.core service if authenticated"""

    params = request.json_body
    email = params.get('email', '').lower()
    password = params.get('password', '')
    timestamp = params.get('timestamp', '')
    hash_key = params.get('hash', '')

    payload = {'email': email, 'password': password,
               'timestamp': timestamp, 'hash_key': hash_key}
    core_uri = request.registry.settings['core_uri']
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
def update_user_settings(request, renderer='json'):
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
               'number_of_people': number_of_people
    }    

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
                    'datacenter': backend.datacenter,
                    'enabled': backend.enabled,
                     })
    return ret


@view_config(route_name='backends', request_method='POST', renderer='json')
def add_backend(request):
    """Adds a new backend."""

    params = request.json_body
    title = params.get('title', '')
    provider = params.get('provider', '')
    apikey = params.get('apikey', '')
    apisecret = params.get('apisecret', '')
    apiurl = params.get('apiurl', '')
    tenant_name = params.get('tenant_name', '')

    # TODO: check if all necessary information was provided in the request

    user = user_from_request(request)
    backend_id = methods.add_backend(user, title, provider, apikey,
                                     apisecret, apiurl, tenant_name)

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


@view_config(route_name='backend_action', request_method='POST')
def toggle_backend(request):
    backend_id = request.matchdict['backend']
    new_state = request.json_body.get('newState', '')
    if not new_state:
        raise RequiredParameterMissingError('new_state')

    # FIXME
    if new_state == "True":
        new_state = True
    elif new_state == "False":
        new_state = False
    else:
        #~ raise BadRequestError('Invalid backend state')
        log.warning("something funcky going on with state toggling, "
                    "what's '%r' supposed to mean?", new_state)
        new_state = True

    user = user_from_request(request)
    if backend_id not in user.backends:
        raise BackendNotFoundError()
    with user.lock_n_load():
        user.backends[backend_id].enabled = new_state
        
    return OK


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


@view_config(route_name='machine', request_method='POST')
def machine_actions(request):
    backend_id = request.matchdict['backend']
    machine_id = request.matchdict['machine']
    user = user_from_request(request)
    action = request.params.get('action')
    if action in ('start', 'stop', 'reboot', 'destroy'):
        if action == 'start':
            methods.start_machine(user, backend_id, machine_id)
        elif action == 'stop':
            methods.stop_machine(user, backend_id, machine_id)
        elif action == 'reboot':
            methods.reboot_machine(user, backend_id, machine_id)
        elif action == 'destroy':
            methods.destroy_machine(user, backend_id, machine_id)
        return OK
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


@view_config(route_name='probe', request_method='POST', renderer='json')
def probe(request):
    """Probes a machine over ssh, using fabric.

    .. note:: Used for getting uptime and a list of deployed keys.

    """
    machine_id = request.matchdict['machine']
    backend_id = request.matchdict['backend']
    host = request.params.get('host', None)
    key = request.params.get('key', None)
    if key == 'undefined':
        key = None

    ssh_user = request.params.get('ssh_user', None)
    command = "sudo -n uptime 2>&1|grep load|wc -l && echo -------- && cat /proc/uptime && echo -------- && cat ~/`grep '^AuthorizedKeysFile' /etc/ssh/sshd_config /etc/sshd_config 2> /dev/null|awk '{print $2}'` 2>/dev/null || cat ~/.ssh/authorized_keys 2>/dev/null"

    if key:
        log.warn('probing with key %s' % key)

    user = user_from_request(request)
    ret = methods.ssh_command(user, backend_id, machine_id, host, command, key_id=key)
    #ret = shell_command(request, backend_id, machine_id, host, command, ssh_user, key)
    if ret:
        cmd_output = ret['output'].split('--------')

        if len(cmd_output) > 2:
            return {'uptime': cmd_output[1],
                    'updated_keys': update_available_keys(request, 
                                                          backend_id, 
                                                          machine_id, 
                                                          ssh_user, 
                                                          host, 
                                                          cmd_output[2]),
                   }
    
    return Response('No valid keys for server', 405)


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


@view_config(route_name='keys', request_method='GET', renderer='json')
def list_keys(request):
    """List keys.
    
    List all key pairs that are configured on this server. Only the public
    keys are returned.
    
    """

    user = user_from_request(request)
    return [{'id': key.replace(' ', ''),
             'name': key,
             'machines': user.keypairs[key].machines,
             'default_key': user.keypairs[key].default}
             for key in user.keypairs]


@view_config(route_name='keys', request_method='PUT', renderer='json')
def add_key(request):
    params = request.json_body
    key_id = params.get('name', '')
    private_key = params.get('priv', '')

    user = user_from_request(request)
    key_id = methods.add_key(user, key_id, private_key)

    keypair = user.keypairs[key_id]

    return {'id': key_id,
            'name': key_id,
            'machines': keypair.machines,
            'default': keypair.default}


@view_config(route_name='key_action', request_method='DELETE', renderer='json')
def delete_key(request):
    """Delete key.
    
    When a keypair gets deleted, it takes its asociations with it so just need to
    remove from the server too.
    
    If the default key gets deleted, it sets the next one as default, provided
    that at least another key exists. It returns the list of all keys after
    the deletion, excluding the private keys (check also list_keys).
    
    """
    
    key_id = request.matchdict.get('key', '')
    
    if not key_id:
        return Response('Keypair name not provided', 400)

    user = user_from_request(request)
    methods.delete_key(user, key_id)
        
    return list_keys(request)


@view_config(route_name='key_action', request_method='PUT', renderer='json')
def edit_key(request):
    
    old_id = request.matchdict.get('key', '')
    key_id = request.json_body.get('newName', '')

    user = user_from_request(request)
    methods.edit_key(user, key_id, old_id)

    return OK


@view_config(route_name='key_action', request_method='POST', renderer='json')
def set_default_key_request(request):
    key_id = request.matchdict['key']
    user = user_from_request(request)

    methods.set_default_key(user, key_id)
    return OK

@view_config(route_name='key_action', request_method='GET', request_param='action=private', renderer='json')
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


@view_config(route_name='key_action', request_method='GET',
             request_param='action=public', renderer='json')
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


@view_config(route_name='key_association', request_method='PUT', renderer='json')
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


@view_config(route_name='key_association', request_method='DELETE', renderer='json')
def disassociate_key(request):
    key_id = request.matchdict['key']
    backend_id = request.matchdict['backend']
    machine_id = request.matchdict['machine']
    user = user_from_request(request)
    methods.disassociate_key(user, key_id, backend_id, machine_id)
    return user.keypairs[key_id].machines


@view_config(route_name='monitoring', request_method='GET', renderer='json')
def check_monitoring(request):
    """Ask the mist.io service if monitoring is enabled for this machine.

    """
    core_uri = request.registry.settings['core_uri']
    with get_user(request, readonly=True) as user:
        email = user.get('email', '')
        password = user.get('password', '')

    timestamp = datetime.utcnow().strftime("%s")
    auth_key = get_auth_key(request)

    payload = {'auth_key': auth_key}
    ret = requests.get(core_uri+request.path, params=payload, verify=False)
    if ret.status_code == 200:
        return ret.json()
    else:
        return Response('Service unavailable', 503)


@view_config(route_name='update_monitoring', request_method='POST', renderer='json')
def update_monitoring(request):
    """Enable/disable monitoring for this machine using the hosted mist.io
    service.

    """
    with get_user(request) as user:
        core_uri = request.registry.settings['core_uri']
        try:
            email = request.json_body['email']
            password = request.json_body['pass']
            payload = {'email': email, 'password': password}
            ret = requests.post(request.settings['core_uri'] + '/auth', params=payload, verify=False)
            if ret.status_code == 200:
                request.settings['auth'] = 1
                user['email'] = email
                user['password'] = password
        except:
            pass   
        auth_key = get_auth_key(request)

        name = request.json_body.get('name','')
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
            backend = user['backends'][request.matchdict['backend']]
            payload['backend_title'] = backend['title']
            payload['backend_provider'] = backend['provider']
            payload['backend_region'] = backend['region']
            payload['backend_apikey'] = backend['apikey']
            payload['backend_apisecret'] = backend['apisecret']

        #TODO: make ssl verification configurable globally, set to true by default
        ret = requests.post(core_uri+request.path, params=payload, verify=False)

        if ret.status_code == 402:
            return Response(ret.text, 402)
        elif ret.status_code != 200:
            return Response('Service unavailable', 503)

        return ret.json()


@view_config(route_name='rules', request_method='POST', renderer='json')
def update_rule(request):
    """Creates or updates a rule.

    """
    core_uri = request.registry.settings['core_uri']
    payload = request.json_body.copy()
    payload['auth_key'] = get_auth_key(request)

    #TODO: make ssl verification configurable globally, set to true by default
    ret = requests.post(core_uri+request.path, params=payload, verify=False)

    if ret.status_code != 200:
        return Response('Service unavailable', 503)

    return ret.json()


@view_config(route_name='rule', request_method='DELETE')
def delete_rule(request):
    """Deletes a rule.

    """
    # TODO: factor out common code in a shared function
    core_uri = request.registry.settings['core_uri']
    payload = {}
    payload['auth_key'] = get_auth_key(request)

    #TODO: make ssl verification configurable globally, set to true by default
    ret = requests.delete(core_uri+request.path, params=payload, verify=False)

    if ret.status_code != 200:
        return Response('Service unavailable', 503)

    return OK


def update_available_keys(request, backend_id, machine_id, ssh_user, host, authorized_keys):
    with get_user(request) as user:
        keypairs = user.get('keypairs', {})

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
                if keypairs[k]['public'].strip().split(' ')[:2] == pub_key[:2]:
                    exists = True
                    associated = False
                    # check if it is already associated with this machine
                    for m in keypairs[k].get('machines', []):
                        if m[:2] == [backend_id, machine_id]:
                            associated = True
                            break
                    if not associated:
                        if not keypairs[k].get('machines', None):
                            keypairs[k]['machines'] = []
                        keypairs[k]['machines'].append([backend_id, machine_id])
                        updated_keypairs[k] = keypairs[k]
                if exists:
                    break
                        
        if updated_keypairs:
            log.debug('update keypairs')

        ret = [{'name': key,
                'machines': keypairs[key].get('machines', []),
                'pub': keypairs[key]['public'],
                'default_key': keypairs[key].get('default', False)}
               for key in updated_keypairs.keys()]
         
        return ret
