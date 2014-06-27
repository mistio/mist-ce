"""mist.io.socket

Here we define the socketio namespace and handlers.

When a user loads mist.io or comes back online, their browser will request a
new socket and the initialize function will be triggered on the server within a
greenlet.

"""

from time import time

import gevent
from gevent.socket import wait_read, wait_write

from socketio.namespace import BaseNamespace

try:
    from mist.core.helpers import user_from_request
except ImportError:
    from mist.io.helpers import user_from_request
from mist.io.helpers import amqp_subscribe

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
        self.monitoring_greenlet = self.spawn(check_monitoring_from_socket, self)
        self.backends_greenlet = self.spawn(list_backends_from_socket, self)
        self.keys_greenlet = self.spawn(list_keys_from_socket, self)
        self.update_greenlet = self.spawn(update_subscriber, self)
        #self.probe_greenlet = self.spawn(probe_subscriber, self)

    def process_update(self, msg):
        routing_key = msg.delivery_info.get('routing_key')
        if routing_key == 'notify':
            self.emit('notify', msg.body)
        elif routing_key == 'probe':
            print "Got probe"
            print msg.body
            self.emit('probe', msg.body);
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
    """Subscribe to RabbitMQ for updates of user data and emit notificaions to
    the browser.

    """
    amqp_subscribe(
        exchange=namespace.user.email or 'mist',
        queue='update',
        callback=namespace.process_update,
    )


def check_monitoring_from_socket(namespace):
    user = namespace.user
    try:
        from mist.core import methods as core_methods
        ret = core_methods.check_monitoring(user)
    except ImportError:
        ret = methods.check_monitoring(user)
    namespace.emit('monitoring', ret)


def list_backends_from_socket(namespace):
    user = namespace.user
    backends = methods.list_backends(user)
    namespace.emit('list_backends', backends)
    print "New backends: ", backends
    sizes = [namespace.spawn(list_sizes_from_socket,
                             namespace,
                             b['id']) for b in backends]
    locations = [namespace.spawn(list_locations_from_socket,
                                 namespace,
                                 b['id']) for b in backends]

    images = [namespace.spawn(list_images_from_socket,
                              namespace,
                              b['id']) for b in backends]
    machines = [namespace.spawn(list_machines_from_socket,
                                namespace,
                                b['id']) for b in backends]


def list_keys_from_socket(namespace):
    user = namespace.user
    keys = methods.list_keys(user)
    namespace.emit('list_keys', keys)


def list_sizes_from_socket(namespace, backend_id):
    user = namespace.user
    sizes = methods.list_sizes(user, backend_id)
    namespace.emit('list_sizes', {'backend_id': backend_id,
                                  'sizes': sizes})


def list_locations_from_socket(namespace, backend_id):
    user = namespace.user
    locations = methods.list_locations(user, backend_id)
    namespace.emit('list_locations', {'backend_id': backend_id,
                                      'locations': locations})


def list_images_from_socket(namespace, backend_id):
    user = namespace.user
    images = methods.list_images(user, backend_id)
    namespace.emit('list_images', {'backend_id': backend_id,
                                   'images': images})


def list_machines_from_socket(namespace, backend_id, probe=True):
    print "list_machines_from_socket"
    user = namespace.user
    machines = methods.list_machines(user, backend_id)
    namespace.emit('list_machines', {'backend_id': backend_id,
                                     'machines': machines})
    if probe:
        probes = []
        for machine in machines:
            ips = filter(lambda ip: ':' not in ip,
                         machine.get('public_ips', []))
            if not ips:
                continue
            tasks.async_probe.delay(user.email, backend_id, machine['id'], ips[0])

    namespace.spawn_later(10,
                          list_machines_from_socket,
                          namespace,
                          backend_id,
                          False)
