"""Helper functions used in views"""
import os
import tempfile
import logging
import yaml

from pyramid.response import Response

from libcloud.compute.types import Provider
from libcloud.compute.types import NodeState
from libcloud.compute.providers import get_driver
from libcloud.compute.base import Node
from libcloud.compute.types import Provider

from fabric.api import env
from fabric.api import run

from mist.io.config import EC2_PROVIDERS, COMMAND_TIMEOUT


log = logging.getLogger('mist.io')


def load_settings(settings):
    """Gets settings from settings.yaml local file.

    The settings argument gets updated. It is the global_config of pyramid. If
    there is no such file, it creates one for later use and sets some sensible
    defaults without writing them in file.
    """
    try:
        config_file = open('settings.yaml', 'r')
    except IOError:
        log.warn('settings.yaml does not exist.')
        config_file = open('settings.yaml', 'w')
        config_file.close()
        config_file = open('settings.yaml', 'r')

    try:
        user_config = yaml.load(config_file) or {}
        config_file.close()
    except:
        log.error('Error parsing settings.yaml')
        config_file.close()
        raise

    settings['keypairs'] = user_config.get('keypairs', {})
    settings['backends'] = user_config.get('backends', {})
    settings['email'] = user_config.get('email', '')
    settings['password'] = user_config.get('password', '')
    settings['js_build'] = user_config.get('js_build', True)
    settings['js_log_level'] = user_config.get('js_log_level', 3)
    settings['default_poll_interval'] = user_config.get('default_poll_interval',
                                                         10000)
    if not 'core_uri' in settings:
        settings['core_uri'] = user_config.get('core_uri', 'https://mist.io')


def save_settings(settings):
    """Stores settings to settings.yaml local file.

    This is useful for using mist.io UI to configure your installation. It
    includes some yaml dump magic in order for the dumped private ssh keys
    to be in a valid string format.
    """
    class folded_unicode(unicode): pass
    class literal_unicode(unicode): pass

    def literal_unicode_representer(dumper, data):
        return dumper.represent_scalar(u'tag:yaml.org,2002:str', data, style='|')

    def folded_unicode_representer(dumper, data):
        return dumper.represent_scalar(u'tag:yaml.org,2002:str', data, style='>')

    def unicode_representer(dumper, uni):
        node = yaml.ScalarNode(tag=u'tag:yaml.org,2002:str', value=uni)
        return node

    yaml.add_representer(unicode, unicode_representer)
    yaml.add_representer(literal_unicode, literal_unicode_representer)

    config_file = open('settings.yaml', 'w')

    keypairs = {}
    for key in settings['keypairs'].keys():
        keypairs[key] = {
            'public': literal_unicode(settings['keypairs'][key]['public']),
            'private': literal_unicode(settings['keypairs'][key]['private']),
            'machines': settings['keypairs'][key].get('machines',[])
        }
        if settings['keypairs'][key].get('default', None):
            keypairs[key]['default'] = True

    payload = {
        'keypairs': keypairs,
        'backends': settings['backends'],
        'core_uri': settings['core_uri'],
        'js_build': settings['js_build'],
        'js_log_level': settings['js_log_level'],
        }
    
    if settings.get('email', False) and settings.get('password', False):
        payload['email'] = settings['email']
        payload['password'] = settings['password']

    yaml.dump(payload, config_file, default_flow_style=False, )

    config_file.close()


def default_keypair(request):
    "get default key pair"
    try:
        keypairs = request.environ['beaker.session']['keypairs']
    except KeyError:
        keypairs = request.registry.settings['keypairs']
    
    for key in keypairs:
        if keypairs[key].get('default', False):
            return keypairs[key]
    return {}

def get_keypair(request, name):
    "get key pair by name"
    try:
        keypairs = request.environ['beaker.session']['keypairs']
    except KeyError:
        keypairs = request.registry.settings['keypairs']
    
    for key in keypairs:
        if name == key:
            return keypairs[key]
    return {}

