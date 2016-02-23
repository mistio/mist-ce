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
from time import sleep, time
from datetime import datetime
from hashlib import sha256
from StringIO import StringIO
from tempfile import NamedTemporaryFile
from netaddr import IPSet, IPNetwork
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
from mist.io.bare_metal import BareMetalDriver, CoreOSDriver
from mist.io.helpers import check_host, sanitize_host
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


def add_cloud(user, title, provider, apikey, apisecret, apiurl, tenant_name,
                machine_hostname="", region="", machine_key="", machine_user="",
                compute_endpoint="", port=22, docker_port=4243, remove_on_error=True):
    """Adds a new cloud to the user and returns the new cloud_id."""
    if not provider:
        raise RequiredParameterMissingError("provider")
    log.info("Adding new cloud in provider '%s'", provider)

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
        cloud = model.Cloud()
        cloud.title = machine_hostname
        cloud.provider = provider
        cloud.enabled = True
        cloud.machines[machine_id] = machine
        cloud_id = cloud.get_id()
        if cloud_id in user.clouds:
            raise CloudExistsError(cloud_id)

        with user.lock_n_load():
            user.clouds[cloud_id] = cloud
            user.save()

        # try to connect. this will either fail and we'll delete the
        # cloud, or it will work and it will create the association
        if remove_on_error:
            try:
                ssh_command(
                    user, cloud_id, machine_id, machine_hostname, 'uptime',
                    key_id=machine_key, username=machine_user, password=None,
                    port=port
                )
            except MachineUnauthorizedError as exc:
                # remove cloud
                with user.lock_n_load():
                    del user.clouds[cloud_id]
                    user.save()
                raise CloudUnauthorizedError(exc)
    else:
        # if api secret not given, search if we already know it
        # FIXME: just pass along an empty apisecret
        if apisecret == 'getsecretfromdb':
            for cloud_id in user.clouds:
                if apikey == user.clouds[cloud_id].apikey:
                    apisecret = user.clouds[cloud_id].apisecret
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

        cloud = model.Cloud()
        cloud.title = title
        cloud.provider = provider
        cloud.apikey = apikey
        cloud.apisecret = apisecret
        cloud.apiurl = apiurl
        cloud.tenant_name = tenant_name
        cloud.region = region
        if provider == 'docker':
            cloud.docker_port = docker_port
        #For digital ocean v2 of the API, only apisecret is needed.
        #However, in v1 both api_key and api_secret are needed. In order
        #for both versions to be supported (existing v1, and new v2 which
        #is now the default) we set api_key same to api_secret to
        #distinguish digitalocean v2 logins, to avoid adding another
        #arguement on digital ocean libcloud driver

        if provider == 'digitalocean':
            cloud.apikey = cloud.apisecret
        #OpenStack specific: compute_endpoint is passed only when there is a
        # custom endpoint for the compute/nova-compute service
        cloud.compute_endpoint = compute_endpoint
        cloud.enabled = True

        #OpenStack does not like trailing slashes
        #so https://192.168.1.101:5000 will work but https://192.168.1.101:5000/ won't!
        if cloud.provider == 'openstack':
            #Strip the v2.0 or v2.0/ at the end of the url if they are there
            if cloud.apiurl.endswith('/v2.0/'):
                cloud.apiurl = cloud.apiurl.split('/v2.0/')[0]
            elif cloud.apiurl.endswith('/v2.0'):
                cloud.apiurl = cloud.apiurl.split('/v2.0')[0]

            cloud.apiurl = cloud.apiurl.rstrip('/')

        #for HP Cloud
        if 'hpcloudsvc' in apiurl:
            cloud.apiurl = HPCLOUD_AUTH_URL

        if provider == 'vcloud':
            for prefix in ['https://', 'http://']:
                cloud.apiurl = cloud.apiurl.replace(prefix, '')
            cloud.apiurl = cloud.apiurl.split('/')[0] #need host, not url

        cloud_id = cloud.get_id()
        if cloud_id in user.clouds:
            raise CloudExistsError(cloud_id)

        # validate cloud before adding
        if remove_on_error:
            try:
                conn = connect_provider(cloud)
            except Exception as exc:
                raise CloudUnauthorizedError(exc=exc)
            try:
                machines = conn.list_nodes()
            except InvalidCredsError:
                raise CloudUnauthorizedError()
            except Exception as exc:
                log.error("Error while trying list_nodes: %r", exc)
                raise CloudUnavailableError(exc=exc)

        with user.lock_n_load():
            user.clouds[cloud_id] = cloud
            user.save()
    log.info("Cloud with id '%s' added succesfully.", cloud_id)
    trigger_session_update(user.email, ['clouds'])
    return cloud_id


def add_cloud_v_2(user, title, provider, params):
    """
    Version 2 of add_cloud
    Adds a new cloud to the user and returns the cloud_id
    """
    if not provider:
        raise RequiredParameterMissingError("provider")
    log.info("Adding new cloud in provider '%s' with Api-Version: 2", provider)

    # perform hostname validation if hostname is supplied
    if provider in ['vcloud', 'bare_metal', 'docker', 'libvirt', 'openstack', 'vsphere', 'coreos']:
        if provider == 'vcloud':
            hostname = params.get('host', '')
        elif provider == 'bare_metal':
            hostname = params.get('machine_ip', '')
        elif provider == 'docker':
            hostname = params.get('docker_host', '')
        elif provider == 'libvirt':
            hostname = params.get('machine_hostname', '')
        elif provider == 'openstack':
            hostname = params.get('auth_url', '')
        elif provider == 'vsphere':
            hostname = params.get('host', '')
        elif provider == 'coreos':
            hostname = params.get('machine_ip', '')

        if hostname:
            check_host(sanitize_host(hostname))

    baremetal = provider == 'bare_metal'

    if provider == 'bare_metal':
        cloud_id, mon_dict = _add_cloud_bare_metal(user, title, provider, params)
        log.info("Cloud with id '%s' added succesfully.", cloud_id)
        trigger_session_update(user.email, ['clouds'])
        return {'cloud_id': cloud_id, 'monitoring': mon_dict}
    elif provider == 'coreos':
        cloud_id, mon_dict = _add_cloud_coreos(user, title, provider, params)
        log.info("Cloud with id '%s' added succesfully.", cloud_id)
        trigger_session_update(user.email, ['clouds'])
        return {'cloud_id': cloud_id, 'monitoring': mon_dict}
    elif provider == 'ec2':
        cloud_id, cloud = _add_cloud_ec2(user, title, params)
    elif provider == 'rackspace':
        cloud_id, cloud = _add_cloud_rackspace(user, title, provider, params)
    elif provider == 'nephoscale':
        cloud_id, cloud = _add_cloud_nephoscale(title, provider, params)
    elif provider == 'digitalocean':
        cloud_id, cloud = _add_cloud_digitalocean(title, provider, params)
    elif provider == 'softlayer':
        cloud_id, cloud = _add_cloud_softlayer(title, provider, params)
    elif provider == 'gce':
        cloud_id, cloud = _add_cloud_gce(title, provider, params)
    elif provider == 'azure':
        cloud_id, cloud = _add_cloud_azure(title, provider, params)
    elif provider == 'linode':
        cloud_id, cloud = _add_cloud_linode(title, provider, params)
    elif provider == 'docker':
        cloud_id, cloud = _add_cloud_docker(title, provider, params)
    elif provider == 'hpcloud':
        cloud_id, cloud = _add_cloud_hp(user, title, provider, params)
    elif provider == 'openstack':
        cloud_id, cloud = _add_cloud_openstack(title, provider, params)
    elif provider in ['vcloud', 'indonesian_vcloud']:
        cloud_id, cloud = _add_cloud_vcloud(title, provider, params)
    elif provider == 'libvirt':
        cloud_id, cloud = _add_cloud_libvirt(user, title, provider, params)
    elif provider == 'hostvirtual':
        cloud_id, cloud = _add_cloud_hostvirtual(title, provider, params)
    elif provider == 'vultr':
        cloud_id, cloud = _add_cloud_vultr(title, provider, params)
    elif provider == 'vsphere':
        cloud_id, cloud = _add_cloud_vsphere(title, provider, params)
    elif provider == 'packet':
        cloud_id, cloud = _add_cloud_packet(title, provider, params)
    else:
        raise BadRequestError("Provider unknown.")

    if cloud_id in user.clouds:
        raise CloudExistsError(cloud_id)
    remove_on_error = params.get('remove_on_error', True)
    # validate cloud before adding
    if remove_on_error:
        try:
            conn = connect_provider(cloud)
        except InvalidCredsError as exc:
            log.error("Error while adding cloud: %r" % exc)
            raise CloudUnauthorizedError(exc)
        except Exception as exc:
            log.error("Error while adding cloud%r" % exc)
            raise CloudUnavailableError(exc)
        if provider not in ['vshere']:
            # in some providers -eg vSphere- this is not needed
            # as we are sure we got a succesfull connection with
            # the provider if connect_provider doesn't fail
            try:
                machines = conn.list_nodes()
            except InvalidCredsError as exc:
                raise CloudUnauthorizedError(exc)
            except Exception as exc:
                log.error("Error while trying list_nodes: %r", exc)
                raise CloudUnavailableError(exc=exc)

    with user.lock_n_load():
        user.clouds[cloud_id] = cloud
        user.save()
    log.info("Cloud with id '%s' added succesfully with Api-Version: 2.", cloud_id)
    trigger_session_update(user.email, ['clouds'])

    if provider == 'libvirt' and cloud.apisecret:
    # associate libvirt hypervisor witht the ssh key, if on qemu+ssh
        key_id = params.get('machine_key')
        node_id = cloud.apiurl # id of the hypervisor is the hostname provided
        username = cloud.apikey
        associate_key(user, key_id, cloud_id, node_id, username=username)

    return {'cloud_id': cloud_id}


