import paramiko
import json
import uuid
import tempfile
import functools

import libcloud.security
from libcloud.compute.types import NodeState

from time import time, sleep
from uuid import uuid4

from base64 import b64encode

from memcache import Client as MemcacheClient

from celery import Celery, Task
from celery.exceptions import SoftTimeLimitExceeded

from amqp import Message
from amqp.connection import Connection

from paramiko.ssh_exception import SSHException

import ansible.playbook
import ansible.utils.template
from ansible import callbacks
from ansible import utils

from mist.io.exceptions import ServiceUnavailableError, MachineNotFoundError
from mist.io.exceptions import MistError
from mist.io.shell import Shell
from mist.io.helpers import get_auth_header

from mist.core.user.models import User, Owner
from mist.core.cloud.models import Cloud, Machine, KeyAssociation
from mist.core.keypair.models import Keypair
#from mist.core.tasks import ListTeams
from mist.core import config

cert_path = "src/mist.io/cacert.pem"
celery_cfg = 'mist.core.celery_config'


from mist.io.helpers import amqp_publish_user
from mist.io.helpers import amqp_owner_listening
from mist.io.helpers import amqp_log


# libcloud certificate fix for OS X
libcloud.security.CA_CERTS_PATH.append(cert_path)

import logging
logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)


app = Celery('tasks')
app.conf.update(**config.CELERY_SETTINGS)


@app.task
def update_machine_count(owner, cloud_id, machine_count):
    """
    Counts the machines number of a cloud and of an owner.
    :param owner:
    :param cloud_id:
    :param machine_count:
    :return:
    """
    if owner.find("@")!=-1:
        owner = User.objects.get(email=owner)
    else:
        owner = Owner.objects.get(id=owner)
    cloud = Cloud.objects.get(owner=owner, id=cloud_id)
    cloud.machine_count = machine_count
    cloud.save()
    # TODO machine count property function
    # TODO total machine count property function
    clouds = Cloud.objects(owner=owner)

    owner.total_machine_count = sum(
        [cloud.machine_count for cloud in clouds]
    )
    owner.save()


@app.task
def ssh_command(owner, cloud_id, machine_id, host, command,
                      key_id=None, username=None, password=None, port=22):
    if owner.find("@")!=-1:
        owner = User.objects.get(email=owner)
    else:
        owner = Owner.objects.get(id=owner)
    shell = Shell(host)
    key_id, ssh_user = shell.autoconfigure(owner, cloud_id, machine_id,
                                           key_id, username, password, port)
    retval, output = shell.command(command)
    shell.disconnect()
    if retval:
        from mist.io.methods import notify_user
        notify_user(owner, "Async command failed for machine %s (%s)" %
                    (machine_id, host), output)


