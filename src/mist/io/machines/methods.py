import re
import random
import base64
import mongoengine as me

from libcloud.compute.base import NodeSize, NodeImage, NodeLocation
from libcloud.compute.types import Provider
from libcloud.compute.base import NodeAuthSSHKey
from tempfile import NamedTemporaryFile

import mist.io.tasks

from mist.io.clouds.models import Cloud
from mist.io.machines.models import Machine
from mist.io.keys.models import Key

from mist.io.exceptions import PolicyUnauthorizedError
from mist.io.exceptions import MachineNameValidationError
from mist.io.exceptions import BadRequestError, MachineCreationError
from mist.io.exceptions import CloudUnavailableError, InternalServerError

from mist.io.helpers import get_temp_file

from mist.io.methods import connect_provider
from mist.io.networks.methods import list_networks
from mist.io.tag.methods import resolve_id_and_set_tags

from mist.core import config  # TODO handle this for opes.source

import logging

logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)


def machine_name_validator(provider, name):
    """
    Validates machine names before creating a machine
    Provider specific
    """
    if not name and provider not in config.EC2_PROVIDERS:
        raise MachineNameValidationError("machine name cannot be empty")
    if provider is Provider.DOCKER:
        pass
    elif provider in [Provider.RACKSPACE_FIRST_GEN, Provider.RACKSPACE]:
        pass
    elif provider in [Provider.OPENSTACK]:
        pass
    elif provider in config.EC2_PROVIDERS:
        if len(name) > 255:
            raise MachineNameValidationError("machine name max "
                                             "chars allowed is 255")
    elif provider is Provider.NEPHOSCALE:
        pass
    elif provider is Provider.GCE:
        if not re.search(r'^(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)$', name):
            raise MachineNameValidationError(
                "name must be 1-63 characters long, with the first "
                "character being a lowercase letter, and all following "
                "characters must be a dash, lowercase letter, or digit, "
                "except the last character, which cannot be a dash."
            )
    elif provider is Provider.SOFTLAYER:
        pass
    elif provider is Provider.DIGITAL_OCEAN:
        if not re.search(r'^[0-9a-zA-Z]+[0-9a-zA-Z-.]{0,}[0-9a-zA-Z]+$', name):
            raise MachineNameValidationError(
                "machine name may only contain ASCII letters "
                "or numbers, dashes and dots")
    elif provider is Provider.PACKET:
        if not re.search(r'^[0-9a-zA-Z-.]+$', name):
            raise MachineNameValidationError(
                "machine name may only contain ASCII letters "
                "or numbers, dashes and periods")
    elif provider == Provider.AZURE:
        pass
    elif provider in [Provider.VCLOUD, Provider.INDONESIAN_VCLOUD]:
        pass
    elif provider is Provider.LINODE:
        if len(name) < 3:
            raise MachineNameValidationError(
                "machine name should be at least 3 chars"
            )
        if not re.search(r'^[0-9a-zA-Z][0-9a-zA-Z-_]+[0-9a-zA-Z]$', name):
            raise MachineNameValidationError(
                "machine name may only contain ASCII letters or numbers, "
                "dashes and underscores. Must begin and end with letters "
                "or numbers, and be at least 3 characters long")
    return name


def list_machines(owner, cloud_id):
    """List all machines in this cloud via API call to the provider."""
    machines = Cloud.objects.get(owner=owner, id=cloud_id,
                                 deleted=None).ctl.compute.list_machines()
    return [machine.as_dict_old() for machine in machines]


