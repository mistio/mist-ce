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
except ImportError:
    from mist.io.helpers import user_from_request
    from mist.io import config

from mist.io.helpers import amqp_subscribe_user
from mist.io.helpers import get_auth_header

from mist.io import methods
from mist.io import tasks
from mist.io.shell import Shell


class ShellNamespace(BaseNamespace):
    def initialize(self):
        self.user = user_from_request(self.request)
        self.channel = None
        print "opening shell socket"

    def on_shell_open(self, data):
        print "opened shell"
        self.shell = Shell(data['host'])
        key_id, ssh_user = self.shell.autoconfigure(self.user, data['backend_id'], data['machine_id'])
        self.channel = self.shell.ssh.invoke_shell('xterm')
        self.spawn(self.get_ssh_data)

    def on_shell_close(self):
        print "closing shell"
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


class MistNamespace(BaseNamespace):
    def initialize(self):
        print "init"
        self.user = user_from_request(self.request)
        self.probes = {}
        self.channel = None
        self._old_machines = set()

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
        print "Ready to go!"
        self.update_greenlet = self.spawn(update_subscriber, self)

        self.monitoring_greenlet = self.spawn_later(2, check_monitoring_from_socket, self)
        self.backends_greenlet = self.spawn_later(2, list_backends_from_socket, self)
        self.keys_greenlet = self.spawn_later(2, list_keys_from_socket, self)
        #self.probe_greenlet = self.spawn(probe_subscriber, self)

    def on_stats(self, backend_id, machine_id, start, stop, step, requestID):
        print "STATS!!", backend_id, machine_id, start, stop, step
        data = {'start': start-50,
                'stop': stop+50,
                'step': step/1000}
        data['v'] = 2
        try:
            uri = config.CORE_URI + '/backends/' + backend_id + '/machines/' + machine_id + '/stats'
            print uri
            resp = requests.get(uri,
                                params=data,
                                headers={'Authorization': get_auth_header(self.user)},
                                verify=config.SSL_VERIFY)
        except requests.exceptions.SSLError as exc:
            print exc
            #log.error("%r", exc)

        if resp.ok:
            ret = {}
            ret['metrics'] = resp.json()
            ret['backend_id'] = backend_id
            ret['machine_id'] = machine_id
            ret['start'] = start
            ret['stop'] = stop
            ret['requestID'] = requestID
            self.emit('stats', ret)
            print ret
        else:
            print "Error getting stats %d:%s", resp.status_code, resp.text
            from mist.io.methods import notify_user
            notify_user(self.user, "Error getting stats %d:%s" % (resp.status_code, resp.text))

    def process_update(self, msg):
        routing_key = msg.delivery_info.get('routing_key')
        print "Got %s" % routing_key
        if routing_key in set(['notify', 'probe', 'list_sizes', 'list_images',
                               'list_machines', 'list_locations']):
            self.emit(routing_key, msg.body)
            if routing_key == 'probe':
                args = (self.user.email, msg.body['backend_id'],
                        msg.body['machine_id'], msg.body['host'])
                ## tasks.probe.apply_async(args, countdown=120)
            elif routing_key == 'list_machines':
                machines = msg.body['machines']
                backend_id = msg.body['backend_id']
                for machine in machines:
                    if (backend_id, machine['id']) in self._old_machines:
                        continue
                    self._old_machines.add((backend_id, machine['id']))
                    ips = filter(lambda ip: ':' not in ip,
                                 machine.get('public_ips', []))
                    if not ips:
                        continue
                    tasks.probe.delay(self.user.email, backend_id,
                                      machine['id'], ips[0])
                ## tasks.list_machines.apply_async((self.user.email, backend_id),
                                                ## countdown=10)
        elif routing_key == 'update':
            self.user.refresh()
            sections = msg.body
            if 'backends' in sections:
                self.backends_greenlet.kill()
                self.backends_greenlet = self.spawn(list_backends_from_socket,
                                                    self)
            if 'keys' in sections:
                self.keys_greenlet.kill()
                self.keys_greenlet = self.spawn(list_keys_from_socket,
                                                self)
            if 'monitoring' in sections:
                self.monitoring_greenlet.kill()
                self.monitoring_greenlet = self.spawn(check_monitoring_from_socket,
                                                      self)


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
    print "New backends: ", backends

    for task in (tasks.list_machines, tasks.list_sizes,
                 tasks.list_locations, tasks.list_images):
        for backend_id in user.backends:
            task.delay(user.email, backend_id)


def list_keys_from_socket(namespace):
    user = namespace.user
    keys = methods.list_keys(user)
    namespace.emit('list_keys', keys)
