import os
import shutil
import random
import tempfile
import json
import requests
import subprocess
import re
from time import sleep, time
from datetime import datetime
from hashlib import sha256
from StringIO import StringIO
from tempfile import NamedTemporaryFile

from libcloud.compute.providers import get_driver
from libcloud.compute.base import Node, NodeSize, NodeImage, NodeLocation
from libcloud.compute.base import NodeAuthSSHKey
from libcloud.compute.deployment import MultiStepDeployment, ScriptDeployment
from libcloud.compute.deployment import SSHKeyDeployment
from libcloud.compute.types import Provider, NodeState
from libcloud.common.types import InvalidCredsError
from libcloud.utils.networking import is_private_subnet

import ansible.playbook
import ansible.utils.template
import ansible.callbacks
import ansible.utils
import ansible.constants

try:
    from mist.core import config, model
except ImportError:
    from mist.io import config, model

from mist.io.shell import Shell
from mist.io.helpers import get_temp_file
from mist.io.helpers import get_auth_header
from mist.io.helpers import parse_ping
from mist.io.bare_metal import BareMetalDriver
from mist.io.exceptions import *


from mist.io.helpers import trigger_session_update
from mist.io.helpers import amqp_publish_user
from mist.io.helpers import StdStreamCapture

import mist.io.tasks
import mist.io.inventory


## # add curl ca-bundle default path to prevent libcloud certificate error
import libcloud.security
libcloud.security.CA_CERTS_PATH.append('cacert.pem')
libcloud.security.CA_CERTS_PATH.append('./src/mist.io/cacert.pem')

import logging
logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)

HPCLOUD_AUTH_URL = 'https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0/tokens'
GCE_IMAGES = ['debian-cloud', 'centos-cloud', 'suse-cloud', 'rhel-cloud']


def add_backend(user, title, provider, apikey, apisecret, apiurl, tenant_name,
                machine_hostname="", region="", machine_key="", machine_user="",
                compute_endpoint="", port=22, docker_port=4243, remove_on_error=True):
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

        #docker url is the only piece needed in docker
        if remove_on_error and provider != 'docker':
            #a few providers need only the apisecret
            if not apikey and provider not in ['digitalocean', 'linode']:
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
        if provider == 'docker':
            backend.docker_port = docker_port
        #For digital ocean v2 of the API, only apisecret is needed.
        #However, in v1 both api_key and api_secret are needed. In order
        #for both versions to be supported (existing v1, and new v2 which
        #is now the default) we set api_key same to api_secret to
        #distinguish digitalocean v2 logins, to avoid adding another
        #arguement on digital ocean libcloud driver

        if provider == 'digitalocean':
            backend.apikey = backend.apisecret
        #OpenStack specific: compute_endpoint is passed only when there is a
        # custom endpoint for the compute/nova-compute service
        backend.compute_endpoint = compute_endpoint
        backend.enabled = True

        #OpenStack does not like trailing slashes
        #so https://192.168.1.101:5000 will work but https://192.168.1.101:5000/ won't!
        if backend.provider == 'openstack':
            #Strip the v2.0 or v2.0/ at the end of the url if they are there
            if backend.apiurl.endswith('/v2.0/'):
                backend.apiurl = backend.apiurl.split('/v2.0/')[0]
            elif backend.apiurl.endswith('/v2.0'):
                backend.apiurl = backend.apiurl.split('/v2.0')[0]

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
    trigger_session_update(user.email, ['backends'])
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
    trigger_session_update(user.email, ['backends'])


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
    trigger_session_update(user.email, ['backends'])


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
    trigger_session_update(user.email, ['keys'])
    return key_id


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
    trigger_session_update(user.email, ['keys'])


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
    trigger_session_update(user.email, ['keys'])


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
    trigger_session_update(user.email, ['keys'])


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
                assoc = [backend_id,
                         machine_id,
                         0,
                         username,
                         False,
                         port]
                user.keypairs[key_id].machines.append(assoc)
                user.save()
            trigger_session_update(user.email, ['keys'])
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
    trigger_session_update(user.email, ['keys'])


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
    if backend.provider == Provider.AZURE:
        #create a temp file and output the cert there, so that
        #Azure driver is instantiated by providing a string with the key instead of
        #a cert file
        temp_key_file = NamedTemporaryFile(delete=False)
        temp_key_file.write(backend.apisecret)
        temp_key_file.close()
        conn = driver(backend.apikey, temp_key_file.name)
    elif backend.provider == Provider.OPENSTACK:
        #keep this for backend compatibility, however we now use HPCLOUD
        #as separate provider
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
    elif backend.provider == Provider.HPCLOUD:
        conn = driver(backend.apikey, backend.apisecret, backend.tenant_name,
                      region=backend.region)
    elif backend.provider == Provider.LINODE:
        conn = driver(backend.apisecret)
    elif backend.provider == Provider.GCE:
        conn = driver(backend.apikey, backend.apisecret, project=backend.tenant_name)
    elif backend.provider == Provider.DOCKER:
        conn = driver(backend.apikey, backend.apisecret, backend.apiurl, backend.docker_port)
    elif backend.provider in [Provider.RACKSPACE_FIRST_GEN,
                              Provider.RACKSPACE]:
        conn = driver(backend.apikey, backend.apisecret,
                      region=backend.region)
    elif backend.provider in [Provider.NEPHOSCALE, Provider.SOFTLAYER]:
        conn = driver(backend.apikey, backend.apisecret)
    elif backend.provider == Provider.DIGITAL_OCEAN:
        if backend.apikey == backend.apisecret:  # API v2
            conn = driver(backend.apisecret)
        else:   # API v1
            driver = get_driver('digitalocean_first_gen')
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
                     Provider.DIGITAL_OCEAN, Provider.DOCKER, Provider.AZURE):
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

    if conn.type in [Provider.LINODE]:
        if machine_from_api.state is NodeState.PENDING:
        #after resize, node gets to pending mode, needs to be started
            can_start = True

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

        for k in m.extra.keys():
            try:
                json.dumps(m.extra[k])
            except TypeError:
                m.extra[k] = str(m.extra[k])

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


