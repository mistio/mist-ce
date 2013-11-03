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
def exception_handler(exc, request):
    """Here we catch exceptions and transform them to proper http responses

    This is a special pyramid view that gets triggered whenever an exception
    is raised from any other view. It catches all exceptions exc where
    isinstance(exc, context) is True.

    """

    log.error("Exception: %r", exc)
    if isinstance(exc, NotFoundError):
        return Response(str(exc), 401)
    elif isinstance(exc, BadRequestError):
        return Response(str(exc), 502)
    else:
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
    "Check on the mist.core service if authenticated"

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


@view_config(route_name='machine', request_method='POST',
             request_param='action=start', renderer='json')
def start_machine(request):
    """Starts a machine on backends that support it."""
    backend_id = request.matchdict['backend']
    machine_id = request.matchdict['machine']
    user = user_from_request(request)
    methods.start_machine(user, backend_id, machine_id)
    return OK


@view_config(route_name='machine', request_method='POST',
             request_param='action=stop', renderer='json')
def stop_machine(request):
    backend_id = request.matchdict['backend']
    machine_id = request.matchdict['machine']
    user = user_from_request(request)
    methods.stop_machine(user, backend_id, machine_id)
    return OK


@view_config(route_name='machine', request_method='POST',
             request_param='action=reboot', renderer='json')
def reboot_machine(request, backend_id=None, machine_id=None):
    """Reboots a machine on a certain backend."""

    backend_id = request.matchdict['backend']
    machine_id = request.matchdict['machine']
    user = user_from_request(request)
    methods.reboot_machine(user, backend_id, machine_id)
    return OK


@view_config(route_name='machine', request_method='POST',
             request_param='action=destroy', renderer='json')
def destroy_machine(request, backend_id=None, machine_id=None):
    """Destroys a machine on a certain backend.

    After destroying a machine it also deletes all key associations.

    """

    backend_id = request.matchdict['backend']
    machine_id = request.matchdict['machine']
    user = user_from_request(request)
    methods.destroy_machine(user, backend_id, machine_id)
    return OK


@view_config(route_name='machine_metadata', request_method='POST',
             renderer='json')
def set_machine_metadata(request):
    """Sets metadata for a machine, given the backend and machine id.

    Libcloud handles this differently for each provider. Linode and Rackspace,
    at least the old Rackspace providers, don't support metadata adding.

    machine_id comes as u'...' but the rest are plain strings so use == when
    comparing in ifs. u'f' is 'f' returns false and 'in' is too broad.

    """
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    if conn.type in [Provider.LINODE, Provider.RACKSPACE_FIRST_GEN]:
        return Response('Adding metadata is not supported in this provider',
                        501)

    machine_id = request.matchdict['machine']

    try:
        tag = request.json_body['tag']
        unique_key = 'mist.io_tag-' + datetime.now().isoformat()
        pair = {unique_key: tag}
    except:
        return Response('Malformed metadata format', 400)

    if conn.type in EC2_PROVIDERS:
        try:
            machine = Node(machine_id,
                           name='',
                           state=0,
                           public_ips=[],
                           private_ips=[],
                           driver=conn)
            conn.ex_create_tags(machine, pair)
        except:
            return Response('Error while creating tag in EC2', 503)
    else:
        try:
            nodes = conn.list_nodes()
            for node in nodes:
                if node.id == machine_id:
                    machine = node
                    break
        except:
            return Response('Machine not found', 404)

        try:
            machine.extra['metadata'].update(pair)
            conn.ex_set_metadata(machine, machine.extra['metadata'])
        except:
            return Response('Error while creating tag', 503)

    return Response('Success', 200)


@view_config(route_name='machine_metadata', request_method='DELETE',
             renderer='json')
