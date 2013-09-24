"""Helper functions used in views and WSGI initialization"""
import os
import tempfile
import logging
import yaml
import subprocess
import struct
import binascii

from time import time
from hashlib import sha1
from Crypto.PublicKey import RSA , DSA
from Crypto.Util.number import bytes_to_long, long_to_bytes, isPrime

from pyramid.response import Response

from libcloud.compute.types import Provider
from libcloud.compute.types import NodeState
from libcloud.compute.providers import get_driver
from libcloud.compute.base import Node
from libcloud.compute.types import Provider

from fabric.api import env
from fabric.api import run

from mist.io.config import EC2_PROVIDERS, COMMAND_TIMEOUT

# add curl ca-bundle default path to prevent libcloud certificate error
import libcloud.security
libcloud.security.CA_CERTS_PATH.append('/usr/share/curl/ca-bundle.crt')

log = logging.getLogger('mist.io')


def load_settings(settings):
    """Gets settings from settings.yaml local file.

    The settings argument gets updated. It is the global_config of pyramid. If
    there is no such file, it creates one for later use and sets some sensible
    defaults without writing them in file.

    settings.yaml is saved either in Opensift's data dir, in order to have
    write access, or to the current path.

    """
    base_path = os.environ.get('OPENSHIFT_DATA_DIR', '')
    yaml_path = base_path + 'settings.yaml'

    try:
        config_file = open(yaml_path, 'r')
    except IOError:
        log.warn('settings.yaml does not exist.')
        config_file = open(yaml_path, 'w')
        config_file.close()
        config_file = open(yaml_path, 'r')

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
    settings['js_build'] = user_config.get('js_build', settings.get('js_build', True))
    settings['js_log_level'] = user_config.get('js_log_level', 3)
    settings['default_poll_interval'] = user_config.get('default_poll_interval',
                                                         10000)
    if not 'core_uri' in settings:
        settings['core_uri'] = user_config.get('core_uri', 'https://mist.io')


def save_settings(request):
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

    base_path = os.environ.get('OPENSHIFT_DATA_DIR', '')
    yaml_path = base_path + 'settings.yaml'
    config_file = open(yaml_path, 'w')

    settings = request.registry.settings

    keypairs = {}
    for key in settings['keypairs'].keys():
        keypairs[key] = {
            'public': literal_unicode(settings['keypairs'][key]['public']),
            'private': literal_unicode(settings['keypairs'][key]['private']),
            'machines': settings['keypairs'][key].get('machines',[]),
            'default': settings['keypairs'][key].get('default', False)
        }

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


def get_keypair_by_name(keypairs, name):
    """get key pair by name."""
    for key in keypairs:
        if name == key:
            return keypairs[key]
    return {}


def get_keypair(keypairs, backend_id=None, machine_id=None):
    """get key pair for machine, else get default key pair."""
    for key in keypairs:
        machines = keypairs[key].get('machines', [])
        if machines:
            for machine in machines:
                if machine[:2] == [backend_id, machine_id]:
                    return keypairs[key]
    for key in keypairs:
        if keypairs[key].get('default', False):
            return keypairs[key]

    return {}


def get_ssh_user_from_keypair(keypair, backend_id=None, machine_id=None):
    """get ssh user for key pair given the key pair"""
    machines = keypair.get('machines', [])
    log.debug("Machines in keypair %s: %s" % (keypair, machines))
    for machine in machines:
        log.debug("Machine: %s" % machine)
        if machine[:2] == [backend_id, machine_id]:
            try:
                #this should be the user, since machine = [backend_id, machine_id, timestamp, ssh_user, sudoer]
                log.debug("user %s" % machine[3])
                return machine[3]
            except:
                log.debug("user is None")
                return ''
    return ''


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
    except KeyError:
        backends = request.registry.settings['backends']

    if not backend_id:
        backend_id = request.matchdict['backend']
    backend = backends.get(backend_id)

    driver = get_driver(backend['provider'])

    if backend['provider'] == Provider.OPENSTACK:
        conn = driver(backend['apikey'],
                      backend['apisecret'],
                      ex_force_auth_version=backend.get('auth_version', '2.0_password'),
                      ex_force_auth_url=backend.get('apiurl', None),
                      ex_tenant_name=backend.get('tenant_name', None))
    elif backend['provider'] == Provider.LINODE:
        conn = driver(backend['apisecret'])
    elif backend['provider'] == Provider.RACKSPACE_FIRST_GEN:
        conn = driver(backend['apikey'], backend['apisecret'],
                      region=backend['region'])
    elif backend['provider'] == Provider.RACKSPACE:
        conn = driver(backend['apikey'], backend['apisecret'],
                      datacenter=backend['region'])
    elif backend['provider'] == Provider.NEPHOSCALE:
        conn = driver(backend['apikey'], backend['apisecret'])
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

    if backend.type == Provider.NEPHOSCALE:
        can_stop = True
        can_tag = False

    if backend.type == Provider.RACKSPACE_FIRST_GEN or \
                       backend.type == Provider.LINODE:
        can_tag = False

    # for other states
    if machine.state in (NodeState.REBOOTING, NodeState.PENDING):
        can_start = False
        can_stop = False
        can_reboot = False
    elif machine.state is NodeState.UNKNOWN:
        # We assume uknown state in EC2 mean stopped
        if backend.type in EC2_PROVIDERS:
            can_stop = False
            can_start = True
        if backend.type == Provider.NEPHOSCALE:
            can_stop = False
            can_start = True        
        can_reboot = False
    elif machine.state in (NodeState.TERMINATED,):
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


def run_command(machine_id, host, ssh_user, private_key, command):
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
        return Response('SystemExit: %s' % e, 401)

    os.remove(tmp_path)

    return Response(cmd_output, 200)