def create_machine(owner, cloud_id, key_id, machine_name, location_id,
                   image_id, size_id, image_extra, disk, image_name,
                   size_name, location_name, ips, monitoring, networks=[],
                   docker_env=[], docker_command=None, ssh_port=22, script='',
                   script_id='', script_params='', job_id=None,
                   docker_port_bindings={}, docker_exposed_ports={},
                   azure_port_bindings='', hostname='', plugins=None,
                   disk_size=None, disk_path=None,
                   post_script_id='', post_script_params='', cloud_init='',
                   associate_floating_ip=False,
                   associate_floating_ip_subnet=None, project_id=None,
                   schedule={}, command=None, tags=None,
                   bare_metal=False, hourly=True,
                   softlayer_backend_vlan_id=None):
    """Creates a new virtual machine on the specified cloud.

    If the cloud is Rackspace it attempts to deploy the node with an ssh key
    provided in config. the method used is the only one working in the old
    Rackspace cloud. create_node(), from libcloud.compute.base, with 'auth'
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
    # script: a command that is given once
    # script_id: id of a script that exists - for mist.core
    # script_params: extra params, for script_id
    # post_script_id: id of a script that exists - for mist.core. If script_id
    # or monitoring are supplied, this will run after both finish
    # post_script_params: extra params, for post_script_id

    log.info('Creating machine %s on cloud %s' % (machine_name, cloud_id))
    cloud = Cloud.objects.get(owner=owner, id=cloud_id, deleted=None)
    conn = connect_provider(cloud)

    machine_name = machine_name_validator(conn.type, machine_name)
    key = None
    if key_id:
        key = Key.objects.get(owner=owner, id=key_id, deleted=None)

    # if key_id not provided, search for default key
    if conn.type not in [Provider.LIBVIRT, Provider.DOCKER]:
        if not key_id:
            key = Key.objects.get(owner=owner, default=True, deleted=None)
            key_id = key.name
    if key:
        private_key = key.private
        public_key = key.public
    else:
        public_key = None

    size = NodeSize(size_id, name=size_name, ram='', disk=disk,
                    bandwidth='', price='', driver=conn)
    image = NodeImage(image_id, name=image_name, extra=image_extra,
                      driver=conn)
    location = NodeLocation(location_id, name=location_name, country='',
                            driver=conn)

    if conn.type is Provider.DOCKER:
        if public_key:
            node = _create_machine_docker(
                conn, machine_name, image_id, '',
                public_key=public_key,
                docker_env=docker_env,
                docker_command=docker_command,
                docker_port_bindings=docker_port_bindings,
                docker_exposed_ports=docker_exposed_ports
            )
            node_info = conn.inspect_node(node)
            try:
                ssh_port = int(
                    node_info.extra[
                        'network_settings']['Ports']['22/tcp'][0]['HostPort'])
            except:
                pass
        else:
            node = _create_machine_docker(
                conn, machine_name, image_id, script,
                docker_env=docker_env,
                docker_command=docker_command,
                docker_port_bindings=docker_port_bindings,
                docker_exposed_ports=docker_exposed_ports
            )
    elif conn.type in [Provider.RACKSPACE_FIRST_GEN, Provider.RACKSPACE]:
        node = _create_machine_rackspace(conn, public_key, machine_name, image,
                                         size, location, user_data=cloud_init)
    elif conn.type in [Provider.OPENSTACK]:
        node = _create_machine_openstack(conn, private_key, public_key,
                                         machine_name, image, size, location,
                                         networks, cloud_init)
    elif conn.type in config.EC2_PROVIDERS and private_key:
        locations = conn.list_locations()
        for loc in locations:
            if loc.id == location_id:
                location = loc
                break
        node = _create_machine_ec2(conn, key_id, private_key, public_key,
                                   machine_name, image, size, location,
                                   cloud_init)
    elif conn.type is Provider.NEPHOSCALE:
        node = _create_machine_nephoscale(conn, key_id, private_key,
                                          public_key, machine_name, image,
                                          size, location, ips)
    elif conn.type is Provider.GCE:
        sizes = conn.list_sizes(location=location_name)
        for size in sizes:
            if size.id == size_id:
                size = size
                break
        node = _create_machine_gce(conn, key_id, private_key, public_key,
                                   machine_name, image, size, location,
                                   cloud_init)
    elif conn.type is Provider.SOFTLAYER:
        node = _create_machine_softlayer(
            conn, key_id, private_key, public_key,
            machine_name, image, size,
            location, bare_metal, cloud_init,
            hourly, softlayer_backend_vlan_id
        )
    elif conn.type is Provider.DIGITAL_OCEAN:
        node = _create_machine_digital_ocean(
            conn, key_id, private_key,
            public_key, machine_name,
            image, size, location, cloud_init)
    elif conn.type == Provider.AZURE:
        node = _create_machine_azure(
            conn, key_id, private_key,
            public_key, machine_name,
            image, size, location,
            cloud_init=cloud_init,
            cloud_service_name=None,
            azure_port_bindings=azure_port_bindings
        )
    elif conn.type in [Provider.VCLOUD, Provider.INDONESIAN_VCLOUD]:
        node = _create_machine_vcloud(conn, machine_name, image,
                                      size, public_key, networks)
    elif conn.type is Provider.LINODE and private_key:
        # FIXME: The orchestration UI does not provide all the necessary
        # parameters, thus we need to fetch the proper size and image objects.
        # This should be properly fixed when migrated to the controllers.
        if not disk:
            for size in conn.list_sizes():
                if int(size.id) == int(size_id):
                    size = size
                    break
        if not image_extra:  # Missing: {'64bit': 1, 'pvops': 1}
            for image in conn.list_images():
                if int(image.id) == int(image_id):
                    image = image
                    break
        node = _create_machine_linode(conn, key_id, private_key, public_key,
                                      machine_name, image, size,
                                      location)
    elif conn.type == Provider.HOSTVIRTUAL:
        node = _create_machine_hostvirtual(conn, public_key,
                                           machine_name, image,
                                           size, location)
    elif conn.type == Provider.VULTR:
        node = _create_machine_vultr(conn, public_key, machine_name, image,
                                     size, location, cloud_init)
    elif conn.type is Provider.LIBVIRT:
        try:
            # size_id should have a format cpu:ram, eg 1:2048
            cpu = size_id.split(':')[0]
            ram = size_id.split(':')[1]
        except:
            ram = 512
            cpu = 1
        node = _create_machine_libvirt(conn, machine_name,
                                       disk_size=disk_size, ram=ram, cpu=cpu,
                                       image=image_id, disk_path=disk_path,
                                       networks=networks,
                                       public_key=public_key,
                                       cloud_init=cloud_init)
    elif conn.type == Provider.PACKET:
        node = _create_machine_packet(conn, public_key, machine_name, image,
                                      size, location, cloud_init, project_id)
    else:
        raise BadRequestError("Provider unknown.")

    if key is not None:
        # we did this change because there was race condition with
        # list_machines
        try:
            machine = Machine(cloud=cloud, machine_id=node.id).save()
        except me.NotUniqueError:
            machine = Machine.objects.get(cloud=cloud, machine_id=node.id)

        username = node.extra.get('username', '')
        machine.ctl.associate_key(key, username=username,
                                  port=ssh_port, no_connect=True)
    # Call post_deploy_steps for every provider
    if conn.type == Provider.AZURE:
        # for Azure, connect with the generated password, deploy the ssh key
        # when this is ok, it calls post_deploy for script/monitoring
        mist.io.tasks.azure_post_create_steps.delay(
            owner.id, cloud_id, node.id, monitoring, key_id,
            node.extra.get('username'), node.extra.get('password'), public_key,
            script=script,
            script_id=script_id, script_params=script_params, job_id=job_id,
            hostname=hostname, plugins=plugins, post_script_id=post_script_id,
            post_script_params=post_script_params, schedule=schedule,
        )
    elif conn.type == Provider.OPENSTACK:
        if associate_floating_ip:
            networks = list_networks(owner, cloud_id)
            mist.io.tasks.openstack_post_create_steps.delay(
                owner.id, cloud_id, node.id, monitoring, key_id,
                node.extra.get('username'), node.extra.get('password'),
                public_key, script=script, script_id=script_id,
                script_params=script_params,
                job_id=job_id, hostname=hostname, plugins=plugins,
                post_script_params=post_script_params,
                networks=networks, schedule=schedule,
            )
    elif conn.type == Provider.RACKSPACE_FIRST_GEN:
        # for Rackspace First Gen, cannot specify ssh keys. When node is
        # created we have the generated password, so deploy the ssh key
        # when this is ok and call post_deploy for script/monitoring
        mist.io.tasks.rackspace_first_gen_post_create_steps.delay(
            owner.id, cloud_id, node.id, monitoring, key_id,
            node.extra.get('password'), public_key, script=script,
            script_id=script_id, script_params=script_params,
            job_id=job_id, hostname=hostname, plugins=plugins,
            post_script_id=post_script_id,
            post_script_params=post_script_params, schedule=schedule
        )

    elif key_id:
        mist.io.tasks.post_deploy_steps.delay(
            owner.id, cloud_id, node.id, monitoring, script=script,
            key_id=key_id, script_id=script_id, script_params=script_params,
            job_id=job_id, hostname=hostname, plugins=plugins,
            post_script_id=post_script_id,
            post_script_params=post_script_params, schedule=schedule,
        )

    if tags:
        resolve_id_and_set_tags(owner, 'machine', node.id, tags,
                                cloud_id=cloud_id)

    ret = {'id': node.id,
           'name': node.name,
           'extra': node.extra,
           'public_ips': node.public_ips,
           'private_ips': node.private_ips,
           'job_id': job_id,
           }

    return ret


def _create_machine_rackspace(conn, public_key, machine_name,
                              image, size, location, user_data):
    """Create a machine in Rackspace.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """

    key = str(public_key).replace('\n', '')

    try:
        server_key = ''
        keys = conn.ex_list_keypairs()
        for k in keys:
            if key == k.public_key:
                server_key = k.name
                break
        if not server_key:
            server_key = conn.ex_import_keypair_from_string(name=machine_name,
                                                            key_material=key)
            server_key = server_key.name
    except:
        try:
            server_key = conn.ex_import_keypair_from_string(
                name='mistio' + str(random.randint(1, 100000)),
                key_material=key)
            server_key = server_key.name
        except AttributeError:
            # RackspaceFirstGenNodeDriver based on OpenStack_1_0_NodeDriver
            # has no support for keys. So don't break here, since
            # create_node won't include it anyway
            server_key = None

    try:
        node = conn.create_node(name=machine_name, image=image, size=size,
                                location=location, ex_keyname=server_key,
                                ex_userdata=user_data)
        return node
    except Exception as e:
        raise MachineCreationError("Rackspace, got exception %r" % e, exc=e)


def _create_machine_openstack(conn, private_key, public_key, machine_name,
                              image, size, location, networks, user_data):
    """Create a machine in Openstack.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    key = str(public_key).replace('\n', '')

    try:
        server_key = ''
        keys = conn.ex_list_keypairs()
        for k in keys:
            if key == k.public_key:
                server_key = k.name
                break
        if not server_key:
            server_key = conn.ex_import_keypair_from_string(name=machine_name,
                                                            key_material=key)
            server_key = server_key.name
    except:
        server_key = conn.ex_import_keypair_from_string(
            name='mistio' + str(random.randint(1, 100000)),
            key_material=key)
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
                networks=chosen_networks,
                ex_userdata=user_data)
        except Exception as e:
            raise MachineCreationError("OpenStack, got exception %s" % e, e)
    return node


