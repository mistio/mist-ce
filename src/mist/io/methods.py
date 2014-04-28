import logging
import random
import json
import requests
import subprocess
import re
from time import sleep
from datetime import datetime
from hashlib import sha256


from libcloud.compute.providers import get_driver
from libcloud.compute.base import Node, NodeSize, NodeImage, NodeLocation
from libcloud.compute.base import NodeAuthSSHKey
from libcloud.compute.deployment import MultiStepDeployment, ScriptDeployment
from libcloud.compute.deployment import SSHKeyDeployment
from libcloud.compute.types import Provider, NodeState
from libcloud.common.types import InvalidCredsError


try:
    from mist.core import config, model
    from mist.core.helpers import core_wrapper
except ImportError:
    from mist.io import config, model
    from mist.io.helpers import core_wrapper

from mist.io.shell import Shell
from mist.io.helpers import get_temp_file
from mist.io.helpers import get_auth_header
from mist.io.helpers import parse_ping
from mist.io.bare_metal import BareMetalDriver
from mist.io.exceptions import *

## # add curl ca-bundle default path to prevent libcloud certificate error
import libcloud.security
libcloud.security.CA_CERTS_PATH.append('cacert.pem')
libcloud.security.CA_CERTS_PATH.append('./src/mist.io/cacert.pem')

log = logging.getLogger(__name__)

HPCLOUD_AUTH_URL = 'https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0/tokens'
GCE_IMAGES = ['debian-cloud', 'centos-cloud', 'suse-cloud', 'rhel-cloud']

@core_wrapper
def add_backend(user, title, provider, apikey, apisecret, apiurl, tenant_name,
                machine_hostname="", region="", machine_key="", machine_user="",
                compute_endpoint="", port=22, remove_on_error=True):
    """Adds a new backend to the user and returns the new backend_id."""

    if not provider:
        raise RequiredParameterMissingError("provider")
    log.info("Adding new backend in provider '%s'", provider)

    baremetal = provider == 'bare_metal'
    if provider == 'bare_metal':
        if not machine_hostname:
            raise RequiredParameterMissingError('machine_hostname')
        if remove_on_error:
            if not machine_key:
                raise RequiredParameterMissingError('machine_key')
            if machine_key not in user.keypairs:
                raise KeypairNotFoundError(machine_key)
            if not machine_user:
                machine_user = 'root'

        machine = model.Machine()
        machine.dns_name = machine_hostname
        machine.ssh_port = port
        machine.public_ips = [machine_hostname]
        machine_id = machine_hostname.replace('.', '').replace(' ', '')
        machine.name = machine_hostname
        backend = model.Backend()
        backend.title = machine_hostname
        backend.provider = provider
        backend.enabled = True
        backend.machines[machine_id] = machine
        backend_id = backend.get_id()
        with user.lock_n_load():
            if backend_id in user.backends:
                raise BackendExistsError(backend_id)
            user.backends[backend_id] = backend
            # try to connect. this will either fail and we'll delete the
            # backend, or it will work and it will create the association
            if remove_on_error:
                try:
                    ssh_command(
                        user, backend_id, machine_id, machine_hostname, 'uptime',
                        key_id=machine_key, username=machine_user, password=None,
                        port=port
                    )
                except MachineUnauthorizedError as exc:
                    # remove backend
                    del user.backends[backend_id]
                    user.save()
                    raise BackendUnauthorizedError(exc)
            user.save()
    else:
        # if api secret not given, search if we already know it
        # FIXME: just pass along an empty apisecret
        if apisecret == 'getsecretfromdb':
            for backend_id in user.backends:
                if apikey == user.backends[backend_id].apikey:
                    apisecret = user.backends[backend_id].apisecret
                    break

        if not provider.__class__ is int and ':' in provider:
            provider, region = provider.split(':')[0], provider.split(':')[1]

        if remove_on_error:
            if not apikey:
                raise RequiredParameterMissingError("apikey")
            if not apisecret:
                raise RequiredParameterMissingError("apisecret")

        backend = model.Backend()
        backend.title = title
        backend.provider = provider
        backend.apikey = apikey
        backend.apisecret = apisecret
        backend.apiurl = apiurl
        backend.tenant_name = tenant_name
        backend.region = region

        #OpenStack specific: compute_endpoint is passed only when there is a
        # custom endpoint for the compute/nova-compute service
        backend.compute_endpoint = compute_endpoint
        backend.enabled = True

        #OpenStack does not like trailing slashes
        #so https://192.168.1.101:5000 will work but https://192.168.1.101:5000/ won't!
        if backend.provider == 'openstack':
            #Strip the v2.0 or v2.0/ at the end of the url if they are there
            if backend.apiurl.endswith('v2.0/'):
                backend.apiurl = backend.apiurl.strip('v2.0/')
            elif backend.apiurl.endswith('v2.0'):
                backend.apiurl = backend.apiurl.strip('v2.0')

            backend.apiurl = backend.apiurl.rstrip('/')

        #for HP Cloud
        if 'hpcloudsvc' in apiurl:
            backend.apiurl = HPCLOUD_AUTH_URL

        backend_id = backend.get_id()
        if backend_id in user.backends:
            raise BackendExistsError(backend_id)

        # validate backend before adding
        if remove_on_error:
            try:
                conn = connect_provider(backend)
            except:
                raise BackendUnauthorizedError()
            try:
                machines = conn.list_nodes()
            except InvalidCredsError:
                raise BackendUnauthorizedError()
            except Exception as exc:
                log.error("Error while trying list_nodes: %r", exc)
                raise BackendUnavailableError()

        with user.lock_n_load():
            user.backends[backend_id] = backend
            user.save()
    log.info("Backend with id '%s' added succesfully.", backend_id)
    return backend_id


