import paramiko
import json
import uuid
import tempfile
import functools

import libcloud.security

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


try:  # Multi-user environment
    from mist.core.helpers import user_from_email
    from mist.core import config
    multi_user = True
    cert_path = "src/mist.io/cacert.pem"
    celery_cfg = 'mist.core.celery_config'
except ImportError:  # Standalone mist.io
    from mist.io.helpers import user_from_email
    from mist.io import config
    multi_user = False
    cert_path = "cacert.pem"
    celery_cfg = 'mist.io.celery_config'

from mist.io.helpers import amqp_publish_user
from mist.io.helpers import amqp_user_listening
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
def update_machine_count(email, cloud_id, machine_count):
    if not multi_user:
        return

    user = user_from_email(email)
    with user.lock_n_load():
        user.clouds[cloud_id].machine_count = machine_count
        user.total_machine_count = sum(
            [cloud.machine_count for cloud in user.clouds.values()]
        )
        user.save()


@app.task
def ssh_command(email, cloud_id, machine_id, host, command,
                      key_id=None, username=None, password=None, port=22):
    user = user_from_email(email)
    shell = Shell(host)
    key_id, ssh_user = shell.autoconfigure(user, cloud_id, machine_id,
                                           key_id, username, password, port)
    retval, output = shell.command(command)
    shell.disconnect()
    if retval:
        from mist.io.methods import notify_user
        notify_user(user, "Async command failed for machine %s (%s)" %
                    (machine_id, host), output)


@app.task(bind=True, default_retry_delay=3*60)
def post_deploy_steps(self, email, cloud_id, machine_id, monitoring, command,
                      key_id=None, username=None, password=None, port=22,
                      script_id='', script_params='', job_id=None,
                      hostname='', plugins=None,
                      post_script_id='', post_script_params=''):
    from mist.io.methods import connect_provider, probe_ssh_only
    from mist.io.methods import notify_user, notify_admin
    from mist.io.methods import create_dns_a_record
    if multi_user:
        from mist.core.methods import enable_monitoring
        from mist.core.tasks import run_script
        from mist.core.helpers import log_event
    else:
        from mist.io.methods import enable_monitoring
        log_event = lambda *args, **kwargs: None

    job_id = job_id or uuid.uuid4().hex

    user = user_from_email(email)
    tmp_log = lambda msg, *args: log.error('Post deploy: %s' % msg, *args)
    tmp_log('Entering post deploy steps for %s %s %s',
            user.email, cloud_id, machine_id)
    try:
        # find the node we're looking for and get its hostname
        node = None
        try:
            conn = connect_provider(user.clouds[cloud_id])
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

        try:
            from mist.io.shell import Shell
            shell = Shell(host)
            # connect with ssh even if no command, to create association
            # to be able to enable monitoring
            tmp_log('attempting to connect to shell')
            key_id, ssh_user = shell.autoconfigure(
                user, cloud_id, node.id, key_id, username, password, port
            )
            tmp_log('connected to shell')
            result = probe_ssh_only(user, cloud_id, machine_id, host=None,
                           key_id=key_id, ssh_user=ssh_user, shell=shell)
            log_dict = {
                    'email': email,
                    'event_type': 'job',
                    'cloud_id': cloud_id,
                    'machine_id': machine_id,
                    'job_id': job_id,
                    'host': host,
                    'key_id': key_id,
                    'ssh_user': ssh_user,
                }

            log_event(action='probe', result=result, **log_dict)
            cloud = user.clouds[cloud_id]
            msg = "Cloud:\n  Name: %s\n  Id: %s\n" % (cloud.title,
                                                        cloud_id)
            msg += "Machine:\n  Name: %s\n  Id: %s\n" % (node.name,
                                                             node.id)

            if hostname:
                try:
                    record = create_dns_a_record(user, hostname, host)
                    hostname = '.'.join((record.name, record.zone.domain))
                    log_event(action='create_dns_a_record', hostname=hostname,
                              **log_dict)
                except Exception as exc:
                    log_event(action='create_dns_a_record', error=str(exc),
                              **log_dict)

            error = False
            if script_id and multi_user:
                tmp_log('will run script_id %s', script_id)
                ret = run_script.run(
                    user.email, script_id, cloud_id, machine_id,
                    params=script_params, host=host, job_id=job_id
                )
                error = ret['error']
                tmp_log('executed script_id %s', script_id)
            elif command:
                tmp_log('will run command %s', command)
                log_event(action='deployment_script_started', command=command, **log_dict)
                start_time = time()
                retval, output = shell.command(command)
                tmp_log('executed command %s', command)
                execution_time = time() - start_time
                output = output.decode('utf-8','ignore')
                title = "Deployment script %s" % ('failed' if retval
                                                  else 'succeeded')
                error = retval > 0
                notify_user(user, title,
                            cloud_id=cloud_id,
                            machine_id=machine_id,
                            machine_name=node.name,
                            command=command,
                            output=output,
                            duration=execution_time,
                            retval=retval,
                            error=retval > 0)
                log_event(action='deployment_script_finished',
                          error=retval > 0,
                          return_value=retval,
                          command=command,
                          stdout=output,
                          **log_dict)

            shell.disconnect()

            if monitoring:
                try:
                    enable_monitoring(user, cloud_id, node.id,
                        name=node.name, dns_name=node.extra.get('dns_name',''),
                        public_ips=ips, no_ssh=False, dry=False, job_id=job_id,
                        plugins=plugins, deploy_async=False,
                    )
                except Exception as e:
                    print repr(e)
                    error = True
                    notify_user(user, "Enable monitoring failed for machine %s" % machine_id, repr(e))
                    notify_admin('Enable monitoring on creation failed for user %s machine %s: %r' % (email, machine_id, e))
                    log_event(action='enable_monitoring_failed', error=repr(e),
                              **log_dict)

            if post_script_id and multi_user:
                tmp_log('will run post_script_id %s', post_script_id)
                ret = run_script.run(
                    user.email, post_script_id, cloud_id, machine_id,
                    params=post_script_params, host=host, job_id=job_id,
                    action_prefix='post_',
                )
                error = ret['error']
                tmp_log('executed post_script_id %s', script_id)

            log_event(action='post_deploy_finished', error=error, **log_dict)

        except (ServiceUnavailableError, SSHException) as exc:
            tmp_log(repr(exc))
            raise self.retry(exc=exc, countdown=60, max_retries=15)
    except Exception as exc:
        tmp_log(repr(exc))
        if str(exc).startswith('Retry'):
            raise
        notify_user(user, "Deployment script failed for machine %s" % machine_id)
        notify_admin("Deployment script failed for machine %s in cloud %s by user %s" % (machine_id, cloud_id, email), repr(exc))
        log_event(
            email=email,
            event_type='job',
            action='post_deploy_finished',
            cloud_id=cloud_id,
            machine_id=machine_id,
            enable_monitoring=bool(monitoring),
            command=command,
            error="Couldn't connect to run post deploy steps.",
            job_id=job_id
        )

