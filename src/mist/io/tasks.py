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


def task_wrap(key, expires, interval):
    def dec(func):
        @functools.wraps(func)
        def wrapped(self, email, *args, **kwargs):
            args = [email] + list(args)
            # seq_id is an id for the sequence of periodic tasks, to avoid
            # running multiple concurrent sequences of the same task with the
            # same arguments. it is empty on first run, constant afterwards
            seq_id = kwargs.pop('seq_id', '')

            # check cache
            id_str = json.dumps([key, args, kwargs])
            cache_key = b64encode(id_str)
            cache = MemcacheClient(["127.0.0.1:11211"])
            cached = cache.get(cache_key)
            cached_seq_id = ''
            if cached:
                age = time() - cached['timestamp']
                cached_seq_id = cached['seq_id']
                if seq_id and seq_id != cached_seq_id:
                    # another sequence of series has started, stop iterating
                    return
                if not seq_id and age < expires:
                    # first run, fresh result, will emit
                    amqp_log("%s: cache hit, age=%.1fs" % (id_str, age))
                    ok = amqp_publish_user(email, routing_key=key,
                                           data=cached['payload'])
                    if not ok:
                        # Task: i don't why i bother
                        amqp_log("%s: exchange closed" % id_str)
                        return
                    if age < interval:
                        # then this task has already been rescheduled for sure
                        # and the result is very fresh
                        return
            assert not seq_id or seq_id == cached_seq_id

            # if not cached, or expired, or not really that fresh,
            # then actually run the task
            data = func(self, *args, **kwargs)
            cached = {'timestamp': time(), 'payload': data, 'seq_id': seq_id}
            ok = amqp_publish_user(email, routing_key=key, data=data)
            if not ok:
                # echange closed, no one gives a shit, stop repeating, why try?
                amqp_log("%s: exchange closed" % id_str)
                return
            if not seq_id:
                # this task is called externally, not a rerun
                seq_id = uuid4().hex
            kwargs['seq_id'] = seq_id
            cache.set(cache_key, cached)
            amqp_log("%s: will rerun in %d secs" % (id_str, interval))
            self.apply_async(args, kwargs, countdown=interval)
        return wrapped
    return dec


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
        if not seq_id:
            # this task is called externally, not a rerun, create a seq_id
            amqp_log("%s: fresh task submitted [%s]" % (id_str, seq_id))
            seq_id = uuid4().hex
        # actually run the task
        data = self.run_inner(*args, **kwargs)
        cached = {'timestamp': time(), 'payload': data, 'seq_id': seq_id}
        ok = amqp_publish_user(email, routing_key=self.ut_key, data=data)
        if not ok:
            # echange closed, no one gives a shit, stop repeating, why try?
            amqp_log("%s: exchange closed" % id_str)
            return
        kwargs['seq_id'] = seq_id
        self.memcache.set(cache_key, cached)
        amqp_log("%s: will rerun in %d secs [%s]" % (id_str, self.ut_fresh,
                                                     seq_id))
        self.apply_async(args, kwargs, countdown=self.ut_fresh)

    def run_inner(self, *args, **kwargs):
        raise NotImplementedError()


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
            return
        return {'backend_id': backend_id,
                'machine_id': machine_id,
                'host': host,
                'result': res}


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