@app.task(bind=True, default_retry_delay=3*60)
def post_deploy_steps(self, owner, cloud_id, machine_id, monitoring,
                      key_id=None, username=None, password=None, port=22,
                      script_id='', script_params='', job_id=None,
                      hostname='', plugins=None, script='',
                      post_script_id='', post_script_params='', cronjob={}):


    from mist.io.methods import connect_provider, probe_ssh_only
    from mist.io.methods import notify_user, notify_admin
    from mist.io.methods import create_dns_a_record

    from mist.core.methods import enable_monitoring
    from mist.core.tasks import run_script
    from mist.core.helpers import log_event

    job_id = job_id or uuid.uuid4().hex
    if owner.find("@") != -1:
        owner = User.objects.get(email=owner)
    else:
        owner = Owner.objects.get(id=owner)
    tmp_log = lambda msg, *args: log.error('Post deploy: %s' % msg, *args)
    tmp_log('Entering post deploy steps for %s %s %s',
            owner.id, cloud_id, machine_id)

    try:
        # find the node we're looking for and get its hostname
        node = None
        try:
            cloud = Cloud.objects.get(owner=owner, id=cloud_id)
            conn = connect_provider(cloud)
            nodes = conn.list_nodes() # TODO: use cache
            for n in nodes:
                if n.id == machine_id:
                    node = n
                    break
            tmp_log('run list_machines')
        except:
            raise self.retry(exc=Exception(), countdown=10, max_retries=10)

        if node and len(node.public_ips):
            # filter out IPv6 addresses
            ips = filter(lambda ip: ':' not in ip, node.public_ips)
            host = ips[0]
        else:
            tmp_log('ip not found, retrying')
            raise self.retry(exc=Exception(), countdown=60, max_retries=20)

        if node.state != NodeState.RUNNING:
            tmp_log('not running state')
            raise self.retry(exc=Exception(), countdown=120, max_retries=30)

        try:
            from mist.io.shell import Shell
            shell = Shell(host)
            # connect with ssh even if no command, to create association
            # to be able to enable monitoring
            tmp_log('attempting to connect to shell')
            key_id, ssh_user = shell.autoconfigure(
                owner, cloud_id, node.id, key_id, username, password, port
            )
            tmp_log('connected to shell')
            result = probe_ssh_only(owner, cloud_id, machine_id, host=None,
                                    key_id=key_id, ssh_user=ssh_user,
                                    shell=shell)
            log_dict = {
                    'owner_id': owner.id,
                    'event_type': 'job',
                    'cloud_id': cloud_id,
                    'machine_id': machine_id,
                    'job_id': job_id,
                    'host': host,
                    'key_id': key_id,
                    'ssh_user': ssh_user,
                }
            log_event(action='probe', result=result, **log_dict)
            cloud = Cloud.objects.get(owner=owner, id=cloud_id)
            msg = "Cloud:\n  Name: %s\n  Id: %s\n" % (cloud.title, cloud_id)
            msg += "Machine:\n  Name: %s\n  Id: %s\n" % (node.name, node.id)

            if hostname:
                try:
                    record = create_dns_a_record(owner, hostname, host)
                    hostname = '.'.join((record.name, record.zone.domain))
                    log_event(action='create_dns_a_record', hostname=hostname,
                              **log_dict)
                except Exception as exc:
                    log_event(action='create_dns_a_record', error=str(exc),
                              **log_dict)

            error = False
            if script_id:
                tmp_log('will run script_id %s', script_id)
                ret = run_script.run(
                    owner, script_id, cloud_id, machine_id,
                    params=script_params, host=host, job_id=job_id
                )
                error = ret['error']
                tmp_log('executed script_id %s', script_id)
            elif script:
                tmp_log('will run script')
                log_event(action='deployment_script_started', command=script,
                          **log_dict)
                start_time = time()
                retval, output = shell.command(script)
                tmp_log('executed script %s', script)
                execution_time = time() - start_time
                output = output.decode('utf-8','ignore')
                title = "Deployment script %s" % ('failed' if retval
                                                  else 'succeeded')
                error = retval > 0
                notify_user(owner, title,
                            cloud_id=cloud_id,
                            machine_id=machine_id,
                            machine_name=node.name,
                            command=script,
                            output=output,
                            duration=execution_time,
                            retval=retval,
                            error=retval > 0)
                log_event(action='deployment_script_finished',
                          error=retval > 0,
                          return_value=retval,
                          command=script,
                          stdout=output,
                          **log_dict)

            shell.disconnect()

            if monitoring:
                try:
                    enable_monitoring(owner, cloud_id, node.id,
                        name=node.name, dns_name=node.extra.get('dns_name',''),
                        public_ips=ips, no_ssh=False, dry=False, job_id=job_id,
                        plugins=plugins, deploy_async=False,
                    )
                except Exception as e:
                    print repr(e)
                    error = True
                    notify_user(owner, "Enable monitoring failed for machine %s"
                                % machine_id, repr(e))
                    notify_admin('Enable monitoring on creation failed for '
                                 'user %s machine %s: %r'
                                 % (str(owner), machine_id, e))
                    log_event(action='enable_monitoring_failed', error=repr(e),
                              **log_dict)

            if post_script_id:
                tmp_log('will run post_script_id %s', post_script_id)
                ret = run_script.run(
                    owner, post_script_id, cloud_id, machine_id,
                    params=post_script_params, host=host, job_id=job_id,
                    action_prefix='post_',
                )
                error = ret['error']
                tmp_log('executed post_script_id %s', post_script_id)

            # only for mist.core, set cronjob entry as a post deploy step
            if cronjob:
                try:
                    from mist.core.methods import add_cronjob_entry
                    tmp_log('Add cronjob entry %s', cronjob["name"])
                    cronjob["machines_per_cloud"] = [[cloud_id, machine_id]]
                    cronjob_info = add_cronjob_entry(owner, cronjob)
                    tmp_log("A cronjob entry was added")
                    log_event(action='add cronjob entry',
                              cronjob=cronjob_info.to_json(), **log_dict)

                except Exception as e:
                    print repr(e)
                    error = True
                    notify_user(owner, "add cronjob entry failed for machine %s"
                                % machine_id, repr(e))
                    log_event(action='Add cronjob entry failed', error=repr(e),
                              **log_dict)

            log_event(action='post_deploy_finished', error=error, **log_dict)

        except (ServiceUnavailableError, SSHException) as exc:
            tmp_log(repr(exc))
            raise self.retry(exc=exc, countdown=60, max_retries=15)
    except Exception as exc:
        tmp_log(repr(exc))
        if str(exc).startswith('Retry'):
            raise
        notify_user(owner, "Deployment script failed for machine %s" % machine_id)
        notify_admin("Deployment script failed for machine %s in cloud %s by "
                     "user %s" % (machine_id, cloud_id, str(owner)), repr(exc))
        log_event(
            owner.id,
            event_type='job',
            action='post_deploy_finished',
            cloud_id=cloud_id,
            machine_id=machine_id,
            enable_monitoring=bool(monitoring),
            command=script,
            error="Couldn't connect to run post deploy steps.",
            job_id=job_id
        )


