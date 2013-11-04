import os
import tempfile
import logging
import random
from time import time


from libcloud.compute.providers import get_driver
from libcloud.compute.base import Node, NodeSize, NodeImage, NodeLocation
from libcloud.compute.base import NodeAuthSSHKey
from libcloud.compute.deployment import MultiStepDeployment, ScriptDeployment
from libcloud.compute.deployment import SSHKeyDeployment
from libcloud.compute.types import Provider
from libcloud.common.types import InvalidCredsError
from libcloud.compute.types import NodeState
from pyramid.response import Response    # temp


from mist.io.config import STATES, SUPPORTED_PROVIDERS
from mist.io.config import EC2_IMAGES, EC2_PROVIDERS, EC2_SECURITYGROUP
from mist.io.config import LINODE_DATACENTERS


from mist.io.model import Backend, Keypair
from mist.io.exceptions import *

from mist.io.shell import Shell

from mist.io.helpers import generate_backend_id, get_preferred_keypairs, get_ssh_user_from_keypair


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
    keypair.construct_public_from_private()
    keypair.default = not len(user.keypairs)
    keypair.machines = []

    if not keypair.isvalid():
        raise KeyValidationError("Keypair could not be validated")

    with user.lock_n_load():
        user.keypairs[key_id] = keypair
        user.save()

    return key_id


def delete_key(user, key_id):
    """Deletes given keypair.

    If key was default, then it checks
    if there are still keys left and assignes another one as default.

    @param user: The User
    @param key_id: The key_id to be deleted
    @return: Returns nothing

    """

    if key_id not in user.keypairs:
        raise KeypairNotFoundError()

    keypair = user.keypairs[key_id]

    with user.lock_n_load():
        keypair = user.keypairs[key_id]
        del user.keypairs[key_id]

        if keypair.default and len(user.keypairs):
            otherKey = user.keypairs.keys()[0]
            user.keypairs[otherKey].default = True

        user.save()


def set_default_key(user, key_id):
    """Sets a new default key

    @param user: The user
    @param key_id: The id of the key we want to set as default
    @return: Nothing. Raises only exceptions if needed.

    """

    if not key_id:
        return NotFoundError("Key_id could not be found")

    keypairs = user.keypairs

    if not key_id in keypairs:
        raise KeypairNotFoundError()

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
        raise RequiredParameterMissingError("New key name not provided")

    if not old_key:
        raise RequiredParameterMissingError("Key to be edited not provided")

    if old_key == new_key:
        log.warning("Same name provided, will not edit key.No reason")
        return

    old_keypair = user.keypairs[old_key]
    with user.lock_n_load():
        del user.keypairs[old_key]
        user.keypairs[new_key] = old_keypair
        user.save()


def associate_key(user, key_id, backend_id, machine_id, deploy=True):
    """Associates a key with a machine.

    If deploy is set to True it will also attempt to actually deploy it to the
    machine.

    """

    log.info("Associate key, deploy = %s" % deploy)
    
    if key_id not in user.keypairs:
        raise KeypairNotFoundError(key_id)
    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)

    keypair = user.keypairs[key_id]
    machine_uid = [backend_id, machine_id]

    # check if key already associated
    for machine in keypair.machines:
        if machine[:2] == machine_uid:
            log.info("Keypair '%s' already associated with machine '%s'"
                     % (key_id, machine_id))
            return

    # add machine to keypair's associated machines list
    with user.lock_n_load():
        keypair.append(machine_uid)
        user.save()

    #TODO
    if deploy:
        pass
        #~ ret = deploy_key(request, keypair)
    #~ 
        #~ if ret:
            #~ keypair['machines'][-1] += [int(time()), ret.get('ssh_user', ''), ret.get('sudoer', False)]
            #~ log.debug("Associate key, %s" % keypair['machines'])
            #~ return keypair['machines']
        #~ else:
            #~ if machine_uid in keypair['machines']:
                #~ keypair['machines'].remove(machine_uid)
            #~ log.debug("Disassociate key, %s" % keypair['machines'])
            #~ 
            #~ return Response('Failed to deploy key', 412)
    #~ else:
        #~ return keypair['machines']