def delete_machine_metadata(request):
    """Deletes metadata for a machine, given the machine id and the tag to be
    deleted.

    Libcloud handles this differently for each provider. Linode and Rackspace,
    at least the old Rackspace providers, don't support metadata updating. In
    EC2 you can delete just the tag you like. In Openstack you can only set a
    new list and not delete from the existing.

    Mist.io client knows only the value of the tag and not it's key so it
    has to loop through the machine list in order to find it.

    Don't forget to check string encoding before using them in ifs.
    u'f' is 'f' returns false.

    """
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    if conn.type in [Provider.LINODE, Provider.RACKSPACE_FIRST_GEN]:
        return Response('Updating metadata is not supported in this provider',
                        501)

    try:
        tag = request.json_body['tag']
    except:
        return Response('Malformed metadata format', 400)

    machine_id = request.matchdict['machine']

    try:
        nodes = conn.list_nodes()
        for node in nodes:
            if node.id == machine_id:
                machine = node
                break
    except:
        return Response('Machine not found', 404)

    if conn.type in EC2_PROVIDERS:
        tags = machine.extra.get('tags', None)
        try:
            for mkey, mdata in tags.iteritems():
                if tag == mdata:
                    pair = {mkey: tag}
                    break
        except:
            return Response('Tag not found', 404)

        try:
            conn.ex_delete_tags(machine, pair)
        except:
            return Response('Error while deleting metadata in EC2', 503)
    else:
        tags = machine.extra.get('metadata', None)
        try:
            for mkey, mdata in tags.iteritems():
                if tag == mdata:
                    tags.pop(mkey)
                    break
        except:
            return Response('Tag not found', 404)

        try:
            conn.ex_set_metadata(machine, tags)
        except:
            return Response('Error while updating metadata', 503)

    return Response('Success', 200)


def shell_command(request, backend_id, machine_id, host, command, ssh_user = None, key = None):
    """ Sends a command over ssh, using fabric """
    
    with get_user(request, readonly=True) as user:
        #log.error("shell command from user '%s'" % user)
        keypairs = user.get('keypairs', {})
        # we don't need to lock the user since the only writes are
        # performed by save_key which takes care of locking the user
        # at the moment

        if not key:
            preferred_keypairs = get_preferred_keypairs(keypairs, backend_id, machine_id)
        else:
            preferred_keypairs = [key]
        for k in preferred_keypairs:
            keypair = keypairs[k]
            private_key = keypair.get('private', None)
            if private_key:
                if ssh_user == 'undefined':
                    ssh_user = None
                ssh_user = ssh_user or get_ssh_user_from_keypair(keypair, 
                                                     backend_id, 
                                                     machine_id) or 'root'
                  
                log.error("before run command %s" % ssh_user)
                response = run_command(machine_id, 
                                       host, 
                                       ssh_user, 
                                       private_key, 
                                       command)
                cmd_output = response.text
                new_ssh_user = False
                if 'Please login as the user ' in cmd_output:
                    new_ssh_user = cmd_output.split()[5].strip('"')
                elif 'Please login as the' in cmd_output:
                    # for EC2 Amazon Linux machines, usually with ec2-user
                    new_ssh_user = cmd_output.split()[4].strip('"')

                sudoer = False
                if new_ssh_user:
                    response = run_command(machine_id, 
                                           host, 
                                           new_ssh_user, 
                                           private_key, 
                                           command)
                    cmd_output = response.text
                    ssh_user = new_ssh_user # update username in key-machine association
                
                if response.status_code != 200:
                    # Mark key failure
                    save_keypair(request, 
                                 k, 
                                 backend_id, 
                                 machine_id, 
                                 -1*int(time()), # minus means failure
                                 ssh_user,
                                 sudoer) 
                    continue
                
                # TODO: Test if user is sudoer
                if command.startswith('sudo -n uptime 2>&1'):
                    split_output = cmd_output.split('--------')
                    try:
                        if int(split_output[0]) > 0:
                            sudoer = True
                    except ValueError:
                        pass
                
                # Mark key success
                save_keypair(request, 
                             k, 
                             backend_id, 
                             machine_id, 
                             int(time()), 
                             ssh_user, 
                             sudoer)
                
                return {'output': cmd_output,
                        'ssh_user': ssh_user,
                        'sudoer': sudoer}
            
        return False