def _add_cloud_bare_metal(user, title, provider, params):
    """
    Add a bare metal cloud
    """
    remove_on_error = params.get('remove_on_error', True)
    machine_key = params.get('machine_key', '')
    machine_user = params.get('machine_user', '')
    is_windows = params.get('windows', False)
    if is_windows:
        os_type = 'windows'
    else:
        os_type = 'unix'
    try:
        port = int(params.get('machine_port', 22))
    except:
        port = 22
    try:
        rdp_port = int(params.get('remote_desktop_port', 3389))
    except:
        rdp_port = 3389
    machine_hostname = params.get('machine_ip', '')

    use_ssh = remove_on_error and os_type == 'unix' and machine_key
    if use_ssh:
        if machine_key not in user.keypairs:
            raise KeypairNotFoundError(machine_key)
        if not machine_hostname:
            raise BadRequestError("You have specified an SSH key but machine "
                                  "hostname is empty.")
        if not machine_user:
            machine_user = 'root'

    machine_hostname = sanitize_host(machine_hostname)
    machine = model.Machine()
    machine.ssh_port = port
    machine.remote_desktop_port = rdp_port
    if machine_hostname:
        machine.dns_name = machine_hostname
        machine.public_ips = [machine_hostname]
    machine_id = title.replace('.', '').replace(' ', '')
    machine.name = title
    machine.os_type = os_type
    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.enabled = True
    cloud.machines[machine_id] = machine
    cloud_id = cloud.get_id()
    if cloud_id in user.clouds:
        raise CloudExistsError(cloud_id)

    with user.lock_n_load():
        user.clouds[cloud_id] = cloud
        user.save()

    # try to connect. this will either fail and we'll delete the
    # cloud, or it will work and it will create the association
    if use_ssh:
        try:
            ssh_command(
                user, cloud_id, machine_id, machine_hostname, 'uptime',
                key_id=machine_key, username=machine_user, password=None,
                port=port
            )
        except MachineUnauthorizedError as exc:
            raise CloudUnauthorizedError(exc)
        except ServiceUnavailableError as exc:
            raise MistError("Couldn't connect to host '%s'."
                            % machine_hostname)
    if params.get('monitoring'):
        try:
            from mist.core.methods import enable_monitoring as _en_monitoring
        except ImportError:
            _en_monitoring = enable_monitoring
        mon_dict = _en_monitoring(user, cloud_id, machine_id,
                                  no_ssh=not use_ssh)
    else:
        mon_dict = {}

    return cloud_id, mon_dict


def _add_cloud_coreos(user, title, provider, params):
    remove_on_error = params.get('remove_on_error', True)
    machine_key = params.get('machine_key', '')
    machine_user = params.get('machine_user', '')
    os_type = 'coreos'

    try:
        port = int(params.get('machine_port', 22))
    except:
        port = 22
    machine_hostname = str(params.get('machine_ip', ''))

    if not machine_hostname:
        raise RequiredParameterMissingError('machine_ip')
    machine_hostname = sanitize_host(machine_hostname)

    use_ssh = remove_on_error and machine_key
    if use_ssh:
        if machine_key not in user.keypairs:
            raise KeypairNotFoundError(machine_key)
        if not machine_user:
            machine_user = 'root'

    machine = model.Machine()
    machine.ssh_port = port
    if machine_hostname:
        machine.dns_name = machine_hostname
        machine.public_ips = [machine_hostname]
    machine_id = machine_hostname.replace('.', '').replace(' ', '')
    machine.name = title
    machine.os_type = os_type
    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.enabled = True
    cloud.machines[machine_id] = machine
    cloud_id = cloud.get_id()

    if cloud_id in user.clouds:
        raise CloudExistsError(cloud_id)

    with user.lock_n_load():
        user.clouds[cloud_id] = cloud
        user.save()

        # try to connect. this will either fail and we'll delete the
        # cloud, or it will work and it will create the association
        if use_ssh:
            try:
                ssh_command(
                    user, cloud_id, machine_id, machine_hostname, 'uptime',
                    key_id=machine_key, username=machine_user, password=None,
                    port=port
                )
            except MachineUnauthorizedError as exc:
                raise CloudUnauthorizedError(exc)
            except ServiceUnavailableError as exc:
                raise MistError("Couldn't connect to host '%s'."
                                % machine_hostname)

    if params.get('monitoring'):
        try:
            from mist.core.methods import enable_monitoring as _en_monitoring
        except ImportError:
            _en_monitoring = enable_monitoring
        mon_dict = _en_monitoring(user, cloud_id, machine_id,
                                  no_ssh=not use_ssh)
    else:
        mon_dict = {}

    return cloud_id, mon_dict


def _add_cloud_vcloud(title, provider, params):
    username = params.get('username', '')
    if not username:
        raise RequiredParameterMissingError('username')

    password = params.get('password', '')
    if not password:
        raise RequiredParameterMissingError('password')

    organization = params.get('organization', '')
    if not organization:
        raise RequiredParameterMissingError('organization')

    username = '%s@%s' % (username, organization)

    host = params.get('host', '')
    if provider == 'vcloud':
        if not host:
            raise RequiredParameterMissingError('host')
        host = sanitize_host(host)
    elif provider == 'indonesian_vcloud':
        host = params.get('indonesianRegion','my.idcloudonline.com')
        if host not in ['my.idcloudonline.com', 'compute.idcloudonline.com']:
            host = 'my.idcloudonline.com'

    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.apikey = username
    cloud.apisecret = password
    cloud.apiurl = host
    cloud.enabled = True
    cloud_id = cloud.get_id()

    return cloud_id, cloud


def _add_cloud_ec2(user, title, params):
        api_key = params.get('api_key', '')
        if not api_key:
            raise RequiredParameterMissingError('api_key')

        api_secret = params.get('api_secret', '')
        if not api_secret:
            raise RequiredParameterMissingError('api_secret')

        region = params.get('region', '')
        if not region:
            raise RequiredParameterMissingError('region')

        if api_secret == 'getsecretfromdb':
            for cloud_id in user.clouds:
                if api_key == user.clouds[cloud_id].apikey:
                    api_secret = user.clouds[cloud_id].apisecret
                    break

        cloud = model.Cloud()
        cloud.title = title
        cloud.provider = region
        cloud.apikey = api_key
        cloud.apisecret = api_secret
        cloud.enabled = True
        cloud_id = cloud.get_id()

        return cloud_id, cloud


def _add_cloud_rackspace(user, title, provider, params):
    username = params.get('username', '')
    if not username:
        raise RequiredParameterMissingError('username')

    api_key = params.get('api_key', '')
    if not api_key:
        raise RequiredParameterMissingError('api_key')

    region = params.get('region', '')
    if not region:
        raise RequiredParameterMissingError('region')

    if 'rackspace_first_gen' in region:
        provider, region = region.split(':')[0], region.split(':')[1]

    if api_key == 'getsecretfromdb':
        for cloud_id in user.clouds:
            if username == user.clouds[cloud_id].apikey:
                api_key = user.clouds[cloud_id].apisecret
                break

    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.apikey = username
    cloud.apisecret = api_key
    cloud.enabled = True
    cloud.region = region
    cloud_id = cloud.get_id()

    return cloud_id, cloud


def _add_cloud_nephoscale(title, provider, params):
    username = params.get('username', '')
    if not username:
        raise RequiredParameterMissingError('username')

    password = params.get('password', '')
    if not password:
        raise RequiredParameterMissingError('password')

    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.apikey = username
    cloud.apisecret = password
    cloud.enabled = True
    cloud_id = cloud.get_id()

    return cloud_id, cloud


def _add_cloud_softlayer(title, provider, params):
    username = params.get('username', '')
    if not username:
        raise RequiredParameterMissingError('username')

    api_key = params.get('api_key', '')
    if not api_key:
        raise RequiredParameterMissingError('api_key')

    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.apikey = username
    cloud.apisecret = api_key
    cloud.enabled = True
    cloud_id = cloud.get_id()

    return cloud_id, cloud


def _add_cloud_digitalocean(title, provider, params):
    token = params.get('token', '')
    if not token:
        raise RequiredParameterMissingError('token')

    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.apikey = token
    cloud.apisecret = token
    cloud.enabled = True
    cloud_id = cloud.get_id()

    return cloud_id, cloud


def _add_cloud_gce(title, provider, params):
    private_key = params.get('private_key', '')
    if not private_key:
        raise RequiredParameterMissingError('private_key')

    project_id = params.get('project_id', '')
    if not project_id:
        raise RequiredParameterMissingError('project_id')

    email = params.get('email', '')
    if not email:
        # support both ways to authenticate a service account,
        # by either using a project id and json key file (highly reccomended)
        # and also by specifying email, project id and private key file
        try:
            creds = json.loads(private_key)
            email = creds['client_email']
            private_key = creds['private_key']
        except:
            raise MistError("Make sure you upload a valid json file")

    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.apikey = email
    cloud.apisecret = private_key
    cloud.tenant_name = project_id
    cloud.enabled = True
    cloud_id = cloud.get_id()

    return cloud_id, cloud


