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

import traceback
import requests
import json

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
from mist.io.helpers import get_auth_header


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


@view_config(route_name='home', request_method='GET',
             renderer='templates/home.pt')
def home(request):
    """Home page view"""
    user = user_from_request(request)
    return {
        'project': 'mist.io',
        'email': json.dumps(user.email),
        'supported_providers': json.dumps(config.SUPPORTED_PROVIDERS),
        'core_uri': json.dumps(config.CORE_URI),
        'auth': json.dumps(bool(user.mist_api_token)),
        'js_build': json.dumps(config.JS_BUILD),
        'css_build': config.CSS_BUILD,
        'js_log_level': json.dumps(config.JS_LOG_LEVEL),
        'google_analytics_id': config.GOOGLE_ANALYTICS_ID,
        'is_core': json.dumps(False),
        'csrf_token': json.dumps(""),
    }


@view_config(route_name="check_auth", request_method='POST', renderer="json")
def check_auth(request):
    """Check on the mist.core service if authenticated"""

    params = request.json_body
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
            user.mist_api_token = ret_dict.pop('mist_api_token', '')
            user.save()
        log.info("succesfully check_authed")
        return ret_dict
    else:
        log.error("Couldn't check_auth to mist.io: %r", ret)
        raise UnauthorizedError()


