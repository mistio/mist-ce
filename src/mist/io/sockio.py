"""mist.io.socket

Here we define the socketio namespace and handlers.

When a user loads mist.io or comes back online, their browser will request a
new socket and the initialize function will be triggered on the server within a
greenlet.

"""

import random
from time import time

import gevent
from gevent.socket import wait_read, wait_write

import requests

from socketio.namespace import BaseNamespace

try:
    from mist.core.helpers import user_from_request
    from mist.core import config
    from mist.core.methods import get_stats
    multi_user = True
except ImportError:
    from mist.io.helpers import user_from_request
    from mist.io import config
    from mist.io.methods import get_stats
    multi_user = False

from mist.io.helpers import amqp_subscribe_user
from mist.io.helpers import amqp_log
from mist.io.methods import notify_user

from mist.io import methods
from mist.io import tasks
from mist.io.shell import Shell

import logging
logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)


class ShellNamespace(BaseNamespace):
    def initialize(self):
        self.user = user_from_request(self.request)
        self.channel = None
        log.info("opening shell socket")

    def on_shell_open(self, data):
        log.info("opened shell")
        self.shell = Shell(data['host'])
        key_id, ssh_user = self.shell.autoconfigure(self.user, data['backend_id'], data['machine_id'])
        self.channel = self.shell.ssh.invoke_shell('xterm')
        self.spawn(self.get_ssh_data)

    def on_shell_close(self):
        log.info("closing shell")
        if self.channel:
            self.channel.close()

    def on_shell_data(self, data):
        self.channel.send(data)

    def get_ssh_data(self):
        try:
            while True:
                wait_read(self.channel.fileno())
                data = self.channel.recv(1024).decode('utf-8','ignore')
                if not len(data):
                    return
                self.emit('shell_data', data)
        finally:
            self.channel.close()

    def disconnect(silent=False):
        if multi_user:
            # reload the session, to avoid saving a stale or deleted session
            self.request.environ['beaker.session'].load()
        return super(ShellNamespace, self).disconnect(silent=silent)