def rename_backend(user, backend_id, new_name):
    """Renames backend with given backend_id."""

    log.info("Renaming backend: %s", backend_id)
    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)
    for backend in user.backends:
        if backend.title == new_name:
            raise BackendNameExistsError(new_name)
    with user.lock_n_load():
        user.backends[backend_id].title = new_name
        user.save()
    log.info("Succesfully renamed backend '%s'", backend_id)


@core_wrapper
def delete_backend(user, backend_id):
    """Deletes backend with given backend_id."""

    log.info("Deleting backend: %s", backend_id)

    # if a core/io installation, disable monitoring for machines
    try:
        from mist.core.methods import disable_monitoring_backend
    except ImportError:
        # this is a standalone io installation, don't bother
        pass
    else:
        # this a core/io installation, disable directly using core's function
        log.info("Disabling monitoring before deleting backend.")
        try:
            disable_monitoring_backend(user, backend_id)
        except Exception as exc:
            log.warning("Couldn't disable monitoring before deleting backend. "
                        "Error: %r", exc)

    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)
    with user.lock_n_load():
        del user.backends[backend_id]
        user.save()
    log.info("Succesfully deleted backend '%s'", backend_id)


@core_wrapper
def add_key(user, key_id, private_key):
    """Adds a new keypair and returns the new key_id."""

    log.info("Adding key with id '%s'.", key_id)
    if not key_id:
        raise KeypairParameterMissingError(key_id)
    if not private_key:
        raise RequiredParameterMissingError("Private key is not provided")

    if key_id in user.keypairs:
        raise KeypairExistsError(key_id)

    keypair = model.Keypair()
    keypair.private = private_key
    keypair.construct_public_from_private()
    keypair.default = not len(user.keypairs)
    keypair.machines = []

    if not keypair.isvalid():
        raise KeyValidationError()

    with user.lock_n_load():
        user.keypairs[key_id] = keypair
        user.save()

    log.info("Added key with id '%s'", key_id)
    return key_id


@core_wrapper
def delete_key(user, key_id):
    """Deletes given keypair.

    If key was default, then it checks
    if there are still keys left and assignes another one as default.

    @param user: The User
    @param key_id: The key_id to be deleted
    @return: Returns nothing

    """

    log.info("Deleting key with id '%s'.", key_id)
    if key_id not in user.keypairs:
        raise KeypairNotFoundError(key_id)

    keypair = user.keypairs[key_id]

    with user.lock_n_load():
        keypair = user.keypairs[key_id]
        del user.keypairs[key_id]

        if keypair.default and len(user.keypairs):
            other_key = user.keypairs.keys()[0]
            user.keypairs[other_key].default = True

        user.save()
    log.info("Deleted key with id '%s'.", key_id)


def set_default_key(user, key_id):
    """Sets a new default key

    @param user: The user
    @param key_id: The id of the key we want to set as default
    @return: Nothing. Raises only exceptions if needed.

    """

    log.info("Setting key with id '%s' as default.", key_id)
    keypairs = user.keypairs

    if not key_id in keypairs:
        raise KeypairNotFoundError(key_id)

    with user.lock_n_load():
        keypairs = user.keypairs
        for key in keypairs:
            if keypairs[key].default:
                keypairs[key].default = False
        keypairs[key_id].default = True
        user.save()
    log.info("Succesfully set key with id '%s' as default.", key_id)


def edit_key(user, new_key, old_key):
    """
    Edits a given key's name from old_key ---> new_key
    @param user: The User
    @param new_key: The new Key name (id)
    @param old_key: The old key name (id)
    @return: Nothing, only raises exceptions if needed

    """

    log.info("Renaming key '%s' to '%s'.", old_key, new_key)
    if not new_key:
        raise KeypairParameterMissingError("new name")
    if old_key not in user.keypairs:
        raise KeypairNotFoundError(old_key)

    if old_key == new_key:
        log.warning("Same name provided, will not edit key. No reason")
        return

    old_keypair = user.keypairs[old_key]
    with user.lock_n_load():
        del user.keypairs[old_key]
        user.keypairs[new_key] = old_keypair
        user.save()
    log.info("Renamed key '%s' to '%s'.", old_key, new_key)


@core_wrapper
def associate_key(user, key_id, backend_id, machine_id, host='', username=None, port=22):
    """Associates a key with a machine.

    If host is set it will also attempt to actually deploy it to the
    machine. To do that it requires another keypair (existing_key) that can
    connect to the machine.

    """

    log.info("Associating key %s to host %s", key_id, host)
    if not host:
        log.info("Host not given so will only create association without "
                 "actually deploying the key to the server.")
    if key_id not in user.keypairs:
        raise KeypairNotFoundError(key_id)
    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)

    keypair = user.keypairs[key_id]
    machine_uid = [backend_id, machine_id]

    # check if key already associated
    associated = False
    for machine in keypair.machines:
        if machine[:2] == machine_uid:
            log.warning("Keypair '%s' already associated with machine '%s' "
                        "in backend '%s'", key_id, backend_id, machine_id)
            associated = True
    # if not already associated, create the association
    # this is only needed if association doesn't exist and host is not provided
    # associations will otherwise be created by shell.autoconfigure upon
    # succesful connection
    if not host:
        if not associated:
            with user.lock_n_load():
                user.keypairs[key_id].machines.append(machine_uid)
                user.save()
        return

    # if host is specified, try to actually deploy
    log.info("Deploying key to machine.")
    filename = '~/.ssh/authorized_keys'
    grep_output = '`grep \'%s\' %s`' % (keypair.public, filename)
    new_line_check_cmd = (
        'if [ "$(tail -c1 %(file)s; echo x)" != "\\nx" ];'
        ' then echo "" >> %(file)s; fi' % {'file': filename}
    )
    append_cmd = ('if [ -z "%s" ]; then echo "%s" >> %s; fi'
                  % (grep_output, keypair.public, filename))
    command = new_line_check_cmd + " ; " + append_cmd
    log.debug("command = %s", command)

    try:
        # deploy key
        ssh_command(user, backend_id, machine_id, host, command, username=username, port=port)
    except MachineUnauthorizedError:
        # couldn't deploy key
        try:
            # maybe key was already deployed?
            ssh_command(user, backend_id, machine_id, host, 'uptime', key_id=key_id, username=username, port=port)
            log.info("Key was already deployed, local association created.")
        except MachineUnauthorizedError:
            # oh screw this
            raise MachineUnauthorizedError(
                "Couldn't connect to deploy new SSH keypair."
            )
    else:
        # deployment probably succeeded
        # attemp to connect with new key
        # if it fails to connect it'll raise exception
        # there is no need to manually set the association in keypair.machines
        # that is automatically handled by Shell, if it is configured by
        # shell.autoconfigure (which ssh_command does)
        ssh_command(user, backend_id, machine_id, host, 'uptime', key_id=key_id, username=username, port=port)
        log.info("Key associated and deployed succesfully.")