def get_keypair_for_machine(request, machine_id):
    "get key pair by name"
    try:
        backends = request.environ['beaker.session']['backends']
    except:
        backends = request.registry.settings['backends']

    backend_id = request.matchdict['backend']
    
    try:
        keypairs = request.environ['beaker.session']['keypairs']
    except KeyError:
        keypairs = request.registry.settings['keypairs']
    
    for key in keypairs:
        if keypairs[key].has_key('machines'):
            for machine in keypairs[key]['machines']:
                if machine == [backend_id, machine_id]:
                    return keypairs[key]
    return {}


def connect(request, backend_id=False):
    """Establishes backend connection using the credentials specified.

    It has been tested with:

        * EC2, and the alternative providers like EC2_EU,
        * Rackspace, old style and the new Nova powered one,
        * Openstack Diablo through Trystack, should also try Essex,
        * Linode
    """
    try:
        backends = request.environ['beaker.session']['backends']
    except:
        backends = request.registry.settings['backends']

    if not backend_id:
        backend_id = request.matchdict['backend']
    backend = backends.get(backend_id)

    driver = get_driver(int(backend['provider']))

    if backend['provider'] == Provider.OPENSTACK:
        conn = driver(backend['apikey'],
                      backend['apisecret'],
                      ex_force_auth_url=backend.get('auth_url', None),
                      ex_force_auth_version=backend.get('auth_version', '2.0'))
    elif backend['provider'] == Provider.LINODE:
        conn = driver(backend['apisecret'])
    elif backend['provider'] == Provider.RACKSPACE_FIRST_GEN:
        conn = driver(backend['apikey'], backend['apisecret'],
                      region=backend['region'])
    elif backend['provider'] == Provider.RACKSPACE:
        conn = driver(backend['apikey'], backend['api'],
                      datacenter=backend['region'])
    else:
        # ec2
        conn = driver(backend['apikey'], backend['apisecret'])
        # Account for sub-provider regions (EC2_US_WEST, EC2_US_EAST etc.)
        conn.type = backend['provider']
    return conn


def get_machine_actions(machine, backend):
    """Returns available machine actions based on backend type.

    Rackspace, Linode and openstack support the same options, but EC2 also
    supports start/stop.

    The available actions are based on the machine state. The state
    codes supported by mist.io are those of libcloud, check config.py.
    """
    # defaults for running state
    can_start = False
    can_stop = False
    can_destroy = True
    can_reboot = True
    can_tag = True

    if backend.type in EC2_PROVIDERS:
        can_stop = True

    if backend.type == Provider.RACKSPACE_FIRST_GEN or \
                       backend.type == Provider.LINODE:
        can_tag = False

    # for other states
    if machine.state in (NodeState.REBOOTING, NodeState.PENDING):
        can_start = False
        can_stop = False
        can_reboot = False
    elif machine.state is NodeState.UNKNOWN and \
                          backend.type in EC2_PROVIDERS:
        # We assume uknown state in EC2 mean stopped
        can_stop = False
        can_start = True
        can_reboot = False
    elif machine.state in (NodeState.TERMINATED, NodeState.UNKNOWN):
        can_start = False
        can_destroy = False
        can_stop = False
        can_reboot = False
        can_tag = False

    return {'can_stop': can_stop,
            'can_start': can_start,
            'can_destroy': can_destroy,
            'can_reboot': can_reboot,
            'can_tag': can_tag}


def import_key(conn, public_key, name):
    """Imports a public ssh key to a machine.

    If a key with a the selected name already exists it leaves it as is and
    considers it a success.

    This is supported only for EC2 at the moment.
    """
    if conn.type in EC2_PROVIDERS:
        (tmp_key, tmp_path) = tempfile.mkstemp()
        key_fd = os.fdopen(tmp_key, 'w+b')
        key_fd.write(public_key)
        key_fd.close()
        try:
            conn.ex_import_keypair(name=name, keyfile=tmp_path)
            os.remove(tmp_path)
            return True
        except Exception as exc:
            if 'Duplicate' in exc.message:
                log.warn('Key already exists, not importing anything.')
                os.remove(tmp_path)
                return True
            else:
                log.error('Failed to import key.')
                os.remove(tmp_path)
                return False
    else:
        log.warn('This provider does not support key importing.')
        return False