@view_config(route_name='probe', request_method='POST',
             renderer='json')
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

    ret = shell_command(request, backend_id, machine_id, host, command, ssh_user, key)
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
    return list_images(request)

@view_config(route_name='images', request_method='GET', renderer='json')
def list_images(request):
    """List images from each backend. 
    Furthermore if a search_term is provided, we loop through each
    backend and search for that term in the ids and the names of 
    the community images"""
    
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)
    
    backend_id = request.matchdict['backend']
    
    term = None
    try:
        term = request.json_body.get('search_term', '').lower()
    except:
        pass
    
    with get_user(request, readonly=True) as user:
        backends = user.get('backends', {})
    
    try:
        starred = backends.get(backend_id, {}).get('starred', [])
        # Initialize arrays
        starred_images = []
        ec2_images = []
        rest_images = []
        images = []
        if conn.type in EC2_PROVIDERS:
            ec2_images = conn.list_images(None, EC2_IMAGES[conn.type].keys() + starred)
            for image in ec2_images:
                image.name = EC2_IMAGES[conn.type].get(image.id, image.name)
        else:
            rest_images = conn.list_images()
            starred_images = [image for image in rest_images if image.id in starred]
            
        if term and conn.type in EC2_PROVIDERS:
            ec2_images += conn.list_images(ex_owner="self")
            ec2_images += conn.list_images(ex_owner="aws-marketplace")
            ec2_images += conn.list_images(ex_owner="amazon")
        
        images = [ image for image in starred_images + ec2_images + rest_images 
            if not (image.id[:3] in ['aki', 'ari'] or 'windows' in image.name.lower() or 'hvm' in image.name.lower())]
        
        if term: 
            images = [ image for image in images if term in image.id.lower() or term in image.name.lower() ][:20]
        
    except:
        return Response('Backend unavailable', 503)
    
    ret = []
    for image in images:
        if image.id in starred:
            star = True
            starred.remove(image.id)
        else:
            star = False
        ret.append({'id'    : image.id,
                    'extra' : image.extra,
                    'name'  : image.name,
                    'star'  : star,
                    })
    return ret

@view_config(route_name='image', request_method='POST', renderer='json')
def star_image(request):
    """Toggle image as starred."""
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)
    
    backend_id = request.matchdict['backend']
    image_id = request.matchdict['image']
    
    starred = True
    with get_user(request) as user:
        backends = user.get('backends', {})

        if not backend_id in backends:
            return Response('Backend id not found %s' % backend_id, 400)
    
        if backends[backend_id].get('starred', None):
            if image_id in backends[backend_id]['starred']:
                backends[backend_id]['starred'].remove(image_id)
                starred = False
            else:
                backends[backend_id]['starred'].append(image_id)
        else:
            backends[backend_id]['starred'] = [image_id]
        
    return starred


@view_config(route_name='sizes', request_method='GET', renderer='json')
def list_sizes(request):
    """List sizes (aka flavors) from each backend."""
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    try:
        sizes = conn.list_sizes()
    except:
        return Response('Backend unavailable', 503)

    ret = []
    for size in sizes:
        ret.append({'id'        : size.id,
                    'bandwidth' : size.bandwidth,
                    'disk'      : size.disk,
                    'driver'    : size.driver.name,
                    'name'      : size.name,
                    'price'     : size.price,
                    'ram'       : size.ram,
                    })

    return ret


