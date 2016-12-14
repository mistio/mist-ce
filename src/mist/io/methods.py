import os
import shutil
import random
import socket
import tempfile
import json
import base64
import requests
import subprocess
import re
import calendar
import ssl
import iso8601

import mongoengine as me
from mongoengine import ValidationError, NotUniqueError, DoesNotExist

from time import sleep, time, mktime
from datetime import datetime
from hashlib import sha256
from StringIO import StringIO
from tempfile import NamedTemporaryFile
from xml.sax.saxutils import escape

from libcloud.compute.providers import get_driver
from libcloud.compute.base import Node, NodeSize, NodeImage, NodeLocation
from libcloud.compute.base import NodeAuthSSHKey
from libcloud.compute.deployment import MultiStepDeployment, ScriptDeployment
from libcloud.compute.deployment import SSHKeyDeployment
from libcloud.compute.types import Provider, NodeState
from libcloud.common.types import InvalidCredsError
from libcloud.utils.networking import is_private_subnet
from libcloud.dns.types import Provider as DnsProvider
from libcloud.dns.types import RecordType
from libcloud.dns.providers import get_driver as get_dns_driver
from libcloud.pricing import get_size_price

import ansible.playbook
import ansible.utils.template
import ansible.callbacks
import ansible.utils
import ansible.constants

# try:
# from mist.core.user.models import User
from mist.core.tag.models import Tag
from mist.io.keys.models import Key
from mist.core import config
# except ImportError:
#     print "Seems to be on IO version"
#     from mist.io import config, model

from mist.io.shell import Shell
from mist.io.helpers import get_temp_file
from mist.io.helpers import get_auth_header
from mist.io.bare_metal import BareMetalDriver
from mist.io.helpers import check_host, sanitize_host
from mist.io.helpers import transform_key_machine_associations
from mist.io.exceptions import *

from mist.io.helpers import trigger_session_update
from mist.io.helpers import amqp_publish_user
from mist.io.helpers import StdStreamCapture

from mist.io.helpers import dirty_cow, parse_os_release

import mist.io.tasks
import mist.io.inventory

from mist.io.clouds.models import Cloud
from mist.io.networks.models import NETWORKS, SUBNETS, Network, Subnet
from mist.io.schedules.models import Schedule
from mist.io.machines.models import Machine

from mist.core.vpn.methods import destination_nat as dnat
from mist.core.vpn.methods import super_ping
from mist.core.vpn.methods import to_tunnel

from mist.core.exceptions import VPNTunnelError

import mist.io.clouds.models as cloud_models

import logging

logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)


def add_cloud_v_2(owner, title, provider, params):
    """Add cloud to owner"""

    # FIXME: Some of these should be explicit arguments, others shouldn't exist
    fail_on_error = params.pop('fail_on_error',
                               params.pop('remove_on_error', True))
    monitoring = params.pop('monitoring', False)
    params.pop('title', None)
    params.pop('provider', None)
    # Find proper Cloud subclass.
    if not provider:
        raise RequiredParameterMissingError("provider")
    log.info("Adding new cloud in provider '%s'", provider)
    if provider not in cloud_models.CLOUDS:
        raise BadRequestError("Invalid provider '%s'." % provider)
    cloud_cls = cloud_models.CLOUDS[provider]  # Class of Cloud model.

    # Add the cloud.
    cloud = cloud_cls.add(owner, title, fail_on_error=fail_on_error,
                          fail_on_invalid_params=False, **params)
    ret = {'cloud_id': cloud.id}
    if provider == 'bare_metal' and monitoring:
        # Let's overload this a bit more by also combining monitoring.
        machine = Machine.objects.get(cloud=cloud)
        try:
            from mist.core.methods import enable_monitoring as _en_mon
        except ImportError:
            _en_mon = enable_monitoring
        ret['monitoring'] = _en_mon(
            owner, cloud.id, machine.machine_id,
            no_ssh=not (machine.os_type == 'unix' and
                        machine.key_associations)
        )
    log.info("Cloud with id '%s' added succesfully.", cloud.id)
    trigger_session_update(owner, ['clouds'])
    return ret


def rename_cloud(owner, cloud_id, new_name):
    """Renames cloud with given cloud_id."""

    log.info("Renaming cloud: %s", cloud_id)
    cloud = Cloud.objects.get(owner=owner, id=cloud_id)
    cloud.ctl.rename(new_name)
    log.info("Succesfully renamed cloud '%s'", cloud_id)
    trigger_session_update(owner, ['clouds'])