def create_security_group(conn, info):
    """Creates a security group based on the info dictionary provided.

    This is supported only for EC2 at the moment. Info should be a dictionary
    with 'name' and 'description' keys.
    """
    name = info.get('name', None)
    description = info.get('description', None)

    if conn.type in EC2_PROVIDERS and name and description:
        try:
            conn.ex_create_security_group(name=name, description=description)
            conn.ex_authorize_security_group_permissive(name=name)
            return True
        except Exception as exc:
            if 'Duplicate' in exc.message:
                log.warn('Security group already exists, not doing anything.')
                return True
            else:
                log.error('Create and configure security group.')
                return False
    else:
        log.warn('This provider does not support security group creation.')
        return False


def run_command(conn, machine_id, host, ssh_user, private_key, command):
    """Runs a command over Fabric.

    Fabric does not support passing the private key as a string, but only as a
    file. To solve this, a temporary file with the private key is created and
    its path is returned.

    In ec2 we always favor the provided dns_name and set the user name to the
    default ec2-user. IP or dns_name come from the js machine model.

    A few useful parameters for fabric configuration that are not currently
    used::

        * env.connection_attempts, defaults to 1
        * env.timeout - e.g. 20 in secs defaults to 10
        * env.always_use_pty = False to avoid running commands like htop.
          However this might cause problems. Check fabric's docs.

    .. warning::

        EC2 machines have default usernames other than root. However when
        attempting to connect with root@... it doesn't return an error but a
        message (e.g. Please login as the ec2-user rather than the user
        root). This misleads fabric to believe that everything went fine. To
        deal with this we check if the returned output contains a fragment
        of this message.
    """
    if not host:
        log.error('Host not provided, exiting.')
        return Response('Host not set', 400)

    if not command:
        log.warn('No command was passed, returning empty.')
        return Response('Command not set', 400)
    
    if not private_key:
        log.warn('No private key provided, returning empty')
        return Response('Key not set', 400)

    (tmp_key, tmp_path) = tempfile.mkstemp()
    key_fd = os.fdopen(tmp_key, 'w+b')
    key_fd.write(private_key)
    key_fd.close()

    env.key_filename = [tmp_path]
    if ssh_user:
        env.user = ssh_user
    else:
        env.user = 'root'
    env.abort_on_prompts = True
    env.no_keys = True
    env.no_agent = True
    env.host_string = host
    env.warn_only = True
    env.combine_stderr = True
    env.keepalive = 15

    try:
        cmd_output = run(command, timeout=COMMAND_TIMEOUT)
        if 'Please login as the' in cmd_output:
            # for EC2 Amazon Linux machines, usually with ec2-user
            username = cmd_output.split()[4].strip('"')
            if 'Please login as the user ' in cmd_output:
                username = cmd_output.split()[5].strip('"')
            machine = Node(machine_id,
                           name=machine_id,
                           state=0,
                           public_ips=[],
                           private_ips=[],
                           driver=conn)
            conn.ex_create_tags(machine, {'ssh_user': username})
            env.user = username
            cmd_output = run(command, timeout=COMMAND_TIMEOUT)
    except Exception as e:
        if 'SSH session not active' in e:
            from fabric.state import connections
            conn_keys = [k for k in connections.keys() if host in k]
            for key in conn_keys:
                del connections[key]
            try:
                cmd_output = run(command, timeout=COMMAND_TIMEOUT)
                log.warn("Recovered!")
            except Exception as e:
                log.error("Failed to recover :(")
                log.error('Exception while executing command: %s' % e)
                os.remove(tmp_path)
                return Response('Exception while executing command: %s' % e, 503)
        else:
            log.error('Exception while executing command: %s' % e)
            os.remove(tmp_path)
            return Response('Exception while executing command: %s' % e, 503)
    except SystemExit as e:
        log.warn('Got SystemExit: %s' % e)
        os.remove(tmp_path)
        return Response('SystemExit: %s' % e, 204)

    os.remove(tmp_path)

    return cmd_output
