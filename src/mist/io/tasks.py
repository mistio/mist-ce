import json
from time import time
from uuid import uuid4
import functools
from base64 import b64encode

from memcache import Client as MemcacheClient

from celery import Task

from amqp import Message
from amqp.connection import Connection

## from celery import logging

import libcloud.security

from mist.io.celery_app import app
from mist.io.exceptions import ServiceUnavailableError
from mist.io.shell import Shell
from mist.io.helpers import get_auth_header

try:  # Multi-user environment
    from mist.core.helpers import user_from_email
    from mist.core import config
    cert_path = "src/mist.io/cacert.pem"
except ImportError:  # Standalone mist.io
    from mist.io.helpers import user_from_email
    from mist.io import config
    cert_path = "cacert.pem"

from mist.io.helpers import amqp_publish_user
from mist.io.helpers import amqp_log

# libcloud certificate fix for OS X
libcloud.security.CA_CERTS_PATH.append(cert_path)

## log = logging.getLogger(__name__)


class UserTask(Task):
    abstract = True
    ut_key = ''
    ut_expires = 0
    ut_fresh = 0
    ut_keep_fresh = False
    _ut_cache = None

    @property
    def memcache(self):
        if self._ut_cache is None:
            self._ut_cache = MemcacheClient(["127.0.0.1:11211"])
        return self._ut_cache

    def smart_delay(self, *args, **kwargs):
        """Return cached result if it exists, send job to celery if needed"""
        # check cache
        id_str = json.dumps([self.ut_key, args, kwargs])
        cache_key = b64encode(id_str)
        cached = self.memcache.get(cache_key)
        if cached:
            age = time() - cached['timestamp']
            if age > self.ut_fresh:
                amqp_log("%s: scheduling task" % id_str)
                self.delay(*args, **kwargs)
            if age < self.ut_expires:
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
        id_str = json.dumps([self.ut_key, args, kwargs])
        cache_key = b64encode(id_str)
        # check cache to stop iteration if other sequence has started
        cached = self.memcache.get(cache_key)
        if cached:
            if seq_id and seq_id != cached['seq_id']:
                amqp_log("%s: found new cached seq_id [%s], "
                         "stopping iteration of [%s]" % (id_str,
                                                         cached['seq_id'],
                                                         seq_id))
                return
            elif not seq_id and time() - cached['timestamp'] < self.ut_fresh:
                amqp_log("%s: fresh task submitted with fresh cached result "
                         ", dropping" % id_str)
                return
        cached_err = self.memcache.get(cache_key + 'error')
        if cached_err:
            # task has been failing recently
            if seq_id != cached_err['seq_id']:
                # other sequence of task already handling this error flow
                return
        if not seq_id:
            # this task is called externally, not a rerun, create a seq_id
            amqp_log("%s: fresh task submitted [%s]" % (id_str, seq_id))
            seq_id = uuid4().hex
        # actually run the task
        try:
            data = self.run_inner(*args, **kwargs)
        except Exception as exc:
            # error handling
            now = time()
            if not cached_err:
                cached_err = {'seq_id': seq_id, 'timestamps': []}
            cached_err['timestamps'].append(now)
            x0 = cached_err['timestamps'][0]
            rel_points = [x - x0 for x in cached_err['timestamps']]
            rerun = self.error_rerun_handler(rel_points, *args, **kwargs)
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
        ok = amqp_publish_user(email, routing_key=self.ut_key, data=data)
        if not ok:
            # echange closed, no one gives a shit, stop repeating, why try?
            amqp_log("%s: exchange closed" % id_str)
            return
        kwargs['seq_id'] = seq_id
        self.memcache.set(cache_key, cached)
        if self.ut_keep_fresh:
            amqp_log("%s: will rerun in %d secs [%s]" % (id_str, self.ut_fresh,
                                                         seq_id))
            self.apply_async(args, kwargs, countdown=self.ut_fresh)

    def run_inner(self, *args, **kwargs):
        raise NotImplementedError()

    def error_rerun_handler(self, points, *args, **kwargs):
        """Accepts a list of relative time points of consecutive errors,
        returns number of seconds to retry in or None to stop retrying."""
        return None


@app.task
def ssh_command(user, backend_id, machine_id, host, command,
                      key_id=None, username=None, password=None, port=22):
    shell = Shell(host)
    key_id, ssh_user = shell.autoconfigure(user, backend_id, machine_id,
                                           key_id, username, password, port)
    retval, output = shell.command(command)
    shell.disconnect()
    if retval:
        from mist.io.methods import notify_user
        notify_user(user, "[mist.io] Async command failed for machine %s (%s)" % (machine_id, host), output)