def _create_machine_ec2(conn, key_name, private_key, public_key,
                        machine_name, image, size, location, user_data):
    """Create a machine in Amazon EC2.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    with get_temp_file(public_key) as tmp_key_path:
        try:
            # create keypair with key name and pub key
            conn.ex_import_keypair(name=key_name, keyfile=tmp_key_path)
        except:
            # get existing key with that pub key
            try:
                keypair = conn.ex_find_or_import_keypair_by_key_material(
                    pubkey=public_key
                )
                key_name = keypair['keyName']
            except Exception as exc:
                raise CloudUnavailableError("Failed to import key")

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
            raise InternalServerError("Couldn't create security group", exc)

    try:
        node = conn.create_node(
            name=machine_name,
            image=image,
            size=size,
            location=location,
            max_tries=1,
            ex_keyname=key_name,
            ex_securitygroup=config.EC2_SECURITYGROUP['name'],
            ex_userdata=user_data
        )
    except Exception as e:
        raise MachineCreationError("EC2, got exception %s" % e, e)

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
        baremetal = True
    else:
        baremetal = False

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
            raise MachineCreationError("Nephoscale, got exception %s" % e, e)
        return node


def _create_machine_softlayer(conn, key_name, private_key, public_key,
                              machine_name, image, size, location,
                              bare_metal, cloud_init, hourly,
                              softlayer_backend_vlan_id):
    """Create a machine in Softlayer.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    key = str(public_key).replace('\n', '')
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
        server_key = conn.create_key_pair(
            'mistio' + str(random.randint(1, 100000)), key
        )
        server_key = server_key.id

    if '.' in machine_name:
        domain = '.'.join(machine_name.split('.')[1:])
        name = machine_name.split('.')[0]
    else:
        domain = None
        name = machine_name

    # FIXME: SoftLayer allows only bash/script, no actual cloud-init
    # Also need to upload this on a public https url...
    if cloud_init:
        postInstallScriptUri = ''
    else:
        postInstallScriptUri = None
    with get_temp_file(private_key) as tmp_key_path:
        try:
            node = conn.create_node(
                name=name,
                ex_domain=domain,
                image=image,
                size=size,
                location=location,
                sshKeys=server_key,
                bare_metal=bare_metal,
                postInstallScriptUri=postInstallScriptUri,
                ex_hourly=hourly,
                ex_backend_vlan=softlayer_backend_vlan_id
            )
        except Exception as e:
            raise MachineCreationError("Softlayer, got exception %s" % e, e)
    return node