@app.task(bind=True, default_retry_delay=2*60)
def hpcloud_post_create_steps(self, email, cloud_id, machine_id, monitoring,
                              command, key_id, username, password, public_key,
                              script_id='', script_params='', job_id=None,
                              hostname='', plugins=None,
                              post_script_id='', post_script_params=''):
    from mist.io.methods import connect_provider
    user = user_from_email(email)

    try:
        conn = connect_provider(user.clouds[cloud_id])
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
                email, cloud_id, machine_id, monitoring, command, key_id,
                script_id=script_id, script_params=script_params,
                job_id=job_id, hostname=hostname, plugins=plugins,
                post_script_id=post_script_id,
                post_script_params=post_script_params,
            )

        else:
            try:
                available_networks = conn.ex_list_networks()
                external_networks = [net for net in available_networks if net.router_external]
                if external_networks:
                    ext_net_id = external_networks[0].id
                else:
                    ext_net_id = ""

                ports = conn.ex_list_ports()

                port = [port for port in ports if port.get("device_id", "") == node.id][0]

                ip = conn.ex_create_floating_ip(ext_net_id, port['id'])
                post_deploy_steps.delay(
                    email, cloud_id, machine_id, monitoring, command, key_id,
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
def openstack_post_create_steps(self, email, cloud_id, machine_id, monitoring,
                              command, key_id, username, password, public_key,
                              script_id='', script_params='', job_id=None,
                              hostname='', plugins=None,
                              post_script_id='', post_script_params='', networks=[]):

    from mist.io.methods import connect_provider
    user = user_from_email(email)

    try:
        conn = connect_provider(user.clouds[cloud_id])
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
                email, cloud_id, machine_id, monitoring, command, key_id,
                script_id=script_id, script_params=script_params,
                job_id=job_id, hostname=hostname, plugins=plugins,
                post_script_id=post_script_id,
                post_script_params=post_script_params,
            )

        else:
            try:
                created_floating_ips = []
                for network in networks['public']:
                    created_floating_ips += [floating_ip for floating_ip in network['floating_ips']]

                # From the already created floating ips try to find one that is not associated to a node
                unassociated_floating_ip = None
                for ip in created_floating_ips:
                    if not ip['node_id']:
                        unassociated_floating_ip = ip
                        break

                # Find the ports which are associated to the machine (e.g. the ports of the private ips)
                # and use one to associate a floating ip
                ports = conn.ex_list_ports()
                machine_port_id = None
                for port in ports:
                    if port.get('device_id') == node.id:
                        machine_port_id = port.get('id')
                        break

                if unassociated_floating_ip:
                    log.info("Associating floating ip with machine: %s" % node.id)
                    ip = conn.ex_associate_floating_ip_to_node(unassociated_floating_ip['id'], machine_port_id)
                else:
                    # Find the external network
                    log.info("Create and associating floating ip with machine: %s" % node.id)
                    ext_net_id = networks['public'][0]['id']
                    ip = conn.ex_create_floating_ip(ext_net_id, machine_port_id)

                post_deploy_steps.delay(
                    email, cloud_id, machine_id, monitoring, command, key_id,
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
def azure_post_create_steps(self, email, cloud_id, machine_id, monitoring,
                            command, key_id, username, password, public_key,
                            script_id='', script_params='', job_id=None,
                            hostname='', plugins=None,
                            post_script_id='', post_script_params=''):
    from mist.io.methods import connect_provider
    user = user_from_email(email)

    try:
        # find the node we're looking for and get its hostname
        conn = connect_provider(user.clouds[cloud_id])
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
            # login with user, password. Deploy the public key, enable sudo access for
            # username, disable password authentication and reload ssh.
            # After this is done, call post_deploy_steps if deploy script or monitoring
            # is provided
            ssh = paramiko.SSHClient()
            ssh.load_system_host_keys()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(host, username=username, password=password, timeout=None, allow_agent=False, look_for_keys=False)

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
                email, cloud_id, machine_id, monitoring, command, key_id,
                script_id=script_id, script_params=script_params,
                job_id=job_id, hostname=hostname, plugins=plugins,
                post_script_id=post_script_id,
                post_script_params=post_script_params,
            )

        except Exception as exc:
            raise self.retry(exc=exc, countdown=10, max_retries=15)
    except Exception as exc:
        if str(exc).startswith('Retry'):
            raise


