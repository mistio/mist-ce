import logging


from libcloud.compute.providers import get_driver
from libcloud.compute.base import Node, NodeSize, NodeImage, NodeLocation
from libcloud.compute.base import NodeAuthSSHKey
from libcloud.compute.deployment import MultiStepDeployment, ScriptDeployment
from libcloud.compute.deployment import SSHKeyDeployment
from libcloud.compute.types import Provider
from libcloud.common.types import InvalidCredsError
from libcloud.compute.types import NodeState


from mist.io.config import STATES, EC2_PROVIDERS


from mist.io.model import User, Backend, Keypair
from mist.io.exceptions import *


from mist.io.helpers import generate_backend_id
from mist.io.helpers import generate_public_key, validate_keypair


log = logging.getLogger(__name__)


def add_backend(user, title, provider, apikey,
                apisecret, apiurl, tenant_name):
    """Adds a new backend to the user and returns the new backend_id."""

    # if api secret not given, search if we already know it
    if apisecret == 'getsecretfromdb':
        for backend_id in user.backends:
            if apikey == user.backends[backend_id].apikey:
                apisecret = user.backends[backend_id].apisecret
                break

    region = ''
    if not isinstance(provider, int) and ':' in provider:
        provider = provider.split(':')[0]
        region = provider.split(':')[1]

    if not provider or not apikey or not apisecret:
        raise BadRequestError("Invalid backend data")

    backend_id = generate_backend_id(provider, region, apikey)

    if backend_id in user.backends:
        raise ConflictError("Backend exists")

    backend = Backend()
    backend.title = title
    backend.provider = provider
    backend.apikey = apikey
    backend.apisecret = apisecret
    backend.apiurl = apiurl
    backend.tenant_name = tenant_name
    backend.region = region
    backend.enabled = True
    #~ FIXME backend.poll_interval
    with user.lock_n_load():
        user.backends[backend_id] = backend
        user.save()
    return backend_id


def delete_backend(user, backend_id):
    if backend_id not in user.backends:
        raise BackendNotFoundError()
    with user.lock_n_load():
        del user.backends[backend_id]
        user.save()


def add_key(user, key_id, private_key):
    """Adds a new keypair and returns the new key_id"""

    if not key_id:
        raise NotFoundError("Key_id could not be found")

    if not private_key:
        raise NotFoundError("Private key is not provided")

    if key_id in user.keypairs:
        raise ConflictError("Key with the same name already exists")

    keypair = Keypair()
    keypair.private = private_key
    keypair.public = generate_public_key(private_key)
    keypair.default = not len(user.keypairs)
    keypair.machines = []

    if not validate_keypair(keypair.public, keypair.private):
        raise KeyValidationError("Keypair could not be validated")

    with user.lock_n_load():
        user.keypairs[key_id] = keypair
        user.save()

    return key_id


def delete_key(user, key_id):
    """
    Deletes given keypair. If key was default, then it checks
    if there are still keys left and assignes another one as default.

    @param user: The User
    @param key_id: The key_id to be deleted
    @return: Returns nothing
    """

    if key_id not in user.keypairs:
        raise KeyNotFoundError()

    keypair = user.keypairs[key_id]

    with user.lock_n_load():
        keypair = user.keypairs[key_id]
        del user.keypairs[key_id]

        if keypair.default and len(user.keypairs):
            otherKey = user.keypairs.keys()[0]
            user.keypairs[otherKey].default = True

        user.save()

def set_default_key(user, key_id):
    """
    Sets a new default key

    @param user: The user
    @param key_id: The id of the key we want to set as default
    @return: Nothing. Raises only exceptions if needed.
    """

    if not key_id:
        return NotFoundError("Key_id could not be found")

    keypairs = user.keypairs

    if not key_id in keypairs:
        raise KeyNotFoundError()

    with user.lock_n_load():
        for key in keypairs:
            if keypairs[key].default:
                keypairs[key].default = False
        keypairs[key_id].default = True
        user.save()