@core_wrapper
def disassociate_key(user, key_id, backend_id, machine_id, host=None):
    """Disassociates a key from a machine.

    If host is set it will also attempt to actually remove it from
    the machine.

    """

    log.info("Disassociating key, undeploy = %s" % host)

    if key_id not in user.keypairs:
        raise KeypairNotFoundError(key_id)
    ## if backend_id not in user.backends:
        ## raise BackendNotFoundError(backend_id)

    keypair = user.keypairs[key_id]
    machine_uid = [backend_id, machine_id]
    key_found = False
    for machine in keypair.machines:
        if machine[:2] == machine_uid:
            key_found = True
            break
    # key not associated
    if not key_found:
        raise BadRequestError("Keypair '%s' is not associated with "
                              "machine '%s'" % (key_id, machine_id))

    if host:
        log.info("Trying to actually remove key from authorized_keys.")
        command = 'grep -v "' + keypair.public +\
                  '" ~/.ssh/authorized_keys ' +\
                  '> ~/.ssh/authorized_keys.tmp ; ' +\
                  'mv ~/.ssh/authorized_keys.tmp ~/.ssh/authorized_keys ' +\
                  '&& chmod go-w ~/.ssh/authorized_keys'
        try:
            ssh_command(user, backend_id, machine_id, host, command)
        except:
            pass

    # removing key association
    with user.lock_n_load():
        keypair = user.keypairs[key_id]
        for machine in keypair.machines:
            if machine[:2] == machine_uid:
                keypair.machines.remove(machine)
                user.save()
                break


def connect_provider(backend):
    """Establishes backend connection using the credentials specified.

    It has been tested with:

        * EC2, and the alternative providers like EC2_EU,
        * Rackspace, old style and the new Nova powered one,
        * Openstack Diablo through Trystack, should also try Essex,
        * Linode

    Backend is expected to be a mist.io.model.Backend

    """
    if backend.provider != 'bare_metal':
        driver = get_driver(backend.provider)
    if backend.provider == Provider.OPENSTACK:
        if 'hpcloudsvc' in backend.apiurl:
            conn = driver(
                backend.apikey,
                backend.apisecret,
                ex_force_auth_version=backend.auth_version or '2.0_password',
                ex_force_auth_url=backend.apiurl,
                ex_tenant_name=backend.tenant_name or backend.apikey,
                ex_force_service_region = backend.region,
                ex_force_service_name='Compute'
            )
        else:
            conn = driver(
                backend.apikey,
                backend.apisecret,
                ex_force_auth_version=backend.auth_version or '2.0_password',
                ex_force_auth_url=backend.apiurl,
                ex_tenant_name=backend.tenant_name,
                ex_force_service_region=backend.region,
                ex_force_base_url=backend.compute_endpoint,
            )
    elif backend.provider == Provider.LINODE:
        conn = driver(backend.apisecret)
    elif backend.provider == Provider.GCE:
        conn = driver(backend.apikey, backend.apisecret, project=backend.tenant_name)
    elif backend.provider in [Provider.RACKSPACE_FIRST_GEN,
                              Provider.RACKSPACE]:
        conn = driver(backend.apikey, backend.apisecret,
                      region=backend.region)
    elif backend.provider in [Provider.NEPHOSCALE,
                              Provider.DIGITAL_OCEAN,
                              Provider.SOFTLAYER]:
        conn = driver(backend.apikey, backend.apisecret)
    elif backend.provider == 'bare_metal':
        conn = BareMetalDriver(backend.machines)
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
    can_stop = True
    can_destroy = True
    can_reboot = True
    can_tag = True

    if conn.type in (Provider.RACKSPACE_FIRST_GEN, Provider.LINODE,
                     Provider.NEPHOSCALE, Provider.SOFTLAYER,
                     Provider.DIGITAL_OCEAN):
        can_tag = False

    # for other states
    if machine_from_api.state in (NodeState.REBOOTING, NodeState.PENDING):
        can_start = False
        can_stop = False
        can_reboot = False
    elif machine_from_api.state in (NodeState.UNKNOWN, NodeState.STOPPED):
        # We assume unknown state mean stopped
        can_stop = False
        can_start = True
        can_reboot = False
    elif machine_from_api.state in (NodeState.TERMINATED,):
        can_start = False
        can_destroy = False
        can_stop = False
        can_reboot = False
        can_tag = False

    if conn.type == 'bare_metal':
        can_start = False
        can_destroy = False
        can_stop = False
        can_reboot = True
        can_tag = False

    if conn.type is Provider.GCE:
        can_start = False
        can_stop = False

    return {'can_stop': can_stop,
            'can_start': can_start,
            'can_destroy': can_destroy,
            'can_reboot': can_reboot,
            'can_tag': can_tag}


