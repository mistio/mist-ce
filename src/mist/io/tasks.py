import json
import functools

import libcloud.security

from time import time
from uuid import uuid4

from base64 import b64encode

from memcache import Client as MemcacheClient

from celery import Task

from amqp import Message
from amqp.connection import Connection

from mist.io.celery_app import app
from mist.io.exceptions import ServiceUnavailableError
from mist.io.shell import Shell
from mist.io.helpers import get_auth_header

try:  # Multi-user environment
    from mist.core.helpers import user_from_email
    from mist.core import config
    multi_user = True
    cert_path = "src/mist.io/cacert.pem"
except ImportError:  # Standalone mist.io
    from mist.io.helpers import user_from_email
    from mist.io import config
    multi_user = False
    cert_path = "cacert.pem"

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


@app.task
def update_machine_count(email, backend_id, machine_count):
    if not multi_user:
        return
    
    user = user_from_email(email)
    with user.lock_n_load():
        user.backends[backend_id].machine_count = machine_count
        user.total_machine_count = sum(
            [backend.machine_count for backend in user.backends.values()]
        )
        user.save()

@app.task
def ssh_command(email, backend_id, machine_id, host, command,
                      key_id=None, username=None, password=None, port=22):
    user = user_from_email(email)
    shell = Shell(host)
    key_id, ssh_user = shell.autoconfigure(user, backend_id, machine_id,
                                           key_id, username, password, port)
    retval, output = shell.command(command)
    shell.disconnect()
    if retval:
        from mist.io.methods import notify_user
        notify_user(user, "Async command failed for machine %s (%s)" % (machine_id, host), output)


@app.task(bind=True, default_retry_delay=3*60)
def run_deploy_script(self, email, backend_id, machine_id, command,
                      key_id=None, username=None, password=None, port=22):
    from mist.io.methods import ssh_command, connect_provider
    from mist.io.methods import notify_user, notify_admin

    user = user_from_email(email)

    try:
        # find the node we're looking for and get its hostname
        conn = connect_provider(user.backends[backend_id])
        nodes = conn.list_nodes()
        node = None
        for n in nodes:
            if n.id == machine_id:
                node = n
                break

        if node and len(node.public_ips):
            # filter out IPv6 addresses
            ips = filter(lambda ip: ':' not in ip, node.public_ips)
            host = ips[0]
        else:
            raise self.retry(exc=Exception(), countdown=60, max_retries=5)

        try:
            from mist.io.shell import Shell
            shell = Shell(host)
            key_id, ssh_user = shell.autoconfigure(user, backend_id, node.id,
                                                   key_id, username, password, port)
            start_time = time()
            retval, output = shell.command(command)
            execution_time = time() - start_time
            shell.disconnect()
            msg = """
Command: %s
Return value: %s
Duration: %s seconds
Output:
%s""" % (command, retval, execution_time, output)

            if retval:
                notify_user(user, "Deployment script failed for machine %s (%s)" % (node.name, node.id), msg)
                amqp_log("Deployment script failed for user %s machine %s (%s): %s" % (user, node.name, node.id, msg))
            else:
                notify_user(user, "Deployment script succeeded for machine %s (%s)" % (node.name, node.id), msg)
                amqp_log("Deployment script succeeded for user %s machine %s (%s): %s" % (user, node.name, node.id, msg))

        except ServiceUnavailableError as exc:
            raise self.retry(exc=exc, countdown=60, max_retries=5)
    except Exception as exc:
        if str(exc).startswith('Retry'):
            return
        amqp_log("Deployment script failed for machine %s in backend %s by user %s after 5 retries: %s" % (node.id, backend_id, email, repr(exc)))
        notify_user(user, "Deployment script failed for machine %s after 5 retries" % node.id)
        notify_admin("Deployment script failed for machine %s in backend %s by user %s after 5 retries" % (node.id, backend_id, email), repr(exc))


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
            self._ut_cache = MemcacheClient(["127.0.0.1:11211"])
        return self._ut_cache

    def smart_delay(self, *args, **kwargs):
        """Return cached result if it exists, send job to celery if needed"""
        # check cache
        id_str = json.dumps([self.task_key, args, kwargs])
        cache_key = b64encode(id_str)
        cached = self.memcache.get(cache_key)
        if cached:
            age = time() - cached['timestamp']
            if age > self.result_fresh:
                amqp_log("%s: scheduling task" % id_str)
                self.delay(*args, **kwargs)
            if age < self.result_expires:
                amqp_log("%s: smart delay cache hit" % id_str)
                return cached['payload']
        else:
            self.delay(*args, **kwargs)

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
                # other sequence of task already handling this error flow
                # This is not working! Passing instead
                #return
                pass
        if not amqp_user_listening(email):
            # noone is waiting for result, stop trying, but flush cached erros
            if cached_err:
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
            if cached_err:
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

    def execute(self, email, backend_id):
        from mist.io import methods
        user = user_from_email(email)
        sizes = methods.list_sizes(user, backend_id)
        return {'backend_id': backend_id, 'sizes': sizes}


class ListLocations(UserTask):
    abstract = False
    task_key = 'list_locations'
    result_expires = 60 * 60 * 24 * 7
    result_fresh = 60 * 60
    polling = False

    def execute(self, email, backend_id):
        from mist.io import methods
        user = user_from_email(email)
        locations = methods.list_locations(user, backend_id)
        return {'backend_id': backend_id, 'locations': locations}


class ListImages(UserTask):
    abstract = False
    task_key = 'list_images'
    result_expires = 60 * 60 * 24 * 7
    result_fresh = 60 * 60
    polling = False

    def execute(self, email, backend_id):
        from mist.io import methods
        user = user_from_email(email)
        images = methods.list_images(user, backend_id)
        return {'backend_id': backend_id, 'images': images}


class ListMachines(UserTask):
    abstract = False
    task_key = 'list_machines'
    result_expires = 60 * 60 * 24
    result_fresh = 10
    polling = True

    def execute(self, email, backend_id):
        log.warn('Running list machines for user %s backend %s' % (email, backend_id))
        from mist.io import methods
        user = user_from_email(email)
        machines = methods.list_machines(user, backend_id)
        log.warn('Returning list machines for user %s backend %s' % (email, backend_id))
        return {'backend_id': backend_id, 'machines': machines}

    def error_rerun_handler(self, exc, errors, email, backend_id):
        if len(errors) < 6:
            return self.result_fresh  # Retry when the result is no longer fresh
        user = user_from_email(email)
        with user.lock_n_load():
            user.backends[backend_id].enabled = False
            user.save()


class ProbeSSH(UserTask):
    abstract = False
    task_key = 'probe'
    result_expires = 60 * 60 * 2
    result_fresh = 60 * 2
    polling = True

    def execute(self, email, backend_id, machine_id, host):
        user = user_from_email(email)
        from mist.io.methods import probe_ssh_only
        res = probe_ssh_only(user, backend_id, machine_id, host)
        return {'backend_id': backend_id,
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

    def execute(self, email, backend_id, machine_id, host):
        from mist.io import methods
        res = methods.ping(host)
        return {'backend_id': backend_id,
                'machine_id': machine_id,
                'host': host,
                'result': res}

    def error_rerun_handler(self, exc, errors, *args, **kwargs):
        return self.result_fresh