def disassociate_key(user, key_id, backend_id, machine_id, undeploy=True):
    """Disassociates a key from a machine.

    If undeploy is set to True it will also attempt to actually remove it from
    the machine.

    """

    log.info("Disassociate key, undeploy = %s" % undeploy)
    
    if key_id not in user.keypairs:
        raise KeypairNotFoundError(key_id)
    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)

    keypair = user.keypairs[key_id]
    machine_uid = [backend_id, machine_id]
    key_found = False
    with user.lock_n_load():
        keypair = user.keypairs[key_id]
        for machine in keypair.machines:
            if machine[:2] == machine_uid:
                keypair.machines.remove(machine)
                user.save()
                key_found = True
                break

    #key not associated
    if not key_found: 
        raise BadRequestError("Keypair '%s' is not associated with "
                              "machine '%s'" % (key_id, machine_id), 304)

    if undeploy:
        pass

def deploy_key(user, keypair):
    raise NotImplementedError()
    #~ """Deploys the provided keypair to the machine.
#~ 
    #~ To do that it requires another keypair (existing_key) that can connect to
    #~ the machine.
#~ 
    #~ """
    #~ grep_output = '`grep \'%s\' ~/.ssh/authorized_keys`' % keypair['public']
    #~ command = 'if [ -z "%s" ]; then echo "%s" >> ~/.ssh/authorized_keys; fi' % (grep_output, keypair['public'])
    #~ host = request.json_body.get('host', None)
    #~ backend_id = request.json_body.get('backend_id', None)
    #~ machine_id = request.json_body.get('machine_id', None)
    #~ 
    #~ try:
        #~ ret = shell_command(request, backend_id, machine_id, host, command)
    #~ except:
        #~ pass
#~ 
    #~ # Maybe the deployment failed but let's try to connect with the new key and see what happens
    #~ with get_user(request, readonly=True) as user:
        #~ keypairs = user.get('keypairs',{})    
        #~ key_name = None
        #~ for key_name, k in keypairs.items():
            #~ if k == keypair:
                #~ break
#~ 
        #~ if key_name:
            #~ log.warn('probing with key %s' % key_name)
#~ 
        #~ if ret:
            #~ ssh_user = ret.get('ssh_user', None)
        #~ else:
            #~ ssh_user = None
#~ 
        #~ test = shell_command(request, backend_id, machine_id, host, 'whoami', ssh_user, key = key_name)
#~ 
        #~ return test


def undeploy_key(request, keypair):
    raise NotImplementedError()
    #~ """Removes the provided keypair from the machine.
#~ 
    #~ It connects to the server with the key that is supposed to be deleted.
#~ 
    #~ """
    #~ command = 'grep -v "' + keypair['public'] + '" ~/.ssh/authorized_keys ' +\
              #~ '> ~/.ssh/authorized_keys.tmp && ' +\
              #~ 'mv ~/.ssh/authorized_keys.tmp ~/.ssh/authorized_keys ' +\
              #~ '&& chmod go-w ~/.ssh/authorized_keys'
    #~ host = request.json_body.get('host', None)
    #~ backend_id = request.json_body.get('backend_id', None)
    #~ machine_id = request.json_body.get('machine_id', None)
                  #~ 
    #~ try:
        #~ ret = shell_command(request, backend_id, machine_id, host, command)
    #~ except:
        #~ return False
#~ 
    #~ return ret