class Probe(UserTask):
    abstract = False
    ut_key = 'probe'
    ut_expires = 60 * 60 * 2
    ut_fresh = 60 * 2
    ut_keep_fresh = True

    def run_inner(self, email, backend_id, machine_id, host,
                  key_id='', ssh_user=''):
        user = user_from_email(email)
        from mist.io import methods
        try:
            res = methods.probe(user, backend_id, machine_id, host,
                                key_id=key_id, ssh_user=ssh_user)
        except Exception as e:
            amqp_log("%s: %r" % (id_str, repr(e)))
            raise
        data = {'backend_id': backend_id,
                'machine_id': machine_id,
                'host': host,
                'result': res}
        if 'uptime' not in res:
            amqp_publish_user(email, routing_key='probe', data=data)
            raise Exception("Probe didn't get uptime")
        return data

    def error_rerun_handler(self, points, *args, **kwargs):
        t = 60 * 2 ** (len(points) + 1)  # 0, 2, 4, 8, 16, 32, 32, 32, 32 ...
        return t if t < 60 * 32 else 60 * 32


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
                notify_user(user, "[mist.io] Deployment script failed for machine %s (%s)" % (node.name, node.id), msg)
            else:
                notify_user(user, "[mist.io] Deployment script succeeded for machine %s (%s)" % (node.name, node.id), msg)

        except ServiceUnavailableError as exc:
            raise self.retry(exc=exc, countdown=60, max_retries=5)
    except Exception as exc:
        if str(exc).startswith('Retry'):
            return
        print "Deploy task failed with exception %s" % repr(exc)
        notify_user(user, "Deployment script failed for machine %s after 5 retries" % node.id)
        notify_admin("Deployment script failed for machine %s in backend %s by user %s after 5 retries" % (node.id, backend_id, email), repr(exc))


class ListSizes(UserTask):
    abstract = False
    ut_key = 'list_sizes'
    ut_expires = 60 * 60 * 24 * 7
    ut_fresh = 60 * 60
    ut_keep_fresh = False

    def run_inner(self, email, backend_id):
        from mist.io import methods
        user = user_from_email(email)
        sizes = methods.list_sizes(user, backend_id)
        return {'backend_id': backend_id, 'sizes': sizes}

    def error_rerun_handler(self, points, *args, **kwargs):
        if len(points) < 3:
            return [30, 120, 60 * 10][len(points) - 1]
        return None


class ListLocations(UserTask):
    abstract = False
    ut_key = 'list_locations'
    ut_expires = 60 * 60 * 24 * 7
    ut_fresh = 60 * 60
    ut_keep_fresh = False

    def run_inner(self, email, backend_id):
        from mist.io import methods
        user = user_from_email(email)
        locations = methods.list_locations(user, backend_id)
        return {'backend_id': backend_id, 'locations': locations}

    def error_rerun_handler(self, points, *args, **kwargs):
        if len(points) < 3:
            return [30, 120, 60 * 10][len(points) - 1]
        return None


class ListImages(UserTask):
    abstract = False
    ut_key = 'list_images'
    ut_expires = 60 * 60 * 24 * 7
    ut_fresh = 60 * 60
    ut_keep_fresh = False

    def run_inner(self, email, backend_id):
        from mist.io import methods
        user = user_from_email(email)
        images = methods.list_images(user, backend_id)
        return {'backend_id': backend_id, 'images': images}

    def error_rerun_handler(self, points, *args, **kwargs):
        if len(points) < 3:
            return [30, 120, 60 * 10][len(points) - 1]
        return None


class ListMachines(UserTask):
    abstract = False
    ut_key = 'list_machines'
    ut_expires = 60 * 60 * 24
    ut_fresh = 10
    ut_keep_fresh = True

    def run_inner(self, email, backend_id):
        from mist.io import methods
        user = user_from_email(email)
        machines = methods.list_machines(user, backend_id)
        return {'backend_id': backend_id, 'machines': machines}

    def error_rerun_handler(self, points, email, backend_id):
        if len(points) < 6:
            return self.ut_fresh
        user = user_from_email(email)
        with user.lock_n_load():
            user.backends[backend_id].enabled = False
            user.save()