def delete_cloud(owner, cloud_id):
    """Deletes cloud with given cloud_id."""

    log.info("Deleting cloud: %s", cloud_id)

    # if a core/io installation, disable monitoring for machines
    try:
        from mist.core.methods import disable_monitoring_cloud
    except ImportError:
        # this is a standalone io installation, don't bother
        pass
    else:
        # this a core/io installation, disable directly using core's function
        log.info("Disabling monitoring before deleting cloud.")
        try:
            disable_monitoring_cloud(owner, cloud_id)
        except Exception as exc:
            log.warning("Couldn't disable monitoring before deleting cloud. "
                        "Error: %r", exc)

    try:
        cloud = Cloud.objects.get(owner=owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')

    machines = Machine.objects(cloud=cloud)
    for machine in machines:
        tags = Tag.objects(owner=owner, resource=machine)
        for tag in tags:
            try:
                tag.delete()
            except:
                pass
        try:
            machine.delete()
        except:
            pass

    cloud.delete()
    log.info("Succesfully deleted cloud '%s'", cloud_id)
    trigger_session_update(owner, ['clouds'])


def delete_key(user, key_id):
    """Deletes given key.
    If key was default, then it checks if there are still keys left
    and assigns another one as default.

    :param user:
    :param key_id:
    :return:
    """
    log.info("Deleting key with id '%s'.", key_id)
    key = Key.objects.get(owner=user, id=key_id)
    default_key = key.default
    key.delete()
    other_key = Key.objects(owner=user, id__ne=key_id).first()
    if default_key and other_key:
        other_key.default = True
        other_key.save()
    log.info("Deleted key with id '%s'.", key_id)
    trigger_session_update(user, ['keys'])


def connect_provider(cloud):
    """Establishes cloud connection using the credentials specified.

    Cloud is expected to be a cloud mongoengine model instance.

    """
    return cloud.ctl.compute.connect()


def list_machines(user, cloud_id):
    """List all machines in this cloud via API call to the provider."""
    machines = Cloud.objects.get(owner=user,
                                 id=cloud_id).ctl.compute.list_machines()
    return [machine.as_dict_old() for machine in machines]


def create_machine(user, cloud_id, key_id, machine_name, location_id,
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
                   cronjob={}, command=None, tags=None,
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
    cloud = Cloud.objects.get(owner=user, id=cloud_id)
    conn = connect_provider(cloud)

    machine_name = machine_name_validator(conn.type, machine_name)
    key = None
    if key_id:
        key = Key.objects.get(owner=user, id=key_id)

    # if key_id not provided, search for default key
    if conn.type not in [Provider.LIBVIRT, Provider.DOCKER]:
        if not key_id:
            key = Key.objects.get(owner=user, default=True)
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
            node = _create_machine_docker(conn, machine_name, image_id, '',
                                          public_key=public_key,
                                          docker_env=docker_env,
                                          docker_command=docker_command,
                                          docker_port_bindings=docker_port_bindings,
                                          docker_exposed_ports=docker_exposed_ports)
            node_info = conn.inspect_node(node)
            try:
                ssh_port = int(node_info.extra['network_settings']['Ports']['22/tcp'][0]['HostPort'])
            except:
                pass
        else:
            node = _create_machine_docker(conn, machine_name, image_id, script, docker_env=docker_env,
                                          docker_command=docker_command, docker_port_bindings=docker_port_bindings,
                                          docker_exposed_ports=docker_exposed_ports)
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
                                          public_key, machine_name, image, size,
                                          location, ips)
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
        node = _create_machine_softlayer(conn, key_id, private_key, public_key,
                                         machine_name, image, size,
                                         location, bare_metal, cloud_init, hourly, softlayer_backend_vlan_id)
    elif conn.type is Provider.DIGITAL_OCEAN:
        node = _create_machine_digital_ocean(conn, key_id, private_key,
                                             public_key, machine_name,
                                             image, size, location, cloud_init)
    elif conn.type == Provider.AZURE:
        node = _create_machine_azure(conn, key_id, private_key,
                                     public_key, machine_name,
                                     image, size, location, cloud_init=cloud_init,
                                     cloud_service_name=None, azure_port_bindings=azure_port_bindings)
    elif conn.type in [Provider.VCLOUD, Provider.INDONESIAN_VCLOUD]:
        node = _create_machine_vcloud(conn, machine_name, image, size, public_key, networks)
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
        node = _create_machine_hostvirtual(conn, public_key, machine_name, image,
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
        except NotUniqueError:
            machine = Machine.objects.get(cloud=cloud, machine_id=node.id)

        username = node.extra.get('username', '')
        machine.ctl.associate_key(key, username=username,
                                  port=ssh_port, no_connect=True)
    # Call post_deploy_steps for every provider
    if conn.type == Provider.AZURE:
        # for Azure, connect with the generated password, deploy the ssh key
        # when this is ok, it calls post_deploy for script/monitoring
        mist.io.tasks.azure_post_create_steps.delay(
            user.id, cloud_id, node.id, monitoring, key_id,
            node.extra.get('username'), node.extra.get('password'), public_key,
            script=script,
            script_id=script_id, script_params=script_params, job_id=job_id,
            hostname=hostname, plugins=plugins, post_script_id=post_script_id,
            post_script_params=post_script_params, cronjob=cronjob,
        )
    elif conn.type == Provider.OPENSTACK:
        if associate_floating_ip:
            networks = list_networks(user, cloud_id)
            mist.io.tasks.openstack_post_create_steps.delay(
                user.id, cloud_id, node.id, monitoring, key_id,
                node.extra.get('username'), node.extra.get('password'),
                public_key, script=script, script_id=script_id, script_params=script_params,
                job_id=job_id, hostname=hostname, plugins=plugins,
                post_script_params=post_script_params,
                networks=networks, cronjob=cronjob,
            )
    elif conn.type == Provider.RACKSPACE_FIRST_GEN:
        # for Rackspace First Gen, cannot specify ssh keys. When node is
        # created we have the generated password, so deploy the ssh key
        # when this is ok and call post_deploy for script/monitoring
        mist.io.tasks.rackspace_first_gen_post_create_steps.delay(
            user.id, cloud_id, node.id, monitoring, key_id,
            node.extra.get('password'), public_key, script=script,
            script_id=script_id, script_params=script_params,
            job_id=job_id, hostname=hostname, plugins=plugins,
            post_script_id=post_script_id,
            post_script_params=post_script_params, cronjob=cronjob
        )

    elif key_id:
        mist.io.tasks.post_deploy_steps.delay(
            user.id, cloud_id, node.id, monitoring, script=script,
            key_id=key_id, script_id=script_id, script_params=script_params,
            job_id=job_id, hostname=hostname, plugins=plugins,
            post_script_id=post_script_id,
            post_script_params=post_script_params, cronjob=cronjob,
        )

    if tags:
        from mist.core.tag.methods import resolve_id_and_set_tags
        resolve_id_and_set_tags(user, 'machine', node.id, tags,
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
            server_key = conn.ex_import_keypair_from_string(name=machine_name, key_material=key)
            server_key = server_key.name
    except:
        try:
            server_key = conn.ex_import_keypair_from_string(name='mistio' + str(random.randint(1, 100000)),
                                                            key_material=key)
            server_key = server_key.name
        except AttributeError:
            # RackspaceFirstGenNodeDriver based on OpenStack_1_0_NodeDriver
            # has no support for keys. So don't break here, since create_node won't
            # include it anyway
            server_key = None

    try:
        node = conn.create_node(name=machine_name, image=image, size=size,
                                location=location, ex_keyname=server_key, ex_userdata=user_data)
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
            server_key = conn.ex_import_keypair_from_string(name=machine_name, key_material=key)
            server_key = server_key.name
    except:
        server_key = conn.ex_import_keypair_from_string(name='mistio' + str(random.randint(1, 100000)),
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
                keypair = conn.ex_find_or_import_keypair_by_key_material(pubkey=public_key)
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
                              machine_name, image, size, location, bare_metal, cloud_init, hourly,
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
        server_key = conn.create_key_pair('mistio' + str(random.randint(1, 100000)), key)
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


def _create_machine_docker(conn, machine_name, image, script=None, public_key=None, docker_env={}, docker_command=None,
                           tty_attach=True, docker_port_bindings={}, docker_exposed_ports={}):
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
            docker_environment = ["%s=%s" % (key, value) for key, value in docker_env.iteritems()]
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
                                  machine_name, image, size, location, user_data):
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
            server_key = conn.ex_create_ssh_key('mistio' + str(random.randint(1, 100000)), key)
        except:
            # on API v1 if we can't create that key, means that key is already
            # on our account. Since we don't know the id, we pass all the ids
            server_keys = [str(key.id) for key in keys]

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
            raise MachineCreationError("Digital Ocean, got exception %s" % e, e)

        return node


def _create_machine_libvirt(conn, machine_name, disk_size, ram, cpu,
                            image, disk_path, networks, public_key, cloud_init):
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


def _create_machine_hostvirtual(conn, public_key, machine_name, image, size, location):
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


def _create_machine_packet(conn, public_key, machine_name, image, size, location, cloud_init, project_id=None):
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
                raise BadRequestError("You don't have any projects on packet.net")
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


def _create_machine_vultr(conn, public_key, machine_name, image, size, location, cloud_init):
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
        server_key = conn.ex_create_ssh_key('mistio' + str(random.randint(1, 100000)), key)

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
                          machine_name, image, size, location, cloud_init, cloud_service_name, azure_port_bindings):
    """Create a machine Azure.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    key = public_key.replace('\n', '')

    port_bindings = []
    if azure_port_bindings and type(azure_port_bindings) in [str, unicode]:
        # we receive something like: http tcp 80:80, smtp tcp 25:25, https tcp 443:443
        # and transform it to [{'name':'http', 'protocol': 'tcp', 'local_port': 80, 'port': 80},
        # {'name':'smtp', 'protocol': 'tcp', 'local_port': 25, 'port': 25}]

        for port_binding in azure_port_bindings.split(','):
            try:
                port_dict = port_binding.split()
                port_name = port_dict[0]
                protocol = port_dict[1]
                ports = port_dict[2]
                local_port = ports.split(':')[0]
                port = ports.split(':')[1]
                binding = {'name': port_name, 'protocol': protocol, 'local_port': local_port, 'port': port}
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


def _create_machine_vcloud(conn, machine_name, image, size, public_key, networks):
    """Create a machine vCloud.

    Here there is no checking done, all parameters are expected to be
    sanitized by create_machine.

    """
    key = public_key.replace('\n', '')
    # we have the option to pass a guest customisation script as ex_vm_script. We'll pass
    # the ssh key there

    deploy_script = NamedTemporaryFile(delete=False)
    deploy_script.write('mkdir -p ~/.ssh && echo "%s" >> ~/.ssh/authorized_keys && chmod -R 700 ~/.ssh/' % key)
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
            raise MachineCreationError("Google Compute Engine, got exception %s" % e, e)
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
    # if machine has monitoring, disable it. the way we disable depends on
    # whether this is a standalone io installation or not
    disable_monitoring_function = None
    try:
        from mist.core.methods import disable_monitoring as dis_mon_core
        disable_monitoring_function = dis_mon_core
    except ImportError:
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

    machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)

    machine.ctl.destroy()


def ssh_command(user, cloud_id, machine_id, host, command,
                key_id=None, username=None, password=None, port=22):
    """
    We initialize a Shell instant (for mist.io.shell).

    Autoconfigures shell and returns command's output as string.
    Raises MachineUnauthorizedError if it doesn't manage to connect.

    """
    # check if cloud exists
    Cloud.objects.get(owner=user, id=cloud_id)

    shell = Shell(host)
    key_id, ssh_user = shell.autoconfigure(user, cloud_id, machine_id,
                                           key_id, username, password, port)
    retval, output = shell.command(command)
    shell.disconnect()
    return output


def list_images(user, cloud_id, term=None):
    """List images from each cloud"""
    return Cloud.objects.get(owner=user,
                             id=cloud_id).ctl.compute.list_images(term)


def star_image(user, cloud_id, image_id):
    """Toggle image star (star/unstar)"""
    cloud = Cloud.objects.get(owner=user, id=cloud_id)

    star = cloud.ctl.compute.image_is_starred(image_id)
    if star:
        if image_id in cloud.starred:
            cloud.starred.remove(image_id)
        if image_id not in cloud.unstarred:
            cloud.unstarred.append(image_id)
    else:
        if image_id not in cloud.starred:
            cloud.starred.append(image_id)
        if image_id in cloud.unstarred:
            cloud.unstarred.remove(image_id)
    cloud.save()
    task = mist.io.tasks.ListImages()
    task.clear_cache(user.id, cloud_id)
    task.delay(user.id, cloud_id)
    return not star


def list_clouds(user):
    # FIXME: Move import to the top of the file.
    from mist.core.tag.methods import get_tags_for_resource
    clouds = [cloud.as_dict() for cloud in Cloud.objects(owner=user)]
    for cloud in clouds:
        cloud['tags'] = get_tags_for_resource(user, cloud)
    return clouds


def list_keys(user):
    """List user's keys
    :param user:
    :return:
    """
    from mist.core.tag.methods import get_tags_for_resource
    keys = Key.objects(owner=user).only("default", "name")
    clouds = Cloud.objects(owner=user)
    key_objects = []
    for key in keys:
        key_object = {}
        machines = Machine.objects(cloud__in=clouds,
                                   key_associations__keypair__exact=key)
        key_object["id"] = key.id
        key_object['name'] = key.name
        key_object["isDefault"] = key.default
        key_object["machines"] = transform_key_machine_associations(machines,
                                                                    key)
        key_object['tags'] = get_tags_for_resource(user, key)
        key_objects.append(key_object)
    return key_objects


def list_sizes(user, cloud_id):
    """List sizes (aka flavors) from each cloud"""
    return Cloud.objects.get(owner=user, id=cloud_id).ctl.compute.list_sizes()


def list_locations(user, cloud_id):
    """List locations from each cloud"""
    return Cloud.objects.get(owner=user,
                             id=cloud_id).ctl.compute.list_locations()


def list_networks(user, cloud_id):
    """List networks from each cloud.
    Currently EC2, Openstack and GCE clouds are supported. For other providers
    this returns an empty list.
    """

    ret = {'public': [],
           'private': [],
           'routers': []}

    try:
        cloud = Cloud.objects.get(owner=user, id=cloud_id)
    except Cloud.DoesNotExist:
        raise CloudNotFoundError

    networks = cloud.ctl.network.list_networks()

    for network in networks:

        network_dict = network.as_dict()
        network_dict['subnets'] = [subnet.as_dict() for subnet in network.ctl.list_subnets()]

    # TODO: Backwards-compatible network privacy detection, to be replaced
        if not network_dict.get('router_external'):
            ret['private'].append(network_dict)
        else:
            ret['public'].append(network_dict)
    return ret


def list_subnets(cloud, network):
    """List subnets for a particular network on a given cloud.
    Currently EC2, Openstack and GCE clouds are supported. For other providers
    this returns an empty list.
    """

    subnets = cloud.ctl.network.list_subnets(network=network)
    return [subnet.as_dict() for subnet in subnets]


def list_projects(user, cloud_id):
    """List projects for each account.
    Currently supported for Packet.net. For other providers
    this returns an empty list
    """
    cloud = Cloud.objects.get(owner=user, id=cloud_id)
    conn = connect_provider(cloud)

    ret = {}
    if conn.type in [Provider.PACKET]:
        projects = conn.ex_list_projects()
    else:
        projects = []

    ret = [{'id': project.id,
            'name': project.name,
            'extra': project.extra
            }
           for project in projects]
    return ret

    if conn.type == 'libvirt':
        # close connection with libvirt
        conn.disconnect()
    return ret


def associate_ip(user, cloud_id, network_id, ip, machine_id=None, assign=True):
    cloud = Cloud.objects.get(owner=user, id=cloud_id)
    conn = connect_provider(cloud)

    if conn.type != Provider.NEPHOSCALE:
        return False

    return conn.ex_associate_ip(ip, server=machine_id, assign=assign)


def create_network(owner, cloud, network_params):
    """
    Creates a new network on the specified cloud.
    Network_params is a dict containing all the necessary values that describe a network.
    """
    # Create a DB document for the new network and call libcloud to declare it on the cloud provider
    new_network = NETWORKS[cloud.ctl.provider].add(cloud=cloud, **network_params)

    # Schedule a UI update
    trigger_session_update(owner, ['clouds'])

    return new_network


def create_subnet(owner, cloud, network, subnet_params):
    """
    Create a new subnet attached to the specified network ont he given cloud.
    Subnet_params is a dict containing all the necessary values that describe a subnet.
    """
    # Create a DB document for the new subnet and call libcloud to declare it on the cloud provider
    new_subnet = SUBNETS[cloud.ctl.provider].add(network=network, **subnet_params)

    # Schedule a UI update
    trigger_session_update(owner, ['clouds'])

    return new_subnet


def delete_network(owner, network):
    """
    Delete a network.
    All subnets attached to the network will be deleted before the network itself.
    """
    network.ctl.delete_network()

    # Schedule a UI update
    trigger_session_update(owner, ['clouds'])


def delete_subnet(owner, subnet):
    """
    Delete a subnet.
    """
    subnet.ctl.delete_subnet()

    # Schedule a UI update
    trigger_session_update(owner, ['clouds'])


def set_machine_tags(user, cloud_id, machine_id, tags):
    """Sets metadata for a machine, given the cloud and machine id.

    Libcloud handles this differently for each provider. Linode and Rackspace,
    at least the old Rackspace providers, don't support metadata adding.

    machine_id comes as u'...' but the rest are plain strings so use == when
    comparing in ifs. u'f' is 'f' returns false and 'in' is too broad.

    Tags is expected to be a list of key-value dicts
    """
    cloud = Cloud.objects.get(owner=user, id=cloud_id)

    if not isinstance(cloud, (cloud_models.AmazonCloud,
                              cloud_models.GoogleCloud,
                              cloud_models.RackSpaceCloud,
                              cloud_models.OpenStackCloud)):
        return False

    conn = connect_provider(cloud)

    machine = Node(machine_id, name='', state=NodeState.RUNNING,
                   public_ips=[], private_ips=[], driver=conn)

    tags_dict = {}
    if isinstance(tags, list):
        for tag in tags:
            for tag_key, tag_value in tag.items():
                if not tag_value:
                    tag_value = ""
                if type(tag_key) == unicode:
                    tag_key = tag_key.encode('utf-8')
                if type(tag_value) == unicode:
                    tag_value = tag_value.encode('utf-8')
                tags_dict[tag_key] = tag_value
    elif isinstance(tags, dict):
        for tag_key in tags:
            tag_value = tags[tag_key]
            if not tag_value:
                tag_value = ""
            if type(tag_key) == unicode:
                tag_key = tag_key.encode('utf-8')
            if type(tag_value) == unicode:
                tag_value = tag_value.encode('utf-8')
            tags_dict[tag_key] = tag_value

    if isinstance(cloud, cloud_models.AmazonCloud):
        try:
            # first get a list of current tags. Make sure
            # the response dict gets utf-8 encoded
            # then delete tags and update with the new ones
            ec2_tags = conn.ex_describe_tags(machine)
            ec2_tags.pop('Name')
            encoded_ec2_tags = {}
            for ec2_key, ec2_value in ec2_tags.items():
                if type(ec2_key) == unicode:
                    ec2_key = ec2_key.encode('utf-8')
                if type(ec2_value) == unicode:
                    ec2_value = ec2_value.encode('utf-8')
                encoded_ec2_tags[ec2_key] = ec2_value
            conn.ex_delete_tags(machine, encoded_ec2_tags)
            # ec2 resource can have up to 10 tags, with one of them being the Name
            if len(tags_dict) > 9:
                tags_keys = tags_dict.keys()[:9]
                pop_keys = [key for key in tags_dict.keys() if key not in tags_keys]
                for key in pop_keys:
                    tags_dict.pop(key)

            conn.ex_create_tags(machine, tags_dict)
        except Exception as exc:
            raise CloudUnavailableError(cloud_id, exc)
    else:
        if conn.type == 'gce':
            try:
                for node in conn.list_nodes():
                    if node.id == machine_id:
                        machine = node
                        break
            except Exception as exc:
                raise CloudUnavailableError(cloud_id, exc)
            if not machine:
                raise MachineNotFoundError(machine_id)
            try:
                conn.ex_set_node_metadata(machine, tags)
            except Exception as exc:
                raise InternalServerError("error setting tags", exc)
        else:
            try:
                conn.ex_set_metadata(machine, tags_dict)
            except Exception as exc:
                raise InternalServerError("error creating tags", exc)


def delete_machine_tag(user, cloud_id, machine_id, tag):
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

    cloud = Cloud.objects.get(owner=user, id=cloud_id)

    if not tag:
        raise RequiredParameterMissingError("tag")
    conn = connect_provider(cloud)

    if type(tag) == unicode:
        tag = tag.encode('utf-8')

    if conn.type in [Provider.LINODE, Provider.RACKSPACE_FIRST_GEN]:
        raise MethodNotAllowedError("Deleting metadata is not supported in %s"
                                    % conn.type)

    machine = None
    try:
        for node in conn.list_nodes():
            if node.id == machine_id:
                machine = node
                break
    except Exception as exc:
        raise CloudUnavailableError(cloud_id, exc)
    if not machine:
        raise MachineNotFoundError(machine_id)
    if isinstance(cloud, cloud_models.AmazonCloud):
        tags = machine.extra.get('tags', None)
        pair = None
        for mkey, mdata in tags.iteritems():
            if type(mkey) == unicode:
                mkey = mkey.encode('utf-8')
            if type(mdata) == unicode:
                mdata = mdata.encode('utf-8')
            if tag == mkey:
                pair = {mkey: mdata}
                break
        if not pair:
            raise NotFoundError("tag not found")

        try:
            conn.ex_delete_tags(machine, pair)
        except Exception as exc:
            raise CloudUnavailableError("Error deleting metadata in EC2", exc)

    else:
        if conn.type == 'gce':
            try:
                metadata = machine.extra['metadata']['items']
                for tag_data in metadata:
                    mkey = tag_data.get('key')
                    mdata = tag_data.get('value')
                    if tag == mkey:
                        metadata.remove({u'value': mdata, u'key': mkey})
                conn.ex_set_node_metadata(machine, metadata)
            except Exception as exc:
                raise InternalServerError("Error while updating metadata", exc)
        else:
            tags = machine.extra.get('metadata', None)
            key = None
            for mkey, mdata in tags.iteritems():
                if type(mkey) == unicode:
                    mkey = mkey.encode('utf-8')
                if type(mdata) == unicode:
                    mdata = mdata.encode('utf-8')
                if tag == mkey:
                    key = mkey
            if key:
                tags.pop(key.decode('utf-8'))
            else:
                raise NotFoundError("tag not found")

            try:
                conn.ex_set_metadata(machine, tags)
            except:
                raise CloudUnavailableError("Error while updating metadata")


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
    elif ret.status_code in [400, 401]:
        user.email = ""
        user.mist_api_token = ""
        user.save()
    log.error("Error getting stats %d:%s", ret.status_code, ret.text)
    raise ServiceUnavailableError()


def enable_monitoring(user, cloud_id, machine_id,
                      name='', dns_name='', public_ips=None,
                      no_ssh=False, dry=False, deploy_async=True, **kwargs):
    """Enable monitoring for a machine."""
    cloud = Cloud.objects.get(owner=user, id=cloud_id)
    payload = {
        'action': 'enable',
        'no_ssh': True,
        'dry': dry,
        'name': name or cloud.title,
        'public_ips': ",".join(public_ips or []),
        'dns_name': dns_name,
        'cloud_title': cloud.title,
        'cloud_provider': cloud.provider,
        'cloud_region': cloud.region,
        'cloud_apikey': cloud.apikey,
        'cloud_apisecret': cloud.apisecret,
        'cloud_apiurl': cloud.apiurl,
        'cloud_tenant_name': cloud.tenant_name,
    }
    url_scheme = "%s/clouds/%s/machines/%s/monitoring"
    try:
        resp = requests.post(
            url_scheme % (config.CORE_URI, cloud_id, machine_id),
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
        deploy = mist.io.tasks.deploy_collectd
        if deploy_async:
            deploy = deploy.delay
        deploy(user.email, cloud_id, machine_id, ret_dict['extra_vars'])

    trigger_session_update(user, ['monitoring'])

    return ret_dict


def disable_monitoring(user, cloud_id, machine_id, no_ssh=False):
    """Disable monitoring for a machine."""
    payload = {
        'action': 'disable',
        'no_ssh': True
    }
    url_scheme = "%s/clouds/%s/machines/%s/monitoring"
    try:
        ret = requests.post(
            url_scheme % (config.CORE_URI, cloud_id, machine_id),
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
                                              cloud_id, machine_id)
    trigger_session_update(user, ['monitoring'])


# TODO deprecate this!
# We should decouple probe_ssh_only from ping.
# Use them as two separate functions instead & through celery
def probe(user, cloud_id, machine_id, host, key_id='', ssh_user=''):
    """Ping and SSH to machine and collect various metrics."""

    if not host:
        raise RequiredParameterMissingError('host')

    ping = super_ping(owner=user, host=host)
    try:
        ret = probe_ssh_only(user, cloud_id, machine_id, host,
                             key_id=key_id, ssh_user=ssh_user)
    except Exception as exc:
        log.error(exc)
        log.warning("SSH failed when probing, let's see what ping has to say.")
        ret = {}

    ret.update(ping)
    return ret


def probe_ssh_only(user, cloud_id, machine_id, host, key_id='', ssh_user='',
                   shell=None):
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
        "echo -------- &&"
        "/bin/df -Pah;"
        "echo -------- &&"
        "uname -r ;"
        "echo -------- &&"
        "cat /etc/*release;"
        "echo --------"
        "\"|sh"  # In case there is a default shell other than bash/sh (e.g. csh)
    )

    if key_id:
        log.warn('probing with key %s' % key_id)

    if not shell:
        cmd_output = ssh_command(user, cloud_id, machine_id,
                                 host, command, key_id=key_id)
    else:
        retval, cmd_output = shell.command(command)
    cmd_output = cmd_output.replace('\r', '').split('--------')
    log.warn(cmd_output)
    uptime_output = cmd_output[1]
    loadavg = re.split('load averages?: ', uptime_output)[1].split(', ')
    users = re.split(' users?', uptime_output)[0].split(', ')[-1].strip()
    uptime = cmd_output[2]
    cores = cmd_output[3]
    ips = re.findall('inet addr:(\S+)', cmd_output[4])
    m = re.findall('((?:[0-9a-fA-F]{1,2}:){5}[0-9a-fA-F]{1,2})', cmd_output[4])
    if '127.0.0.1' in ips:
        ips.remove('127.0.0.1')
    macs = {}
    for i in range(0, len(ips)):
        try:
            macs[ips[i]] = m[i]
        except IndexError:
            # in case of interfaces, such as VPN tunnels, with a dummy MAC addr
            continue
    pub_ips = find_public_ips(ips)
    priv_ips = [ip for ip in ips if ip not in pub_ips]

    kernel_version = cmd_output[6].replace("\n", "")
    os_release = cmd_output[7]
    os, os_version = parse_os_release(os_release)

    return {
        'uptime': uptime,
        'loadavg': loadavg,
        'cores': cores,
        'users': users,
        'pub_ips': pub_ips,
        'priv_ips': priv_ips,
        'macs': macs,
        'df': cmd_output[5],
        'timestamp': time(),
        'kernel': kernel_version,
        'os': os,
        'os_version': os_version,
        'dirty_cow': dirty_cow(os, os_version, kernel_version)
    }


def ping(host, user=None):
    return super_ping(user, host=host)


def find_public_ips(ips):
    public_ips = []
    for ip in ips:
        # is_private_subnet does not check for ipv6
        try:
            if not is_private_subnet(ip):
                public_ips.append(ip)
        except:
            pass
    return public_ips


def notify_admin(title, message="", team="all"):
    """ This will only work on a multi-user setup configured to send emails """
    try:
        from mist.core.helpers import send_email
        send_email(title, message,
                   config.NOTIFICATION_EMAIL.get(team,
                                                 config.NOTIFICATION_EMAIL))
    except ImportError:
        pass


def notify_user(user, title, message="", email_notify=True, **kwargs):
    # Notify connected user via amqp
    payload = {'title': title, 'message': message}
    payload.update(kwargs)
    if 'command' in kwargs:
        output = '%s\n' % kwargs['command']
        if 'output' in kwargs:
            output += '%s\n' % kwargs['output'].decode('utf-8', 'ignore')
        if 'retval' in kwargs:
            output += 'returned with exit code %s.\n' % kwargs['retval']
        payload['output'] = output
    amqp_publish_user(user, routing_key='notify', data=payload)

    body = message + '\n' if message else ''
    if 'cloud_id' in kwargs:
        cloud_id = kwargs['cloud_id']
        body += "Cloud:\n"
        try:
            cloud = Cloud.objects.get(owner=user, id=cloud_id)
            cloud_title = cloud.title
        except DoesNotExist:
            cloud_title = ''
            cloud = ''
        if cloud_title:
            body += "  Name: %s\n" % cloud_title
        body += "  Id: %s\n" % cloud_id
        if 'machine_id' in kwargs:
            machine_id = kwargs['machine_id']
            body += "Machine:\n"
            if kwargs.get('machine_name'):
                name = kwargs['machine_name']
            else:
                try:
                    name = Machine.objects.get(cloud=cloud,
                                               machine_id=machine_id).name
                except DoesNotExist:
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
        body += "Output: %s\n" % kwargs['output'].decode('utf-8', 'ignore')

    try:  # Send email in multi-user env
        if email_notify:
            from mist.core.helpers import send_email
            email = user.email if hasattr(user, 'email') else user.get_email()
            send_email("[mist.io] %s" % title, body.encode('utf-8', 'ignore'),
                       email)
    except ImportError:
        pass


def find_metrics(user, cloud_id, machine_id):
    url = "%s/clouds/%s/machines/%s/metrics" % (config.CORE_URI,
                                                cloud_id, machine_id)
    headers = {'Authorization': get_auth_header(user)}
    try:
        resp = requests.get(url, headers=headers, verify=config.SSL_VERIFY)
    except requests.exceptions.SSLError as exc:
        raise SSLError()
    except Exception as exc:
        log.error("Exception requesting find_metrics: %r", exc)
        raise ServiceUnavailableError(exc=exc)
    if not resp.ok:
        log.error("Error in find_metrics %d:%s", resp.status_code, resp.text)
        raise ServiceUnavailableError(resp.text)
    return resp.json()


def assoc_metric(user, cloud_id, machine_id, metric_id):
    url = "%s/clouds/%s/machines/%s/metrics" % (config.CORE_URI,
                                                cloud_id, machine_id)
    try:
        resp = requests.put(url,
                            headers={'Authorization': get_auth_header(user)},
                            params={'metric_id': metric_id},
                            verify=config.SSL_VERIFY)
    except requests.exceptions.SSLError as exc:
        raise SSLError()
    except Exception as exc:
        log.error("Exception requesting assoc_metric: %r", exc)
        raise ServiceUnavailableError(exc=exc)
    if not resp.ok:
        log.error("Error in assoc_metric %d:%s", resp.status_code, resp.text)
        raise ServiceUnavailableError(resp.text)
    trigger_session_update(user, [])


def disassoc_metric(user, cloud_id, machine_id, metric_id):
    url = "%s/clouds/%s/machines/%s/metrics" % (config.CORE_URI,
                                                cloud_id, machine_id)
    try:
        resp = requests.delete(url,
                               headers={'Authorization': get_auth_header(user)},
                               params={'metric_id': metric_id},
                               verify=config.SSL_VERIFY)
    except requests.exceptions.SSLError as exc:
        raise SSLError()
    except Exception as exc:
        log.error("Exception requesting disassoc_metric: %r", exc)
        raise ServiceUnavailableError(exc=exc)
    if not resp.ok:
        log.error("Error in disassoc_metric %d:%s", resp.status_code, resp.text)
        raise ServiceUnavailableError(resp.text)
    trigger_session_update(user, [])


def update_metric(user, metric_id, name=None, unit=None,
                  cloud_id=None, machine_id=None):
    url = "%s/metrics/%s" % (config.CORE_URI, metric_id)
    headers = {'Authorization': get_auth_header(user)}
    params = {
        'name': name,
        'unit': unit,
        'cloud_id': cloud_id,
        'machine_id': machine_id,
    }
    try:
        resp = requests.put(url, headers=headers, params=params,
                            verify=config.SSL_VERIFY)
    except requests.exceptions.SSLError as exc:
        raise SSLError()
    except Exception as exc:
        log.error("Exception updating metric: %r", exc)
        raise ServiceUnavailableError(exc=exc)
    if not resp.ok:
        log.error("Error updating metric %d:%s", resp.status_code, resp.text)
        raise BadRequestError(resp.text)
    trigger_session_update(user, [])


def deploy_python_plugin(user, cloud_id, machine_id, plugin_id,
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

    # Initialize SSH connection
    shell = Shell(host)
    key_id, ssh_user = shell.autoconfigure(user, cloud_id, machine_id)
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
    if val is not None and not isinstance(val, (int, float, long)):
        raise Exception("read() must return a single int, float or long "
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


def undeploy_python_plugin(user, cloud_id, machine_id, plugin_id, host):
    # Sanity checks
    if not plugin_id:
        raise RequiredParameterMissingError('plugin_id')
    if not host:
        raise RequiredParameterMissingError('host')

    # Iniatilize SSH connection
    shell = Shell(host)
    key_id, ssh_user = shell.autoconfigure(user, cloud_id, machine_id)

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


def get_stats(user, cloud_id, machine_id, start='', stop='', step='', metrics=''):
    try:
        resp = requests.get(
            "%s/clouds/%s/machines/%s/stats" % (config.CORE_URI,
                                                cloud_id, machine_id),
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
        if resp.status_code == 400:
            raise BadRequestError(resp.text.replace('Bad Request: ', ''))
        raise ServiceUnavailableError(resp.text)


def run_playbook(user, cloud_id, machine_id, playbook_path, extra_vars=None,
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
                                                [(cloud_id, machine_id)])
    if len(inventory.hosts) != 1:
        log.error("Expected 1 host, found %s", inventory.hosts)
        ret_dict['error_msg'] = "Expected 1 host, found %s" % inventory.hosts
        ret_dict['finished_at'] = time()
        return ret_dict
    ret_dict['host'] = inventory.hosts.values()[0]['ansible_ssh_host']
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


def _notify_playbook_result(user, res, cloud_id=None, machine_id=None,
                            extra_vars=None, label='Ansible playbook'):
    title = label + (' succeeded' if res['success'] else ' failed')
    kwargs = {
        'cloud_id': cloud_id,
        'machine_id': machine_id,
        'duration': res['finished_at'] - res['started_at'],
        'error': False if res['success'] else res['error_msg'] or True,
    }
    if not res['success']:
        kwargs['output'] = res['stdout']
    notify_user(user, title, **kwargs)


def deploy_collectd(user, cloud_id, machine_id, extra_vars):
    ret_dict = run_playbook(
        user, cloud_id, machine_id,
        playbook_path='src/deploy_collectd/ansible/enable.yml',
        extra_vars=extra_vars,
        force_handlers=True,
        # debug=True,
    )
    _notify_playbook_result(user, ret_dict, cloud_id, machine_id,
                            label='Collectd deployment')
    return ret_dict


def undeploy_collectd(user, cloud_id, machine_id):
    ret_dict = run_playbook(
        user, cloud_id, machine_id,
        playbook_path='src/deploy_collectd/ansible/disable.yml',
        force_handlers=True,
        # debug=True,
    )
    _notify_playbook_result(user, ret_dict, cloud_id, machine_id,
                            label='Collectd undeployment')
    return ret_dict


def get_deploy_collectd_command_unix(uuid, password, monitor, port=25826):
    url = "https://github.com/mistio/deploy_collectd/raw/master/local_run.py"
    cmd = "wget -O mist_collectd.py %s && $(command -v sudo) python mist_collectd.py %s %s" % (url, uuid, password)
    if monitor != 'monitor1.mist.io':
        cmd += " -m %s" % monitor
    if str(port) != '25826':
        cmd += " -p %s" % port
    return cmd


def get_deploy_collectd_command_windows(uuid, password, monitor, port=25826):
    return 'Set-ExecutionPolicy -ExecutionPolicy RemoteSigned ' \
           '-Scope CurrentUser -Force;(New-Object System.Net.WebClient).' \
           'DownloadFile(\'https://raw.githubusercontent.com/mistio/' \
           'deploy_collectm/master/collectm.remote.install.ps1\',' \
           ' \'.\collectm.remote.install.ps1\');.\collectm.remote.install.ps1 ' \
           '-SetupConfigFile -setupArgs \'-username "%s" -password "%s" ' \
           '-servers @("%s:%s")\'' % (uuid, password, monitor, port)


def get_deploy_collectd_command_coreos(uuid, password, monitor, port=25826):
    return "sudo docker run -d -v /sys/fs/cgroup:/sys/fs/cgroup -e COLLECTD_USERNAME=%s -e COLLECTD_PASSWORD=%s -e MONITOR_SERVER=%s -e COLLECTD_PORT=%s mist/collectd" % (
        uuid, password, monitor, port)


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
            raise MachineNameValidationError("machine name max chars allowed is 255")
    elif provider is Provider.NEPHOSCALE:
        pass
    elif provider is Provider.GCE:
        if not re.search(r'^(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)$', name):
            raise MachineNameValidationError("name must be 1-63 characters long, with the first " + \
                                             "character being a lowercase letter, and all following characters must be a dash, " + \
                                             "lowercase letter, or digit, except the last character, which cannot be a dash.")
    elif provider is Provider.SOFTLAYER:
        pass
    elif provider is Provider.DIGITAL_OCEAN:
        if not re.search(r'^[0-9a-zA-Z]+[0-9a-zA-Z-.]{0,}[0-9a-zA-Z]+$', name):
            raise MachineNameValidationError("machine name may only contain ASCII letters " + \
                                             "or numbers, dashes and dots")
    elif provider is Provider.PACKET:
        if not re.search(r'^[0-9a-zA-Z-.]+$', name):
            raise MachineNameValidationError("machine name may only contain ASCII letters " + \
                                             "or numbers, dashes and periods")
    elif provider == Provider.AZURE:
        pass
    elif provider in [Provider.VCLOUD, Provider.INDONESIAN_VCLOUD]:
        pass
    elif provider is Provider.LINODE:
        if len(name) < 3:
            raise MachineNameValidationError("machine name should be at least 3 chars")
        if not re.search(r'^[0-9a-zA-Z][0-9a-zA-Z-_]+[0-9a-zA-Z]$', name):
            raise MachineNameValidationError("machine name may only contain ASCII letters " + \
                                             "or numbers, dashes and underscores. Must begin and end with letters or numbers, " + \
                                             "and be at least 3 characters long")
    return name


def create_dns_a_record(user, domain_name, ip_addr):
    """Will try to create DNS A record for specified domain name and IP addr.

    All clouds for which there is DNS support will be tried to see if the
    relevant zone exists.

    """

    # split domain_name in dot separated parts
    parts = [part for part in domain_name.split('.') if part]
    # find all possible domains for this domain name, longest first
    all_domains = {}
    for i in range(1, len(parts) - 1):
        host = '.'.join(parts[:i])
        domain = '.'.join(parts[i:]) + '.'
        all_domains[domain] = host
    if not all_domains:
        raise MistError("Couldn't extract a valid domain from '%s'."
                        % domain_name)

    # iterate over all clouds that can also be used as DNS providers
    providers = {}
    clouds = Cloud.objects(owner=user)
    for cloud in clouds:
        if isinstance(cloud, cloud_models.AmazonCloud):
            provider = DnsProvider.ROUTE53
            creds = cloud.apikey, cloud.apisecret
        # TODO: add support for more providers
        # elif cloud.provider == Provider.LINODE:
        #    pass
        # elif cloud.provider == Provider.RACKSPACE:
        #    pass
        else:
            # no DNS support for this provider, skip
            continue
        if (provider, creds) in providers:
            # we have already checked this provider with these creds, skip
            continue

        try:
            conn = get_dns_driver(provider)(*creds)
            zones = conn.list_zones()
        except InvalidCredsError:
            log.error("Invalid creds for DNS provider %s.", provider)
            continue
        except Exception as exc:
            log.error("Error listing zones for DNS provider %s: %r",
                      provider, exc)
            continue

        # for each possible domain, starting with the longest match
        best_zone = None
        for domain in all_domains:
            for zone in zones:
                if zone.domain == domain:
                    log.info("Found zone '%s' in provider '%s'.",
                             domain, provider)
                    best_zone = zone
                    break
            if best_zone:
                break

        # add provider/creds combination to checked list, in case multiple
        # clouds for same provider with same creds exist
        providers[(provider, creds)] = best_zone

    best = None
    for provider, creds in providers:
        zone = providers[(provider, creds)]
        if zone is None:
            continue
        if best is None or len(zone.domain) > len(best[2].domain):
            best = provider, creds, zone

    if not best:
        raise MistError("No DNS zone matches specified domain name.")

    provider, creds, zone = best
    name = all_domains[zone.domain]
    log.info("Will use name %s and zone %s in provider %s.",
             name, zone.domain, provider)

    # debug
    # log.debug("Will print all existing A records for zone '%s'.", zone.domain)
    # for record in zone.list_records():
    #    if record.type == 'A':
    #        log.info("%s -> %s", record.name, record.data)

    msg = ("Creating A record with name %s for %s in zone %s in %s"
           % (name, ip_addr, zone.domain, provider))
    try:
        record = zone.create_record(name, RecordType.A, ip_addr)
    except Exception as exc:
        raise MistError(msg + " failed: %r" % repr(exc))
    log.info(msg + " succeeded.")
    return record