def _create_machine_docker(conn, machine_name, image, script=None,
                           public_key=None, docker_env={}, docker_command=None,
                           tty_attach=True, docker_port_bindings={},
                           docker_exposed_ports={}):
    """Create a machine in docker.

    """

    try:
        if public_key:
            environment = ['PUBLIC_KEY=%s' % public_key.strip()]
        else:
            environment = []

        if docker_env:
            # docker_env is a dict, and we must convert it ot be in the form:
            # [ "key=value", "key=value"...]
            docker_environment = ["%s=%s" % (key, value) for key, value in
                                  docker_env.iteritems()]
            environment += docker_environment

        node = conn.create_node(
            name=machine_name,
            image=image,
            command=docker_command,
            environment=environment,
            tty=tty_attach,
            ports=docker_exposed_ports,
            port_bindings=docker_port_bindings,
        )
    except Exception as e:
        raise MachineCreationError("Docker, got exception %s" % e, e)

    return node


def _create_machine_digital_ocean(conn, key_name, private_key, public_key,
                                  machine_name, image, size,
                                  location, user_data):
    """Create a machine in Digital Ocean.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    key = public_key.replace('\n', '')

    # on API v1 list keys returns only ids, without actual public keys
    # So the check fails. If there's already a key with the same pub key,
    # create key call will fail!
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
            server_key = conn.ex_create_ssh_key('mistio' + str(
                random.randint(1, 100000)), key)
        except:
            # on API v1 if we can't create that key, means that key is already
            # on our account. Since we don't know the id, we pass all the ids
            server_keys = [str(k.id) for k in keys]

    if not server_key:
        ex_ssh_key_ids = server_keys
    else:
        ex_ssh_key_ids = [str(server_key.id)]

    # check if location allows the private_networking setting
    private_networking = False
    try:
        locations = conn.list_locations()
        for loc in locations:
            if loc.id == location.id:
                if 'private_networking' in loc.extra:
                    private_networking = True
                break
    except:
        # do not break if this fails for some reason
        pass

    with get_temp_file(private_key) as tmp_key_path:
        try:
            node = conn.create_node(
                name=machine_name,
                image=image,
                size=size,
                ex_ssh_key_ids=ex_ssh_key_ids,
                location=location,
                ssh_key=tmp_key_path,
                private_networking=private_networking,
                user_data=user_data
            )
        except Exception as e:
            raise MachineCreationError(
                "Digital Ocean, got exception %s" % e, e
            )

        return node


def _create_machine_libvirt(conn, machine_name, disk_size, ram, cpu,
                            image, disk_path, networks,
                            public_key, cloud_init):
    """Create a machine in Libvirt.
    """

    try:
        node = conn.create_node(
            name=machine_name,
            disk_size=disk_size,
            ram=ram,
            cpu=cpu,
            image=image,
            disk_path=disk_path,
            networks=networks,
            public_key=public_key,
            cloud_init=cloud_init
        )

    except Exception as e:
        raise MachineCreationError("KVM, got exception %s" % e, e)

    return node


def _create_machine_hostvirtual(conn, public_key,
                                machine_name, image, size, location):
    """Create a machine in HostVirtual.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    key = public_key.replace('\n', '')

    auth = NodeAuthSSHKey(pubkey=key)

    try:
        node = conn.create_node(
            name=machine_name,
            image=image,
            size=size,
            auth=auth,
            location=location
        )
    except Exception as e:
        raise MachineCreationError("HostVirtual, got exception %s" % e, e)

    return node