@app.task(bind=True, default_retry_delay=2*60)
def openstack_post_create_steps(self, owner, cloud_id, machine_id, monitoring,
                                key_id, username, password, public_key, script='',
                                script_id='', script_params='', job_id=None,
                                hostname='', plugins=None,
                                post_script_id='', post_script_params='',
                                networks=[], cronjob={}):

    from mist.io.methods import connect_provider
    if owner.find("@")!=-1:
        owner = Owner.objects.get(email=owner)
    else:
        owner = Owner.objects.get(id=owner)

    try:
        cloud = Cloud.objects.get(owner=owner, id=cloud_id)
        conn = connect_provider(cloud)
        nodes = conn.list_nodes()
        node = None

        for n in nodes:
            if n.id == machine_id:
                node = n
                break

        if node and node.state == 0 and len(node.public_ips):
            # filter out IPv6 addresses
            ips = filter(lambda ip: ':' not in ip, node.public_ips)
            host = ips[0]

            post_deploy_steps.delay(
                owner.id, cloud_id, machine_id, monitoring, key_id,
                script=script, script_id=script_id, script_params=script_params,
                job_id=job_id, hostname=hostname, plugins=plugins,
                post_script_id=post_script_id,
                post_script_params=post_script_params, cronjob=cronjob
            )

        else:
            try:
                created_floating_ips = []
                for network in networks['public']:
                    created_floating_ips += [floating_ip for floating_ip
                                             in network['floating_ips']]

                # From the already created floating ips try to find one
                # that is not associated to a node
                unassociated_floating_ip = None
                for ip in created_floating_ips:
                    if not ip['node_id']:
                        unassociated_floating_ip = ip
                        break

                # Find the ports which are associated to the machine
                # (e.g. the ports of the private ips)
                # and use one to associate a floating ip
                ports = conn.ex_list_ports()
                machine_port_id = None
                for port in ports:
                    if port.get('device_id') == node.id:
                        machine_port_id = port.get('id')
                        break

                if unassociated_floating_ip:
                    log.info("Associating floating "
                             "ip with machine: %s" % node.id)
                    ip = conn.ex_associate_floating_ip_to_node(
                        unassociated_floating_ip['id'], machine_port_id)
                else:
                    # Find the external network
                    log.info("Create and associating floating ip with "
                             "machine: %s" % node.id)
                    ext_net_id = networks['public'][0]['id']
                    ip = conn.ex_create_floating_ip(ext_net_id, machine_port_id)

                post_deploy_steps.delay(
                    owner.id, cloud_id, machine_id, monitoring, key_id,
                    script=script,
                    script_id=script_id, script_params=script_params,
                    job_id=job_id, hostname=hostname, plugins=plugins,
                    post_script_id=post_script_id,
                    post_script_params=post_script_params,
                )

            except:
                raise self.retry(exc=Exception(), max_retries=20)
    except Exception as exc:
        if str(exc).startswith('Retry'):
            raise