def list_machines(user, backend_id):
    """List all machines in this backend via API call to the provider."""

    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)
    conn = connect_provider(user.backends[backend_id])

    try:
        machines = conn.list_nodes()
    except InvalidCredsError:
        raise BackendUnauthorizedError()
    except Exception as exc:
        log.error("Error while running list_nodes: %r", exc)
        raise BackendUnavailableError()

    ret = []
    for m in machines:
        if m.driver.type == 'gce':
            #tags and metadata exist in GCE
            tags = m.extra.get('tags')
        else:
            tags = m.extra.get('tags') or m.extra.get('metadata') or {}
        if type(tags) == dict:
            tags = [value for key, value in tags.iteritems() if key != 'Name']

        if m.extra.get('availability', None):
            # for EC2
            tags.append(m.extra['availability'])
        elif m.extra.get('DATACENTERID', None):
            # for Linode
            tags.append(config.LINODE_DATACENTERS[m.extra['DATACENTERID']])

        image_id = m.image or m.extra.get('imageId', None)
        size = m.size or m.extra.get('flavorId', None)
        size = size or m.extra.get('instancetype', None)
        machine = {'id': m.id,
                   'uuid': m.get_uuid(),
                   'name': m.name,
                   'imageId': image_id,
                   'size': size,
                   'state': config.STATES[m.state],
                   'private_ips': m.private_ips,
                   'public_ips': m.public_ips,
                   'tags': tags,
                   'extra': m.extra}
        machine.update(get_machine_actions(m, conn))
        ret.append(machine)

    return ret


@core_wrapper
def create_machine(user, backend_id, key_id, machine_name, location_id,
                   image_id, size_id, script, image_extra, disk, image_name, size_name, location_name):

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
        raise BackendNotFoundError(backend_id)
    conn = connect_provider(user.backends[backend_id])

    if key_id and key_id not in user.keypairs:
        raise KeypairNotFoundError(key_id)

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

    #print "Key id: " + key_id
    #print "Public: " + public_key
    #print "Private: " + private_key

    size = NodeSize(size_id, name=size_name, ram='', disk=disk,
                    bandwidth='', price='', driver=conn)
    image = NodeImage(image_id, name=image_name, extra=image_extra, driver=conn)
    location = NodeLocation(location_id, name=location_name, country='', driver=conn)

    if conn.type in [Provider.RACKSPACE_FIRST_GEN,
                     Provider.RACKSPACE]:
        node = _create_machine_rackspace(conn, public_key, script, machine_name,
                                        image, size, location)
    elif conn.type in [Provider.OPENSTACK]:
        node = _create_machine_openstack(conn, private_key, public_key, script, machine_name,
                                        image, size, location)
    elif conn.type in config.EC2_PROVIDERS and private_key:
        locations = conn.list_locations()
        for loc in locations:
            if loc.id == location_id:
                location = loc
                break
        node = _create_machine_ec2(conn, key_id, private_key, public_key,
                                  script, machine_name, image, size, location)
    elif conn.type is Provider.NEPHOSCALE:
        node = _create_machine_nephoscale(conn, key_id, private_key, public_key,
                                         script, machine_name, image, size,
                                         location)
    elif conn.type is Provider.GCE:
        sizes = conn.list_sizes(location=location_name)
        for size in sizes:
            if size.id == size_id:
                size = size
                break
        node = _create_machine_gce(conn, key_id, private_key, public_key,
                                         script, machine_name, image, size,
                                         location)
    elif conn.type is Provider.SOFTLAYER:
        node = _create_machine_softlayer(conn, key_id, private_key, public_key,
                                        script, machine_name, image, size,
                                        location)
    elif conn.type is Provider.DIGITAL_OCEAN:
        node = _create_machine_digital_ocean(conn, key_id, private_key,
                                            public_key, script, machine_name,
                                            image, size, location)
    elif conn.type is Provider.LINODE and private_key:
        node = _create_machine_linode(conn, key_id, private_key, public_key,
                                     script, machine_name, image, size,
                                     location)
    else:
        raise BadRequestError("Provider unknown.")

    associate_key(user, key_id, backend_id, node.id)

    return {'id': node.id,
            'name': node.name,
            'extra': node.extra,
            'public_ips': node.public_ips,
            'private_ips': node.private_ips,
            }


def _create_machine_rackspace(conn, public_key, script, machine_name,
                             image, size, location):
    """Create a machine in Rackspace.

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


def _create_machine_openstack(conn, private_key, public_key, script, machine_name,
                             image, size, location):
    """Create a machine in Openstack.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    key = SSHKeyDeployment(str(public_key))
    deploy_script = ScriptDeployment(script)
    msd = MultiStepDeployment([key, deploy_script])
    key = str(public_key).replace('\n','')

    try:
        server_key = ''
        keys = conn.ex_list_keypairs()
        for k in keys:
            if key == k.public_key:
                server_key = k.name
                break
        if not server_key:
            server_key = conn.ex_import_keypair_from_string(name=machine_name, key_material=key)
            server_key = server_key.name
    except:
        server_key = conn.ex_import_keypair_from_string(name='mistio'+str(random.randint(1,100000)), key_material=key)
        server_key = server_key.name
    with get_temp_file(private_key) as tmp_key_path:
        try:
            node = conn.deploy_node(name=machine_name,
                image=image,
                size=size,
                location=location,
                deploy=msd,
                ssh_key=tmp_key_path,
                ssh_alternate_usernames=['ec2-user', 'ubuntu'],
                max_tries=1,
                ex_keyname=server_key)
        except Exception as e:
            raise MachineCreationError("OpenStack, got exception %s" % e)
    return node