class MistNamespace(BaseNamespace):
    def initialize(self):
        log.info("init")
        self.user = user_from_request(self.request)
        self.update_greenlet = None
        self.running_machines = set()

    def spawn_later(self, delay, fn, *args, **kwargs):
        """Spawn a new process, attached to this Namespace after no less than
        delay seconds.

        It will be monitored by the "watcher" process in the Socket. If the
        socket disconnects, all these greenlets are going to be killed, after
        calling BaseNamespace.disconnect()

        This method uses the ``exception_handler_decorator``.  See
        Namespace documentation for more information.

        """
        # self.log.debug("Spawning sub-Namespace Greenlet: %s" % fn.__name__)
        if hasattr(self, 'exception_handler_decorator'):
            fn = self.exception_handler_decorator(fn)
        import gevent
        new = gevent.spawn_later(delay, fn, *args, **kwargs)
        self.jobs.append(new)
        return new

    def on_ready(self):
        log.info("Ready to go!")
        if self.update_greenlet is not None:
            self.update_greenlet.kill()
        self.update_greenlet = self.spawn(update_subscriber, self)

        self.monitoring_greenlet = self.spawn_later(2, check_monitoring_from_socket, self)
        self.backends_greenlet = self.spawn_later(2, list_backends_from_socket, self)
        self.keys_greenlet = self.spawn_later(2, list_keys_from_socket, self)
        #self.probe_greenlet = self.spawn(probe_subscriber, self)

    def on_stats(self, backend_id, machine_id, start, stop, step, requestID):
        try:
            data = get_stats(self.user, backend_id, machine_id,
                             start - 50, stop + 50, step / 1000)
        except Exception as exc:
            amqp_log("Error getting stats: %r" % exc)
            return
        ret = {
            'backend_id': backend_id,
            'machine_id': machine_id,
            'start': start,
            'stop': stop,
            'requestID': requestID,
            'metrics': data,
        }
        self.emit('stats', ret)

    def process_update(self, msg):
        routing_key = msg.delivery_info.get('routing_key')
        log.info("Got %s", routing_key)
        if routing_key in set(['notify', 'probe', 'list_sizes', 'list_images',
                               'list_machines', 'list_locations', 'ping']):
            self.emit(routing_key, msg.body)
            if routing_key == 'probe':
                log.warn('send probe')

            if routing_key == 'list_machines':
                # probe newly discovered running machines
                machines = msg.body['machines']
                backend_id = msg.body['backend_id']
                # update backend machine count in multi-user setups
                try:
                    if multi_user and len(machines) != self.user.backends[backend_id].machine_count:
                        tasks.update_machine_count.delay(self.user.email, backend_id, len(machines))
                        log.info('Updated machine count for user %s' % self.user.email)
                except Exception as e:
                    log.error('Cannot update machine count for user %s: %r' % (self.user.email, e))
                for machine in machines:
                    bmid = (backend_id, machine['id'])
                    if bmid in self.running_machines:
                        # machine was running
                        if machine['state'] != 'running':
                            # machine no longer running
                            self.running_machines.remove(bmid)
                        continue
                    if machine['state'] != 'running':
                        # machine not running
                        continue
                    # machine just started running
                    self.running_machines.add(bmid)
                    ips = filter(lambda ip: ':' not in ip,
                                 machine.get('public_ips', []))
                    if not ips:
                        continue
                    cached = tasks.ProbeSSH().smart_delay(
                        self.user.email, backend_id, machine['id'], ips[0]
                    )
                    if cached is not None:
                        self.emit('probe', cached)
                    cached = tasks.Ping().smart_delay(
                        self.user.email, backend_id, machine['id'], ips[0]
                    )
                    if cached is not None:
                        self.emit('ping', cached)
        elif routing_key == 'update':
            self.user.refresh()
            sections = msg.body
            if 'backends' in sections:
                self.backends_greenlet.kill()
                self.backends_greenlet = self.spawn(list_backends_from_socket,
                                                    self)
            if 'keys' in sections:
                self.keys_greenlet.kill()
                self.keys_greenlet = self.spawn(list_keys_from_socket, self)
            if 'monitoring' in sections:
                self.monitoring_greenlet.kill()
                self.monitoring_greenlet = self.spawn(check_monitoring_from_socket,
                                                      self)

    def disconnect(silent=False):
        if multi_user:
            # reload the session, to avoid saving a stale or deleted session
            self.request.environ['beaker.session'].load()
        return super(MistNamespace, self).disconnect(silent=silent)


def update_subscriber(namespace):
    """Subscribe to RabbitMQ for updates of user data and emit notifications to
    the browser.

    """
    # The exchange/queue name consists of a non-empty sequence of these
    # characters: letters, digits, hyphen, underscore, period, or colon.
    user = namespace.user
    queue = "mist-socket-%d" % random.randrange(2 ** 20)
    amqp_subscribe_user(user, queue=queue, callback=namespace.process_update)


def check_monitoring_from_socket(namespace):
    user = namespace.user
    try:
        from mist.core import methods as core_methods
        func = core_methods.check_monitoring
    except ImportError:
        func = methods.check_monitoring
    try:
        ret = func(user)
        namespace.emit('monitoring', ret)
    except:
        pass


def list_backends_from_socket(namespace):
    user = namespace.user
    backends = methods.list_backends(user)
    namespace.emit('list_backends', backends)
    for key, task in (('list_machines', tasks.ListMachines()),
                      ('list_images', tasks.ListImages()),
                      ('list_sizes', tasks.ListSizes()),
                      ('list_locations', tasks.ListLocations())):
        for backend_id in user.backends:
            if user.backends[backend_id].enabled:
                cached = task.smart_delay(user.email, backend_id)
                if cached is not None:
                    namespace.emit(key, cached)


def list_keys_from_socket(namespace):
    user = namespace.user
    keys = methods.list_keys(user)
    namespace.emit('list_keys', keys)