@app.task(bind=True, default_retry_delay=2*60)
def azure_post_create_steps(self, owner, cloud_id, machine_id, monitoring,
                            key_id, username, password, public_key, script='',
                            script_id='', script_params='', job_id=None,
                            hostname='', plugins=None,
                            post_script_id='', post_script_params='',cronjob={}):
    from mist.io.methods import connect_provider
    if owner.find("@")!=-1:
        owner = User.objects.get(email=owner)
    else:
        owner = Owner.objects.get(id=owner)

    try:
        # find the node we're looking for and get its hostname
        cloud = Cloud.objects.get(id=cloud_id)
        conn = connect_provider(cloud)
        nodes = conn.list_nodes()
        node = None
        for n in nodes:
            if n.id == machine_id:
                node = n
                break

        if node and node.state == 0 and len(node.public_ips):
            # filter out IPv6 addresses
            ips = filter(lambda ip: ':' not in ip, node.public_ips)
            host = ips[0]
        else:
            raise self.retry(exc=Exception(), max_retries=20)

        try:
            # login with user, password. Deploy the public key, enable sudo
            # access for username, disable password authentication
            # and reload ssh.
            # After this is done, call post_deploy_steps if deploy script
            # or monitoring is provided
            ssh = paramiko.SSHClient()
            ssh.load_system_host_keys()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(host, username=username, password=password,
                        timeout=None, allow_agent=False, look_for_keys=False)

            ssh.exec_command('mkdir -p ~/.ssh && echo "%s" >> ~/.ssh/authorized_keys && chmod -R 700 ~/.ssh/' % public_key)

            chan = ssh.get_transport().open_session()
            chan.get_pty()
            chan.exec_command('sudo su -c \'echo "%s ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers\' ' % username)
            chan.send('%s\n' % password)

            check_sudo_command = 'sudo su -c \'whoami\''

            chan = ssh.get_transport().open_session()
            chan.get_pty()
            chan.exec_command(check_sudo_command)
            output = chan.recv(1024)

            if not output.startswith('root'):
                raise
            cmd = 'sudo su -c \'sed -i "s|[#]*PasswordAuthentication yes|PasswordAuthentication no|g" /etc/ssh/sshd_config &&  /etc/init.d/ssh reload; service ssh reload\' '
            ssh.exec_command(cmd)

            ssh.close()

            post_deploy_steps.delay(
                owner.id, cloud_id, machine_id, monitoring, key_id,
                script=script,
                script_id=script_id, script_params=script_params,
                job_id=job_id, hostname=hostname, plugins=plugins,
                post_script_id=post_script_id,
                post_script_params=post_script_params, cronjob=cronjob,
            )

        except Exception as exc:
            raise self.retry(exc=exc, countdown=10, max_retries=15)
    except Exception as exc:
        if str(exc).startswith('Retry'):
            raise