def connect_provider(backend):
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

    if conn.type in [Provider.NEPHOSCALE,
                     Provider.DIGITAL_OCEAN,
                     Provider.SOFTLAYER]:
        can_stop = True

    if conn.type in (Provider.RACKSPACE_FIRST_GEN, Provider.LINODE, 
                     Provider.NEPHOSCALE, Provider.SOFTLAYER,
                     Provider.DIGITAL_OCEAN):
        can_tag = False

    # for other states
    if machine_from_api.state in (NodeState.REBOOTING, NodeState.PENDING):
        can_start = False
        can_stop = False
        can_reboot = False
    elif machine_from_api.state is NodeState.UNKNOWN:
        # We assume uknown state mean stopped
        if conn.type in (Provider.NEPHOSCALE, Provider.SOFTLAYER,
                         Provider.DIGITAL_OCEAN) or conn.type in EC2_PROVIDERS:
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


def list_machines(user, backend_id):
    if backend_id not in user.backends:
        raise BackendNotFoundError()
    conn = connect_provider(user.backends[backend_id])

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

        machine = {'id': m.id,
                   'uuid': m.get_uuid(),
                   'name': m.name,
                   'imageId': image_id,
                   'size': size,
                   'state': STATES[m.state],
                   'private_ips': m.private_ips,
                   'public_ips': m.public_ips,
                   'tags': tags,
                   'extra': m.extra,
                  }
        machine.update(get_machine_actions(m, conn))
        ret.append(machine)
    
    return ret


def create_machine(user, backend_id, key_id, machine_name, location_id,
                   image_id, size_id, script, image_extra, disk):

    """Creates a new virtual machine on the specified backend.

    If the backend is Rackspace it attempts to deploy the node with an ssh key
    provided in config. the method used is the only one working in the old
    Rackspace backend. create_node(), from libcloud.compute.base, with 'auth'
    kwarg doesn't do the trick. Didn't test if you can upload some ssh related
    files using the 'ex_files' kwarg from openstack 1.0 driver.

    In Linode creation is a bit different. There you can pass the key file
    directly during creation. The Linode API also requires to set a disk size
    and doesn't get it from size.id. So, send size.disk from the client and
    use it in all cases just to avoid provider checking. Finally, Linode API
    does not support association between a machine and the image it came from.
    We could set this, at least for machines created through mist.io in
    ex_comment, lroot or lconfig. lroot seems more appropriate. However,
    liblcoud doesn't support linode.config.list at the moment, so no way to
    get them. Also, it will create inconsistencies for machines created
    through mist.io and those from the Linode interface.

    """

    if backend_id not in user.backends:
        raise BackendNotFoundError()
    conn = connect_provider(user.backends[backend_id])

    if key_id and key_id not in user.keypairs:
        raise KeypairNotFoundError()

    # if key_id not provided, search for default key
    if not key_id:
        for kid in user.keypairs:
            if user.keypairs[kid].default:
                key_id = kid
                break
    if key_id is None:
        raise KeypairNotFoundError("Couldn't find default keypair")

    keypair = user.keypairs[key_id]
    private_key = keypair.private
    public_key = keypair.public

    size = NodeSize(size_id, name='', ram='', disk=disk,
                    bandwidth='', price='', driver=conn)
    image = NodeImage(image_id, name='', extra=image_extra, driver=conn)
    location = NodeLocation(location_id, name='', country='', driver=conn)

    if conn.type in [Provider.RACKSPACE_FIRST_GEN, 
                     Provider.RACKSPACE, 
                     Provider.OPENSTACK]:
        node = create_machine_openstack(conn, public_key, script, machine_name,
                                        image, size, location)
    elif conn.type in EC2_PROVIDERS and private_key:
        locations = conn.list_locations()
        for loc in locations:
            if loc.id == location_id:
                location = loc
                break
        node = create_machine_ec2(conn, key_id, private_key, public_key,
                                  script, machine_name, image, size, location)
    elif conn.type is Provider.NEPHOSCALE:
        node = create_machine_nephoscale(conn, key_id, private_key, public_key,
                                         script, machine_name, image, size,
                                         location)
    elif conn.type is Provider.SOFTLAYER:
        node = create_machine_softlayer(conn, key_id, private_key, public_key,
                                        script, machine_name, image, size,
                                        location)
    elif conn.type is Provider.DIGITAL_OCEAN:
        node = create_machine_digital_ocean(conn, key_id, private_key,
                                            public_key, script, machine_name,
                                            image, size, location)
    elif conn.type is Provider.LINODE and private_key:
        node = create_machine_linode(conn, key_id, private_key, public_key,
                                     script, machine_name, image, size,
                                     location)
    else:
        raise BadRequestError()

    # TODO associate key
    associate_key(user, key_id, backend_id, node.id, deploy=False)

    return {'id': node.id,
            'name': node.name,
            'extra': node.extra,
            'public_ips': node.public_ips,
            'private_ips': node.private_ips,
            }