def _create_machine_packet(conn, public_key, machine_name, image,
                           size, location, cloud_init, project_id=None):
    """Create a machine in Packet.net.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    key = public_key.replace('\n', '')
    try:
        conn.create_key_pair('mistio', key)
    except:
        # key exists and will be deployed
        pass

    # if project_id is not specified, use the project for which the driver
    # has been initiated. If driver hasn't been initiated with a project,
    # then use the first one from the projects
    ex_project_id = None
    if not project_id:
        if conn.project_id:
            ex_project_id = conn.project_id
        else:
            try:
                ex_project_id = conn.projects[0].id
            except IndexError:
                raise BadRequestError(
                    "You don't have any projects on packet.net"
                )
    else:
        for project_obj in conn.projects:
            if project_id in [project_obj.name, project_obj.id]:
                ex_project_id = project_obj.id
                break
        if not ex_project_id:
            raise BadRequestError("Project id is invalid")

    try:
        node = conn.create_node(
            name=machine_name,
            size=size,
            image=image,
            location=location,
            ex_project_id=ex_project_id,
            cloud_init=cloud_init
        )
    except Exception as e:
        raise MachineCreationError("Packet.net, got exception %s" % e, e)

    return node


def _create_machine_vultr(conn, public_key, machine_name, image,
                          size, location, cloud_init):
    """Create a machine in Vultr.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    key = public_key.replace('\n', '')

    try:
        server_key = ''
        keys = conn.ex_list_ssh_keys()
        for k in keys:
            if key == k.ssh_key.replace('\n', ''):
                server_key = k
                break
        if not server_key:
            server_key = conn.ex_create_ssh_key(machine_name, key)
    except:
        server_key = conn.ex_create_ssh_key('mistio' + str(
            random.randint(1, 100000)), key)

    try:
        server_key = server_key.id
    except:
        pass

    try:
        node = conn.create_node(
            name=machine_name,
            size=size,
            image=image,
            location=location,
            ssh_key=[server_key],
            userdata=cloud_init
        )
    except Exception as e:
        raise MachineCreationError("Vultr, got exception %s" % e, e)

    return node