@app.task(bind=True, default_retry_delay=2*60)
def rackspace_first_gen_post_create_steps(
    self, owner, cloud_id, machine_id, monitoring, key_id, password,
    public_key, username='root', script='', script_id='', script_params='',
    job_id=None, hostname='', plugins=None, post_script_id='',
    post_script_params='', cronjob={}
):
    from mist.io.methods import connect_provider
    if owner.find("@")!=-1:
        owner = User.objects.get(email=owner)
    else:
        owner = Owner.objects.get(id=owner)
    try:
        # find the node we're looking for and get its hostname
        cloud = Cloud.objects.get(id=cloud_id)
        conn = connect_provider(cloud)
        nodes = conn.list_nodes()
        node = None
        for n in nodes:
            if n.id == machine_id:
                node = n
                break

        if node and node.state == 0 and len(node.public_ips):
            # filter out IPv6 addresses
            ips = filter(lambda ip: ':' not in ip, node.public_ips)
            host = ips[0]
        else:
            raise self.retry(exc=Exception(), max_retries=20)

        try:
            # login with user, password and deploy the ssh public key.
            # Disable password authentication and reload ssh.
            # After this is done, call post_deploy_steps
            # if deploy script or monitoring
            # is provided
            ssh = paramiko.SSHClient()
            ssh.load_system_host_keys()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(host, username=username, password=password, timeout=None, allow_agent=False, look_for_keys=False)

            ssh.exec_command('mkdir -p ~/.ssh && echo "%s" >> ~/.ssh/authorized_keys && chmod -R 700 ~/.ssh/' % public_key)

            cmd = 'sudo su -c \'sed -i "s|[#]*PasswordAuthentication yes|PasswordAuthentication no|g" /etc/ssh/sshd_config &&  /etc/init.d/ssh reload; service ssh reload\' '
            ssh.exec_command(cmd)

            ssh.close()

            post_deploy_steps.delay(
                owner.id, cloud_id, machine_id, monitoring, key_id,
                script=script,
                script_id=script_id, script_params=script_params,
                job_id=job_id, hostname=hostname, plugins=plugins,
                post_script_id=post_script_id,
                post_script_params=post_script_params, cronjob=cronjob
            )

        except Exception as exc:
            raise self.retry(exc=exc, countdown=10, max_retries=15)
    except Exception as exc:
        if str(exc).startswith('Retry'):
            raise


class UserTask(Task):
    abstract = True
    task_key = ''
    result_expires = 0
    result_fresh = 0
    polling = False
    _ut_cache = None

    @property
    def memcache(self):
        if self._ut_cache is None:
            self._ut_cache = MemcacheClient(config.MEMCACHED_HOST)
        return self._ut_cache

    def smart_delay(self, *args,  **kwargs):
        """Return cached result if it exists, send job to celery if needed"""
        # check cache
        id_str = json.dumps([self.task_key, args, kwargs])
        cache_key = b64encode(id_str)
        cached = self.memcache.get(cache_key)
        if cached:
            age = time() - cached['timestamp']
            if age > self.result_fresh:
                amqp_log("%s: scheduling task" % id_str)
                if kwargs.pop('blocking', None):
                    return self.execute(*args, **kwargs)
                else:
                    self.delay(*args, **kwargs)
            if age < self.result_expires:
                amqp_log("%s: smart delay cache hit" % id_str)
                return cached['payload']
        else:
            if kwargs.pop('blocking', None):
                return self.execute(*args, **kwargs)
            else:
                self.delay(*args, **kwargs)

    def clear_cache(self, *args, **kwargs):
        id_str = json.dumps([self.task_key, args, kwargs])
        cache_key = b64encode(id_str)
        log.info("Clearing cache for '%s'", id_str)
        return self.memcache.delete(cache_key)

    def run(self, *args, **kwargs):
        owner_id = args[0]
        if '@' in owner_id:
            owner_id = User.objects.get(email=owner_id).id
            args[0] = owner_id
        log.error('Running %s for %s', self.__class__.__name__, owner_id)
        # seq_id is an id for the sequence of periodic tasks, to avoid
        # running multiple concurrent sequences of the same task with the
        # same arguments. it is empty on first run, constant afterwards
        seq_id = kwargs.pop('seq_id', '')
        id_str = json.dumps([self.task_key, args, kwargs])
        cache_key = b64encode(id_str)
        cached_err = self.memcache.get(cache_key + 'error')
        if cached_err:
            # task has been failing recently
            if seq_id != cached_err['seq_id']:
                if seq_id:
                    # other sequence of tasks has taken over
                    return
                else:
                    # taking over from other sequence
                    cached_err = None
                    # cached err will be deleted or overwritten in a while
                    #self.memcache.delete(cache_key + 'error')
        if not amqp_owner_listening(owner_id):
            # noone is waiting for result, stop trying, but flush cached erros
            self.memcache.delete(cache_key + 'error')
            return
        # check cache to stop iteration if other sequence has started
        cached = self.memcache.get(cache_key)
        if cached:
            if seq_id and seq_id != cached['seq_id']:
                amqp_log("%s: found new cached seq_id [%s], "
                         "stopping iteration of [%s]" % (id_str,
                                                         cached['seq_id'],
                                                         seq_id))
                return
            elif not seq_id and time() - cached['timestamp'] < self.result_fresh:
                amqp_log("%s: fresh task submitted with fresh cached result "
                         ", dropping" % id_str)
                return
        if not seq_id:
            # this task is called externally, not a rerun, create a seq_id
            amqp_log("%s: fresh task submitted [%s]" % (id_str, seq_id))
            seq_id = uuid4().hex
        # actually run the task
        try:
            data = self.execute(*args, **kwargs)
        except Exception as exc:
            # error handling
            if isinstance(exc, SoftTimeLimitExceeded):
                log.error("SoftTimeLimitExceeded: %s", id_str)
            now = time()
            if not cached_err:
                cached_err = {'seq_id': seq_id, 'timestamps': []}
            cached_err['timestamps'].append(now)
            x0 = cached_err['timestamps'][0]
            rel_points = [x - x0 for x in cached_err['timestamps']]
            rerun = self.error_rerun_handler(exc, rel_points, *args, **kwargs)
            if rerun is not None:
                self.memcache.set(cache_key + 'error', cached_err)
                kwargs['seq_id'] = seq_id
                self.apply_async(args, kwargs, countdown=rerun)
            else:
                self.memcache.delete(cache_key + 'error')
            amqp_log("%s: error %r, rerun %s" % (id_str, exc, rerun))
            return
        else:
            self.memcache.delete(cache_key + 'error')
        cached = {'timestamp': time(), 'payload': data, 'seq_id': seq_id}
        ok = amqp_publish_user(owner_id, routing_key=self.task_key, data=data)
        if not ok:
            # echange closed, no one gives a shit, stop repeating, why try?
            amqp_log("%s: exchange closed" % id_str)
            return
        kwargs['seq_id'] = seq_id
        self.memcache.set(cache_key, cached)
        if self.polling:
            amqp_log("%s: will rerun in %d secs [%s]" % (id_str,
                                                         self.result_fresh,
                                                         seq_id))
            self.apply_async(args, kwargs, countdown=self.result_fresh)

    def execute(self, *args, **kwargs):
        raise NotImplementedError()

    def error_rerun_handler(self, exc, errors, *args, **kwargs):
        """Accepts a list of relative time points of consecutive errors,
        returns number of seconds to retry in or None to stop retrying."""
        if len(errors) == 1:
            return 30  # Retry in 30sec after the first error
        if len(errors) == 2:
            return 120  # Retry in 120sec after the second error
        if len(errors) == 3:
            return 60 * 10  # Retry in 10mins after the third error