@view_config(route_name='account', request_method='POST', renderer='json')
def update_user_settings(request):
    """try free plan, by communicating to the mist.core service"""

    params = request.json_body
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
                    'state': 'wait' if backend.enabled else 'offline',
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
    machine_hostname = params.get('machine_ip', '')
    machine_key = params.get('machine_key', '')
    machine_user = params.get('machine_user', '')
    try:
        ssh_port = int(params.get('machine_port', 22))
    except:
        ssh_port = 22
    region = params.get('region', '')
    compute_endpoint = params.get('compute_endpoint', '')
    # TODO: check if all necessary information was provided in the request

    user = user_from_request(request)
    backend_id = methods.add_backend(
        user, title, provider, apikey, apisecret, apiurl, tenant_name=tenant_name,
        machine_hostname=machine_hostname, machine_key=machine_key, machine_user=machine_user,
        region=region, compute_endpoint=compute_endpoint, port=ssh_port
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
    ssh_user = request.json_body.get('user', None)
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
    methods.associate_key(user, key_id, backend_id, machine_id, host, username=ssh_user, port=ssh_port)
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
        # these are required only for Linode/GCE, passing them anyway
        image_extra = request.json_body.get('image_extra', None)
        disk = request.json_body.get('disk', None)
        image_name = request.json_body.get('image_name', None)
        size_name = request.json_body.get('size_name', None)
        location_name = request.json_body.get('location_name', None)
    except Exception as e:
        raise RequiredParameterMissingError(e)

    user = user_from_request(request)
    ret = methods.create_machine(user, backend_id, key_id, machine_name,
                                 location_id, image_id, size_id, script,
                                 image_extra, disk, image_name, size_name, location_name)
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
    return methods.star_image(user, backend_id, image_id)


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
    """Probes a machine using ping and ssh to collect metrics.

    .. note:: Used for getting uptime and a list of deployed keys.

    """
    machine_id = request.matchdict['machine']
    backend_id = request.matchdict['backend']
    host = request.json_body.get('host', None)
    key_id = request.json_body.get('key', None)
    # FIXME: simply don't pass a key parameter
    if key_id == 'undefined':
        key_id = None

    ssh_user = request.params.get('ssh_user', '')
    # FIXME: simply don't pass a key parameter
    if key_id == 'undefined':
        key_id = ''
    user = user_from_request(request)
    ret = methods.probe(user, backend_id, machine_id, host, key_id, ssh_user)
    return ret


@view_config(route_name='monitoring', request_method='GET', renderer='json')
def check_monitoring(request):
    """Ask the mist.io service if monitoring is enabled for this machine.

    """
    user = user_from_request(request)

    try:
        ret = requests.get(config.CORE_URI + request.path,
                           headers={'Authorization': get_auth_header(user)},
                           verify=config.SSL_VERIFY)
    except requests.exceptions.SSLError as exc:
        log.error("%r", exc)
        raise SSLError()
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
    backend_id = request.matchdict['backend']
    machine_id = request.matchdict['machine']
    if not user.mist_api_token:
        log.info("trying to authenticate to service first")
        email = request.json_body.get('email')
        password = request.json_body.get('password')
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
                user.mist_api_token = ret_dict.pop('mist_api_token', '')
                user.save()
            log.info("succesfully check_authed")
        else:
            raise UnauthorizedError("You need to authenticate to mist.io.")

    action = request.json_body['action'] or 'enable'
    name = request.json_body.get('name', '')
    public_ips = request.json_body.get('public_ips', [])
    dns_name = request.json_body.get('dns_name', '')
    no_ssh = bool(request.json_body.get('no_ssh', False))
    dry = bool(request.json_body.get('dry', False))

    payload = {
        'action': action,
        'name': name,
        'public_ips': ",".join(public_ips),
        'dns_name': dns_name,
        # tells core not to try to run ssh command to (un)deploy collectd
        'no_ssh': True,
        'dry': dry,
    }

    if action == 'enable':
        ret_dict = methods.enable_monitoring(
            user, backend_id, machine_id, name, dns_name, public_ips,
            no_ssh=no_ssh, dry=dry
        )
    elif action == 'disable':
        stdout = methods.disable_monitoring(user, backend_id, machine_id,
                                            no_ssh=no_ssh)
        ret_dict = {'cmd_output': stdout}
    else:
        raise BadRequestError()

    return ret_dict


@view_config(route_name='stats', request_method='GET', renderer='json')
def get_stats(request):
    core_uri = config.CORE_URI
    user = user_from_request(request)
    params = request.params
    start = params.get('start')
    stop = params.get('stop')
    step = params.get('step')
    expression = params.get('expression')

    params = {
        'start': start,
        'stop': stop,
        'step': step,
        'expression': expression,
    }
    try:
        ret = requests.get(config.CORE_URI + request.path,
                           params=params,
                           headers={'Authorization': get_auth_header(user)},
                           verify=config.SSL_VERIFY)
    except requests.exceptions.SSLError as exc:
        log.error("%r", exc)
        raise SSLError()
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
    core_uri = config.CORE_URI
    payload = {
        'start': start,
        'stop': stop,
    }
    headers = {
        'Authorization': get_auth_header(user),
        'Content-type': 'image/png',
        'Accept': '*/*'
    }
    try:
        ret = requests.get(config.CORE_URI + request.path, params=payload,
                           headers=headers, verify=config.SSL_VERIFY)
    except requests.exceptions.SSLError as exc:
        log.error("%r", exc)
        raise SSLError()
    if ret.status_code != 200:
        log.error("Error getting loadavg %d:%s", ret.status_code, ret.text)
        raise ServiceUnavailableError()
    return Response(ret.content, content_type='image/png', request=request)


@view_config(route_name='rules', request_method='POST', renderer='json')
def update_rule(request):
    """Creates or updates a rule.

    """
    user = user_from_request(request)
    try:
        ret = requests.post(
            config.CORE_URI + request.path,
            params=request.json_body,
            headers={'Authorization': get_auth_header(user)},
            verify=config.SSL_VERIFY
        )
    except requests.exceptions.SSLError as exc:
        log.error("%r", exc)
        raise SSLError()
    if ret.status_code != 200:
        log.error("Error updating rule %d:%s", ret.status_code, ret.text)
        raise ServiceUnavailableError()
    return ret.json()


@view_config(route_name='rule', request_method='DELETE')
def delete_rule(request):
    """Deletes a rule.

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
        # send some blank data to fill the initial buffer and get (webkit)
        # browsers to display right away what's sent
        #yield 1024*'\0'
        # start the html response
        yield "<html><body>\n"
        js = "<script type='text/javascript'>parent.appendShell('%s', '%s');</script>\n"
        for line in lines:
            # get commands output, line by line
            clear_line = line.replace('\'', '\\\'')
            clear_line = clear_line.replace('\n', '<br/>')
            clear_line = clear_line.replace('\r', '')
            #.replace('<','&lt;').replace('>', '&gt;')
            ret = js % (clear_line, cmd_id)
            yield ret
        js = "<script type='text/javascript'>"
        js += "parent.completeShell(%s, '%s');</script>\n"
        yield js % (1, cmd_id)  # FIXME
        yield "</body></html>\n"

    log.info("got shell_stream request")
    backend_id = request.matchdict['backend']
    machine_id = request.matchdict['machine']
    cmd = request.params.get('command')
    cmd_id = request.params.get('command_id').encode('utf-8', 'ignore')
    host = request.params.get('host')
    try:
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
    except Exception as e:
        message = ["Failed to execute command\n", "Error: %s \n" % e]
        return Response(status=500, app_iter=parse(message))

    return Response(status=200, app_iter=parse(stdout_lines))


@view_config(route_name='providers', request_method='GET', renderer='json')
def list_supported_providers(request):
    """
    @param request: A simple GET request
    @return: Return all of our SUPPORTED PROVIDERS
    """
    return {'supported_providers': config.SUPPORTED_PROVIDERS}