def create_machine_openstack(conn, public_key, script, machine_name,
                             image, size, location):
    """Create a machine in Openstack.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """

    key = SSHKeyDeployment(str(public_key))
    deploy_script = ScriptDeployment(script)
    msd = MultiStepDeployment([key, deploy_script])
    try:
        node = conn.deploy_node(name=machine_name, image=image, size=size,
                                location=location, deploy=msd)
    except Exception as e:
        raise MachineCreationError("Rackspace, got exception %s" % e)
    return node


def create_machine_ec2(conn, key_name, private_key, public_key, script,
                       machine_name, image, size, location):
    """Create a machine in Amazon EC2.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """

    # import key. This is supported only for EC2 at the moment.
    (tmp_key_fd, tmp_key_path) = tempfile.mkstemp()
    key_fd = os.fdopen(tmp_key_fd, 'w+b')
    key_fd.write(public_key)
    key_fd.close()
    try:
        log.info("Attempting to import key (ec2-only)")
        conn.ex_import_keypair(name=key_name, keyfile=tmp_key_path)
    except Exception as exc:
        if 'Duplicate' in exc.message:
            log.debug('Key already exists, not importing anything.')
        else:
            log.error('Failed to import key.')
            raise InternalServerError("Failed to import key (ec2-only)")
    finally:
        os.remove(tmp_key_path)

    # create security group
    name = EC2_SECURITYGROUP.get('name', '')
    description = EC2_SECURITYGROUP.get('description', '')
    try:
        log.info("Attempting to create security group")
        conn.ex_create_security_group(name=name, description=description)
        conn.ex_authorize_security_group_permissive(name=name)
        return True
    except Exception as exc:
        if 'Duplicate' in exc.message:
            log.info('Security group already exists, not doing anything.')
        else:
            raise InternalServerError("Couldn't create security group")

    deploy_script = ScriptDeployment(script)
    (tmp_key_fd, tmp_key_path) = tempfile.mkstemp()
    key_fd = os.fdopen(tmp_key_fd, 'w+b')
    key_fd.write(private_key)
    key_fd.close()
    #deploy_node wants path for ssh private key
    try:
        node = conn.deploy_node(
            name=machine_name,
            image=image,
            size=size,
            deploy=deploy_script,
            location=location,
            ssh_key=tmp_key_path,
            ssh_alternate_usernames=['ec2-user', 'ubuntu'],
            max_tries=1,
            ex_keyname=key_name,
            ex_securitygroup=EC2_SECURITYGROUP['name']
        )
    except Exception as e:
        raise MachineCreationError("EC2, got exception %s" % e)
    finally:
        os.remove(tmp_key_path)
    return node