class ListSizes(UserTask):
    abstract = False
    task_key = 'list_sizes'
    result_expires = 60 * 60 * 24 * 7
    result_fresh = 60 * 60
    polling = False
    soft_time_limit = 30

    def execute(self, owner_id, cloud_id):
        from mist.io import methods
        owner = Owner.objects.get(id=owner_id)
        sizes = methods.list_sizes(owner, cloud_id)
        return {'cloud_id': cloud_id, 'sizes': sizes}


class ListLocations(UserTask):
    abstract = False
    task_key = 'list_locations'
    result_expires = 60 * 60 * 24 * 7
    result_fresh = 60 * 60
    polling = False
    soft_time_limit = 30

    def execute(self, owner_id, cloud_id):
        from mist.io import methods
        owner = Owner.objects.get(id=owner_id)
        locations = methods.list_locations(owner, cloud_id)
        return {'cloud_id': cloud_id, 'locations': locations}


class ListNetworks(UserTask):
    abstract = False
    task_key = 'list_networks'
    result_expires = 60 * 60 * 24
    result_fresh = 0
    polling = False
    soft_time_limit = 30

    def execute(self, owner_id, cloud_id):
        owner = Owner.objects.get(id=owner_id)
        log.warn('Running list networks for user %s cloud %s'
                 % (owner.id, cloud_id))
        from mist.io import methods
        networks = methods.list_networks(owner, cloud_id)
        log.warn('Returning list networks for user %s cloud %s'
                 % (owner.id, cloud_id))
        return {'cloud_id': cloud_id, 'networks': networks}