def generate_backend_id(provider, region, apikey):
    i = int(sha1('%s%s%s' % (provider, region, apikey)).hexdigest(), 16)
    return b58_encode(i)


alphabet = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
base_count = len(alphabet)

def b58_encode(num):
    """Returns num in a base58-encoded string."""
    encode = ''
    if (num < 0):
        return ''
    while (num >= base_count):
        mod = num % base_count
        encode = alphabet[mod] + encode
        num = num / base_count
    if (num):
        encode = alphabet[num] + encode
    return encode


def b58_decode(s):
    """Decodes the base58-encoded string s into an integer."""
    decoded = 0
    multi = 1
    s = s[::-1]
    for char in s:
        decoded += multi * alphabet.index(char)
        multi = multi * base_count

    return decoded


def generate_keypair():
    """Generates a random keypair."""
    key = RSA.generate(2048, os.urandom)
    return {
        'public': key.exportKey('OpenSSH'),
        'private': key.exportKey()
    }


def set_default_key(request):
    """Sets a key as default.

    After all changes take place, it updates the configuration and saves the
    updated yaml.

    """
    key_id = request.matchdict['key']
    
    if not key_id:
        return Response('Keypair not found', 404)

    keypairs = request.registry.settings['keypairs']

    for key in keypairs:
        keypairs[key]['default'] = False

    keypairs[key_id]['default'] = True

    save_settings(request)

    return Response('OK', 200)


def get_private_key(request):
    """Gets private key from keypair name.

    It is used in single key view when the user clicks the display private key
    button.

    """    
    try:
        keypairs = request.environ['beaker.session']['keypairs']
    except:
        keypairs = request.registry.settings.get('keypairs', {})
    
    key_id = request.matchdict['key']

    if key_id in keypairs.keys():
        return keypairs[key_id].get('private', '')
    else:
        return Response('Keypair not found', 404)


def validate_dsa_key_pair(public_key, private_key):
    """ Validates a pair of dsa keys """
    
    # FIXME: Make this function validate private key too
    
    # Construct DSA key
    keystring = binascii.a2b_base64(public_key.split(' ')[1])
    keyparts = []
    
    while len(keystring) > 4:
        length = struct.unpack('>I', keystring[:4])[0]
        keyparts.append(keystring[4:4 + length])
        keystring = keystring[4 + length:]
        
    if keyparts[0] == 'ssh-dss':
        tup = [bytes_to_long(keyparts[x]) for x in (4, 3, 1, 2)]
    else:
        return False
    
    key = DSA.construct(tup)
    
    # Validate DSA key
    fmt_error = not isPrime(key.p)
    fmt_error |= ((key.p-1) % key.q)!=0 
    fmt_error |= key.g<=1 or key.g>=key.p
    fmt_error |= pow(key.g, key.q, key.p)!=1 
    fmt_error |= key.y<=0 or key.y>=key.p 
    
    # The following piece of code is currently useless, because 'x' attribute is the private key
    #if hasattr(key, 'x'):
    #    fmt_error |= key.x<=0 or key.x>=key.q 
    #    fmt_error |= pow(key.g, key.x, key.p)!=key.y 
        
    return not fmt_error

def validate_key_pair(public_key, private_key):
    """ Validates a pair of keys """
    
    message = 'Encrypted message 1234567890'
    
    if 'ssh-rsa' in public_key:
        
        public_key_container = RSA.importKey(public_key)
        private_key_container = RSA.importKey(private_key)
        encrypted_message = public_key_container.encrypt(message, 0)
        decrypted_message = private_key_container.decrypt(encrypted_message)
        
        if message == decrypted_message:
            return True
        
    elif 'ssh-dss' in public_key:
    
        return validate_dsa_key_pair(public_key, private_key)
    
    return False

def get_preferred_keypairs(keypairs, backend_id, machine_id):
    """ Returns a list with the preferred keypairs for this machine
    """

    default_keypair = [k for k in keypairs if keypairs[k].get('default', False)]
    associated_keypairs = [k for k in keypairs \
                           for m in keypairs[k].get('machines',[]) \
                           if m[0] == backend_id and m[1] == machine_id]
    recently_tested_keypairs = [k for k in associated_keypairs \
                                for m in keypairs[k].get('machines',[]) \
                                if len(m) > 2 and int(time()) - int(m[2]) < 7*24*3600]
    
    # Try to find a recently tested root keypair
    root_keypairs = [k for k in recently_tested_keypairs \
                     for m in keypairs[k].get('machines',[]) \
                     if len(m) > 3 and m[3] == 'root']
    
    if not root_keypairs:
        # If not try to get a recently tested sudoer keypair
        sudo_keypairs = [k for k in recently_tested_keypairs \
                         for m in keypairs[k].get('machines',[]) \
                         if len(m) > 4 and m[4] == True]
        if not sudo_keypairs:
            # If there is none just try to get a root or sudoer associated keypair even if not recently tested
            preferred_keypairs = [k for k in associated_keypairs \
                                  for m in keypairs[k].get('machines',[]) \
                                  if len(m) > 3 and m[3] == 'root'] or \
                                 [k for k in associated_keypairs \
                                  for m in keypairs[k].get('machines',[]) \
                                  if len(m) > 4 and m[4] == True]
            if not preferred_keypairs:
                # If there is none of the above then just use whatever keys are available
                preferred_keypairs = associated_keypairs
        else:
            preferred_keypairs = sudo_keypairs
    else:
        preferred_keypairs = root_keypairs
    
    if len(default_keypair) and default_keypair[0] not in preferred_keypairs:
        preferred_keypairs.append(default_keypair[0])
        
    return preferred_keypairs