def _create_machine_ec2(conn, key_name, private_key, public_key, script,
                       machine_name, image, size, location):
    """Create a machine in Amazon EC2.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """

    # import key. This is supported only for EC2 at the moment.
    with get_temp_file(public_key) as tmp_key_path:
        try:
            log.info("Attempting to import key (ec2-only)")
            conn.ex_import_keypair(name=key_name, keyfile=tmp_key_path)
        except Exception as exc:
            if 'Duplicate' in exc.message:
                log.debug('Key already exists, not importing anything.')
            else:
                log.error('Failed to import key.')
                raise BackendUnavailableError("Failed to import key "
                                              "(ec2-only): %r" % exc)

    # create security group
    name = config.EC2_SECURITYGROUP.get('name', '')
    description = config.EC2_SECURITYGROUP.get('description', '')
    try:
        log.info("Attempting to create security group")
        conn.ex_create_security_group(name=name, description=description)
        conn.ex_authorize_security_group_permissive(name=name)
    except Exception as exc:
        if 'Duplicate' in exc.message:
            log.info('Security group already exists, not doing anything.')
        else:
            raise InternalServerError("Couldn't create security group")

    deploy_script = ScriptDeployment(script)
    with get_temp_file(private_key) as tmp_key_path:
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
                ex_securitygroup=config.EC2_SECURITYGROUP['name']
            )
        except Exception as e:
            raise MachineCreationError("EC2, got exception %s" % e)
    return node


def _create_machine_nephoscale(conn, key_name, private_key, public_key, script,
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
    key = public_key.replace('\n', '')
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
            'mistio' + str(random.randint(1, 100000)),
            public_key=key
        )

    # mist.io does not support console key add through the wizzard.
    # Try to add one
    try:
        console_key = conn.ex_create_keypair(
            'mistio' + str(random.randint(1, 100000)),
            key_group=4
        )
    except:
        console_keys = conn.ex_list_keypairs(key_group=4)
        if console_keys:
            console_key = console_keys[0].id

    with get_temp_file(private_key) as tmp_key_path:
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
    return node


