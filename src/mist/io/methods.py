import os
import re
import shutil
import tempfile
import json
import requests

from mongoengine import ValidationError, NotUniqueError, DoesNotExist

from time import time

from libcloud.compute.types import Provider
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

from mist.io.shell import Shell

from mist.io.helpers import get_auth_header

from mist.io.exceptions import *

from mist.io.helpers import trigger_session_update
from mist.io.helpers import amqp_publish_user
from mist.io.helpers import StdStreamCapture

from mist.io.helpers import dirty_cow, parse_os_release

import mist.io.tasks
import mist.io.inventory

from mist.io.clouds.models import Cloud
from mist.io.networks.models import NETWORKS, SUBNETS, Network, Subnet
from mist.io.machines.models import Machine

try:
    from mist.core.vpn.methods import super_ping
except ImportError:
    from mist.io.dummy.methods import super_ping

from mist.io import config

import mist.io.clouds.models as cloud_models

import logging

logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)


def connect_provider(cloud):
    """Establishes cloud connection using the credentials specified.

    Cloud is expected to be a cloud mongoengine model instance.

    """
    return cloud.ctl.compute.connect()


def ssh_command(owner, cloud_id, machine_id, host, command,
                key_id=None, username=None, password=None, port=22):
    """
    We initialize a Shell instant (for mist.io.shell).

    Autoconfigures shell and returns command's output as string.
    Raises MachineUnauthorizedError if it doesn't manage to connect.

    """
    # check if cloud exists
    Cloud.objects.get(owner=owner, id=cloud_id, deleted=None)

    shell = Shell(host)
    key_id, ssh_user = shell.autoconfigure(owner, cloud_id, machine_id,
                                           key_id, username, password, port)
    retval, output = shell.command(command)
    shell.disconnect()
    return output


def list_images(owner, cloud_id, term=None):
    """List images from each cloud"""
    return Cloud.objects.get(owner=owner, id=cloud_id,
                             deleted=None).ctl.compute.list_images(term)


def star_image(owner, cloud_id, image_id):
    """Toggle image star (star/unstar)"""
    cloud = Cloud.objects.get(owner=owner, id=cloud_id, deleted=None)

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
    task.clear_cache(owner.id, cloud_id)
    task.delay(owner.id, cloud_id)
    return not star


def list_sizes(owner, cloud_id):
    """List sizes (aka flavors) from each cloud"""
    return Cloud.objects.get(owner=owner, id=cloud_id,
                             deleted=None).ctl.compute.list_sizes()


def list_locations(owner, cloud_id):
    """List locations from each cloud"""
    return Cloud.objects.get(owner=owner, id=cloud_id,
                             deleted=None).ctl.compute.list_locations()


def list_subnets(cloud, network):
    """List subnets for a particular network on a given cloud.
    Currently EC2, Openstack and GCE clouds are supported. For other providers
    this returns an empty list.
    """
    if not hasattr(cloud.ctl, 'network'):
        return []
    subnets = cloud.ctl.network.list_subnets(network=network)
    return [subnet.as_dict() for subnet in subnets]


def list_projects(owner, cloud_id):
    """List projects for each account.
    Currently supported for Packet.net. For other providers
    this returns an empty list
    """
    cloud = Cloud.objects.get(owner=owner, id=cloud_id, deleted=None)
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


def create_subnet(owner, cloud, network, subnet_params):
    """
    Create a new subnet attached to the specified network ont he given cloud.
    Subnet_params is a dict containing all the necessary values that describe a subnet.
    """
    if not hasattr(cloud.ctl, 'network'):
        raise NotImplementedError()

    # Create a DB document for the new subnet and call libcloud
    #  to declare it on the cloud provider
    new_subnet = SUBNETS[cloud.ctl.provider].add(network=network,
                                                 **subnet_params)

    # Schedule a UI update
    trigger_session_update(owner, ['clouds'])

    return new_subnet


def delete_subnet(owner, subnet):
    """
    Delete a subnet.
    """
    subnet.ctl.delete()

    # Schedule a UI update
    trigger_session_update(owner, ['clouds'])