class ListImages(UserTask):
    abstract = False
    task_key = 'list_images'
    result_expires = 60 * 60 * 24 * 7
    result_fresh = 60 * 60
    polling = False
    soft_time_limit = 60*2

    def execute(self, owner_id, cloud_id):
        from mist.io import methods
        owner = Owner.objects.get(id=owner_id)
        log.warn('Running list images for user %s cloud %s',
                 owner.id, cloud_id)
        images = methods.list_images(owner, cloud_id)
        log.warn('Returning list images for user %s cloud %s',
                 owner.id, cloud_id)
        return {'cloud_id': cloud_id, 'images': images}


class ListProjects(UserTask):
    abstract = False
    task_key = 'list_projects'
    result_expires = 60 * 60 * 24 * 7
    result_fresh = 60 * 60
    polling = False
    soft_time_limit = 30

    def execute(self, owner_id, cloud_id):
        owner = Owner.objects.get(id=owner_id)
        log.warn('Running list projects for user %s cloud %s',
                 owner.id, cloud_id)
        from mist.io import methods
        projects = methods.list_projects(owner, cloud_id)
        log.warn('Returning list projects for user %s cloud %s',
                 owner.id, cloud_id)
        return {'cloud_id': cloud_id, 'projects': projects}


class ListMachines(UserTask):
    abstract = False
    task_key = 'list_machines'
    result_expires = 60 * 60 * 24
    result_fresh = 10
    polling = True
    soft_time_limit = 60

    from mist.core.helpers import log_event

    def execute(self, owner_id, cloud_id):
        from mist.io import methods
        owner = Owner.objects.get(id=owner_id)
        log.warn('Running list machines for user %s cloud %s',
                 owner.id, cloud_id)
        machines = methods.list_machines(owner, cloud_id)

        from mist.core.methods import get_machine_tags
        for machine in machines:
            # TODO tags tags tags
            if machine.get("tags"):
                tags = {}
                for tag in machine["tags"]:
                    tags[tag["key"]]= tag["value"]
            try:
                mistio_tags = get_machine_tags(owner, cloud_id,
                                               machine.get("id"))
            except:
                log.info("Machine has not tags in mist db")
                mistio_tags = {}
            else:
                machine["tags"] = []
                # optimized for js
                for tag in mistio_tags:
                    key, value = tag.popitem()
                    tag_dict = {'key': key, 'value': value}
                    machine['tags'].append(tag_dict)
            # FIXME: optimize!
        log.warn('Returning list machines for user %s cloud %s',
             owner.id, cloud_id)
        return {'cloud_id': cloud_id, 'machines': machines}

    def error_rerun_handler(self, exc, errors, owner_id, cloud_id):
        from mist.io.methods import notify_user

        if len(errors) < 6:
            return self.result_fresh  # Retry when the result is no longer fresh
        owner = Owner.objects.get(id=owner_id)
        cloud = Cloud.objects.get(owner=owner, id=cloud_id)

        if len(errors) == 6:  # If does not respond for a minute
            notify_user(owner, 'Cloud %s does not respond' % cloud.title,
                        email_notify=False, cloud_id=cloud_id)

        # Keep retrying every 30 secs for 10 minutes, then every 60 secs for
        # 20 minutes and finally every 20 minutes
        times = [30]*20 + [60]*20
        index = len(errors) - 6
        if index < len(times):
            return times[index]
        else: #
            return 20*60


class ProbeSSH(UserTask):
    abstract = False
    task_key = 'probe'
    result_expires = 60 * 60 * 2
    result_fresh = 60 * 2
    polling = True
    soft_time_limit = 60

    def execute(self, owner_id, cloud_id, machine_id, host):
        owner = Owner.objects.get(id=owner_id)
        from mist.io.methods import probe_ssh_only
        res = probe_ssh_only(owner, cloud_id, machine_id, host)
        return {'cloud_id': cloud_id,
                'machine_id': machine_id,
                'host': host,
                'result': res}

    def error_rerun_handler(self, exc, errors, *args, **kwargs):
        # Retry in 2, 4, 8, 16, 32, 32, 32, 32, 32, 32 minutes
        t = 60 * 2 ** len(errors)
        return t if t < 60 * 32 else 60 * 32