@app.task(bind=True, default_retry_delay=2*60)
def rackspace_first_gen_post_create_steps(
    self, email, cloud_id, machine_id, monitoring, command, key_id,
    password, public_key, username='root', script_id='', script_params='',
    job_id=None, hostname='', plugins=None, post_script_id='',
    post_script_params=''
):
    from mist.io.methods import connect_provider
    user = user_from_email(email)

    try:
        # find the node we're looking for and get its hostname
        conn = connect_provider(user.clouds[cloud_id])
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
            # login with user, password and deploy the ssh public key. Disable password authentication and reload ssh.
            # After this is done, call post_deploy_steps if deploy script or monitoring
            # is provided
            ssh=paramiko.SSHClient()
            ssh.load_system_host_keys()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(host, username=username, password=password, timeout=None, allow_agent=False, look_for_keys=False)

            ssh.exec_command('mkdir -p ~/.ssh && echo "%s" >> ~/.ssh/authorized_keys && chmod -R 700 ~/.ssh/' % public_key)

            cmd = 'sudo su -c \'sed -i "s|[#]*PasswordAuthentication yes|PasswordAuthentication no|g" /etc/ssh/sshd_config &&  /etc/init.d/ssh reload; service ssh reload\' '
            ssh.exec_command(cmd)

            ssh.close()

            post_deploy_steps.delay(
                email, cloud_id, machine_id, monitoring, command, key_id,
                script_id=script_id, script_params=script_params,
                job_id=job_id, hostname=hostname, plugins=plugins,
                post_script_id=post_script_id,
                post_script_params=post_script_params,
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
        email = args[0]
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
        if not amqp_user_listening(email):
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
        ok = amqp_publish_user(email, routing_key=self.task_key, data=data)
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

    def execute(self, email, cloud_id):
        from mist.io import methods
        user = user_from_email(email)
        sizes = methods.list_sizes(user, cloud_id)
        return {'cloud_id': cloud_id, 'sizes': sizes}


class ListLocations(UserTask):
    abstract = False
    task_key = 'list_locations'
    result_expires = 60 * 60 * 24 * 7
    result_fresh = 60 * 60
    polling = False
    soft_time_limit = 30

    def execute(self, email, cloud_id):
        from mist.io import methods
        user = user_from_email(email)
        locations = methods.list_locations(user, cloud_id)
        return {'cloud_id': cloud_id, 'locations': locations}


class ListNetworks(UserTask):
    abstract = False
    task_key = 'list_networks'
    result_expires = 60 * 60 * 24
    result_fresh = 0
    polling = False
    soft_time_limit = 30

    def execute(self, email, cloud_id):
        log.warn('Running list networks for user %s cloud %s' % (email, cloud_id))
        from mist.io import methods
        user = user_from_email(email)
        networks = methods.list_networks(user, cloud_id)
        log.warn('Returning list networks for user %s cloud %s' % (email, cloud_id))
        return {'cloud_id': cloud_id, 'networks': networks}


class ListImages(UserTask):
    abstract = False
    task_key = 'list_images'
    result_expires = 60 * 60 * 24 * 7
    result_fresh = 60 * 60
    polling = False
    soft_time_limit = 60*2

    def execute(self, email, cloud_id):
        log.warn('Running list images for user %s cloud %s' % (email, cloud_id))
        from mist.io import methods
        user = user_from_email(email)
        images = methods.list_images(user, cloud_id)
        log.warn('Returning list images for user %s cloud %s' % (email, cloud_id))
        return {'cloud_id': cloud_id, 'images': images}


class ListProjects(UserTask):
    abstract = False
    task_key = 'list_projects'
    result_expires = 60 * 60 * 24 * 7
    result_fresh = 60 * 60
    polling = False
    soft_time_limit = 30

    def execute(self, email, cloud_id):
        log.warn('Running list projects for user %s cloud %s' % (email, cloud_id))
        from mist.io import methods
        user = user_from_email(email)
        projects = methods.list_projects(user, cloud_id)
        log.warn('Returning list projects for user %s cloud %s' % (email, cloud_id))
        return {'cloud_id': cloud_id, 'projects': projects}


class ListMachines(UserTask):
    abstract = False
    task_key = 'list_machines'
    result_expires = 60 * 60 * 24
    result_fresh = 10
    polling = True
    soft_time_limit = 60

    def execute(self, email, cloud_id):
        log.warn('Running list machines for user %s cloud %s' % (email, cloud_id))
        from mist.io import methods
        user = user_from_email(email)
        machines = methods.list_machines(user, cloud_id)
        if multi_user:
            for machine in machines:
                kwargs = {}
                kwargs['cloud_id'] = cloud_id
                kwargs['machine_id'] = machine.get('id')
                from mist.core.methods import list_tags
                mistio_tags = list_tags(user, resource_type='machine', **kwargs)
                # optimized for js
                for tag in mistio_tags:
                    for key, value in tag.items():
                        tag_dict = {'key': key, 'value': value}
                        if tag_dict not in machine['tags']:
                            machine['tags'].append(tag_dict)
                # FIXME: optimize!
        log.warn('Returning list machines for user %s cloud %s' % (email, cloud_id))
        return {'cloud_id': cloud_id, 'machines': machines}

    def error_rerun_handler(self, exc, errors, email, cloud_id):
        from mist.io.methods import notify_user

        if len(errors) < 6:
            return self.result_fresh  # Retry when the result is no longer fresh

        user = user_from_email(email)

        if len(errors) == 6: # If does not respond for a minute
            notify_user(user, 'Cloud %s does not respond' % user.clouds[cloud_id].title,
                        email_notify=False, cloud_id=cloud_id)

        # Keep retrying for 30 minutes
        times = [60, 60, 120, 300, 600, 600]
        index = len(errors) - 6
        if index < len(times):
            return times[index]
        else: # If cloud still unresponsive disable it & notify user
            with user.lock_n_load():
                user.clouds[cloud_id].enabled = False
                user.save()
            notify_user(user, "Cloud %s disabled after not responding for 30mins" % user.clouds[cloud_id].title,
                        email_notify=True, cloud_id=cloud_id)
            log_event(user.email, 'incident', action='disable_cloud',
                      cloud_id=cloud_id, error="Cloud unresponsive")


class ProbeSSH(UserTask):
    abstract = False
    task_key = 'probe'
    result_expires = 60 * 60 * 2
    result_fresh = 60 * 2
    polling = True
    soft_time_limit = 60

    def execute(self, email, cloud_id, machine_id, host):
        user = user_from_email(email)
        from mist.io.methods import probe_ssh_only
        res = probe_ssh_only(user, cloud_id, machine_id, host)
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

    def execute(self, email, cloud_id, machine_id, host):
        from mist.io import methods
        res = methods.ping(host)
        return {'cloud_id': cloud_id,
                'machine_id': machine_id,
                'host': host,
                'result': res}

    def error_rerun_handler(self, exc, errors, *args, **kwargs):
        return self.result_fresh


@app.task
def deploy_collectd(email, cloud_id, machine_id, extra_vars):
    import mist.io.methods
    user = user_from_email(email)
    mist.io.methods.deploy_collectd(user, cloud_id, machine_id, extra_vars)


@app.task
def undeploy_collectd(email, cloud_id, machine_id):
    user = user_from_email(email)
    import mist.io.methods
    mist.io.methods.undeploy_collectd(user, cloud_id, machine_id)


@app.task
def create_machine_async(email, cloud_id, key_id, machine_name, location_id,
                         image_id, size_id, script, image_extra, disk,
                         image_name, size_name, location_name, ips, monitoring,
                         networks, docker_env, docker_command,
                         script_id='', script_params='',
                         post_script_id='', post_script_params='',
                         quantity=1, persist=False, job_id=None,
                         docker_port_bindings={}, docker_exposed_ports={},
                         azure_port_bindings='', hostname='', plugins=None,
                         disk_size=None, disk_path=None, create_from_existing=None,
                         cloud_init='', associate_floating_ip=False, associate_floating_ip_subnet=None, project_id=None):
    from multiprocessing.dummy import Pool as ThreadPool
    from mist.io.methods import create_machine
    from mist.io.exceptions import MachineCreationError
    log.warn('MULTICREATE ASYNC %d' % quantity)

    if multi_user:
        from mist.core.helpers import log_event
    else:
        log_event = lambda *args, **kwargs: None
    job_id = job_id or uuid.uuid4().hex

    log_event(email, 'job', 'async_machine_creation_started', job_id=job_id,
              cloud_id=cloud_id, script=script, script_id=script_id,
              script_params=script_params, monitoring=monitoring,
              persist=persist, quantity=quantity)

    THREAD_COUNT = 5
    pool = ThreadPool(THREAD_COUNT)

    names = []
    for i in range(1, quantity+1):
        names.append('%s-%d' % (machine_name,i))

    user = user_from_email(email)
    specs = []
    for name in names:
        specs.append((
            (user, cloud_id, key_id, name, location_id, image_id,
             size_id, script, image_extra, disk, image_name, size_name,
             location_name, ips, monitoring, networks, docker_env,
             docker_command, 22, script_id, script_params, job_id),
            {'hostname': hostname, 'plugins': plugins,
             'post_script_id': post_script_id,
             'post_script_params': post_script_params,
             'azure_port_bindings': azure_port_bindings,
             'associate_floating_ip': associate_floating_ip,
             'cloud_init': cloud_init,
             'disk_size': disk_size,
             'disk_path': disk_path,
             'create_from_existing': create_from_existing,
             'project_id': project_id}
        ))

    def create_machine_wrapper(args_kwargs):
        args, kwargs = args_kwargs
        error = False
        try:
            node = create_machine(*args, **kwargs)
        except MachineCreationError as exc:
            error = str(exc)
        except Exception as exc:
            error = repr(exc)
        finally:
            name = args[3]
            log_event(email, 'job', 'machine_creation_finished', job_id=job_id,
                      cloud_id=cloud_id, machine_name=name, error=error)

    pool.map(create_machine_wrapper, specs)
    pool.close()
    pool.join()