@view_config(route_name='locations', request_method='GET', renderer='json')
def list_locations(request):
    """List locations from each backend.

    Locations mean different things in each backend. e.g. EC2 uses it as a
    datacenter in a given availability zone, whereas Linode lists availability
    zones. However all responses share id, name and country eventhough in some
    cases might be empty, e.g. Openstack.

    In EC2 all locations by a provider have the same name, so the availability
    zones are listed instead of name.

    """
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    try:
        locations = conn.list_locations()
    except:
        locations = [NodeLocation('', name='default', country='', driver=conn)]

    ret = []
    for location in locations:
        if conn.type in EC2_PROVIDERS:
            try:
                name = location.availability_zone.name
            except:
                name = location.name
        else:
            name = location.name

        ret.append({'id'        : location.id,
                    'name'      : name,
                    'country'   : location.country,
                    })

    return ret


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

    return Response('OK', 200)


@view_config(route_name='key_action', request_method='POST', renderer='json')
def set_default_key_request(request):
    key_id = request.matchdict['key']
    user = user_from_request(request)

    methods.set_default_key(user, key_id)
    return Response('OK', 200)

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
    user = user_from_request(request)
    methods.associate_key(user, key_id, backend_id, machine_id)
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
            ret = requests.post(settings['core_uri'] + '/auth', params=payload, verify=False)
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

    return Response('OK', 200)


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


def save_keypair(request, key_id, backend_id, machine_id, timestamp, ssh_user, sudoer, public_key = False, private_key = False, default = None):
    """ Updates an ssh keypair or associates an ssh user for a machine with a key.

    """
    with get_user(request) as user:
        keypairs = user.get('keypairs', {})

        if key_id not in keypairs:
            keypairs[key_id] = {'machines': []}
        
        keypair = keypairs[key_id]

        if public_key:
            keypair['public'] = public_key

        if private_key:
            keypair['private'] = private_key

        if default != None:
            keypair['default'] = default

        #~ log.debug("Keypair is : %s" % keypair)
        for machine in keypair.get('machines',[]):
            if [backend_id, machine_id] == machine[:2]:
                keypairs[key_id]['machines'][keypair['machines'].index(machine)] = [backend_id, machine_id, timestamp, ssh_user, sudoer]
            else:
                log.debug("Machines are : %s" % keypair.get('machines', []))

        return True


def deploy_key(request, keypair):
    """Deploys the provided keypair to the machine.

    To do that it requires another keypair (existing_key) that can connect to
    the machine.

    """
    grep_output = '`grep \'%s\' ~/.ssh/authorized_keys`' % keypair['public']
    command = 'if [ -z "%s" ]; then echo "%s" >> ~/.ssh/authorized_keys; fi' % (grep_output, keypair['public'])
    host = request.json_body.get('host', None)
    backend_id = request.json_body.get('backend_id', None)
    machine_id = request.json_body.get('machine_id', None)
    
    try:
        ret = shell_command(request, backend_id, machine_id, host, command)
    except:
        pass

    # Maybe the deployment failed but let's try to connect with the new key and see what happens
    with get_user(request, readonly=True) as user:
        keypairs = user.get('keypairs',{})    
        key_name = None
        for key_name, k in keypairs.items():
            if k == keypair:
                break

        if key_name:
            log.warn('probing with key %s' % key_name)

        if ret:
            ssh_user = ret.get('ssh_user', None)
        else:
            ssh_user = None

        test = shell_command(request, backend_id, machine_id, host, 'whoami', ssh_user, key = key_name)

        return test


def undeploy_key(request, keypair):
    """Removes the provided keypair from the machine.

    It connects to the server with the key that is supposed to be deleted.

    """
    command = 'grep -v "' + keypair['public'] + '" ~/.ssh/authorized_keys ' +\
              '> ~/.ssh/authorized_keys.tmp && ' +\
              'mv ~/.ssh/authorized_keys.tmp ~/.ssh/authorized_keys ' +\
              '&& chmod go-w ~/.ssh/authorized_keys'
    host = request.json_body.get('host', None)
    backend_id = request.json_body.get('backend_id', None)
    machine_id = request.json_body.get('machine_id', None)
                  
    try:
        ret = shell_command(request, backend_id, machine_id, host, command)
    except:
        return False

    return ret