def _create_machine_softlayer(conn, key_name, private_key, public_key, script,
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
        name = machine_name.split('.')[0]
    else:
        domain = None
        name = machine_name
    with get_temp_file(private_key) as tmp_key_path:
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
    return node


def _create_machine_digital_ocean(conn, key_name, private_key, public_key,
                                 script, machine_name, image, size, location):
    """Create a machine in Digital Ocean.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """

    key = public_key.replace('\n', '')
    deploy_script = ScriptDeployment(script)

    try:
        key = conn.ex_create_ssh_key(machine_name, key)
    except:
        key = conn.ex_create_ssh_key('mist.io', key)

    with get_temp_file(private_key) as tmp_key_path:
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
    return node


def _create_machine_gce(conn, key_name, private_key, public_key,
                                 script, machine_name, image, size, location):
    """Create a machine in GCE.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    key = public_key.replace('\n', '')

    metadata = {'items': [{'key': 'startup-script', 'value': script},
                          {'key': 'sshKeys', 'value': 'user:%s' % key}]}
    with get_temp_file(private_key) as tmp_key_path:
        try:
            node = conn.create_node(
                name=machine_name,
                image=image,
                size=size,
                location=location,
                ex_metadata=metadata
            )
        except Exception as e:
            raise MachineCreationError("Google Compute Engine, got exception %s" % e)
    return node


def _create_machine_linode(conn, key_name, private_key, public_key, script,
                          machine_name, image, size, location):
    """Create a machine in Linode.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """

    auth = NodeAuthSSHKey(public_key)
    deploy_script = ScriptDeployment(script)

    with get_temp_file(private_key) as tmp_key_path:
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

    bare_metal = False
    if user.backends[backend_id].provider == 'bare_metal':
        bare_metal = True
    conn = connect_provider(user.backends[backend_id])
    #GCE needs machine.extra as well, so we need the real machine object
    try:
        for node in conn.list_nodes():
            if node.id == machine_id:
                machine = node
                break
    except:
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
            if bare_metal:
                try:
                    hostname = user.backends[backend_id].machines[machine_id].public_ips[0]
                    command = '$(command -v sudo) shutdown -r now'
                    ssh_command(user, backend_id, machine_id, hostname, command)
                    return True
                except:
                    return False
            else:
                machine.reboot()
        elif action is 'destroy':
            machine.destroy()
    except AttributeError:
        raise BadRequestError("Action %s not supported for this machine"
                              % action)

    except Exception as e:
        log.error("%r", e)
        raise MachineUnavailableError("Error while attempting to %s machine"
                                  % action)


def start_machine(user, backend_id, machine_id):
    """Starts a machine on backends that support it.

    Currently only EC2 supports that.
    Normally try won't get an AttributeError exception because this
    action is not allowed for machines that don't support it. Check
    helpers.get_machine_actions.

    """
    _machine_action(user, backend_id, machine_id, 'start')


def stop_machine(user, backend_id, machine_id):
    """Stops a machine on backends that support it.

    Currently only EC2 supports that.
    Normally try won't get an AttributeError exception because this
    action is not allowed for machines that don't support it. Check
    helpers.get_machine_actions.

    """
    _machine_action(user, backend_id, machine_id, 'stop')


def reboot_machine(user, backend_id, machine_id):
    """Reboots a machine on a certain backend."""
    _machine_action(user, backend_id, machine_id, 'reboot')


@core_wrapper
def destroy_machine(user, backend_id, machine_id):
    """Destroys a machine on a certain backend.

    After destroying a machine it also deletes all key associations. However,
    it doesn't undeploy the keypair. There is no need to do it because the
    machine will be destroyed.

    """

    # if machine has monitoring, disable it. the way we disable depends on
    # whether this is a standalone io installation or not
    disable_monitoring_function = None
    try:
        from mist.core.methods import disable_monitoring as dis_mon_core
        disable_monitoring_function = dis_mon_core
    except ImportError:
        # this is a standalone io installation, using io's disable_monitoring
        # if we have an authentication token for the core service
        if user.mist_api_token:
            disable_monitoring_function = disable_monitoring
    if disable_monitoring_function is not None:
        log.info("Will try to disable monitoring for machine before "
                 "destroying it (we don't bother to check if it "
                 "actually has monitoring enabled.")
        try:
            # we don't actually bother to undeploy collectd
            disable_monitoring_function(user, backend_id, machine_id,
                                        no_ssh=True)
        except Exception as exc:
            log.warning("Didn't manage to disable monitoring, maybe the "
                        "machine never had monitoring enabled. Error: %r", exc)

    _machine_action(user, backend_id, machine_id, 'destroy')

    pair = [backend_id, machine_id]
    with user.lock_n_load():
        for key_id in user.keypairs:
            keypair = user.keypairs[key_id]
            for machine in keypair.machines:
                if machine[:2] == pair:
                    disassociate_key(user, key_id, backend_id, machine_id)


def ssh_command(user, backend_id, machine_id, host, command,
                key_id=None, username=None, password=None, port=22):
    """
    We initialize a Shell instant (for mist.io.shell).

    Autoconfigures shell and returns command's output as string.
    Raises MachineUnauthorizedError if it doesn't manage to connect.

    """

    shell = Shell(host)
    key_id, ssh_user = shell.autoconfigure(user, backend_id, machine_id,
                                           key_id, username, password, port)
    output = shell.command(command)
    shell.disconnect()
    return output


def list_images(user, backend_id, term=None):
    """List images from each backend.

    Furthermore if a search_term is provided, we loop through each
    backend and search for that term in the ids and the names of
    the community images

    """

    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)

    backend = user.backends[backend_id]
    conn = connect_provider(backend)
    try:
        starred = list(backend.starred)
        # Initialize arrays
        starred_images = []
        ec2_images = []
        rest_images = []
        images = []
        if conn.type in config.EC2_PROVIDERS:
            imgs = config.EC2_IMAGES[conn.type].keys() + starred
            ec2_images = conn.list_images(None, imgs)
            for image in ec2_images:
                image.name = config.EC2_IMAGES[conn.type].get(image.id, image.name)
            ec2_images += conn.list_images(ex_owner="amazon")
            ec2_images += conn.list_images(ex_owner="self")
        elif conn.type == Provider.GCE:
            # Currently not other way to receive all images :(
            rest_images = conn.list_images()
            for OS in GCE_IMAGES:
                try:
                    gce_images = conn.list_images(ex_project=OS)
                    rest_images += gce_images
                except:
                    #eg ResourceNotFoundError
                    pass
            rest_images = [image for image in rest_images if not image.extra['deprecated']]
        else:
            rest_images = conn.list_images()
            starred_images = [image for image in rest_images
                              if image.id in starred]

        if term and conn.type in config.EC2_PROVIDERS:
            ec2_images += conn.list_images(ex_owner="aws-marketplace")

        images = starred_images + ec2_images + rest_images
        images = [img for img in images
                  if img.name and img.id[:3] not in ['aki', 'ari']
                  and 'windows' not in img.name.lower()
                  and 'hvm' not in img.name.lower()]

        if term:
            images = [img for img in images
                      if term in img.id.lower()
                      or term in img.name.lower()][:40]
    except Exception as e:
        log.error(repr(e))
        raise BackendUnavailableError(backend_id)

    ret = [{'id': image.id,
            'extra': image.extra,
            'name': image.name,
            'star': _image_starred(user, backend_id, image.id)}
           for image in images]
    return ret


def _image_starred(user, backend_id, image_id):
    """Check if an image should appear as starred or not to the user"""
    backend = user.backends[backend_id]
    if backend.provider.startswith('ec2'):
        default = False
        if backend.provider in config.EC2_IMAGES:
            if image_id in config.EC2_IMAGES[backend.provider]:
                default = True
    else:
        # consider all images default for backends with few images
        default = True
    starred = image_id in backend.starred
    unstarred = image_id in backend.unstarred
    return starred or (default and not unstarred)


def star_image(user, backend_id, image_id):
    """Toggle image star (star/unstar)"""

    with user.lock_n_load():
        backend = user.backends[backend_id]
        star = _image_starred(user, backend_id, image_id)
        if star:
            if image_id in backend.starred:
                backend.starred.remove(image_id)
            if image_id not in backend.unstarred:
                backend.unstarred.append(image_id)
        else:
            if image_id not in backend.starred:
                backend.starred.append(image_id)
            if image_id in backend.unstarred:
                backend.unstarred.remove(image_id)
        user.save()
    return not star


def list_sizes(user, backend_id):
    """List sizes (aka flavors) from each backend."""

    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)
    backend = user.backends[backend_id]
    conn = connect_provider(backend)

    try:
        if conn.type == Provider.GCE:
            #have to get sizes for one location only, since list_sizes returns
            #sizes for all zones (currently 88 sizes)
            sizes = conn.list_sizes(location='us-central1-a')
            sizes = [s for s in sizes if s.name and not s.name.endswith('-d')]
            #deprecated sizes for GCE

        else:
            sizes = conn.list_sizes()
    except:
        raise BackendUnavailableError(backend_id)

    ret = []
    for size in sizes:
        ret.append({'id': size.id,
                    'bandwidth': size.bandwidth,
                    'disk': size.disk,
                    'driver': size.driver.name,
                    'name': size.name,
                    'price': size.price,
                    'ram': size.ram})

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
        if conn.type in config.EC2_PROVIDERS:
            try:
                name = location.availability_zone.name
            except:
                name = location.name
        else:
            name = location.name

        ret.append({'id': location.id,
                    'name': name,
                    'country': location.country})

    return ret


def set_machine_metadata(user, backend_id, machine_id, tag):
    """Sets metadata for a machine, given the backend and machine id.

    Libcloud handles this differently for each provider. Linode and Rackspace,
    at least the old Rackspace providers, don't support metadata adding.

    machine_id comes as u'...' but the rest are plain strings so use == when
    comparing in ifs. u'f' is 'f' returns false and 'in' is too broad.

    """

    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)
    backend = user.backends[backend_id]
    if not tag:
        raise RequiredParameterMissingError("tag")
    conn = connect_provider(backend)

    if conn.type in [Provider.LINODE, Provider.RACKSPACE_FIRST_GEN]:
        raise MethodNotAllowedError("Adding metadata is not supported in %s"
                                    % conn.type)

    unique_key = 'mist.io_tag-' + datetime.now().isoformat()
    pair = {unique_key: tag}

    if conn.type in config.EC2_PROVIDERS:
        try:
            machine = Node(machine_id, name='', state=0, public_ips=[],
                           private_ips=[], driver=conn)
            conn.ex_create_tags(machine, pair)
        except:
            raise BackendUnavailableError(backend_id)
    else:
        machine = None
        try:
            for node in conn.list_nodes():
                if node.id == machine_id:
                    machine = node
                    break
        except:
            raise BackendUnavailableError(backend_id)
        if not machine:
            raise MachineNotFoundError(machine_id)
        if conn.type == 'gce':
            try:
                machine.extra['tags'].append(tag)
                conn.ex_set_node_tags(machine, machine.extra['tags'])
            except:
                raise InternalServerError("error creating tag")
        else:
            try:
                machine.extra['metadata'].update(pair)
                conn.ex_set_metadata(machine, machine.extra['metadata'])
            except:
                raise InternalServerError("error creating tag")


def delete_machine_metadata(user, backend_id, machine_id, tag):
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

    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)
    backend = user.backends[backend_id]
    if not tag:
        raise RequiredParameterMissingError("tag")
    conn = connect_provider(backend)

    if conn.type in [Provider.LINODE, Provider.RACKSPACE_FIRST_GEN]:
        raise MethodNotAllowedError("Deleting metadata is not supported in %s"
                                    % conn.type)

    machine = None
    try:
        for node in conn.list_nodes():
            if node.id == machine_id:
                machine = node
                break
    except:
        raise BackendUnavailableError(backend_id)
    if not machine:
        raise MachineNotFoundError(machine_id)

    if conn.type in config.EC2_PROVIDERS:
        tags = machine.extra.get('tags', None)
        pair = None
        for mkey, mdata in tags.iteritems():
            if tag == mdata:
                pair = {mkey: tag}
                break
        if not pair:
            raise NotFoundError("tag not found")

        try:
            conn.ex_delete_tags(machine, pair)
        except:
            raise BackendUnavailableError("Error deleting metadata in EC2")

    else:
        if conn.type == 'gce':
            try:
                machine.extra['tags'].remove(tag)
                conn.ex_set_node_tags(machine, machine.extra['tags'])
            except:
                raise InternalServerError("Error while updating metadata")
        else:
            tags = machine.extra.get('metadata', None)
            key = None
            for mkey, mdata in tags.iteritems():
                if tag == mdata:
                    key = mkey
            if key:
                tags.pop(key)
            else:
                raise NotFoundError("tag not found")

            try:
                conn.ex_set_metadata(machine, tags)
            except:
                BackendUnavailableError("Error while updating metadata")


def enable_monitoring(user, backend_id, machine_id,
                      name='', dns_name='', public_ips=None,
                      no_ssh=False, dry=False):
    """Enable monitoring for a machine."""
    backend = user.backends[backend_id]
    payload = {
        'action': 'enable',
        'no_ssh': True,
        'dry': dry,
        'name': name,
        'public_ips': ",".join(public_ips),
        'dns_name': dns_name,
        'backend_title': backend.title,
        'backend_provider': backend.provider,
        'backend_region': backend.region,
        'backend_apikey': backend.apikey,
        'backend_apisecret': backend.apisecret,
        'backend_apiurl': backend.apiurl,
        'backend_tenant_name': backend.tenant_name,
    }
    url_scheme = "%s/backends/%s/machines/%s/monitoring"
    try:
        resp = requests.post(
            url_scheme % (config.CORE_URI, backend_id, machine_id),
            data=json.dumps(payload),
            headers={'Authorization': get_auth_header(user)},
            verify=config.SSL_VERIFY
        )
    except requests.exceptions.SSLError as exc:
        log.error("%r", exc)
        raise SSLError()
    if not resp.ok:
        if resp.status_code == 402:
            raise PaymentRequiredError(resp.text.replace('Payment required: ', ''))
        else:
            raise ServiceUnavailableError()

    resp_dict = resp.json()
    host = resp_dict.get('host')
    deploy_kwargs = resp_dict.get('deploy_kwargs')
    command = deploy_collectd_command(deploy_kwargs)
    ret_dict = {
        'host': host,
        'deploy_kwargs': deploy_kwargs,
        'command': command,
    }
    if dry:
        return ret_dict
    stdout = ''
    if not no_ssh:
        stdout = ssh_command(user, backend_id, machine_id, host, command)
    ret_dict['cmd_output'] = stdout
    return ret_dict


def disable_monitoring(user, backend_id, machine_id, no_ssh=False):
    """Disable monitoring for a machine."""
    payload = {
        'action': 'disable',
        'no_ssh': True
    }
    url_scheme = "%s/backends/%s/machines/%s/monitoring"
    try:
        ret = requests.post(
            url_scheme % (config.CORE_URI, backend_id, machine_id),
            params=payload,
            headers={'Authorization': get_auth_header(user)},
            verify=config.SSL_VERIFY
        )
    except requests.exceptions.SSLError as exc:
        log.error("%r", exc)
        raise SSLError()
    if ret.status_code != 200:
        raise ServiceUnavailableError()

    ret_dict = json.loads(ret.content)
    host = ret_dict.get('host')

    stdout = ""
    try:
        if not no_ssh:
            stdout = _undeploy_collectd(user, backend_id, machine_id, host)
    except:
        pass
    return stdout


def deploy_collectd_command(deploy_kwargs):
    """Return command that must be run to deploy collectd on a machine."""
    parts = ["%s=%s" % (key, value) for key, value in deploy_kwargs.items()]
    query = "&".join(parts)
    url = "%s/deploy_script" % config.CORE_URI
    if query:
        url += "?" + query
    command = "$(command -v sudo) bash -c \"$(wget -O - %s '%s')\"" % (
        "--no-check-certificate" if not config.SSL_VERIFY else "",
        url,
    )
    return command


def _undeploy_collectd(user, backend_id, machine_id, host):
    """Uninstall collectd from the machine and return command's output"""

    #FIXME: do not hard-code stuff!
    check_collectd_dist = "if [ ! -d /opt/mistio-collectd/ ]; then $(command -v sudo) /etc/init.d/collectd stop ; $(command -v sudo) chmod -x /etc/init.d/collectd ; fi"
    disable_collectd = (
        "$(command -v sudo) rm -f /etc/cron.d/mistio-collectd "
        "&& $(command -v sudo) kill -9 "
        "`cat /opt/mistio-collectd/collectd.pid`"
    )

    shell = Shell(host)
    shell.autoconfigure(user, backend_id, machine_id)
    #FIXME: parse output and check for success/failure
    stdout = shell.command(check_collectd_dist)
    stdout += shell.command(disable_collectd)

    return stdout


def probe(user, backend_id, machine_id, host, key_id='', ssh_user=''):
    """Ping and SSH to machine and collect various metrics."""

    # start pinging the machine in the background
    log.info("Starting ping in the background for host %s", host)
    ping = subprocess.Popen(["ping", "-c", "10", "-i", "0.4", "-W", "1", "-q", host], stdout=subprocess.PIPE)

    # run SSH commands
    command = (
       "sudo -n uptime 2>&1|"
       "grep load|"
       "wc -l && "
       "echo -------- && "
       "uptime && "
       "echo -------- && "
       "if [ -f /proc/uptime ]; then cat /proc/uptime; "
       "else expr `date '+%s'` - `sysctl kern.boottime | sed -En 's/[^0-9]*([0-9]+).*/\\1/p'`;"
       "fi; "
       "echo -------- && "
       "if [ -f /proc/cpuinfo ]; then grep -c processor /proc/cpuinfo;"
       "else sysctl hw.ncpu | awk '{print $2}';"
       "fi;"
       "echo --------"
       #"cat ~/`grep '^AuthorizedKeysFile' /etc/ssh/sshd_config /etc/sshd_config 2> /dev/null |"
       #"awk '{print $2}'` 2> /dev/null || "
       #"cat ~/.ssh/authorized_keys 2> /dev/null"
    )

    log.warn('probing with key %s' % key_id)

    try:
        cmd_output = ssh_command(user, backend_id, machine_id,
                                 host, command, key_id=key_id)
    except:
        log.warning("SSH failed when probing, let's see what ping has to say.")
        cmd_output = ""

    # stop pinging
    #ping.send_signal(2)  # SIGINT to print stats and exit
    #sleep(0.1)
    #ping.kill()  # better safe than sorry
    ping_out = ping.stdout.read()
    ping.wait()
    log.info("ping output: %s" % ping_out)

    ret = {}
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
        # if len(cmd_output) > 4:
        #     updated_keys = update_available_keys(user, backend_id,
        #                                          machine_id, cmd_output[4])
        #     ret['updated_keys'] = updated_keys

    ret.update(parse_ping(ping_out))

    return ret


# def update_available_keys(user, backend_id, machine_id, authorized_keys):
#     keypairs = user.keypairs
#
#     # track which keypairs will be updated
#     updated_keypairs = {}
#     # get the actual public keys from the blob
#     ak = [k for k in authorized_keys.split('\n') if k.startswith('ssh')]
#
#     # for each public key
#     for pk in ak:
#         exists = False
#         pub_key = pk.strip().split(' ')
#         for k in keypairs:
#             # check if the public key already exists in our keypairs
#             if keypairs[k].public.strip().split(' ')[:2] == pub_key[:2]:
#                 exists = True
#                 associated = False
#                 # check if it is already associated with this machine
#                 for machine in keypairs[k].machines:
#                     if machine[:2] == [backend_id, machine_id]:
#                         associated = True
#                         break
#                 if not associated:
#                     with user.lock_n_load():
#                         keypairs[k].machines.append([backend_id, machine_id])
#                         user.save()
#                     updated_keypairs[k] = keypairs[k]
#             if exists:
#                 break
#
#     if updated_keypairs:
#         log.debug('update keypairs')
#
#     ret = [{'name': key,
#             'machines': keypairs[key].machines,
#             'pub': keypairs[key].public,
#             'default_key': keypairs[key].default
#             } for key in updated_keypairs]
#
#     return ret