def create_machine_nephoscale(conn, key_name, private_key, public_key, script,
                              machine_name, image, size, location):
    """Create a machine in Nephoscale.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """

    machine_name = machine_name[:64].replace(' ', '-')
    # name in NephoScale must start with a letter, can contain mixed 
    # alpha-numeric characters, hyphen ('-') and underscore ('_')
    # characters, cannot exceed 64 characters, and can end with a 
    # letter or a number."

    # Hostname must start with a letter, can contain mixed alpha-numeric
    # characters and the hyphen ('-') character, cannot exceed 15 characters,
    # and can end with a letter or a number.
    key = public_key.replace('\n','')
    deploy_script = ScriptDeployment(script)        

    # NephoScale has 2 keys that need be specified, console and ssh key
    # get the id of the ssh key if it exists, otherwise add the key
    try:
        server_key = ''        
        keys = conn.ex_list_keypairs(ssh=True, key_group=1)
        for k in keys:
            if key == k.public_key:
                server_key = k.id
                break
        if not server_key:
            server_key = conn.ex_create_keypair(machine_name, public_key=key)
    except:
        server_key = conn.ex_create_keypair(
            'mistio' + str(random.randint(1,100000)),
            public_key=key)                          

    # mist.io does not support console key add through the wizzard.
    # Try to add one    
    try:
        console_key = conn.ex_create_keypair(
            'mistio' + str(random.randint(1,100000)),
            key_group=4)
    except:
        console_keys = conn.ex_list_keypairs(key_group=4)
        if console_keys:
            console_key = console_keys[0].id

    (tmp_key_fd, tmp_key_path) = tempfile.mkstemp()
    key_fd = os.fdopen(tmp_key_fd, 'w+b')
    key_fd.write(private_key)
    key_fd.close()

    try:
        node = conn.deploy_node(
            name=machine_name,
            hostname=machine_name[:15],
            image=image,
            size=size,
            zone=location.id,                             
            server_key=server_key,
            console_key=console_key,
            ssh_key=tmp_key_path,
            connect_attempts=20,
            ex_wait=True,
            deploy=deploy_script
        )
    except Exception as e:
        raise MachineCreationError("Nephoscale, got exception %s" % e)
    finally:
        os.remove(tmp_key_path)
    return node


def create_machine_softlayer(conn, key_name, private_key, public_key, script,
                             machine_name, image, size, location):
    """Create a machine in Softlayer.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """

    key = SSHKeyDeployment(public_key)
    deploy_script = ScriptDeployment(script)
    msd = MultiStepDeployment([key, deploy_script])
    if '.' in machine_name:
        domain = '.'.join(machine_name.split('.')[1:])
        name=machine_name.split('.')[0]
    else:
        domain = None
        name=machine_name
    (tmp_key_fd, tmp_key_path) = tempfile.mkstemp()
    key_fd = os.fdopen(tmp_key_fd, 'w+b')
    key_fd.write(private_key)
    key_fd.close()
    try:
        node = conn.deploy_node(
            name=name,
            ex_domain=domain,
            image=image,
            size=size,
            deploy=msd,
            location=location,
            ssh_key=tmp_key_path
        )
    except Exception as e:
        raise MachineCreationError("Softlayer, got exception %s" % e)
    finally:
        os.remove(tmp_key_path)
    return node


def create_machine_digital_ocean(conn, key_name, private_key, public_key,
                                 script, machine_name, image, size, location):
    """Create a machine in Digital Ocean.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """

    key = public_key.replace('\n','')
    deploy_script = ScriptDeployment(script)

    try:
        key = conn.ex_create_ssh_key(machine_name, key)
    except:
        key = conn.ex_create_ssh_key('mist.io', key)

    (tmp_key_fd, tmp_key_path) = tempfile.mkstemp()
    key_fd = os.fdopen(tmp_key_fd, 'w+b')
    key_fd.write(private_key)
    key_fd.close()
    try:
        node = conn.deploy_node(
            name=machine_name,
            image=image,
            size=size,
            ex_ssh_key_ids=[str(key.id)],
            location=location,
            ssh_key=tmp_key_path,
            ssh_alternate_usernames=['root']*5,
            #attempt to fix the Connection reset by peer exception
            #that is (most probably) created due to a race condition
            #while deploy_node establishes a connection and the 
            #ssh server is restarted on the created node
            private_networking=True,
            deploy=deploy_script
        )
    except Exception as e:
        raise MachineCreationError("Digital Ocean, got exception %s" % e)
    finally:
        os.remove(tmp_key_path)
    return node