def _add_cloud_azure(title, provider, params):
    subscription_id = params.get('subscription_id', '')
    if not subscription_id:
        raise RequiredParameterMissingError('subscription_id')

    certificate = params.get('certificate', '')
    if not certificate:
        raise RequiredParameterMissingError('certificate')

    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.apikey = subscription_id
    cloud.apisecret = certificate
    cloud.enabled = True
    cloud_id = cloud.get_id()

    return cloud_id, cloud


def _add_cloud_linode(title, provider, params):
    api_key = params.get('api_key', '')
    if not api_key:
        raise RequiredParameterMissingError('api_key')

    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.apikey = api_key
    cloud.apisecret = api_key
    cloud.enabled = True
    cloud_id = cloud.get_id()

    return cloud_id, cloud


def _add_cloud_docker(title, provider, params):
    try:
        docker_port = int(params.get('docker_port', 4243))
    except:
        docker_port = 4243

    docker_host = params.get('docker_host', '')
    if not docker_host:
        raise RequiredParameterMissingError('docker_host')

    auth_user = params.get('auth_user', '')
    auth_password = params.get('auth_password', '')

    # tls auth
    key_file = params.get('key_file', '')
    cert_file = params.get('cert_file', '')
    ca_cert_file = params.get('ca_cert_file', '')

    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.docker_port = docker_port
    cloud.apikey = auth_user
    cloud.key_file = key_file
    cloud.cert_file = cert_file
    cloud.ca_cert_file = ca_cert_file
    cloud.apisecret = auth_password
    cloud.apiurl = docker_host
    cloud.enabled = True
    cloud_id = cloud.get_id()

    return cloud_id, cloud


def _add_cloud_libvirt(user, title, provider, params):
    machine_hostname = params.get('machine_hostname', '')
    if not machine_hostname:
        raise RequiredParameterMissingError('machine_hostname')
    machine_hostname = sanitize_host(machine_hostname)
    apikey = params.get('machine_user', 'root')

    apisecret = params.get('machine_key', '')
    images_location = params.get('images_location', '/var/lib/libvirt/images')

    if apisecret:
        if apisecret not in user.keypairs:
            raise KeypairNotFoundError(apisecret)
        apisecret = user.keypairs[apisecret].private

    try:
        port = int(params.get('ssh_port', 22))
    except:
        port = 22

    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.apikey = apikey
    cloud.apisecret = apisecret
    cloud.apiurl = machine_hostname
    cloud.enabled = True
    cloud.ssh_port = port
    cloud_id = cloud.get_id()
    cloud.images_location = images_location

    return cloud_id, cloud


def _add_cloud_hp(user, title, provider, params):
    username = params.get('username', '')
    if not username:
        raise RequiredParameterMissingError('username')

    password = params.get('password', '')
    if not password:
        raise RequiredParameterMissingError('password')

    tenant_name = params.get('tenant_name', '')
    if not tenant_name:
        raise RequiredParameterMissingError('tenant_name')

    apiurl = params.get('apiurl') or ''
    if 'hpcloudsvc' in apiurl:
            apiurl = HPCLOUD_AUTH_URL

    region = params.get('region', '')
    if not region:
        raise RequiredParameterMissingError('region')

    if password == 'getsecretfromdb':
        for cloud_id in user.clouds:
            if username == user.clouds[cloud_id].apikey:
                password = user.clouds[cloud_id].apisecret
                break

    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.apikey = username
    cloud.apisecret = password
    cloud.apiurl = apiurl
    cloud.region = region
    cloud.tenant_name = tenant_name
    cloud.enabled = True
    cloud_id = cloud.get_id()

    return cloud_id, cloud


def _add_cloud_openstack(title, provider, params):
    username = params.get('username', '')
    if not username:
        raise RequiredParameterMissingError('username')

    password = params.get('password', '')
    if not password:
        raise RequiredParameterMissingError('password')

    auth_url = params.get('auth_url')
    if not auth_url:
        raise RequiredParameterMissingError('auth_url')

    if auth_url.endswith('/v2.0/'):
        auth_url = auth_url.split('/v2.0/')[0]
    elif auth_url.endswith('/v2.0'):
        auth_url = auth_url.split('/v2.0')[0]

    auth_url = auth_url.rstrip('/')

    tenant_name = params.get('tenant_name', '')
    if not tenant_name:
        raise RequiredParameterMissingError('tenant_name')

    region = params.get('region', '')
    compute_endpoint = params.get('compute_endpoint', '')


    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.apikey = username
    cloud.apisecret = password
    cloud.apiurl = auth_url
    cloud.tenant_name = tenant_name
    cloud.region = region
    cloud.compute_endpoint = compute_endpoint
    cloud.enabled = True
    cloud_id = cloud.get_id()

    return cloud_id, cloud


def _add_cloud_hostvirtual(title, provider, params):
    api_key = params.get('api_key', '')
    if not api_key:
        raise RequiredParameterMissingError('api_key')

    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.apikey = api_key
    cloud.apisecret = api_key
    cloud.enabled = True
    cloud_id = cloud.get_id()

    return cloud_id, cloud


def _add_cloud_vultr(title, provider, params):
    api_key = params.get('api_key', '')
    if not api_key:
        raise RequiredParameterMissingError('api_key')

    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.apikey = api_key
    cloud.apisecret = api_key
    cloud.enabled = True
    cloud_id = cloud.get_id()

    return cloud_id, cloud


def _add_cloud_packet(title, provider, params):
    api_key = params.get('api_key', '')
    if not api_key:
        raise RequiredParameterMissingError('api_key')
    project_id = params.get('project_id', '')

    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.apikey = api_key
    cloud.apisecret = api_key
    cloud.enabled = True
    cloud_id = cloud.get_id()
    if project_id:
        cloud.tenant_name = project_id
    return cloud_id, cloud


def _add_cloud_vsphere(title, provider, params):
    username = params.get('username', '')
    if not username:
        raise RequiredParameterMissingError('username')

    password = params.get('password', '')
    if not password:
        raise RequiredParameterMissingError('password')

    host = params.get('host', '')
    if not host:
        raise RequiredParameterMissingError('host')
    host = sanitize_host(host)

    cloud = model.Cloud()
    cloud.title = title
    cloud.provider = provider
    cloud.apikey = username
    cloud.apisecret = password
    cloud.apiurl = host
    cloud.enabled = True
    cloud_id = cloud.get_id()

    return cloud_id, cloud


def rename_cloud(user, cloud_id, new_name):
    """Renames cloud with given cloud_id."""

    log.info("Renaming cloud: %s", cloud_id)
    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)
    for cloud in user.clouds:
        if cloud.title == new_name:
            raise CloudNameExistsError(new_name)
    with user.lock_n_load():
        user.clouds[cloud_id].title = new_name
        user.save()
    log.info("Succesfully renamed cloud '%s'", cloud_id)
    trigger_session_update(user.email, ['clouds'])


def delete_cloud(user, cloud_id):
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
            disable_monitoring_cloud(user, cloud_id)
        except Exception as exc:
            log.warning("Couldn't disable monitoring before deleting cloud. "
                        "Error: %r", exc)

    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)
    with user.lock_n_load():
        del user.clouds[cloud_id]
        user.save()
    log.info("Succesfully deleted cloud '%s'", cloud_id)
    trigger_session_update(user.email, ['clouds'])


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


def associate_key(user, key_id, cloud_id, machine_id, host='', username=None, port=22):
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
    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)

    keypair = user.keypairs[key_id]
    machine_uid = [cloud_id, machine_id]

    # check if key already associated
    associated = False
    for machine in keypair.machines:
        if machine[:2] == machine_uid:
            log.warning("Keypair '%s' already associated with machine '%s' "
                        "in cloud '%s'", key_id, cloud_id, machine_id)
            associated = True
    # if not already associated, create the association
    # this is only needed if association doesn't exist and host is not provided
    # associations will otherwise be created by shell.autoconfigure upon
    # succesful connection
    if not host:
        if not associated:
            for i in range(3):
                try:
                    with user.lock_n_load():
                        assoc = [cloud_id,
                                 machine_id,
                                 0,
                                 username,
                                 False,
                                 port]
                        user.keypairs[key_id].machines.append(assoc)
                        user.save()
                except:
                    if i == 2:
                        log.error('RACE CONDITION: failed to recover from previous race conditions')
                        raise
                    else:
                        log.error('RACE CONDITION: trying to recover from race condition')
                else:
                    break
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
        ssh_command(user, cloud_id, machine_id, host, command, username=username, port=port)
    except MachineUnauthorizedError:
        # couldn't deploy key
        try:
            # maybe key was already deployed?
            ssh_command(user, cloud_id, machine_id, host, 'uptime', key_id=key_id, username=username, port=port)
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
        ssh_command(user, cloud_id, machine_id, host, 'uptime', key_id=key_id, username=username, port=port)
        log.info("Key associated and deployed succesfully.")


def disassociate_key(user, key_id, cloud_id, machine_id, host=None):
    """Disassociates a key from a machine.

    If host is set it will also attempt to actually remove it from
    the machine.

    """

    log.info("Disassociating key, undeploy = %s" % host)

    if key_id not in user.keypairs:
        raise KeypairNotFoundError(key_id)
    ## if cloud_id not in user.clouds:
        ## raise CloudNotFoundError(cloud_id)

    keypair = user.keypairs[key_id]
    machine_uid = [cloud_id, machine_id]
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
            ssh_command(user, cloud_id, machine_id, host, command)
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