def create_machine(user, backend_id, key_id, machine_name, location_id,
                   image_id, size_id, script, image_extra, disk, image_name,
                   size_name, location_name, ips, monitoring, networks=[], ssh_port=22):

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
    log.info('Creating machine %s on backend %s' % (machine_name, backend_id))

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

    size = NodeSize(size_id, name=size_name, ram='', disk=disk,
                    bandwidth='', price='', driver=conn)
    image = NodeImage(image_id, name=image_name, extra=image_extra, driver=conn)
    location = NodeLocation(location_id, name=location_name, country='', driver=conn)
    if conn.type is Provider.DOCKER:
        node = _create_machine_docker(conn, machine_name, image_id, script, public_key=public_key)
        if key_id and key_id in user.keypairs:
            node_info = conn.inspect_node(node)
            try:
                ssh_port = int(node_info.extra['network_settings']['Ports']['22/tcp'][0]['HostPort'])
            except:
                pass
    elif conn.type in [Provider.RACKSPACE_FIRST_GEN,
                     Provider.RACKSPACE]:
        node = _create_machine_rackspace(conn, public_key, machine_name, image,
                                         size, location)
    elif conn.type in [Provider.OPENSTACK]:
        node = _create_machine_openstack(conn, private_key, public_key,
                                         machine_name, image, size, location, networks)
    elif conn.type is Provider.HPCLOUD:
        node = _create_machine_hpcloud(conn, private_key, public_key,
                                       machine_name, image, size, location)
    elif conn.type in config.EC2_PROVIDERS and private_key:
        locations = conn.list_locations()
        for loc in locations:
            if loc.id == location_id:
                location = loc
                break
        node = _create_machine_ec2(conn, key_id, private_key, public_key,
                                   machine_name, image, size, location)
    elif conn.type is Provider.NEPHOSCALE:
        node = _create_machine_nephoscale(conn, key_id, private_key, public_key,
                                          machine_name, image, size,
                                          location, ips)
    elif conn.type is Provider.GCE:
        sizes = conn.list_sizes(location=location_name)
        for size in sizes:
            if size.id == size_id:
                size = size
                break
        node = _create_machine_gce(conn, key_id, private_key, public_key,
                                         machine_name, image, size, location)
    elif conn.type is Provider.SOFTLAYER:
        node = _create_machine_softlayer(conn, key_id, private_key, public_key,
                                         machine_name, image, size,
                                         location)
    elif conn.type is Provider.DIGITAL_OCEAN:
        node = _create_machine_digital_ocean(conn, key_id, private_key,
                                             public_key, machine_name,
                                             image, size, location)
    elif conn.type == Provider.AZURE:
        node = _create_machine_azure(conn, key_id, private_key,
                                             public_key, machine_name,
                                             image, size, location, cloud_service_name=None)
    elif conn.type is Provider.LINODE and private_key:
        node = _create_machine_linode(conn, key_id, private_key, public_key,
                                      machine_name, image, size,
                                      location)
    else:
        raise BadRequestError("Provider unknown.")

    if conn.type == Provider.AZURE:
        #we have the username
        associate_key(user, key_id, backend_id, node.id,
                      username=node.extra.get('username'), port=ssh_port)
    else:
        associate_key(user, key_id, backend_id, node.id, port=ssh_port)

    if conn.type == Provider.AZURE:
        # for Azure, connect with the generated password, deploy the ssh key
        # when this is ok, it calss post_deploy for script/monitoring
        mist.io.tasks.azure_post_create_steps.delay(user.email, backend_id, node.id,
                                      monitoring, script, key_id,
                                      node.extra.get('username'), node.extra.get('password'), public_key)
    elif conn.type == Provider.RACKSPACE_FIRST_GEN:
        # for Rackspace First Gen, cannot specify ssh keys. When node is
        # created we have the generated password, so deploy the ssh key
        # when this is ok and call post_deploy for script/monitoring
        mist.io.tasks.rackspace_first_gen_post_create_steps.delay(user.email, backend_id, node.id,
                                      monitoring, script, key_id, node.extra.get('password'), public_key)
    else:
        if script or monitoring:
            mist.io.tasks.post_deploy_steps.delay(user.email, backend_id, node.id,
                                      monitoring, script, key_id)

    return {'id': node.id,
            'name': node.name,
            'extra': node.extra,
            'public_ips': node.public_ips,
            'private_ips': node.private_ips,
            }


def _create_machine_rackspace(conn, public_key, machine_name,
                             image, size, location):
    """Create a machine in Rackspace.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """

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
        try:
            server_key = conn.ex_import_keypair_from_string(name='mistio'+str(random.randint(1,100000)), key_material=key)
            server_key = server_key.name
        except AttributeError:
            # RackspaceFirstGenNodeDriver based on OpenStack_1_0_NodeDriver
            # has no support for keys. So don't break here, since create_node won't
            # include it anyway
            server_key = None

    try:
        node = conn.create_node(name=machine_name, image=image, size=size,
                                location=location, ex_keyname=server_key)
        return node
    except Exception as e:
        raise MachineCreationError("Rackspace, got exception %r" % e)


def _create_machine_openstack(conn, private_key, public_key, machine_name,
                             image, size, location, networks):
    """Create a machine in Openstack.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
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

    # select the right OpenStack network object
    available_networks = conn.ex_list_networks()
    try:
        chosen_networks = []
        for net in available_networks:
            if net.id in networks:
                chosen_networks.append(net)
    except:
        chosen_networks = []

    with get_temp_file(private_key) as tmp_key_path:
        try:
            node = conn.create_node(
                name=machine_name,
                image=image,
                size=size,
                location=location,
                ssh_key=tmp_key_path,
                ssh_alternate_usernames=['ec2-user', 'ubuntu'],
                max_tries=1,
                ex_keyname=server_key,
                networks=chosen_networks)
        except Exception as e:
            raise MachineCreationError("OpenStack, got exception %s" % e)
    return node


def _create_machine_hpcloud(conn, private_key, public_key, machine_name,
                             image, size, location):
    """Create a machine in HP Cloud.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
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

    #FIXME: Neutron API not currently supported by libcloud
    #need to pass the network on create node - can only omitted if one network only exists

    with get_temp_file(private_key) as tmp_key_path:
        try:
            node = conn.create_node(name=machine_name,
                image=image,
                size=size,
                location=location,
                ssh_key=tmp_key_path,
                ssh_alternate_usernames=['ec2-user', 'ubuntu'],
                max_tries=1,
                ex_keyname=server_key)
        except Exception as e:
            raise MachineCreationError("HP Cloud, got exception %s" % e)
    return node