def edit_key(user, new_key, old_key):
    """
    Edits a given key's name from old_key ---> new_key
    @param user: The User
    @param new_key: The new Key name
    @param old_key: The old key name
    @return: Nothing, only raises exceptions if needed
    """

    if not new_key:
        raise KeyParameterNotProvided("New key name not provided")

    if not old_key:
        raise KeyParameterNotProvided("Key to be edited not provided")

    if old_key == new_key:
        log.warning("Same name provided, will not edit key.No reason")
        return

    old_keypair = user.keypairs[old_key]
    with user.lock_n_load():
        del user.keypairs[old_key]
        user.keypairs[new_key] = old_keypair
        user.save()


def list_machines(user, backend_id):
    if backend_id not in user.backends:
        raise BackendNotFoundError()
    conn = connect(user.backends[backend_id])

    try:
        machines = conn.list_nodes()
    except InvalidCredsError:
        raise BackendUnauthorizedError()
    except:
        raise InternalServerError("Backend unavailable")

    ret = []
    for m in machines:
        tags = m.extra.get('tags') or m.extra.get('metadata') or {}
        tags = [value for key, value in tags.iteritems() if key != 'Name']

        if m.extra.get('availability', None):
            # for EC2
            tags.append(m.extra['availability'])
        elif m.extra.get('DATACENTERID', None):
            # for Linode
            tags.append(LINODE_DATACENTERS[m.extra['DATACENTERID']])

        image_id = m.image or m.extra.get('imageId', None)

        size = m.size or m.extra.get('flavorId', None)
        size = size or m.extra.get('instancetype', None)

        machine = {'id'            : m.id,
                   'uuid'          : m.get_uuid(),
                   'name'          : m.name,
                   'imageId'       : image_id,
                   'size'          : size,
                   'state'         : STATES[m.state],
                   'private_ips'   : m.private_ips,
                   'public_ips'    : m.public_ips,
                   'tags'          : tags,
                   'extra'         : m.extra,
                  }
        machine.update(get_machine_actions(m, conn))
        ret.append(machine)
    
    return ret


def get_machine_actions(machine_from_api, conn):
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

    if conn.type in EC2_PROVIDERS:
        can_stop = True

    if conn.type in [Provider.NEPHOSCALE, Provider.DIGITAL_OCEAN, Provider.SOFTLAYER]:
        can_stop = True

    if conn.type in (Provider.RACKSPACE_FIRST_GEN, Provider.LINODE, 
                        Provider.NEPHOSCALE, Provider.SOFTLAYER, Provider.DIGITAL_OCEAN):
        can_tag = False

    # for other states
    if machine_from_api.state in (NodeState.REBOOTING, NodeState.PENDING):
        can_start = False
        can_stop = False
        can_reboot = False
    elif machine_from_api.state is NodeState.UNKNOWN:
        # We assume uknown state mean stopped
        if conn.type in (Provider.NEPHOSCALE, Provider.SOFTLAYER, Provider.DIGITAL_OCEAN) or \
            conn.type in EC2_PROVIDERS:
            can_stop = False
            can_start = True
        can_reboot = False
    elif machine_from_api.state in (NodeState.TERMINATED,):
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


def connect(backend):
    """Establishes backend connection using the credentials specified.

    It has been tested with:

        * EC2, and the alternative providers like EC2_EU,
        * Rackspace, old style and the new Nova powered one,
        * Openstack Diablo through Trystack, should also try Essex,
        * Linode

    """

    driver = get_driver(backend.provider)
    if backend.provider == Provider.OPENSTACK:
        conn = driver(
            backend.apikey,
            backend.apisecret,
            ex_force_auth_version=backend.auth_version or '2.0_password',
            ex_force_auth_url=backend.apiurl,
            ex_tenant_name=backend.tenant_name)
    elif backend.provider == Provider.LINODE:
        conn = driver(backend.apisecret)
    elif backend.provider in [Provider.RACKSPACE_FIRST_GEN,
                              Provider.RACKSPACE]:
        conn = driver(backend.apikey, backend.apisecret,
                      region=backend.region)
    elif backend.provider in [Provider.NEPHOSCALE,
                              Provider.DIGITAL_OCEAN,
                              Provider.SOFTLAYER]:
        conn = driver(backend.apikey, backend.apisecret)
    else:
        # ec2
        conn = driver(backend.apikey, backend.apisecret)
        # Account for sub-provider regions (EC2_US_WEST, EC2_US_EAST etc.)
        conn.type = backend.provider
    return conn