#  TODO we don't use this, do we need it?
# def set_machine_tags(owner, cloud_id, machine_id, tags):
#     """Sets metadata for a machine, given the cloud and machine id.
#
#     Libcloud handles this differently for each provider. Linode and Rackspace,
#     at least the old Rackspace providers, don't support metadata adding.
#
#     machine_id comes as u'...' but the rest are plain strings so use == when
#     comparing in ifs. u'f' is 'f' returns false and 'in' is too broad.
#
#     Tags is expected to be a list of key-value dicts
#     """
#     cloud = Cloud.objects.get(owner=owner, id=cloud_id, deleted=None)
#
#     if not isinstance(cloud, (cloud_models.AmazonCloud,
#                               cloud_models.GoogleCloud,
#                               cloud_models.RackSpaceCloud,
#                               cloud_models.OpenStackCloud)):
#         return False
#
#     conn = connect_provider(cloud)
#
#     machine = Node(machine_id, name='', state=NodeState.RUNNING,
#                    public_ips=[], private_ips=[], driver=conn)
#
#     tags_dict = {}
#     if isinstance(tags, list):
#         for tag in tags:
#             for tag_key, tag_value in tag.items():
#                 if not tag_value:
#                     tag_value = ""
#                 if type(tag_key) == unicode:
#                     tag_key = tag_key.encode('utf-8')
#                 if type(tag_value) == unicode:
#                     tag_value = tag_value.encode('utf-8')
#                 tags_dict[tag_key] = tag_value
#     elif isinstance(tags, dict):
#         for tag_key in tags:
#             tag_value = tags[tag_key]
#             if not tag_value:
#                 tag_value = ""
#             if type(tag_key) == unicode:
#                 tag_key = tag_key.encode('utf-8')
#             if type(tag_value) == unicode:
#                 tag_value = tag_value.encode('utf-8')
#             tags_dict[tag_key] = tag_value
#
#     if isinstance(cloud, cloud_models.AmazonCloud):
#         try:
#             # first get a list of current tags. Make sure
#             # the response dict gets utf-8 encoded
#             # then delete tags and update with the new ones
#             ec2_tags = conn.ex_describe_tags(machine)
#             ec2_tags.pop('Name')
#             encoded_ec2_tags = {}
#             for ec2_key, ec2_value in ec2_tags.items():
#                 if type(ec2_key) == unicode:
#                     ec2_key = ec2_key.encode('utf-8')
#                 if type(ec2_value) == unicode:
#                     ec2_value = ec2_value.encode('utf-8')
#                 encoded_ec2_tags[ec2_key] = ec2_value
#             conn.ex_delete_tags(machine, encoded_ec2_tags)
#             # ec2 resource can have up to 10 tags, with one of them being the Name
#             if len(tags_dict) > 9:
#                 tags_keys = tags_dict.keys()[:9]
#                 pop_keys = [key for key in tags_dict.keys() if key not in tags_keys]
#                 for key in pop_keys:
#                     tags_dict.pop(key)
#
#             conn.ex_create_tags(machine, tags_dict)
#         except Exception as exc:
#             raise CloudUnavailableError(cloud_id, exc)
#     else:
#         if conn.type == 'gce':
#             try:
#                 for node in conn.list_nodes():
#                     if node.id == machine_id:
#                         machine = node
#                         break
#             except Exception as exc:
#                 raise CloudUnavailableError(cloud_id, exc)
#             if not machine:
#                 raise MachineNotFoundError(machine_id)
#             try:
#                 conn.ex_set_node_metadata(machine, tags)
#             except Exception as exc:
#                 raise InternalServerError("error setting tags", exc)
#         else:
#             try:
#                 conn.ex_set_metadata(machine, tags_dict)
#             except Exception as exc:
#                 raise InternalServerError("error creating tags", exc)


#  TODO we don't use this, do we need it?
# def delete_machine_tag(owner, cloud_id, machine_id, tag):
#     """Deletes metadata for a machine, given the machine id and the tag to be
#     deleted.
#
#     Libcloud handles this differently for each provider. Linode and Rackspace,
#     at least the old Rackspace providers, don't support metadata updating. In
#     EC2 you can delete just the tag you like. In Openstack you can only set a
#     new list and not delete from the existing.
#
#     Mist.io client knows only the value of the tag and not it's key so it
#     has to loop through the machine list in order to find it.
#
#     Don't forget to check string encoding before using them in ifs.
#     u'f' is 'f' returns false.
#
#     """
#
#     cloud = Cloud.objects.get(owner=owner, id=cloud_id, deleted=None)
#
#     if not tag:
#         raise RequiredParameterMissingError("tag")
#     conn = connect_provider(cloud)
#
#     if type(tag) == unicode:
#         tag = tag.encode('utf-8')
#
#     if conn.type in [Provider.LINODE, Provider.RACKSPACE_FIRST_GEN]:
#         raise MethodNotAllowedError("Deleting metadata is not supported in %s"
#                                     % conn.type)
#
#     machine = None
#     try:
#         for node in conn.list_nodes():
#             if node.id == machine_id:
#                 machine = node
#                 break
#     except Exception as exc:
#         raise CloudUnavailableError(cloud_id, exc)
#     if not machine:
#         raise MachineNotFoundError(machine_id)
#     if isinstance(cloud, cloud_models.AmazonCloud):
#         tags = machine.extra.get('tags', None)
#         pair = None
#         for mkey, mdata in tags.iteritems():
#             if type(mkey) == unicode:
#                 mkey = mkey.encode('utf-8')
#             if type(mdata) == unicode:
#                 mdata = mdata.encode('utf-8')
#             if tag == mkey:
#                 pair = {mkey: mdata}
#                 break
#         if not pair:
#             raise NotFoundError("tag not found")
#
#         try:
#             conn.ex_delete_tags(machine, pair)
#         except Exception as exc:
#             raise CloudUnavailableError("Error deleting metadata in EC2", exc)
#
#     else:
#         if conn.type == 'gce':
#             try:
#                 metadata = machine.extra['metadata']['items']
#                 for tag_data in metadata:
#                     mkey = tag_data.get('key')
#                     mdata = tag_data.get('value')
#                     if tag == mkey:
#                         metadata.remove({u'value': mdata, u'key': mkey})
#                 conn.ex_set_node_metadata(machine, metadata)
#             except Exception as exc:
#                 raise InternalServerError("Error while updating metadata", exc)
#         else:
#             tags = machine.extra.get('metadata', None)
#             key = None
#             for mkey, mdata in tags.iteritems():
#                 if type(mkey) == unicode:
#                     mkey = mkey.encode('utf-8')
#                 if type(mdata) == unicode:
#                     mdata = mdata.encode('utf-8')
#                 if tag == mkey:
#                     key = mkey
#             if key:
#                 tags.pop(key.decode('utf-8'))
#             else:
#                 raise NotFoundError("tag not found")
#
#             try:
#                 conn.ex_set_metadata(machine, tags)
#             except:
#                 raise CloudUnavailableError("Error while updating metadata")