def _create_machine_ec2(conn, key_name, private_key, public_key,
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

    with get_temp_file(private_key) as tmp_key_path:
        #deploy_node wants path for ssh private key
        try:
            node = conn.create_node(
                name=machine_name,
                image=image,
                size=size,
                location=location,
                ssh_key=tmp_key_path,
                max_tries=1,
                ex_keyname=key_name,
                ex_securitygroup=config.EC2_SECURITYGROUP['name']
            )
        except Exception as e:
            raise MachineCreationError("EC2, got exception %s" % e)

    return node


def _create_machine_nephoscale(conn, key_name, private_key, public_key,
                              machine_name, image, size, location, ips):
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
    if size.name and size.name.startswith('D'):
        baremetal=True
    else:
        baremetal=False

    with get_temp_file(private_key) as tmp_key_path:
        try:
            node = conn.create_node(
                name=machine_name,
                hostname=machine_name[:15],
                image=image,
                size=size,
                zone=location.id,
                server_key=server_key,
                console_key=console_key,
                ssh_key=tmp_key_path,
                baremetal=baremetal,
                ips=ips
            )
        except Exception as e:
            raise MachineCreationError("Nephoscale, got exception %s" % e)
        return node


def _create_machine_softlayer(conn, key_name, private_key, public_key,
                             machine_name, image, size, location):
    """Create a machine in Softlayer.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """

    key = str(public_key).replace('\n','')
    try:
        server_key = ''
        keys = conn.list_key_pairs()
        for k in keys:
            if key == k.key:
                server_key = k.id
                break
        if not server_key:
            server_key = conn.create_key_pair(machine_name, key)
            server_key = server_key.id
    except:
        server_key = conn.create_key_pair('mistio'+str(random.randint(1,100000)), key)
        server_key = server_key.id


    if '.' in machine_name:
        domain = '.'.join(machine_name.split('.')[1:])
        name = machine_name.split('.')[0]
    else:
        domain = None
        name = machine_name

    with get_temp_file(private_key) as tmp_key_path:
        try:
            node = conn.create_node(
                name=name,
                ex_domain=domain,
                image=image,
                size=size,
                location=location,
                sshKeys=server_key
            )
        except Exception as e:
            raise MachineCreationError("Softlayer, got exception %s" % e)
    return node

def _create_machine_docker(conn, machine_name, image, script, public_key=None):
    """Create a machine in docker.

    """

    try:
        if public_key:
            environment = ['PUBLIC_KEY=%s' % public_key.strip()]
        else:
            environment = None
        node = conn.create_node(
            name=machine_name,
            image=image,
            command=script,
            environment=environment,
        )
    except Exception as e:
        raise MachineCreationError("Docker, got exception %s" % e)

    return node

def _create_machine_digital_ocean(conn, key_name, private_key, public_key,
                                  machine_name, image, size, location):
    """Create a machine in Digital Ocean.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    key = public_key.replace('\n', '')

    #on API v1 list keys returns only ids, without actual public keys
    #So the check fails. If there's already a key with the same pub key,
    #create key call will fail!
    try:
        server_key = ''
        keys = conn.ex_list_ssh_keys()
        for k in keys:
            if key == k.pub_key:
                server_key = k
                break
        if not server_key:
            server_key = conn.ex_create_ssh_key(machine_name, key)
    except:
        try:
            server_key = conn.ex_create_ssh_key('mistio'+str(random.randint(1,100000)), key)
        except:
            #on API v1 if we can't create that key, means that key is already
            #on our account. Since we don't know the id, we pass all the ids
            server_keys = [str(key.id) for key in keys]

    if not server_key:
        ex_ssh_key_ids = server_keys
    else:
        ex_ssh_key_ids = [str(server_key.id)]

    with get_temp_file(private_key) as tmp_key_path:
        try:
            node = conn.create_node(
                name=machine_name,
                image=image,
                size=size,
                ex_ssh_key_ids=ex_ssh_key_ids,
                location=location,
                ssh_key=tmp_key_path,
                ssh_alternate_usernames=['root']*5,
                #attempt to fix the Connection reset by peer exception
                #that is (most probably) created due to a race condition
                #while deploy_node establishes a connection and the
                #ssh server is restarted on the created node
                private_networking=True,
            )
        except Exception as e:
            raise MachineCreationError("Digital Ocean, got exception %s" % e)

        return node


def _create_machine_azure(conn, key_name, private_key, public_key,
                                  machine_name, image, size, location, cloud_service_name):
    """Create a machine Azure.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    key = public_key.replace('\n', '')
    with get_temp_file(private_key) as tmp_key_path:
        try:
            node = conn.create_node(
                name=machine_name,
                size=size,
                image=image,
                location=location,
                ex_cloud_service_name=cloud_service_name
            )
        except Exception as e:
            try:
                #get to get the message only out of the XML response
                msg = re.search(r"(<Message>)(.*?)(</Message>)", e.value).group(2)
            except:
                msg = e
            raise MachineCreationError('Azure, got exception %s' % msg)

        return node


def _create_machine_gce(conn, key_name, private_key, public_key, machine_name,
                        image, size, location):
    """Create a machine in GCE.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    key = public_key.replace('\n', '')

    metadata = {#'startup-script': script,
                'sshKeys': 'user:%s' % key}
    #metadata for ssh user, ssh key and script to deploy

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


def _create_machine_linode(conn, key_name, private_key, public_key,
                          machine_name, image, size, location):
    """Create a machine in Linode.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """

    auth = NodeAuthSSHKey(public_key)

    with get_temp_file(private_key) as tmp_key_path:
        try:
            node = conn.create_node(
                name=machine_name,
                image=image,
                size=size,
                location=location,
                auth=auth,
                ssh_key=tmp_key_path
            )
        except Exception as e:
            raise MachineCreationError("Linode, got exception %s" % e)
    return node


def _machine_action(user, backend_id, machine_id, action, plan_id=None):
    """Start, stop, reboot, resize and destroy have the same logic underneath, the only
    thing that changes is the action. This helper function saves us some code.

    """
    actions = ('start', 'stop', 'reboot', 'destroy', 'resize')

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
    machine = None
    try:
        if conn.type == 'azure':
            #Azure needs the cloud service specified as well as the node
            cloud_service = conn.get_cloud_service_from_node_id(machine_id)
            nodes = conn.list_nodes(ex_cloud_service_name=cloud_service)
            for node in nodes:
                if node.id == machine_id:
                    machine = node
                    break
        else:
            for node in conn.list_nodes():
                if node.id == machine_id:
                    machine = node
                    break
        if machine is None:
            #did not find the machine_id on the list of nodes, still do not fail
            raise MachineUnavailableError("Error while attempting to %s machine"
                                  % action)
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
            if conn.type == 'azure':
                conn.ex_start_node(machine, ex_cloud_service_name=cloud_service)
            else:
                conn.ex_start_node(machine)

            if conn.type is Provider.DOCKER:
                node_info = conn.inspect_node(node)
                try:
                    port = node_info.extra['network_settings']['Ports']['22/tcp'][0]['HostPort']
                except KeyError:
                    port = 22

                with user.lock_n_load():
                    machine_uid = [backend_id, machine_id]

                    for keypair in user.keypairs:
                        for machine in user.keypairs[keypair].machines:
                            if machine[:2] == machine_uid:
                                key_id = keypair
                                machine[-1] = int(port)
                    user.save()

        elif action is 'stop':
            # In libcloud it is not possible to call this with machine.stop()
            if conn.type == 'azure':
                conn.ex_stop_node(machine, ex_cloud_service_name=cloud_service)
            else:
                conn.ex_stop_node(machine)
        elif action is 'resize':
            conn.ex_resize_node(node, plan_id)
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
                if conn.type == 'azure':
                    conn.reboot_node(machine, ex_cloud_service_name=cloud_service)
                else:
                    machine.reboot()
                if conn.type is Provider.DOCKER:
                    node_info = conn.inspect_node(node)
                    try:
                        port = node_info.extra['network_settings']['Ports']['22/tcp'][0]['HostPort']
                    except KeyError:
                        port = 22

                    with user.lock_n_load():
                        machine_uid = [backend_id, machine_id]

                        for keypair in user.keypairs:
                            for machine in user.keypairs[keypair].machines:
                                if machine[:2] == machine_uid:
                                    key_id = keypair
                                    machine[-1] = int(port)
                        user.save()

        elif action is 'destroy':
            if conn.type is Provider.DOCKER and node.state == 0:
                conn.ex_stop_node(node)
                machine.destroy()
            elif conn.type == 'azure':
                conn.destroy_node(machine, ex_cloud_service_name=cloud_service)
            else:
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


def resize_machine(user, backend_id, machine_id, plan_id):
    """Resize a machine on an other plan."""
    _machine_action(user, backend_id, machine_id, 'resize', plan_id=plan_id)


def destroy_machine(user, backend_id, machine_id):
    """Destroys a machine on a certain backend.

    After destroying a machine it also deletes all key associations. However,
    it doesn't undeploy the keypair. There is no need to do it because the
    machine will be destroyed.

    """

    log.info('Destroying machine %s in backend %s' % (machine_id, backend_id))
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
    retval, output = shell.command(command)
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
        elif conn.type == Provider.AZURE:
            # do not show Microsoft Windows images
            # from Azure's response we can't know which images are default
            rest_images = conn.list_images()
            rest_images = [image for image in rest_images if 'windows' not in image.name.lower()
                           and 'RightImage' not in image.name and 'Barracuda' not in image.name and 'BizTalk' not in image.name]
            temp_dict = {}
            for image in rest_images:
                temp_dict[image.name] = image
            #there are many builds for some images -eg Ubuntu). All have the same name!
            rest_images = sorted(temp_dict.values(), key=lambda k: k.name)
        elif conn.type == Provider.DOCKER:
            #get mist.io default docker images from config
            rest_images = [NodeImage(id=image, name=name, driver=conn, extra={})
                              for image, name in config.DOCKER_IMAGES.items()]
            rest_images += conn.list_images()
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

        if term and conn.type == 'docker':
            images = conn.search_images(term=term)[:40]
        #search directly on docker registry for the query
        elif term:
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
    elif backend.provider == 'docker':
        # do not consider docker backend's images as default
        default = False
        if image_id in config.DOCKER_IMAGES:
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
    task = mist.io.tasks.ListImages()
    task.clear_cache(user.email, backend_id)
    task.delay(user.email, backend_id)
    return not star


def list_backends(user):
    ret = []
    for backend_id in user.backends:
        backend = user.backends[backend_id]
        ret.append({'id': backend_id,
                    'apikey': backend.apikey,
                    'title': backend.title or backend.provider,
                    'provider': backend.provider,
                    'poll_interval': backend.poll_interval,
                    'state': 'online' if backend.enabled else 'offline',
                    # for Provider.RACKSPACE_FIRST_GEN
                    'region': backend.region,
                    # for Provider.RACKSPACE (the new Nova provider)
                    ## 'datacenter': backend.datacenter,
                    'enabled': backend.enabled})
    return ret


def list_keys(user):
    return [{'id': key,
             'machines': user.keypairs[key].machines,
             'isDefault': user.keypairs[key].default}
            for key in user.keypairs]


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
        elif conn.type == Provider.NEPHOSCALE:
            sizes = conn.list_sizes(baremetal=False)
            dedicated = conn.list_sizes(baremetal=True)
            sizes.extend(dedicated)
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


def list_networks(user, backend_id):
    """List networks from each backend.
    Currently NephoScale and Openstack networks are supported. For other providers
    this returns an empty list

    """

    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)
    backend = user.backends[backend_id]
    conn = connect_provider(backend)

    ret = []
    if conn.type in [Provider.NEPHOSCALE]:
        networks = conn.ex_list_networks()

        for network in networks:
            ret.append({
                'id': network.id,
                'name': network.name,
                'extra': network.extra,
            })

        return ret
    elif conn.type in [Provider.OPENSTACK]:
        networks = conn.ex_list_neutron_networks()
        for network in networks:
            ret.append(openstack_network_to_dict(network))
        return ret
    else:
        return ret


def openstack_network_to_dict(network):
    net = {}
    net['name'] = network.name
    net['id'] = network.id
    net['status'] = network.status

    net['subnets'] = []
    for sub in network.subnets:

        net['subnets'].append(openstack_subnet_to_dict(sub))
    return net


def openstack_subnet_to_dict(subnet):
    net = {}

    net['name'] = subnet.name
    net['id'] = subnet.id
    net['cidr'] = subnet.cidr
    net['enable_dhcp'] = subnet.enable_dhcp
    net['dns_nameservers'] = subnet.dns_nameservers
    net['allocation_pools'] = subnet.allocation_pools
    net['gateway_ip'] = subnet.gateway_ip

    return net


def create_network(user, backend_id, network, subnet):
    """
    Creates a new network. If subnet dict is specified, after creating the network
    it will use the new network's id to create a subnet

    """
    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)
    backend = user.backends[backend_id]

    conn = connect_provider(backend)
    if conn.type is not Provider.OPENSTACK:
        raise NetworkActionNotSupported()

    try:
        network_name = network.get('name')
    except Exception as e:
        raise RequiredParameterMissingError(e)

    admin_state_up = network.get('admin_state_up', True)
    shared = network.get('shared', False)

    # First we create the network
    try:
        new_network = conn.ex_create_neutron_network(name=network_name, admin_state_up=admin_state_up, shared=shared)
    except Exception as e:
        raise NetworkCreationError("Got error r%" % e)

    ret = dict()
    if subnet:
        network_id = new_network.id

        try:
            subnet_name = subnet.get('name')
            cidr = subnet.get('cidr')
        except Exception as e:
            raise RequiredParameterMissingError(e)

        allocation_pools = subnet.get('allocation_pools', [])
        gateway_ip = subnet.get('gateway_ip', None)
        ip_version = subnet.get('ip_version', '4')
        enable_dhcp = subnet.get('enable_dhcp', True)

        try:
            subnet = conn.ex_create_neutron_subnet(name=subnet_name, network_id=network_id, cidr=cidr,
                                                   allocation_pools=allocation_pools, gateway_ip=gateway_ip,
                                                   ip_version=ip_version, enable_dhcp=enable_dhcp)
        except Exception as e:
            conn.ex_delete_neutron_network(network_id)
            raise NetworkError(e)

        ret['network'] = openstack_network_to_dict(new_network)
        ret['network']['subnets'].append(openstack_subnet_to_dict(subnet))

    else:
        ret = openstack_network_to_dict(new_network)

    task = mist.io.tasks.ListNetworks()
    task.clear_cache(user.email, backend_id)
    trigger_session_update(user.email, ['backends'])
    return ret


def delete_network(user, backend_id, network_id):
    """
    Delete a neutron network

    """
    if backend_id not in user.backends:
        raise BackendNotFoundError(backend_id)
    backend = user.backends[backend_id]

    conn = connect_provider(backend)
    if conn.type is not Provider.OPENSTACK:
        raise NetworkActionNotSupported()

    try:
        conn.ex_delete_neutron_network(network_id)
    except Exception as e:
        raise NetworkError(e)

    try:
        task = mist.io.tasks.ListNetworks()
        task.clear_cache(user.email, backend_id)
        trigger_session_update(user.email, ['backends'])
    except Exception as e:
        pass


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


def check_monitoring(user):
    """Ask the mist.io service if monitoring is enabled for this machine."""
    try:
        ret = requests.get(config.CORE_URI + '/monitoring',
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
    ret_dict = resp.json()

    if dry:
        return ret_dict

    if not no_ssh:
        mist.io.tasks.deploy_collectd.delay(user.email, backend_id, machine_id,
                                            ret_dict['extra_vars'])

    trigger_session_update(user.email, ['monitoring'])

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

    if not no_ssh:
        mist.io.tasks.undeploy_collectd.delay(user.email,
                                              backend_id, machine_id)
    trigger_session_update(user.email, ['monitoring'])


def probe(user, backend_id, machine_id, host, key_id='', ssh_user=''):
    """Ping and SSH to machine and collect various metrics."""

    if not host:
        raise RequiredParameterMissingError('host')

    # start pinging the machine in the background
    log.info("Starting ping in the background for host %s", host)
    ping = subprocess.Popen(
        ["ping", "-c", "10", "-i", "0.4", "-W", "1", "-q", host],
        stdout=subprocess.PIPE
    )
    try:
        ret = probe_ssh_only(user, backend_id, machine_id, host,
                             key_id=key_id, ssh_user=ssh_user)
    except:
        log.warning("SSH failed when probing, let's see what ping has to say.")
        ret = {}
    ping_out = ping.stdout.read()
    ping.wait()
    log.info("ping output: %s" % ping_out)
    ret.update(parse_ping(ping_out))
    return ret


def probe_ssh_only(user, backend_id, machine_id, host, key_id='', ssh_user=''):
    """Ping and SSH to machine and collect various metrics."""

    # run SSH commands
    command = (
       "echo \""
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
       "echo -------- && "
       "/sbin/ifconfig;"
       "echo --------"
       "\"|sh" # In case there is a default shell other than bash/sh (e.g. csh)
    )

    if key_id:
        log.warn('probing with key %s' % key_id)

    cmd_output = ssh_command(user, backend_id, machine_id,
                             host, command, key_id=key_id)
    cmd_output = cmd_output.replace('\r\n','').split('--------')
    log.warn(cmd_output)
    uptime_output = cmd_output[1]
    loadavg = re.split('load averages?: ', uptime_output)[1].split(', ')
    users = re.split(' users?', uptime_output)[0].split(', ')[-1].strip()
    uptime = cmd_output[2]
    cores = cmd_output[3]
    ips = re.findall('inet addr:(\S+)', cmd_output[4])
    if '127.0.0.1' in ips:
        ips.remove('127.0.0.1')
    pub_ips = find_public_ips(ips)
    priv_ips = [ip for ip in ips if ip not in pub_ips]
    return {
        'uptime': uptime,
        'loadavg': loadavg,
        'cores': cores,
        'users': users,
        'pub_ips': pub_ips,
        'priv_ips': priv_ips,
        'timestamp': time(),
    }


def ping(host):
    ping = subprocess.Popen(
        ["ping", "-c", "10", "-i", "0.4", "-W", "1", "-q", host],
        stdout=subprocess.PIPE
    )
    ping_out = ping.stdout.read()
    ping.wait()
    return parse_ping(ping_out)


def find_public_ips(ips):
    public_ips = []
    for ip in ips:
        #is_private_subnet does not check for ipv6
        try:
            if not is_private_subnet(ip):
                public_ips.append(ip)
        except:
            pass
    return public_ips


def notify_admin(title, message=""):
    """ This will only work on a multi-user setup configured to send emails """
    try:
        from mist.core.helpers import send_email
        send_email(title, message, config.NOTIFICATION_EMAIL)
    except ImportError:
        pass


def notify_user(user, title, message="", **kwargs):
    # Notify connected user via amqp
    payload = {'title': title, 'message': message}
    payload.update(kwargs)
    if 'command' in kwargs:
        output = '%s\n' % kwargs['command']
        if 'output' in kwargs:
            output += '%s\n' % kwargs['output']
        if 'retval' in kwargs:
            output += 'returned with exit code %d.\n' % kwargs['retval']
        payload['output'] = output
    amqp_publish_user(user, routing_key='notify', data=payload)

    body = message + '\n' if message else ''
    if 'backend_id' in kwargs:
        backend_id = kwargs['backend_id']
        backend = user.backends[backend_id]
        body += "Backend:\n  Name: %s\n  Id: %s\n" % (backend.title,
                                                      backend_id)
        if 'machine_id' in kwargs:
            machine_id = kwargs['machine_id']
            body += "Machine:\n"
            if kwargs.get('machine_name'):
                name = kwargs['machine_name']
            else:
                try:
                    name = backend.machines[machine_id].name
                except MachineNotFoundError:
                    name = ''
            if name:
                body += "  Name: %s\n" % name
            title += " for machine %s" % (name or machine_id)
            body += "  Id: %s\n" % machine_id
    if 'error' in kwargs:
        error = kwargs['error']
        body += "Result: %s\n" % ('Success' if not error else 'Error')
        if error and error is not True:
            body += "Error: %s" % error
    if 'command' in kwargs:
        body += "Command: %s\n" % kwargs['command']
    if 'retval' in kwargs:
        body += "Return value: %s\n" % kwargs['retval']
    if 'duration' in kwargs:
        body += "Duration: %.2f secs\n" % kwargs['duration']
    if 'output' in kwargs:
        body += "Output: %s\n" % kwargs['output']

    try: # Send email in multi-user env
        from mist.core.helpers import send_email
        send_email("[mist.io] %s" % title, body, user.email)
    except ImportError:
        pass


def find_metrics(user, backend_id, machine_id):
    url = "%s/backends/%s/machines/%s/metrics" % (config.CORE_URI,
                                                  backend_id, machine_id)
    headers={'Authorization': get_auth_header(user)}
    try:
        resp = requests.get(url, headers=headers, verify=config.SSL_VERIFY)
    except requests.exceptions.SSLError as exc:
        raise SSLError()
    except Exception as exc:
        log.error("Exception requesting find_metrics: %r", exc)
        raise ServiceUnavailableError()
    if not resp.ok:
        log.error("Error in find_metrics %d:%s", resp.status_code, resp.text)
        raise ServiceUnavailableError(resp.text)
    return resp.json()


def assoc_metric(user, backend_id, machine_id, metric_id):
    url = "%s/backends/%s/machines/%s/metrics" % (config.CORE_URI,
                                                  backend_id, machine_id)
    try:
        resp = requests.put(url,
                            headers={'Authorization': get_auth_header(user)},
                            params={'metric_id': metric_id},
                            verify=config.SSL_VERIFY)
    except requests.exceptions.SSLError as exc:
        raise SSLError()
    except Exception as exc:
        log.error("Exception requesting assoc_metric: %r", exc)
        raise ServiceUnavailableError()
    if not resp.ok:
        log.error("Error in assoc_metric %d:%s", resp.status_code, resp.text)
        raise ServiceUnavailableError(resp.text)
    trigger_session_update(user.email, [])


def disassoc_metric(user, backend_id, machine_id, metric_id):
    url = "%s/backends/%s/machines/%s/metrics" % (config.CORE_URI,
                                                  backend_id, machine_id)
    try:
        resp = requests.delete(url,
                               headers={'Authorization': get_auth_header(user)},
                               params={'metric_id': metric_id},
                               verify=config.SSL_VERIFY)
    except requests.exceptions.SSLError as exc:
        raise SSLError()
    except Exception as exc:
        log.error("Exception requesting disassoc_metric: %r", exc)
        raise ServiceUnavailableError()
    if not resp.ok:
        log.error("Error in disassoc_metric %d:%s", resp.status_code, resp.text)
        raise ServiceUnavailableError(resp.text)
    trigger_session_update(user.email, [])


def update_metric(user, metric_id, name=None, unit=None,
                  backend_id=None, machine_id=None):
    url = "%s/metrics/%s" % (config.CORE_URI, metric_id)
    headers={'Authorization': get_auth_header(user)}
    params = {
        'name': name,
        'unit': unit,
        'backend_id': backend_id,
        'machine_id': machine_id,
    }
    try:
        resp = requests.put(url, headers=headers, params=params,
                            verify=config.SSL_VERIFY)
    except requests.exceptions.SSLError as exc:
        raise SSLError()
    except Exception as exc:
        log.error("Exception updating metric: %r", exc)
        raise ServiceUnavailableError()
    if not resp.ok:
        log.error("Error updating metric %d:%s", resp.status_code, resp.text)
        raise BadRequestError(resp.text)
    trigger_session_update(user.email, [])


def deploy_python_plugin(user, backend_id, machine_id, plugin_id,
                         value_type, read_function, host):
    # Sanity checks
    if not plugin_id:
        raise RequiredParameterMissingError('plugin_id')
    if not value_type:
        raise RequiredParameterMissingError('value_type')
    if not read_function:
        raise RequiredParameterMissingError('read_function')
    if not host:
        raise RequiredParameterMissingError('host')
    chars = [chr(ord('a') + i) for i in range(26)] + list('0123456789_')
    for c in plugin_id:
        if c not in chars:
            raise BadRequestError("Invalid plugin_id '%s'.plugin_id can only "
                                  "lower case chars, numeric digits and"
                                  "underscores" % plugin_id)
    if plugin_id.startswith('_') or plugin_id.endswith('_'):
        raise BadRequestError("Invalid plugin_id '%s'. plugin_id can't start "
                              "or end with an underscore." % plugin_id)
    if value_type not in ('gauge', 'derive'):
        raise BadRequestError("Invalid value_type '%s'. Must be 'gauge' or "
                              "'derive'." % value_type)

    # Iniatilize SSH connection
    shell = Shell(host)
    key_id, ssh_user = shell.autoconfigure(user, backend_id, machine_id)
    sftp = shell.ssh.open_sftp()

    tmp_dir = "/tmp/mist-python-plugin-%d" % random.randrange(2 ** 20)
    retval, stdout = shell.command(
"""
sudo=$(command -v sudo)
mkdir -p %s
cd /opt/mistio-collectd/
$sudo mkdir -p plugins/mist-python/
$sudo chown -R root plugins/mist-python/
""" % tmp_dir
    )

    # Test read function
    test_code = """
import time

from %s_read import *

for i in range(3):
    val = read()
    if val is not None and not isinstance(val, (int, float)):
        raise Exception("read() must return a single int or float "
                        "(or None to not submit any sample to collectd)")
    time.sleep(1)
print("READ FUNCTION TEST PASSED")
    """ % plugin_id

    sftp.putfo(StringIO(read_function), "%s/%s_read.py" % (tmp_dir, plugin_id))
    sftp.putfo(StringIO(test_code), "%s/test.py" % tmp_dir)

    retval, test_out = shell.command("$(command -v sudo) python %s/test.py" % tmp_dir)
    stdout += test_out

    if not test_out.strip().endswith("READ FUNCTION TEST PASSED"):
        stdout += "\nERROR DEPLOYING PLUGIN\n"
        raise BadRequestError(stdout)

    # Generate plugin script
    plugin = """# Generated by mist.io web ui

import collectd

%(read_function)s

def read_callback():
    val = read()
    if val is None:
        return
    vl = collectd.Values(type="%(value_type)s")
    vl.plugin = "mist.python"
    vl.plugin_instance = "%(plugin_instance)s"
    vl.dispatch(values=[val])

collectd.register_read(read_callback)
""" % {'read_function': read_function,
       'value_type': value_type,
       'plugin_instance': plugin_id}

    sftp.putfo(StringIO(plugin), "%s/%s.py" % (tmp_dir, plugin_id))
    retval, cmd_out = shell.command("""
cd /opt/mistio-collectd/
$(command -v sudo) mv %s/%s.py plugins/mist-python/
$(command -v sudo) chown -R root plugins/mist-python/
""" % (tmp_dir, plugin_id)
    )

    stdout += cmd_out

    # Prepare collectd.conf
    script = """
sudo=$(command -v sudo)
cd /opt/mistio-collectd/

if ! grep '^Include.*plugins/mist-python' collectd.conf; then
    echo "Adding Include line in collectd.conf for plugins/mist-python/include.conf"
    $sudo su -c 'echo Include \\"/opt/mistio-collectd/plugins/mist-python/include.conf\\" >> collectd.conf'
else
    echo "plugins/mist-python/include.conf is already included in collectd.conf"
fi
if [ ! -f plugins/mist-python/include.conf ]; then
    echo "Generating plugins/mist-python/include.conf"
    $sudo su -c 'echo -e "# Do not edit this file, unless you are looking for trouble.\n\n<LoadPlugin python>\n    Globals true\n</LoadPlugin>\n\n\n<Plugin python>\n    ModulePath \\"/opt/mistio-collectd/plugins/mist-python/\\"\n    LogTraces true\n    Interactive false\n</Plugin>\n" > plugins/mist-python/include.conf'
else
    echo "plugins/mist-python/include.conf already exists, continuing"
fi

echo "Adding Import line for plugin in plugins/mist-python/include.conf"
if ! grep '^ *Import %(plugin_id)s *$' plugins/mist-python/include.conf; then
    $sudo cp plugins/mist-python/include.conf plugins/mist-python/include.conf.backup
    $sudo sed -i 's/^<\/Plugin>$/    Import %(plugin_id)s\\n<\/Plugin>/' plugins/mist-python/include.conf
    echo "Checking that python plugin is available"
    if $sudo /usr/bin/collectd -C /opt/mistio-collectd/collectd.conf -t 2>&1 | grep 'Could not find plugin python'; then
        echo "WARNING: collectd python plugin is not installed, will attempt to install it"
        zypper in -y collectd-plugin-python
        if $sudo /usr/bin/collectd -C /opt/mistio-collectd/collectd.conf -t 2>&1 | grep 'Could not find plugin python'; then
            echo "Install collectd-plugin-python failed"
            $sudo cp plugins/mist-python/include.conf.backup plugins/mist-python/include.conf
            echo "ERROR DEPLOYING PLUGIN"
        fi
    fi
    echo "Restarting collectd"
    $sudo /opt/mistio-collectd/collectd.sh restart
    sleep 2
    if ! $sudo /opt/mistio-collectd/collectd.sh status; then
        echo "Restarting collectd failed, restoring include.conf"
        $sudo cp plugins/mist-python/include.conf.backup plugins/mist-python/include.conf
        $sudo /opt/mistio-collectd/collectd.sh restart
        echo "ERROR DEPLOYING PLUGIN"
    fi
else
    echo "Plugin already imported in include.conf"
fi
$sudo rm -rf %(tmp_dir)s
""" % {'plugin_id': plugin_id, 'tmp_dir': tmp_dir}

    retval, cmd_out = shell.command(script)
    stdout += cmd_out
    if stdout.strip().endswith("ERROR DEPLOYING PLUGIN"):
        raise BadRequestError(stdout)

    shell.disconnect()

    parts = ["mist", "python"]  # strip duplicates (bucky also does this)
    for part in plugin_id.split("."):
        if part != parts[-1]:
            parts.append(part)
    ## parts.append(value_type)  # not needed since MistPythonConverter in bucky
    metric_id = ".".join(parts)

    return {'metric_id': metric_id, 'stdout': stdout}


def undeploy_python_plugin(user, backend_id, machine_id, plugin_id, host):

    # Sanity checks
    if not plugin_id:
        raise RequiredParameterMissingError('plugin_id')
    if not host:
        raise RequiredParameterMissingError('host')

    # Iniatilize SSH connection
    shell = Shell(host)
    key_id, ssh_user = shell.autoconfigure(user, backend_id, machine_id)

    # Prepare collectd.conf
    script = """
sudo=$(command -v sudo)
cd /opt/mistio-collectd/

echo "Removing Include line for plugin conf from plugins/mist-python/include.conf"
$sudo grep -v 'Import %(plugin_id)s$' plugins/mist-python/include.conf > /tmp/include.conf
$sudo mv /tmp/include.conf plugins/mist-python/include.conf

echo "Restarting collectd"
$sudo /opt/mistio-collectd/collectd.sh restart
""" % {'plugin_id': plugin_id}

    retval, stdout = shell.command(script)

    shell.disconnect()

    return {'metric_id': None, 'stdout': stdout}


def get_stats(user, backend_id, machine_id, start='', stop='', step='', metrics=''):
    try:
        resp = requests.get(
            "%s/backends/%s/machines/%s/stats" % (config.CORE_URI,
                                                  backend_id, machine_id),
            params={'start': start, 'stop': stop, 'step': step},
            headers={'Authorization': get_auth_header(user)},
            verify=config.SSL_VERIFY
        )
    except requests.exceptions.SSLError as exc:
        log.error("%r", exc)
        raise SSLError()
    if resp.status_code == 200:
        ret = resp.json()
        return ret
    else:
        log.error("Error getting stats %d:%s", resp.status_code, resp.text)
        raise ServiceUnavailableError(resp.text)


def run_playbook(user, backend_id, machine_id, playbook_path, extra_vars=None,
                 force_handlers=False, debug=False):
    if not extra_vars:
        extra_vars = None
    ret_dict = {
        'success': False,
        'started_at': time(),
        'finished_at': 0,
        'stdout': '',
        'error_msg': '',
        'inventory': '',
        'stats': {},
    }
    inventory = mist.io.inventory.MistInventory(user,
                                                [(backend_id, machine_id)])
    if len(inventory.hosts) != 1:
        log.error("Expected 1 host, found %s", inventory.hosts)
        ret_dict['error_msg'] = "Expected 1 host, found %s" % inventory.hosts
        ret_dict['finished_at'] = time()
        return ret_dict
    machine_name = inventory.hosts.keys()[0]
    log_prefix = "Running playbook '%s' on machine '%s'" % (playbook_path,
                                                            machine_name)
    files = inventory.export(include_localhost=False)
    ret_dict['inventory'] = files['inventory']
    tmp_dir = tempfile.mkdtemp()
    old_dir = os.getcwd()
    os.chdir(tmp_dir)
    try:
        log.debug("%s: Saving inventory files", log_prefix)
        os.mkdir('id_rsa')
        for name, data in files.items():
            with open(name, 'w') as f:
                f.write(data)
        for name in os.listdir('id_rsa'):
            os.chmod('id_rsa/%s' % name, 0600)
        log.debug("%s: Inventory files ready", log_prefix)

        playbook_path = '%s/%s' % (old_dir, playbook_path)
        ansible_hosts_path = 'inventory'
        # extra_vars['host_key_checking'] = False

        ansible.utils.VERBOSITY = 4 if debug else 0
        ansible.constants.HOST_KEY_CHECKING = False
        ansible.constants.ANSIBLE_NOCOWS = True
        stats = ansible.callbacks.AggregateStats()
        playbook_cb = ansible.callbacks.PlaybookCallbacks(
            verbose=ansible.utils.VERBOSITY
        )
        runner_cb = ansible.callbacks.PlaybookRunnerCallbacks(
            stats, verbose=ansible.utils.VERBOSITY
        )
        log.error(old_dir)
        log.error(tmp_dir)
        log.error(extra_vars)
        log.error(playbook_path)
        capture = StdStreamCapture()
        try:
            playbook = ansible.playbook.PlayBook(
                playbook=playbook_path,
                host_list=ansible_hosts_path,
                callbacks=playbook_cb,
                runner_callbacks=runner_cb,
                stats=stats,
                extra_vars=extra_vars,
                force_handlers=force_handlers,
            )
            result = playbook.run()
        except Exception as exc:
            log.error("%s: Error %r", log_prefix, exc)
            ret_dict['error_msg'] = repr(exc)
        finally:
            ret_dict['finished_at'] = time()
            ret_dict['stdout'] = capture.close()
        if ret_dict['error_msg']:
            return ret_dict
        log.debug("%s: Ansible result = %s", log_prefix, result)
        mresult = result[machine_name]
        ret_dict['stats'] = mresult
        if mresult['failures'] or mresult['unreachable']:
            log.error("%s: Ansible run failed: %s", log_prefix, mresult)
            return ret_dict
        log.info("%s: Ansible run succeeded: %s", log_prefix, mresult)
        ret_dict['success'] = True
        return ret_dict
    finally:
        os.chdir(old_dir)
        if not debug:
            shutil.rmtree(tmp_dir)


def _notify_playbook_result(user, res, backend_id=None, machine_id=None,
                            extra_vars=None, label='Ansible playbook'):
    title = label + (' succeeded' if res['success'] else ' failed')
    kwargs = {
        'backend_id': backend_id,
        'machine_id': machine_id,
        'duration': res['finished_at'] - res['started_at'],
        'error': False if res['success'] else res['error_msg'] or True,
    }
    if not res['success']:
        kwargs['output'] = res['stdout']
    notify_user(user, title, **kwargs)


def deploy_collectd(user, backend_id, machine_id, extra_vars):
    ret_dict = run_playbook(
        user, backend_id, machine_id,
        playbook_path='src/deploy_collectd/ansible/enable.yml',
        extra_vars=extra_vars,
        force_handlers=True,
        # debug=True,
    )
    _notify_playbook_result(user, ret_dict, backend_id, machine_id,
                            label='Collectd deployment')
    return ret_dict


def undeploy_collectd(user, backend_id, machine_id):
    ret_dict = run_playbook(
        user, backend_id, machine_id,
        playbook_path='src/deploy_collectd/ansible/disable.yml',
        force_handlers=True,
        # debug=True,
    )
    _notify_playbook_result(user, ret_dict, backend_id, machine_id,
                            label='Collectd undeployment')
    return ret_dict


def get_deploy_collectd_manual_command(uuid, password, monitor):
    url = "https://github.com/mistio/deploy_collectd/raw/master/local_run.py"
    cmd = "wget -O - %s | sudo python - %s %s" % (url, uuid, password)
    if monitor != 'monitor1.mist.io':
        cmd += " -m %s" % monitor
    return cmd