class Ping(UserTask):
    abstract = False
    task_key = 'ping'
    result_expires = 60 * 60 * 2
    result_fresh = 60 * 15
    polling = True
    soft_time_limit = 30

    def execute(self, owner_id, cloud_id, machine_id, host):
        from mist.io import methods
        res = methods.ping(host)
        return {'cloud_id': cloud_id,
                'machine_id': machine_id,
                'host': host,
                'result': res}

    def error_rerun_handler(self, exc, errors, *args, **kwargs):
        return self.result_fresh


@app.task
def deploy_collectd(owner, cloud_id, machine_id, extra_vars):
    import mist.io.methods
    if owner.find("@") != -1:
        owner = User.objects.get(email=owner)
    else:
        owner = Owner.objects.get(id=owner)
    mist.io.methods.deploy_collectd(owner, cloud_id, machine_id, extra_vars)


@app.task
def undeploy_collectd(owner, cloud_id, machine_id):
    if owner.find("@") != -1:
        owner = User.objects.get(email=owner)
    else:
        owner = Owner.objects.get(id=owner)
    import mist.io.methods
    mist.io.methods.undeploy_collectd(owner, cloud_id, machine_id)


@app.task
def create_machine_async(owner, cloud_id, key_id, machine_name, location_id,
                         image_id, size_id, image_extra, disk,
                         image_name, size_name, location_name, ips, monitoring,
                         networks, docker_env, docker_command, script='',
                         script_id='', script_params='',
                         post_script_id='', post_script_params='',
                         quantity=1, persist=False, job_id=None,
                         docker_port_bindings={}, docker_exposed_ports={},
                         azure_port_bindings='', hostname='', plugins=None,
                         disk_size=None, disk_path=None,
                         cloud_init='', associate_floating_ip=False,
                         associate_floating_ip_subnet=None, project_id=None,
                         tags=None, cronjob={}, bare_metal=False, hourly=True,
                         softlayer_backend_vlan_id=None):
    from multiprocessing.dummy import Pool as ThreadPool
    from mist.io.methods import create_machine
    from mist.io.exceptions import MachineCreationError
    log.warn('MULTICREATE ASYNC %d' % quantity)

    from mist.core.helpers import log_event

    job_id = job_id or uuid.uuid4().hex


    if owner.find("@") != -1:
        owner = Owner.objects.get(email=owner)
    else:
        owner = Owner.objects.get(id=owner)

    names = []
    if quantity == 1:
        names = [machine_name]
    else:
        names = []
        for i in range(1, quantity + 1):
            names.append('%s-%d' % (machine_name, i))

    log_event(owner.id, 'job', 'async_machine_creation_started', job_id=job_id,
              cloud_id=cloud_id, script=script, script_id=script_id,
              script_params=script_params, monitoring=monitoring,
              persist=persist, quantity=quantity, key_id=key_id,
              machine_names=names)

    THREAD_COUNT = 5
    pool = ThreadPool(THREAD_COUNT)
    specs = []
    for name in names:
        specs.append((
            (owner, cloud_id, key_id, name, location_id, image_id,
             size_id, image_extra, disk, image_name, size_name,
             location_name, ips, monitoring, networks, docker_env,
             docker_command, 22, script, script_id, script_params, job_id),
            {'hostname': hostname, 'plugins': plugins,
             'post_script_id': post_script_id,
             'post_script_params': post_script_params,
             'azure_port_bindings': azure_port_bindings,
             'associate_floating_ip': associate_floating_ip,
             'cloud_init': cloud_init,
             'disk_size': disk_size,
             'disk_path': disk_path,
             'project_id': project_id,
             'tags': tags,
             'cronjob': cronjob,
             'softlayer_backend_vlan_id': softlayer_backend_vlan_id}
        ))

    def create_machine_wrapper(args_kwargs):
        args, kwargs = args_kwargs
        error = False
        node = {}
        try:

            node = create_machine(*args, **kwargs)
        except MachineCreationError as exc:
            error = str(exc)
        except Exception as exc:
            error = repr(exc)
        finally:
            name = args[3]
            log_event(owner.id, 'job', 'machine_creation_finished',
                      job_id=job_id, cloud_id=cloud_id, machine_name=name,
                      error=error, machine_id=node.get('id', ''))

    pool.map(create_machine_wrapper, specs)
    pool.close()
    pool.join()