def check_monitoring(user):
    raise NotImplementedError()

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
    raise NotImplementedError()
    """Enable monitoring for a machine."""
    cloud = Cloud.objects.get(owner=user, id=cloud_id, deleted=None)
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
    raise NotImplementedError()
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
def probe(owner, cloud_id, machine_id, host, key_id='', ssh_user=''):
    """Ping and SSH to machine and collect various metrics."""

    if not host:
        raise RequiredParameterMissingError('host')

    ping = super_ping(owner=owner, host=host)
    try:
        ret = probe_ssh_only(owner, cloud_id, machine_id, host,
                             key_id=key_id, ssh_user=ssh_user)
    except Exception as exc:
        log.error(exc)
        log.warning("SSH failed when probing, let's see what ping has to say.")
        ret = {}

    ret.update(ping)
    return ret


def probe_ssh_only(owner, cloud_id, machine_id, host, key_id='', ssh_user='',
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
        cmd_output = ssh_command(owner, cloud_id, machine_id,
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


def ping(host, owner=None):
    return super_ping(owner, host=host)


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
        from mist.io.helpers import send_email
        send_email(title, message,
                   config.NOTIFICATION_EMAIL.get(team,
                                                 config.NOTIFICATION_EMAIL))
    except ImportError:
        pass


def notify_user(owner, title, message="", email_notify=True, **kwargs):
    # Notify connected owner via amqp
    payload = {'title': title, 'message': message}
    payload.update(kwargs)
    if 'command' in kwargs:
        output = '%s\n' % kwargs['command']
        if 'output' in kwargs:
            output += '%s\n' % kwargs['output'].decode('utf-8', 'ignore')
        if 'retval' in kwargs:
            output += 'returned with exit code %s.\n' % kwargs['retval']
        payload['output'] = output
    amqp_publish_user(owner, routing_key='notify', data=payload)

    body = message + '\n' if message else ''
    if 'cloud_id' in kwargs:
        cloud_id = kwargs['cloud_id']
        body += "Cloud:\n"
        try:
            cloud = Cloud.objects.get(owner=owner, id=cloud_id, deleted=None)
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
            from mist.io.helpers import send_email
            email = owner.email if hasattr(owner, 'email') else owner.get_email()
            send_email("[mist.io] %s" % title, body.encode('utf-8', 'ignore'),
                       email)
    except ImportError:
        pass


def find_metrics(user, cloud_id, machine_id):
    raise NotImplementedError()

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
    raise NotImplementedError()

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
    raise NotImplementedError()

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
    raise NotImplementedError()

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


def undeploy_python_plugin(owner, cloud_id, machine_id, plugin_id, host):

    # Sanity checks
    if not plugin_id:
        raise RequiredParameterMissingError('plugin_id')
    if not host:
        raise RequiredParameterMissingError('host')

    # Iniatilize SSH connection
    shell = Shell(host)
    key_id, ssh_user = shell.autoconfigure(owner, cloud_id, machine_id)

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
    raise NotImplementedError()

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


def run_playbook(owner, cloud_id, machine_id, playbook_path, extra_vars=None,
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
    inventory = mist.io.inventory.MistInventory(owner,
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


def _notify_playbook_result(owner, res, cloud_id=None, machine_id=None,
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
    notify_user(owner, title, **kwargs)


def deploy_collectd(owner, cloud_id, machine_id, extra_vars):
    ret_dict = run_playbook(
        owner, cloud_id, machine_id,
        playbook_path='src/deploy_collectd/ansible/enable.yml',
        extra_vars=extra_vars,
        force_handlers=True,
        # debug=True,
    )
    _notify_playbook_result(owner, ret_dict, cloud_id, machine_id,
                            label='Collectd deployment')
    return ret_dict


def undeploy_collectd(owner, cloud_id, machine_id):
    ret_dict = run_playbook(
        owner, cloud_id, machine_id,
        playbook_path='src/deploy_collectd/ansible/disable.yml',
        force_handlers=True,
        # debug=True,
    )
    _notify_playbook_result(owner, ret_dict, cloud_id, machine_id,
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


def create_dns_a_record(owner, domain_name, ip_addr):
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
    clouds = Cloud.objects(owner=owner)
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