def _create_machine_azure(conn, key_name, private_key, public_key,
                          machine_name, image, size, location, cloud_init,
                          cloud_service_name, azure_port_bindings):
    """Create a machine Azure.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    public_key.replace('\n', '')

    port_bindings = []
    if azure_port_bindings and type(azure_port_bindings) in [str, unicode]:
        # we receive something like: http tcp 80:80, smtp tcp 25:25,
        # https tcp 443:443
        # and transform it to [{'name':'http', 'protocol': 'tcp',
        # 'local_port': 80, 'port': 80},
        # {'name':'smtp', 'protocol': 'tcp', 'local_port': 25, 'port': 25}]

        for port_binding in azure_port_bindings.split(','):
            try:
                port_dict = port_binding.split()
                port_name = port_dict[0]
                protocol = port_dict[1]
                ports = port_dict[2]
                local_port = ports.split(':')[0]
                port = ports.split(':')[1]
                binding = {'name': port_name, 'protocol': protocol,
                           'local_port': local_port, 'port': port}
                port_bindings.append(binding)
            except:
                pass

    with get_temp_file(private_key) as tmp_key_path:
        try:
            node = conn.create_node(
                name=machine_name,
                size=size,
                image=image,
                location=location,
                ex_cloud_service_name=cloud_service_name,
                endpoint_ports=port_bindings,
                custom_data=base64.b64encode(cloud_init)
            )
        except Exception as e:
            try:
                # try to get the message only out of the XML response
                msg = re.search(r"(<Message>)(.*?)(</Message>)", e.value)
                if not msg:
                    msg = re.search(r"(Message: ')(.*?)(', Body)", e.value)
                if msg:
                    msg = msg.group(2)
            except:
                msg = e
            raise MachineCreationError('Azure, got exception %s' % msg)

        return node


def _create_machine_vcloud(conn, machine_name, image,
                           size, public_key, networks):
    """Create a machine vCloud.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    key = public_key.replace('\n', '')
    # we have the option to pass a guest customisation
    # script as ex_vm_script. We'll pass
    # the ssh key there

    deploy_script = NamedTemporaryFile(delete=False)
    deploy_script.write(
        'mkdir -p ~/.ssh && echo "%s" >> ~/.ssh/authorized_keys '
        '&& chmod -R 700 ~/.ssh/' % key)
    deploy_script.close()

    # select the right network object
    ex_network = None
    try:
        if networks:
            network = networks[0]
            available_networks = conn.ex_list_networks()
            available_networks_ids = [net.id for net in available_networks]
            if network in available_networks_ids:
                ex_network = network
    except:
        pass

    try:
        node = conn.create_node(
            name=machine_name,
            image=image,
            size=size,
            ex_vm_script=deploy_script.name,
            ex_vm_network=ex_network,
            ex_vm_fence='bridged',
            ex_vm_ipmode='DHCP'
        )
    except Exception as e:
        raise MachineCreationError("vCloud, got exception %s" % e, e)

    return node