def create_machine_linode(conn, key_name, private_key, public_key, script,
                          machine_name, image, size, location):
    """Create a machine in Linode.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """

    auth = NodeAuthSSHKey(public_key)
    deploy_script = ScriptDeployment(script)

    (tmp_key_fd, tmp_key_path) = tempfile.mkstemp()
    key_fd = os.fdopen(tmp_key_fd, 'w+b')
    key_fd.write(private_key)
    key_fd.close()
    try:
        node = conn.deploy_node(
            name=machine_name,
            image=image,
            size=size,
            deploy=deploy_script,
            location=location,
            auth=auth,
            ssh_key=tmp_key_path
        )
    except Exception as e:
        raise MachineCreationError("Linode, got exception %s" % e)
    finally:
        os.remove(tmp_key_path)
    return node


def _machine_action(user, backend_id, machine_id, action):
    """Start, stop, reboot and destroy have the same logic underneath, the only
    thing that changes is the action. This helper function saves us some code.

    """

    actions = ('start', 'stop', 'reboot', 'destroy')
    if action not in actions:
        raise BadRequestError("Action '%s' should be one of %s" % (action,
                                                                   actions))

    if backend_id not in user.backends:
        raise BackendNotFoundError()
    conn = connect_provider(user.backends[backend_id])
    machine = Node(machine_id,
                   name=machine_id,
                   state=0,
                   public_ips=[],
                   private_ips=[],
                   driver=conn)
    try:
        if action is 'start':
            # In liblcoud it is not possible to call this with machine.start()
            conn.ex_start_node(machine)
        elif action is 'stop':
            # In libcloud it is not possible to call this with machine.stop()
            conn.ex_stop_node(machine)
        elif action is 'reboot':
            machine.reboot()
        elif action is 'destroy':
            machine.destroy()
    except AttributeError:
        raise BadRequestError("Action %s not supported for this machine"
                              % action)
    except Exception as e:
        raise InternalServerError("Error while attempting to %s machine"
                                  % action)


def start_machine(user, backend_id, machine_id):
    """Starts a machine on backends that support it.

    Currently only EC2 supports that.
    .. note:: Normally try won't get an AttributeError exception because this
              action is not allowed for machines that don't support it. Check
              helpers.get_machine_actions.

    """

    _machine_action(user, backend_id, machine_id, 'start')


def stop_machine(user, backend_id, machine_id):
    """Stops a machine on backends that support it.

    Currently only EC2 supports that.
    .. note:: Normally try won't get an AttributeError exception because this
              action is not allowed for machines that don't support it. Check
              helpers.get_machine_actions.

    """

    _machine_action(user, backend_id, machine_id, 'stop')


def reboot_machine(user, backend_id, machine_id):
    """Reboots a machine on a certain backend."""

    _machine_action(user, backend_id, machine_id, 'reboot')


def destroy_machine(user, backend_id, machine_id):
    """Destroys a machine on a certain backend.

    After destroying a machine it also deletes all key associations. However,
    it doesn't undeploy the keypair. There is no need to do it because the
    machine will be destroyed.

    """

    _machine_action(user, backend_id, machine_id, 'destroy')

    pair = [backend_id, machine_id]
    with user.lock_n_load():
        for key_id in user.keypairs:
            keypair = user.keypairs[key_id]
            for machine in keypair.machines:
                if machine[:2] == pair:
                    disassociate_key(user, key_id, backend_id,
                                     machine_id, undeploy=False)