def connect_provider(cloud):
    """Establishes cloud connection using the credentials specified.

    It has been tested with:

        * EC2, and the alternative providers like EC2_EU,
        * Rackspace, old style and the new Nova powered one,
        * Openstack Diablo through Trystack, should also try Essex,
        * Linode

    Cloud is expected to be a mist.io.model.Cloud

    """
    import libcloud.security
    if cloud.provider == Provider.LIBVIRT:
        import libcloud.compute.drivers.libvirt_driver
        libcloud.compute.drivers.libvirt_driver.ALLOW_LIBVIRT_LOCALHOST = config.ALLOW_LIBVIRT_LOCALHOST
    if cloud.provider not in ['bare_metal', 'coreos']:
        driver = get_driver(cloud.provider)
    if cloud.provider == Provider.AZURE:
        # create a temp file and output the cert there, so that
        # Azure driver is instantiated by providing a string with the key instead of
        # a cert file
        temp_key_file = NamedTemporaryFile(delete=False)
        temp_key_file.write(cloud.apisecret)
        temp_key_file.close()
        conn = driver(cloud.apikey, temp_key_file.name)
    elif cloud.provider == Provider.OPENSTACK:
        #keep this for cloud compatibility, however we now use HPCLOUD
        #as separate provider
        if 'hpcloudsvc' in cloud.apiurl:
            conn = driver(
                cloud.apikey,
                cloud.apisecret,
                ex_force_auth_version=cloud.auth_version or '2.0_password',
                ex_force_auth_url=cloud.apiurl,
                ex_tenant_name=cloud.tenant_name or cloud.apikey,
                ex_force_service_region = cloud.region,
                ex_force_service_name='Compute'
            )
        else:
            conn = driver(
                cloud.apikey,
                cloud.apisecret,
                ex_force_auth_version=cloud.auth_version or '2.0_password',
                ex_force_auth_url=cloud.apiurl,
                ex_tenant_name=cloud.tenant_name,
                ex_force_service_region=cloud.region,
                ex_force_base_url=cloud.compute_endpoint,
            )
    elif cloud.provider == Provider.HPCLOUD:
        conn = driver(cloud.apikey, cloud.apisecret, cloud.tenant_name,
                      region=cloud.region)
    elif cloud.provider in [Provider.LINODE, Provider.HOSTVIRTUAL, Provider.VULTR]:
        conn = driver(cloud.apisecret)
    elif cloud.provider == Provider.PACKET:
        if cloud.tenant_name:
            conn = driver(cloud.apisecret, project=cloud.tenant_name)
        else:
            conn = driver(cloud.apisecret)
    elif cloud.provider == Provider.GCE:
        conn = driver(cloud.apikey, cloud.apisecret, project=cloud.tenant_name)
    elif cloud.provider == Provider.DOCKER:
        libcloud.security.VERIFY_SSL_CERT = False;
        if cloud.key_file and cloud.cert_file:
            # tls auth, needs to pass the key and cert as files
            key_temp_file = NamedTemporaryFile(delete=False)
            key_temp_file.write(cloud.key_file)
            key_temp_file.close()
            cert_temp_file = NamedTemporaryFile(delete=False)
            cert_temp_file.write(cloud.cert_file)
            cert_temp_file.close()
            if cloud.ca_cert_file:
                # docker started with tlsverify
                ca_cert_temp_file = NamedTemporaryFile(delete=False)
                ca_cert_temp_file.write(cloud.ca_cert_file)
                ca_cert_temp_file.close()
                libcloud.security.VERIFY_SSL_CERT = True;
                libcloud.security.CA_CERTS_PATH.insert(0,ca_cert_temp_file.name)
            conn = driver(host=cloud.apiurl, port=cloud.docker_port, key_file=key_temp_file.name, cert_file=cert_temp_file.name)
        else:
            conn = driver(cloud.apikey, cloud.apisecret, cloud.apiurl, cloud.docker_port)
    elif cloud.provider in [Provider.RACKSPACE_FIRST_GEN,
                              Provider.RACKSPACE]:
        conn = driver(cloud.apikey, cloud.apisecret,
                      region=cloud.region)
    elif cloud.provider in [Provider.NEPHOSCALE, Provider.SOFTLAYER]:
        conn = driver(cloud.apikey, cloud.apisecret)
    elif cloud.provider in [Provider.VCLOUD, Provider.INDONESIAN_VCLOUD]:
        libcloud.security.VERIFY_SSL_CERT = False;
        conn = driver(cloud.apikey, cloud.apisecret, host=cloud.apiurl)
    elif cloud.provider == Provider.DIGITAL_OCEAN:
        if cloud.apikey == cloud.apisecret:  # API v2
            conn = driver(cloud.apisecret)
        else:   # API v1
            driver = get_driver('digitalocean_first_gen')
            conn = driver(cloud.apikey, cloud.apisecret)
    elif cloud.provider == Provider.VSPHERE:
        conn = driver(host=cloud.apiurl, username=cloud.apikey, password=cloud.apisecret)
    elif cloud.provider == 'bare_metal':
        conn = BareMetalDriver(cloud.machines)
    elif cloud.provider == 'coreos':
        conn = CoreOSDriver(cloud.machines)
    elif cloud.provider == Provider.LIBVIRT:
        # support the three ways to connect: local system, qemu+tcp, qemu+ssh
        if cloud.apisecret:
           conn = driver(cloud.apiurl, user=cloud.apikey, ssh_key=cloud.apisecret, ssh_port=cloud.ssh_port)
        else:
            conn = driver(cloud.apiurl, user=cloud.apikey)
    else:
        # ec2
        conn = driver(cloud.apikey, cloud.apisecret)
        # Account for sub-provider regions (EC2_US_WEST, EC2_US_EAST etc.)
        conn.type = cloud.provider
    return conn


