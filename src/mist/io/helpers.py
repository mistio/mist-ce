"""Helper functions used in views and WSGI initialization"""
import os
import tempfile
import logging
from time import time
from hashlib import sha1
from contextlib import contextmanager

from pyramid.response import Response

from libcloud.compute.types import Provider
from libcloud.compute.providers import get_driver

from fabric.api import env
from fabric.api import run

from mist.io.config import COMMAND_TIMEOUT

# add curl ca-bundle default path to prevent libcloud certificate error
import libcloud.security
libcloud.security.CA_CERTS_PATH.append('/usr/share/curl/ca-bundle.crt')


from mist.io.model import User


log = logging.getLogger(__name__)


@contextmanager
def get_user(request, readonly=False, refresh=False, ext_auth=False):
    """Use it like this:
        with get_user(request) as user:
            code....
    It will automagically clean up and save the data to the session and the database
    """

    # FIXME: This is a temporary hack until migration is completed. get_user
    # will then be deleted

    user = User()
    if user is None:
        raise UnauthorizedError()
    with user.lock_n_load():
        yield user._dict
        user.save()


def get_ssh_user_from_keypair(keypair, backend_id, machine_id):
    """get ssh user for key pair given the key pair"""

    user = ''
    for machine in keypair.machines:
        log.debug("Machine: %s" % machine)
        if machine[:2] == [backend_id, machine_id]:
            try:
                # this should be the user, since machine =
                # [backend_id, machine_id, timestamp, ssh_user, sudoer]
                user = machine[3]
            except:
                pass
    log.debug("get_ssh_user_from_keypair: %s", user)
    return user


# functionality already transfered to methods connect
def connect(request, backend_id=False):
    """Establishes backend connection using the credentials specified.

    It has been tested with:

        * EC2, and the alternative providers like EC2_EU,
        * Rackspace, old style and the new Nova powered one,
        * Openstack Diablo through Trystack, should also try Essex,
        * Linode

    """
    with get_user(request, readonly=True) as user:
        backends = user['backends']
        #~ log.error(backends.keys())

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
                      region=backend['region'])
    elif backend['provider'] in [Provider.NEPHOSCALE, Provider.DIGITAL_OCEAN]:
        conn = driver(backend['apikey'], backend['apisecret'])
    elif backend['provider'] == Provider.SOFTLAYER:
        conn = driver(backend['apikey'], backend['apisecret'])
    else:
        # ec2
        conn = driver(backend['apikey'], backend['apisecret'])
        # Account for sub-provider regions (EC2_US_WEST, EC2_US_EAST etc.)
        conn.type = backend['provider']
    return conn


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
    #~ log.error("runcommand(%s,%s,%s,%s,%s)" % (machine_id, host, ssh_user, private_key, command))
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


def get_preferred_keypairs(keypairs, backend_id, machine_id):
    """ Returns a list with the preferred keypairs for this machine."""

    default_keys = filter(lambda key_id: keypairs[key_id].default, keypairs)
    assoc_keys = []
    recent_keys = []
    root_keys = []
    sudo_keys = []
    for key_id in keypairs:
        for machine in keypairs[key_id].machines:
            if [backend_id, machine_id] == machine[:2]:
                assoc_keys.append(key_id)
                if len(machine) > 2 and int(time() - machine[2]) < 7*24*3600:
                    recent_keys.append(key_id)
                if len(machine) > 3 and machine[3] == 'root':
                    root_keys.append(key_id)
                if len(machine) > 4 and machine[4] == True:
                    sudo_keys.append(key_id) 

    pref_keys = root_keys or sudo_keys or assoc_keys
    if default_keys and default_keys[0] not in pref_keys:
        pref_keys.append(default_keys[0])
    return pref_keys


def get_temp_file(content):
    """Creates a temporary file on disk and saves 'content' in it.

    It is meant to be used like this:
    with get_temp_file(my_string) as filepath:
        do_stuff()

    Once the with block is exited, the file is deleted.

    """

    (tmp_key, tmp_path) = tempfile.mkstemp()
    tmp_fd = os.fdopen(tmp_key, 'w+b')
    key_fd.write(content)
    key_fd.close()
    try:
        yield tmp_key, tmp_path
    finally:
        os.remove(tmp_path)