def _create_machine_gce(conn, key_name, private_key, public_key, machine_name,
                        image, size, location, cloud_init):
    """Create a machine in GCE.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    key = public_key.replace('\n', '')

    metadata = {  # 'startup-script': script,
        'sshKeys': 'user:%s' % key}
    # metadata for ssh user, ssh key and script to deploy
    if cloud_init:
        metadata['startup-script'] = cloud_init

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
            raise MachineCreationError(
                "Google Compute Engine, got exception %s" % e, e)
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
                ssh_key=tmp_key_path,
                ex_private=True
            )
        except Exception as e:
            raise MachineCreationError("Linode, got exception %s" % e, e)
    return node


def destroy_machine(user, cloud_id, machine_id):
    """Destroys a machine on a certain cloud.

    After destroying a machine it also deletes all key associations. However,
    it doesn't undeploy the keypair. There is no need to do it because the
    machine will be destroyed.
    """
    log.info('Destroying machine %s in cloud %s' % (machine_id, cloud_id))

    machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)

    if not machine.monitoring.hasmonitoring:
        machine.ctl.destroy()
        return

    # if machine has monitoring, disable it. the way we disable depends on
    # whether this is a standalone io installation or not
    disable_monitoring_function = None
    try:  # TODO handle this for open.source
        from mist.core.methods import disable_monitoring as dis_mon_core
        disable_monitoring_function = dis_mon_core
    except ImportError:
        #  TODO handle this for open.source
        from mist.io.methods import disable_monitoring
        # this is a standalone io instal/mlation, using io's disable_monitoring
        # if we have an authentication token for the core service
        if user.mist_api_token:
            disable_monitoring_function = disable_monitoring
    if disable_monitoring_function is not None:
        log.info("Will try to disable monitoring for machine before "
                 "destroying it (we don't bother to check if it "
                 "actually has monitoring enabled.")
        try:
            # we don't actually bother to undeploy collectd
            disable_monitoring_function(user, cloud_id, machine_id,
                                        no_ssh=True)
        except Exception as exc:
            log.warning("Didn't manage to disable monitoring, maybe the "
                        "machine never had monitoring enabled. Error: %r", exc)

    machine.ctl.destroy()


# SEC
def filter_list_machines(auth_context, cloud_id, machines=None, perm='read'):
    """Returns a list of machines.

    In case of non-Owners, the QuerySet only includes machines found in the
    RBAC Mappings of the Teams the current user is a member of.
    """
    assert cloud_id

    if machines is None:
        machines = list_machines(auth_context.owner, cloud_id)
    if not machines:  # Exit early in case the cloud provider returned 0 nodes.
        return []

    # NOTE: We can trust the RBAC Mappings in order to fetch the latest list of
    # machines for the current user, since mongo has been updated by either the
    # Poller or the above `list_machines`.

    if not auth_context.is_owner():
        try:
            auth_context.check_perm('cloud', 'read', cloud_id)
        except PolicyUnauthorizedError:
            return []
        allowed_ids = set(auth_context.get_allowed_resources(rtype='machines'))
        machines = [machine for machine in machines
                    if machine['uuid'] in allowed_ids]

    return machines