def get_machine_actions(machine_from_api, conn, extra):
    """Returns available machine actions based on cloud type.

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
    can_undefine = False
    can_resume = False
    can_suspend = False
    # resume, suspend and undefine are states related to KVM

    # tag allowed on mist.core only for all providers, mist.io
    # supports only EC2, RackSpace, GCE, OpenStack
    try:
        from mist.core.views import set_machine_tags
    except ImportError:
        if conn.type in (Provider.RACKSPACE_FIRST_GEN, Provider.LINODE,
                         Provider.NEPHOSCALE, Provider.SOFTLAYER,
                         Provider.DIGITAL_OCEAN, Provider.DOCKER, Provider.AZURE,
                         Provider.VCLOUD, Provider.INDONESIAN_VCLOUD, Provider.LIBVIRT, Provider.HOSTVIRTUAL, Provider.VSPHERE, Provider.VULTR, Provider.PACKET, 'bare_metal', 'coreos'):
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

    if conn.type in ['bare_metal', 'coreos']:
        can_start = False
        can_destroy = False
        can_stop = False
        can_reboot = False

        if extra.get('can_reboot', False):
        # allow reboot action for bare metal with key associated
            can_reboot = True


    if conn.type in [Provider.LINODE]:
        if machine_from_api.state is NodeState.PENDING:
        #after resize, node gets to pending mode, needs to be started
            can_start = True

    if conn.type in [Provider.LIBVIRT]:
        can_undefine = True
        if machine_from_api.state is NodeState.TERMINATED:
        # in libvirt a terminated machine can be started
            can_start = True
        if machine_from_api.state is NodeState.RUNNING:
            can_suspend = True
        if machine_from_api.state is NodeState.SUSPENDED:
            can_resume = True

    if conn.type in [Provider.VCLOUD, Provider.INDONESIAN_VCLOUD] and machine_from_api.state is NodeState.PENDING:
        can_start = True
        can_stop = True

    if conn.type == Provider.LIBVIRT and extra.get('tags', {}).get('type', None) == 'hypervisor':
        # allow only reboot action for libvirt hypervisor
        can_stop = False
        can_destroy = False
        can_start = False
        can_undefine = False
        can_suspend = False
        can_resume = False

    if conn.type in (Provider.LINODE, Provider.NEPHOSCALE, Provider.DIGITAL_OCEAN,
                     Provider.OPENSTACK, Provider.RACKSPACE) or conn.type in config.EC2_PROVIDERS:
        can_rename = True
    else:
        can_rename = False


    return {'can_stop': can_stop,
            'can_start': can_start,
            'can_destroy': can_destroy,
            'can_reboot': can_reboot,
            'can_tag': can_tag,
            'can_undefine': can_undefine,
            'can_rename': can_rename,
            'can_suspend': can_suspend,
            'can_resume': can_resume}


def list_machines(user, cloud_id):
    """List all machines in this cloud via API call to the provider."""

    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)

    try:
        conn = connect_provider(user.clouds[cloud_id])
        machines = conn.list_nodes()
    except InvalidCredsError:
        raise CloudUnauthorizedError()
    except Exception as exc:
        log.error("Error while running list_nodes: %r", exc)
        raise CloudUnavailableError(exc=exc)
    ret = []
    for m in machines:
        if m.driver.type == 'gce':
            #tags and metadata exist in GCE
            tags = m.extra.get('metadata', {}).get('items')
        else:
            tags = m.extra.get('tags') or m.extra.get('metadata') or {}
        # optimize for js
        if type(tags) == dict:
            tags = [{'key': key, 'value': value} for key, value in tags.iteritems() if key != 'Name']
        #if m.extra.get('availability', None):
        #    # for EC2
        #    tags.append({'key': 'availability', 'value': m.extra['availability']})
        if m.extra.get('DATACENTERID', None):
            # for Linode
            dc = config.LINODE_DATACENTERS.get(m.extra['DATACENTERID'])
            tags.append({'key': 'DATACENTERID', 'value':dc})
        elif m.extra.get('vdc', None):
            # for vCloud
            tags.append({'key': 'vdc', 'value': m.extra['vdc']})

        image_id = m.image or m.extra.get('imageId', None)
        size = m.size or m.extra.get('flavorId', None)
        size = size or m.extra.get('instancetype', None)

        if m.driver.type is Provider.GCE:
                # show specific extra metadata for GCE. Wrap in try/except
                # to prevent from future GCE API changes

                # identify Windows servers
                os_type = 'linux'
                try:
                    if 'windows-cloud' in m.extra['disks'][0].get('licenses')[0]:
                        os_type = 'windows'
                except:
                    pass
                m.extra['os_type'] = os_type

                # windows specific metadata including user/password
                try:
                    for item in m.extra.get('metadata', {}).get('items', []):
                        if item.get('key') in ['gce-initial-windows-password', 'gce-initial-windows-user']:
                            m.extra[item.get('key')] = item.get('value')
                except:
                    pass

                try:
                    if m.extra.get('boot_disk'):
                        m.extra['boot_disk_size'] = m.extra.get('boot_disk').size
                        m.extra['boot_disk_type'] = m.extra.get('boot_disk').extra.get('type')
                        m.extra.pop('boot_disk')
                except:
                    pass

                try:
                    if m.extra.get('zone'):
                        m.extra['zone'] = m.extra.get('zone').name
                except:
                    pass

                try:
                    if m.extra.get('machineType'):
                        m.extra['machineType'] = m.extra.get('machineType').split('/')[-1]
                except:
                    pass
        for k in m.extra.keys():
            try:
                json.dumps(m.extra[k])
            except TypeError:
                m.extra[k] = str(m.extra[k])

        if m.driver.type is Provider.AZURE:
            if m.extra.get('endpoints'):
                m.extra['endpoints'] = json.dumps(m.extra.get('endpoints', {}))

        if m.driver.type == 'bare_metal':
            can_reboot = False
            keypairs = user.keypairs
            for key_id in keypairs:
                for machine in keypairs[key_id].machines:
                    if [cloud_id, m.id] == machine[:2]:
                        can_reboot = True
            m.extra['can_reboot'] = can_reboot

        if m.driver.type in [Provider.NEPHOSCALE, Provider.SOFTLAYER]:
            if 'windows' in m.extra.get('image', '').lower():
                os_type = 'windows'
            else:
                os_type = 'linux'
            m.extra['os_type'] = os_type

        if m.driver.type in config.EC2_PROVIDERS:
            # this is windows for windows servers and None for Linux
            m.extra['os_type'] = m.extra.get('platform', 'linux')

        if m.driver.type is Provider.LIBVIRT:
            if m.extra.get('xml_description'):
                m.extra['xml_description'] = escape(m.extra['xml_description'])

        # tags should be a list
        if not tags:
            tags = []

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
        machine.update(get_machine_actions(m, conn, m.extra))
        ret.append(machine)
    if conn.type == 'libvirt':
        # close connection with libvirt
        conn.disconnect()
    return ret


def create_machine(user, cloud_id, key_id, machine_name, location_id,
                   image_id, size_id, script, image_extra, disk, image_name,
                   size_name, location_name, ips, monitoring, networks=[],
                   docker_env=[], docker_command=None, ssh_port=22,
                   script_id='', script_params='', job_id=None,
                   docker_port_bindings={}, docker_exposed_ports={},
                   azure_port_bindings='', hostname='', plugins=None,
                   disk_size=None, disk_path=None,
                   post_script_id='', post_script_params='', cloud_init='',
                   associate_floating_ip=False, associate_floating_ip_subnet=None, project_id=None):

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
    log.info('Creating machine %s on cloud %s' % (machine_name, cloud_id))

    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)
    conn = connect_provider(user.clouds[cloud_id])

    machine_name = machine_name_validator(conn.type, machine_name)

    if key_id and key_id not in user.keypairs:
        raise KeypairNotFoundError(key_id)

    # if key_id not provided, search for default key
    if conn.type not in [Provider.LIBVIRT, Provider.DOCKER]:
        if not key_id:
            for kid in user.keypairs:
                if user.keypairs[kid].default:
                    key_id = kid
                    break
        if key_id is None:
            raise KeypairNotFoundError("Couldn't find default keypair")

    if key_id:
        keypair = user.keypairs[key_id]
        private_key = keypair.private
        public_key = keypair.public
    else:
        public_key = None

    size = NodeSize(size_id, name=size_name, ram='', disk=disk,
                    bandwidth='', price='', driver=conn)
    image = NodeImage(image_id, name=image_name, extra=image_extra, driver=conn)
    location = NodeLocation(location_id, name=location_name, country='', driver=conn)

    if conn.type is Provider.DOCKER:
        if key_id:
            node = _create_machine_docker(conn, machine_name, image_id, '', public_key=public_key,
                                          docker_env=docker_env, docker_command=docker_command,
                                          docker_port_bindings=docker_port_bindings,
                                          docker_exposed_ports=docker_exposed_ports)
        else:
            node = _create_machine_docker(conn, machine_name, image_id, script, docker_env=docker_env,
                                          docker_command=docker_command, docker_port_bindings=docker_port_bindings,
                                          docker_exposed_ports=docker_exposed_ports)
        if key_id and key_id in user.keypairs:
            node_info = conn.inspect_node(node)
            try:
                ssh_port = int(node_info.extra['network_settings']['Ports']['22/tcp'][0]['HostPort'])
            except:
                pass
    elif conn.type in [Provider.RACKSPACE_FIRST_GEN,
                     Provider.RACKSPACE]:
        node = _create_machine_rackspace(conn, public_key, machine_name, image,
                                         size, location, user_data=cloud_init)
    elif conn.type in [Provider.OPENSTACK]:
        node = _create_machine_openstack(conn, private_key, public_key,
                                         machine_name, image, size, location, networks, cloud_init)
    elif conn.type is Provider.HPCLOUD:
        node = _create_machine_hpcloud(conn, private_key, public_key,
                                       machine_name, image, size, location, networks)
    elif conn.type in config.EC2_PROVIDERS and private_key:
        locations = conn.list_locations()
        for loc in locations:
            if loc.id == location_id:
                location = loc
                break
        node = _create_machine_ec2(conn, key_id, private_key, public_key,
                                   machine_name, image, size, location, cloud_init)
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
                                         machine_name, image, size, location, cloud_init)
    elif conn.type is Provider.SOFTLAYER:
        node = _create_machine_softlayer(conn, key_id, private_key, public_key,
                                         machine_name, image, size,
                                         location)
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

    if conn.type == Provider.AZURE:
        #we have the username
        associate_key(user, key_id, cloud_id, node.id,
                      username=node.extra.get('username'), port=ssh_port)
    elif key_id:
        associate_key(user, key_id, cloud_id, node.id, port=ssh_port)

    if conn.type == Provider.AZURE:
        # for Azure, connect with the generated password, deploy the ssh key
        # when this is ok, it calss post_deploy for script/monitoring
        mist.io.tasks.azure_post_create_steps.delay(
            user.email, cloud_id, node.id, monitoring, script, key_id,
            node.extra.get('username'), node.extra.get('password'), public_key,
            script_id=script_id, script_params=script_params, job_id = job_id,
            hostname=hostname, plugins=plugins,
            post_script_id=post_script_id,
            post_script_params=post_script_params,
        )
    elif conn.type == Provider.HPCLOUD:
        mist.io.tasks.hpcloud_post_create_steps.delay(
            user.email, cloud_id, node.id, monitoring, script, key_id,
            node.extra.get('username'), node.extra.get('password'), public_key,
            script_id=script_id, script_params=script_params, job_id = job_id,
            hostname=hostname, plugins=plugins,
            post_script_id=post_script_id,
            post_script_params=post_script_params,
        )
    elif conn.type == Provider.OPENSTACK:
        if associate_floating_ip:
            networks = list_networks(user, cloud_id)
            mist.io.tasks.openstack_post_create_steps.delay(
                user.email, cloud_id, node.id, monitoring, script, key_id,
                node.extra.get('username'), node.extra.get('password'), public_key,
                script_id=script_id, script_params=script_params, job_id = job_id,
                hostname=hostname, plugins=plugins,
                post_script_id=post_script_id,
                post_script_params=post_script_params,
                networks=networks
            )
    elif conn.type == Provider.RACKSPACE_FIRST_GEN:
        # for Rackspace First Gen, cannot specify ssh keys. When node is
        # created we have the generated password, so deploy the ssh key
        # when this is ok and call post_deploy for script/monitoring
        mist.io.tasks.rackspace_first_gen_post_create_steps.delay(
            user.email, cloud_id, node.id, monitoring, script, key_id,
            node.extra.get('password'), public_key,
            script_id=script_id, script_params=script_params, job_id = job_id,
            hostname=hostname, plugins=plugins,
            post_script_id=post_script_id,
            post_script_params=post_script_params,
        )
    elif key_id:
        mist.io.tasks.post_deploy_steps.delay(
            user.email, cloud_id, node.id, monitoring, script, key_id,
            script_id=script_id, script_params=script_params,
            job_id=job_id, hostname=hostname, plugins=plugins,
            post_script_id=post_script_id,
            post_script_params=post_script_params,
        )


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
                networks=chosen_networks,
                ex_userdata=user_data)
        except Exception as e:
            raise MachineCreationError("OpenStack, got exception %s" % e, e)
    return node


def _create_machine_hpcloud(conn, private_key, public_key, machine_name,
                             image, size, location, networks):
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
            node = conn.create_node(name=machine_name,
                image=image,
                size=size,
                location=location,
                ssh_key=tmp_key_path,
                ssh_alternate_usernames=['ec2-user', 'ubuntu'],
                max_tries=1,
                ex_keyname=server_key,
                networks=chosen_networks)
        except Exception as e:
            raise MachineCreationError("HP Cloud, got exception %s" % e, e)
    return node


def _create_machine_ec2(conn, key_name, private_key, public_key,
                       machine_name, image, size, location, user_data):
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
                raise CloudUnavailableError("Failed to import key "
                                              "(ec2-only): %r" % exc, exc=exc)

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
            raise MachineCreationError("Nephoscale, got exception %s" % e, e)
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
        server_key = conn.ex_create_ssh_key('mistio'+str(random.randint(1,100000)), key)

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
    #we have the option to pass a guest customisation script as ex_vm_script. We'll pass
    #the ssh key there

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

    metadata = {#'startup-script': script,
                'sshKeys': 'user:%s' % key}
    #metadata for ssh user, ssh key and script to deploy
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
                ssh_key=tmp_key_path
            )
        except Exception as e:
            raise MachineCreationError("Linode, got exception %s" % e, e)
    return node


def _machine_action(user, cloud_id, machine_id, action, plan_id=None, name=None):
    """Start, stop, reboot, resize, undefine and destroy have the same logic underneath, the only
    thing that changes is the action. This helper function saves us some code.

    """
    actions = ('start', 'stop', 'reboot', 'destroy', 'resize', 'rename', 'undefine', 'suspend', 'resume')

    if action not in actions:
        raise BadRequestError("Action '%s' should be one of %s" % (action,
                                                                   actions))

    if cloud_id not in user.clouds:
        raise CloudNotFoundError()

    bare_metal = False
    if user.clouds[cloud_id].provider == 'bare_metal':
        bare_metal = True

    try:
        conn = connect_provider(user.clouds[cloud_id])
    except InvalidCredsError:
        raise CloudUnauthorizedError()
    except Exception as exc:
        log.error("Error while connecting to cloud")
        raise CloudUnavailableError(exc=exc)

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
                    machine_uid = [cloud_id, machine_id]

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
        elif action is 'undefine':
            # In libcloud undefine means destroy machine and delete XML configuration
            if conn.type == 'libvirt':
                conn.ex_undefine_node(machine)
        elif action is 'suspend':
            if conn.type == 'libvirt':
                conn.ex_suspend_node(machine)
        elif action is 'resume':
            if conn.type == 'libvirt':
                conn.ex_resume_node(machine)

        elif action is 'resize':
            conn.ex_resize_node(node, plan_id)
        elif action is 'rename':
            conn.ex_rename_node(node, name)
        elif action is 'reboot':
            if bare_metal:
                try:
                    hostname = user.clouds[cloud_id].machines[machine_id].public_ips[0]
                    command = '$(command -v sudo) shutdown -r now'
                    ssh_command(user, cloud_id, machine_id, hostname, command)
                    return True
                except:
                    return False
            else:
                if conn.type == 'libvirt':
                    if machine.extra.get('tags', {}).get('type', None) == 'hypervisor':
                         # issue an ssh command for the libvirt hypervisor
                        try:
                            hostname = machine.public_ips[0]
                            command = '$(command -v sudo) shutdown -r now'
                            ssh_command(user, cloud_id, machine_id, hostname, command)
                            return True
                        except:
                            return False

                    else:
                       machine.reboot()
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
                        machine_uid = [cloud_id, machine_id]

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


def start_machine(user, cloud_id, machine_id):
    """Starts a machine on clouds that support it.

    Currently only EC2 supports that.
    Normally try won't get an AttributeError exception because this
    action is not allowed for machines that don't support it. Check
    helpers.get_machine_actions.

    """
    _machine_action(user, cloud_id, machine_id, 'start')


def stop_machine(user, cloud_id, machine_id):
    """Stops a machine on clouds that support it.

    Currently only EC2 supports that.
    Normally try won't get an AttributeError exception because this
    action is not allowed for machines that don't support it. Check
    helpers.get_machine_actions.

    """
    _machine_action(user, cloud_id, machine_id, 'stop')


def reboot_machine(user, cloud_id, machine_id):
    """Reboots a machine on a certain cloud."""
    _machine_action(user, cloud_id, machine_id, 'reboot')


def undefine_machine(user, cloud_id, machine_id):
    """Undefines machine - used in KVM libvirt to destroy machine + delete XML conf"""
    _machine_action(user, cloud_id, machine_id, 'undefine')


def resume_machine(user, cloud_id, machine_id):
    """Resumes machine - used in KVM libvirt to resume suspended machine"""
    _machine_action(user, cloud_id, machine_id, 'resume')


def suspend_machine(user, cloud_id, machine_id):
    """Suspends machine - used in KVM libvirt to pause machine"""
    _machine_action(user, cloud_id, machine_id, 'suspend')


def rename_machine(user, cloud_id, machine_id, name):
    """Renames a machine on a certain cloud."""
    _machine_action(user, cloud_id, machine_id, 'rename', name=name)


def resize_machine(user, cloud_id, machine_id, plan_id):
    """Resize a machine on an other plan."""
    _machine_action(user, cloud_id, machine_id, 'resize', plan_id=plan_id)


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
            disable_monitoring_function(user, cloud_id, machine_id,
                                        no_ssh=True)
        except Exception as exc:
            log.warning("Didn't manage to disable monitoring, maybe the "
                        "machine never had monitoring enabled. Error: %r", exc)

    _machine_action(user, cloud_id, machine_id, 'destroy')

    pair = [cloud_id, machine_id]
    with user.lock_n_load():
        for key_id in user.keypairs:
            keypair = user.keypairs[key_id]
            for machine in keypair.machines:
                if machine[:2] == pair:
                    disassociate_key(user, key_id, cloud_id, machine_id)


def ssh_command(user, cloud_id, machine_id, host, command,
                key_id=None, username=None, password=None, port=22):
    """
    We initialize a Shell instant (for mist.io.shell).

    Autoconfigures shell and returns command's output as string.
    Raises MachineUnauthorizedError if it doesn't manage to connect.

    """

    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)
    else:
        cloud = user.clouds[cloud_id]

    shell = Shell(host)
    key_id, ssh_user = shell.autoconfigure(user, cloud_id, machine_id,
                                           key_id, username, password, port)
    retval, output = shell.command(command)
    shell.disconnect()
    return output


def list_images(user, cloud_id, term=None):
    """List images from each cloud.

    Furthermore if a search_term is provided, we loop through each
    cloud and search for that term in the ids and the names of
    the community images

    """

    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)

    cloud = user.clouds[cloud_id]
    conn = connect_provider(cloud)
    try:
        starred = list(cloud.starred)
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
            rest_images = conn.list_images()
            for gce_image in rest_images:
                if gce_image.extra.get('licenses'):
                    gce_image.extra['licenses'] = None
            # GCE has some objects in extra so we make sure they are not passed
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
        elif conn.type == Provider.LIBVIRT:
            rest_images = conn.list_images(location=cloud.images_location)
        else:
            rest_images = conn.list_images()
            starred_images = [image for image in rest_images
                              if image.id in starred]
        if term and conn.type in config.EC2_PROVIDERS:
            ec2_images += conn.list_images(ex_owner="aws-marketplace")

        images = starred_images + ec2_images + rest_images
        images = [img for img in images
                  if img.name and img.id[:3] not in ['aki', 'ari']
                  and 'windows' not in img.name.lower()]

        if term and conn.type == Provider.LIBVIRT:
            # fetch a new listing of the images and search for the term
            images = conn.list_images()

        if term and conn.type == 'docker':
            images = conn.search_images(term=term)[:40]
        #search directly on docker registry for the query
        elif term:
            images = [img for img in images
                      if term in img.id.lower()
                      or term in img.name.lower()][:40]
    except Exception as e:
        log.error(repr(e))
        raise CloudUnavailableError(cloud_id, e)
    ret = [{'id': image.id,
            'extra': image.extra,
            'name': image.name,
            'star': _image_starred(user, cloud_id, image.id)}
           for image in images]

    return ret


def _image_starred(user, cloud_id, image_id):
    """Check if an image should appear as starred or not to the user"""
    cloud = user.clouds[cloud_id]
    if cloud.provider.startswith('ec2'):
        default = False
        if cloud.provider in config.EC2_IMAGES:
            if image_id in config.EC2_IMAGES[cloud.provider]:
                default = True
    else:
        # consider all images default for clouds with few images
        default = True
    starred = image_id in cloud.starred
    unstarred = image_id in cloud.unstarred
    return starred or (default and not unstarred)


def star_image(user, cloud_id, image_id):
    """Toggle image star (star/unstar)"""

    with user.lock_n_load():
        cloud = user.clouds[cloud_id]
        star = _image_starred(user, cloud_id, image_id)
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
        user.save()
    task = mist.io.tasks.ListImages()
    task.clear_cache(user.email, cloud_id)
    task.delay(user.email, cloud_id)
    return not star


def list_clouds(user):
    ret = []
    for cloud_id in user.clouds:
        cloud = user.clouds[cloud_id]
        info = {'id': cloud_id,
                    'apikey': cloud.apikey,
                    'title': cloud.title or cloud.provider,
                    'provider': cloud.provider,
                    'poll_interval': cloud.poll_interval,
                    'state': 'online' if cloud.enabled else 'offline',
                    # for Provider.RACKSPACE_FIRST_GEN
                    'region': cloud.region,
                    # for Provider.RACKSPACE (the new Nova provider)
                    ## 'datacenter': cloud.datacenter,
                    'enabled': cloud.enabled,
                    'tenant_name': cloud.tenant_name}

        if cloud.provider == 'docker':
            info['docker_port'] = cloud.docker_port

        ret.append(info)

    return ret


def list_keys(user):
    return [{'id': key,
             'machines': user.keypairs[key].machines,
             'isDefault': user.keypairs[key].default}
            for key in user.keypairs]


def list_sizes(user, cloud_id):
    """List sizes (aka flavors) from each cloud."""

    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)
    cloud = user.clouds[cloud_id]
    conn = connect_provider(cloud)

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
    except Exception as exc:
        raise CloudUnavailableError(cloud_id, exc)

    ret = []
    for size in sizes:
        ret.append({'id': size.id,
                    'bandwidth': size.bandwidth,
                    'disk': size.disk,
                    'driver': size.driver.name,
                    'name': size.name,
                    'price': size.price,
                    'ram': size.ram})
    if conn.type == 'libvirt':
        # close connection with libvirt
        conn.disconnect()
    return ret


def list_locations(user, cloud_id):
    """List locations from each cloud.

    Locations mean different things in each cloud. e.g. EC2 uses it as a
    datacenter in a given availability zone, whereas Linode lists availability
    zones. However all responses share id, name and country eventhough in some
    cases might be empty, e.g. Openstack.

    In EC2 all locations by a provider have the same name, so the availability
    zones are listed instead of name.

    """

    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)
    cloud = user.clouds[cloud_id]
    conn = connect_provider(cloud)

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
    if conn.type == 'libvirt':
        # close connection with libvirt
        conn.disconnect()
    return ret


def list_networks(user, cloud_id):
    """List networks from each cloud.
    Currently NephoScale and Openstack networks are supported. For other providers
    this returns an empty list

    """

    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)
    cloud = user.clouds[cloud_id]
    conn = connect_provider(cloud)

    ret = {}
    ret['public'] = []
    ret['private'] = []
    ret['routers'] = []

    # Get the actual networks
    if conn.type in [Provider.NEPHOSCALE]:
        networks = conn.ex_list_networks()
        for network in networks:
            ret['public'].append(nephoscale_network_to_dict(network))
    elif conn.type in [Provider.VCLOUD, Provider.INDONESIAN_VCLOUD]:
        networks = conn.ex_list_networks()

        for network in networks:
            ret['public'].append({
                'id': network.id,
                'name': network.name,
                'extra': network.extra,
            })
    elif conn.type in (Provider.OPENSTACK, Provider.HPCLOUD):
        networks = conn.ex_list_networks()
        subnets = conn.ex_list_subnets()
        routers = conn.ex_list_routers()
        floating_ips = conn.ex_list_floating_ips()
        if conn.connection.tenant_id:
            floating_ips = [floating_ip for floating_ip in floating_ips if floating_ip.extra.get('tenant_id') == conn.connection.tenant_id]
        if floating_ips:
            nodes = conn.list_nodes()
        else:
            nodes = []

        public_networks = []
        for net in networks:
            if net.router_external:
                net_index = networks.index(net)
                public_networks.append(networks.pop(net_index))

        for pub_net in public_networks:
            ret['public'].append(openstack_network_to_dict(pub_net, subnets, floating_ips, nodes))
        for network in networks:
            ret['private'].append(openstack_network_to_dict(network, subnets))
        for router in routers:
            ret['routers'].append(openstack_router_to_dict(router))
    elif conn.type in [Provider.GCE]:
        networks = conn.ex_list_networks()
        for network in networks:
            ret['public'].append(gce_network_to_dict(network))
    elif conn.type in [Provider.EC2, Provider.EC2_AP_NORTHEAST,
                       Provider.EC2_AP_SOUTHEAST, Provider.EC2_AP_SOUTHEAST2,
                       Provider.EC2_EU, Provider.EC2_EU_WEST,
                       Provider.EC2_SA_EAST, Provider.EC2_US_EAST,
                       Provider.EC2_US_WEST, Provider.EC2_US_WEST_OREGON]:
        networks = conn.ex_list_networks()
        for network in networks:
            ret['public'].append(ec2_network_to_dict(network))

    if conn.type == 'libvirt':
        # close connection with libvirt
        conn.disconnect()
    return ret


def list_projects(user, cloud_id):
    """List projects for each account.
    Currently supported for Packet.net. For other providers
    this returns an empty list
    """

    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)
    cloud = user.clouds[cloud_id]
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


def ec2_network_to_dict(network):
    net = {}
    net['name'] = network.name
    net['id'] = network.id
    net['is_default'] = network.extra.get('is_default', False)
    net['state'] = network.extra.get('state')
    net['instance_tenancy'] = network.extra.get('instance_tenancy')
    net['dhcp_options_id'] = network.extra.get('dhcp_options_id')
    net['tags'] = network.extra.get('tags', [])
    net['subnets'] = [{'name': network.cidr_block}]
    return net


def nephoscale_network_to_dict(network):
    net = {}
    net['name'] = network.name
    net['id'] = network.id
    net['subnets'] = network.subnets
    net['is_default'] = network.is_default
    net['zone'] = network.zone
    net['domain_type'] = network.domain_type
    return net


def gce_network_to_dict(network):
    net = {}
    net['name'] = network.name
    net['id'] = network.id
    net['extra'] = network.extra
    net['subnets'] = [{'name': network.cidr,
                       'gateway_ip': network.extra.get('gatewayIPv4')}]
    return net


def openstack_network_to_dict(network, subnets=[], floating_ips=[], nodes=[]):
    net = {}
    net['name'] = network.name
    net['id'] = network.id
    net['status'] = network.status
    net['router_external'] = network.router_external
    net['extra'] = network.extra
    net['public'] = bool(network.router_external)
    net['subnets'] = [openstack_subnet_to_dict(subnet) for subnet in subnets if subnet.id in network.subnets]
    net['floating_ips'] = []
    for floating_ip in floating_ips:
        if floating_ip.floating_network_id == network.id:
            net['floating_ips'].append(openstack_floating_ip_to_dict(floating_ip, nodes))
    return net


def openstack_floating_ip_to_dict(floating_ip, nodes=[]):
    ret = {}
    ret['id'] = floating_ip.id
    ret['floating_network_id'] = floating_ip.floating_network_id
    ret['floating_ip_address'] = floating_ip.floating_ip_address
    ret['fixed_ip_address'] = floating_ip.fixed_ip_address
    ret['status'] = str(floating_ip.status)
    ret['port_id'] = floating_ip.port_id
    ret['extra'] = floating_ip.extra
    ret['node_id'] = ''

    for node in nodes:
        if floating_ip.fixed_ip_address in node.private_ips:
            ret['node_id'] = node.id

    return ret

def openstack_subnet_to_dict(subnet):
    net = {}

    net['name'] = subnet.name
    net['id'] = subnet.id
    net['cidr'] = subnet.cidr
    net['enable_dhcp'] = subnet.enable_dhcp
    net['dns_nameservers'] = subnet.dns_nameservers
    net['allocation_pools'] = subnet.allocation_pools
    net['gateway_ip'] = subnet.gateway_ip
    net['ip_version'] = subnet.ip_version
    net['extra'] = subnet.extra

    return net


def openstack_router_to_dict(router):
    ret = {}

    ret['name'] = router.name
    ret['id'] = router.id
    ret['status'] = router.status
    ret['external_gateway_info'] = router.external_gateway_info
    ret['external_gateway'] = router.external_gateway
    ret['admin_state_up'] = router.admin_state_up
    ret['extra'] = router.extra

    return ret


def associate_ip(user, cloud_id, network_id, ip, machine_id=None, assign=True):
    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)
    cloud = user.clouds[cloud_id]
    conn = connect_provider(cloud)

    if conn.type != Provider.NEPHOSCALE:
        return False

    return conn.ex_associate_ip(ip, server=machine_id, assign=assign)


def create_network(user, cloud_id, network, subnet, router):
    """
    Creates a new network. If subnet dict is specified, after creating the network
    it will use the new network's id to create a subnet

    """
    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)
    cloud = user.clouds[cloud_id]

    conn = connect_provider(cloud)
    if conn.type not in (Provider.OPENSTACK, Provider.HPCLOUD):
        raise NetworkActionNotSupported()

    if conn.type is Provider.OPENSTACK:
        ret = _create_network_openstack(conn, network, subnet, router)
    elif conn.type is Provider.HPCLOUD:
        ret = _create_network_hpcloud(conn, network, subnet, router)

    task = mist.io.tasks.ListNetworks()
    task.clear_cache(user.email, cloud_id)
    trigger_session_update(user.email, ['clouds'])
    return ret


def _create_network_hpcloud(conn, network, subnet, router):
    """
    Create hpcloud network
    """
    try:
        network_name = network.get('name')
    except Exception as e:
        raise RequiredParameterMissingError(e)

    admin_state_up = network.get('admin_state_up', True)
    shared = network.get('shared', False)

    # First we create the network

    try:
        new_network = conn.ex_create_network(name=network_name, admin_state_up=admin_state_up, shared=shared)
    except Exception as e:
        raise NetworkCreationError("Got error %s" % str(e))

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
            subnet = conn.ex_create_subnet(name=subnet_name, network_id=network_id, cidr=cidr,
                                           allocation_pools=allocation_pools, gateway_ip=gateway_ip,
                                           ip_version=ip_version, enable_dhcp=enable_dhcp)
        except Exception as e:
            conn.ex_delete_network(network_id)
            raise NetworkError(e)

        ret['network'] = openstack_network_to_dict(new_network)
        ret['network']['subnets'].append(openstack_subnet_to_dict(subnet))

        if router:
            try:
                router_name = router.get('name')
            except Exception as e:
                raise RequiredParameterMissingError(e)

            subnet_id = ret['network']['subnets'][0]['id']
            external_gateway = router.get('publicGateway', False)

            # If external gateway, find the ext-net
            if external_gateway:
                available_networks = conn.ex_list_networks()
                external_networks = [net for net in available_networks if net.router_external]
                if external_networks:
                    ext_net_id = external_networks[0].id
                else:
                    external_gateway = False
                    ext_net_id = ""

            # First we create the router
            router_obj = conn.ex_create_router(name=router_name, external_gateway=external_gateway,
                                               ext_net_id=ext_net_id)

            # Then we attach the router to the subnet
            router_obj = conn.ex_add_router_interface(router_obj['router']['id'], subnet_id)

    else:
        ret = openstack_network_to_dict(new_network)

    return ret


def _create_network_openstack(conn, network, subnet, router):
    """
    Create openstack specific network
    """
    try:
        network_name = network.get('name')
    except Exception as e:
        raise RequiredParameterMissingError(e)

    admin_state_up = network.get('admin_state_up', True)
    shared = network.get('shared', False)

    # First we create the network
    try:
        new_network = conn.ex_create_network(name=network_name, admin_state_up=admin_state_up, shared=shared)
    except Exception as e:
        raise NetworkCreationError("Got error %s" % str(e))

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
            subnet = conn.ex_create_subnet(name=subnet_name, network_id=network_id, cidr=cidr,
                                           allocation_pools=allocation_pools, gateway_ip=gateway_ip,
                                           ip_version=ip_version, enable_dhcp=enable_dhcp)
        except Exception as e:
            conn.ex_delete_network(network_id)
            raise NetworkError(e)

        ret['network'] = openstack_network_to_dict(new_network)
        ret['network']['subnets'].append(openstack_subnet_to_dict(subnet))

    else:
        ret = openstack_network_to_dict(new_network)

    return ret


def delete_network(user, cloud_id, network_id):
    """
    Delete a neutron network

    """
    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)
    cloud = user.clouds[cloud_id]

    conn = connect_provider(cloud)
    if conn.type is Provider.OPENSTACK:
        try:
            conn.ex_delete_network(network_id)
        except Exception as e:
            raise NetworkError(e)
    elif conn.type is Provider.HPCLOUD:
        try:
            conn.ex_delete_network(network_id)
        except Exception as e:
            raise NetworkError(e)
    else:
        raise NetworkActionNotSupported()

    try:
        task = mist.io.tasks.ListNetworks()
        task.clear_cache(user.email, cloud_id)
        trigger_session_update(user.email, ['clouds'])
    except Exception as e:
        pass


def set_machine_tags(user, cloud_id, machine_id, tags):
    """Sets metadata for a machine, given the cloud and machine id.

    Libcloud handles this differently for each provider. Linode and Rackspace,
    at least the old Rackspace providers, don't support metadata adding.

    machine_id comes as u'...' but the rest are plain strings so use == when
    comparing in ifs. u'f' is 'f' returns false and 'in' is too broad.

    Tags is expected to be a list of key-value dicts
    """

    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)
    cloud = user.clouds[cloud_id]

    conn = connect_provider(cloud)

    machine = Node(machine_id, name='', state=0, public_ips=[],
                   private_ips=[], driver=conn)

    tags_dict = {}
    for tag in tags:
        for tag_key, tag_value in tag.items():
            if type(tag_key) ==  unicode:
                tag_key = tag_key.encode('utf-8')
            if type(tag_value) ==  unicode:
                tag_value = tag_value.encode('utf-8')
            tags_dict[tag_key] = tag_value

    if conn.type in config.EC2_PROVIDERS:
        try:
            # first get a list of current tags. Make sure
            # the response dict gets utf-8 encoded
            # then delete tags and update with the new ones
            ec2_tags = conn.ex_describe_tags(machine)
            ec2_tags.pop('Name')
            encoded_ec2_tags = {}
            for ec2_key, ec2_value in ec2_tags.items():
                if type(ec2_key) ==  unicode:
                    ec2_key = ec2_key.encode('utf-8')
                if type(ec2_value) ==  unicode:
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

    if cloud_id not in user.clouds:
        raise CloudNotFoundError(cloud_id)
    cloud = user.clouds[cloud_id]
    if not tag:
        raise RequiredParameterMissingError("tag")
    conn = connect_provider(cloud)

    if type(tag) ==  unicode:
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
    if conn.type in config.EC2_PROVIDERS:
        tags = machine.extra.get('tags', None)
        pair = None
        for mkey, mdata in tags.iteritems():
            if type(mkey) ==  unicode:
                mkey = mkey.encode('utf-8')
            if type(mdata) ==  unicode:
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
                        metadata.remove({u'value':mdata, u'key':mkey})
                conn.ex_set_node_metadata(machine, metadata)
            except Exception as exc:
                raise InternalServerError("Error while updating metadata", exc)
        else:
            tags = machine.extra.get('metadata', None)
            key = None
            for mkey, mdata in tags.iteritems():
                if type(mkey) ==  unicode:
                    mkey = mkey.encode('utf-8')
                if type(mdata) ==  unicode:
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
        with user.lock_n_load():
            user.email = ""
            user.mist_api_token = ""
            user.save()
    log.error("Error getting stats %d:%s", ret.status_code, ret.text)
    raise ServiceUnavailableError()


def enable_monitoring(user, cloud_id, machine_id,
                      name='', dns_name='', public_ips=None,
                      no_ssh=False, dry=False, deploy_async=True, **kwargs):
    """Enable monitoring for a machine."""
    cloud = user.clouds[cloud_id]
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

    trigger_session_update(user.email, ['monitoring'])

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
    trigger_session_update(user.email, ['monitoring'])


def probe(user, cloud_id, machine_id, host, key_id='', ssh_user=''):
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
        ret = probe_ssh_only(user, cloud_id, machine_id, host,
                             key_id=key_id, ssh_user=ssh_user)
    except:
        log.warning("SSH failed when probing, let's see what ping has to say.")
        ret = {}
    ping_out = ping.stdout.read()
    ping.wait()
    log.info("ping output: %s" % ping_out)
    ret.update(parse_ping(ping_out))
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
       "echo --------"
       "\"|sh" # In case there is a default shell other than bash/sh (e.g. csh)
    )

    if key_id:
        log.warn('probing with key %s' % key_id)

    if not shell:
        cmd_output = ssh_command(user, cloud_id, machine_id,
                                 host, command, key_id=key_id)
    else:
        retval, cmd_output = shell.command(command)

    cmd_output = cmd_output.replace('\r','').split('--------')
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
        macs[ips[i]] = m[i]
    pub_ips = find_public_ips(ips)
    priv_ips = [ip for ip in ips if ip not in pub_ips]

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


def notify_admin(title, message="", team = "all"):
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
        cloud = user.clouds[cloud_id]
        body += "Cloud:\n  Name: %s\n  Id: %s\n" % (cloud.title,
                                                      cloud_id)
        if 'machine_id' in kwargs:
            machine_id = kwargs['machine_id']
            body += "Machine:\n"
            if kwargs.get('machine_name'):
                name = kwargs['machine_name']
            else:
                try:
                    name = cloud.machines[machine_id].name
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
        body += "Output: %s\n" % kwargs['output'].decode('utf-8', 'ignore')

    try: # Send email in multi-user env
        if email_notify:
            from mist.core.helpers import send_email
            send_email("[mist.io] %s" % title, body.encode('utf-8', 'ignore'), user.email)
    except ImportError:
        pass


def find_metrics(user, cloud_id, machine_id):
    url = "%s/clouds/%s/machines/%s/metrics" % (config.CORE_URI,
                                                  cloud_id, machine_id)
    headers={'Authorization': get_auth_header(user)}
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
    trigger_session_update(user.email, [])


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
    trigger_session_update(user.email, [])


def update_metric(user, metric_id, name=None, unit=None,
                  cloud_id=None, machine_id=None):
    url = "%s/metrics/%s" % (config.CORE_URI, metric_id)
    headers={'Authorization': get_auth_header(user)}
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
    trigger_session_update(user.email, [])


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

    # Iniatilize SSH connection
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
     return '''powershell.exe -command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force;(New-Object System.Net.WebClient).DownloadFile('https://github.com/mistio/collectm/blob/build_issues/scripts/collectm.remote.install.ps1?raw=true', '.\collectm.remote.install.ps1');.\collectm.remote.install.ps1 -gitBranch ""build_issues"" -SetupConfigFile -setupArgs '-username """"%s"""""" -password """"""%s"""""" -servers @(""""""%s:%s"""""") -interval 10'"''' % (uuid, password, monitor, port)


def get_deploy_collectd_command_coreos(uuid, password, monitor, port=25826):
    return "sudo docker run -d -v /sys/fs/cgroup:/sys/fs/cgroup -e COLLECTD_USERNAME=%s -e COLLECTD_PASSWORD=%s -e MONITOR_SERVER=%s -e COLLECTD_PORT=%s mist/collectd" % (uuid, password, monitor, port)


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
    elif provider is Provider.HPCLOUD:
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
    for cloud in user.clouds.values():
        if cloud.provider.startswith('ec2_'):
            provider = DnsProvider.ROUTE53
            creds = cloud.apikey, cloud.apisecret
        #TODO: add support for more providers
        #elif cloud.provider == Provider.LINODE:
        #    pass
        #elif cloud.provider == Provider.RACKSPACE:
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
    #log.debug("Will print all existing A records for zone '%s'.", zone.domain)
    #for record in zone.list_records():
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