def run_command(user, backend_id, machine_id, host, command, key_id=None, password=None):
    """
    We initialize a Shell instant (for mist.io.shell).

    @param host: The host to connect to
    @param ssh_user: Username
    @param private_key: The private_key. We may not need to put one, as we may
    want to connect only with password (e.g. bare-metal server)
    @param command: Command to run
    @param password: Password. By default password is none, as we use private_key.
    However we may need to connect only with password (e.g. bare-metal server). In
    case both password and private_key are given, then the password is used for the
    private_key in case it needs password.
    @return:
    """

    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)
    if key_id is not None and key_id not in user.keypairs:
        raise KeypairNotFoundError(key_id)

    keypairs = user.keypairs
    pref_keys = [key_id] or get_preferred_keypairs(keypairs, backend_id, machine_id)
    shell = None

    for key_id in pref_keys:
        private_key = keypairs[key_id].private
        ssh_user = get_ssh_user_from_keypair(pref_keys[key_id], backend_id, machine_id)
        try:
            shell = Shell(host=host, username=ssh_user, pkey=private_key, password=password)
            break
        except Exception as e:
            log.warning(e)

    if shell is None:
        raise MachineUnauthorizedError()

    try:
        output, error = shell.command(command)
        shell.checkSudo()
        sudoer = shell.sudo
        shell.close_connection()

        with user.lock_n_load():
            for i in range(len(user.keypairs[key_id].machines)):
                machine = user.keypairs[key_id].machines[i]
                if [backend_id, machine_id] == machine[:2]:
                    assoc = [backend_id, machine_id, time(), ssh_user, sudoer]
                    user.keypairs[key_id].machines[i] = assoc
            user.save()

        return {'output': output, 'ssh_user': ssh_user, 'sudoer': sudoer}
    except Exception as e:
        log.warning(e)
    finally:
        shell.close_connection()


def list_images(user, backend_id, term=None):
    """List images from each backend. 
    Furthermore if a search_term is provided, we loop through each
    backend and search for that term in the ids and the names of 
    the community images"""

    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)

    backend = user.backends[backend_id]
    conn = connect_provider(backend)
    #~ try:
    starred = list(backend.starred)
    # Initialize arrays
    starred_images = []
    ec2_images = []
    rest_images = []
    images = []
    if conn.type in EC2_PROVIDERS:
        imgs = EC2_IMAGES[conn.type].keys() + starred
        ec2_images = conn.list_images(None, imgs)
        for image in ec2_images:
            image.name = EC2_IMAGES[conn.type].get(image.id, image.name)
    else:
        rest_images = conn.list_images()
        starred_images = [image for image in rest_images if image.id in starred]

    if term and conn.type in EC2_PROVIDERS:
        ec2_images += conn.list_images(ex_owner="self")
        ec2_images += conn.list_images(ex_owner="aws-marketplace")
        ec2_images += conn.list_images(ex_owner="amazon")

    images = starred_images + ec2_images + rest_images
    images = [img for img in images
                    if img.id[:3] not in ['aki', 'ari']
                    and img.id[:3] not in ['aki', 'ari']
                    and 'windows' not in img.name.lower()
                    and 'hvm' not in img.name.lower()
    ]

    if term: 
        images = [img for img in images
                        if term in img.id.lower()
                        or term in img.name.lower()
        ][:20]
    #~ except Exception as e:
        #~ log.error(e)
        #~ return Response('Backend unavailable', 503)
    
    ret = []
    for image in images:
        ret.append({'id': image.id, 'extra': image.extra,
                    'name': image.name, 'star': image.id in starred})
    return ret


def list_sizes(user, backend_id):
    """List sizes (aka flavors) from each backend."""

    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)
    backend = user.backends[backend_id]
    conn = connect_provider(backend)

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


def list_locations(user, backend_id):
    """List locations from each backend.

    Locations mean different things in each backend. e.g. EC2 uses it as a
    datacenter in a given availability zone, whereas Linode lists availability
    zones. However all responses share id, name and country eventhough in some
    cases might be empty, e.g. Openstack.

    In EC2 all locations by a provider have the same name, so the availability
    zones are listed instead of name.

    """

    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)
    backend = user.backends[backend_id]
    conn = connect_provider(backend)

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
