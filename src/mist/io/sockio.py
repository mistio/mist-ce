"""mist.io.socket

Here we define the socketio namespace and handlers.

When a user loads mist.io or comes back online, their browser will request a 
new socket and the initialize function will be triggered on the server within a 
greenlet.

"""

import json

import pika

from time import time

from gevent.socket import wait_read, wait_write

from socketio.namespace import BaseNamespace

try:
    from mist.core.helpers import user_from_request
except ImportError:
    from mist.io.helpers import user_from_request

from mist.io import methods
from mist.io.shell import Shell


class MistNamespace(BaseNamespace):
    def initialize(self):
        self.user = user_from_request(self.request)
        self.probes = {}
        self.monitoring_greenlet = self.spawn(check_monitoring_from_socket, self)
        self.backends_greenlet = self.spawn(list_backends_from_socket, self)
        self.keys_greenlet = self.spawn(list_keys_from_socket, self)
        self.update_greenlet = self.spawn(update_subscriber, self)
        
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
    
    def on_shell_open(self, data):
        print "opened shell! %s" % data
        self.shell = Shell(data['host'])
        key_id, ssh_user = self.shell.autoconfigure(self.user, data['backend_id'], data['machine_id'])
        self.channel = self.shell.ssh.invoke_shell('xterm')
        self.spawn(get_ssh_data, self)
    
    def on_shell_close(self):
        print "closing shell"
        self.channel.disconnect()
    
    def on_shell_data(self, data):
        self.channel.send(data)
        
    def on_boo(self, data):
        print "BOO", data
        self.emit("Boo")


def get_ssh_data(namespace):
    channel = namespace.channel
    try:
        while True:
            wait_read(channel.fileno())
            data = channel.recv(1024)
            if not len(data):
                return
            namespace.emit('shell_data', data)
    finally:
        channel.close()


def update_subscriber(namespace):
    """Subscribe to RabbitMQ for updates of user data and emit notificaions to
    the browser.
        
    """
    connection = pika.BlockingConnection(pika.ConnectionParameters(
            host='localhost'))
    channel = connection.channel()
    
    channel.exchange_declare(exchange=namespace.user.email,
                             type='fanout')
    result = channel.queue_declare(exclusive=True)
    queue_name = result.method.queue
    
    channel.queue_bind(exchange=namespace.user.email,
                       queue=queue_name)
    
    print ' [*] Waiting for logs. To exit press CTRL+C'
    
    def callback(ch, method, properties, body):
        if method.routing_key == 'notify':
            namespace.emit('notify', body)
        elif method.routing_key == 'update':
            namespace.user.refresh()
            namespace.emit('update', body)
            sections = json.loads(body)
            if 'backends' in sections:
                namespace.backends_greenlet.kill()
                namespace.backends_greenlet = namespace.spawn(list_backends_from_socket, 
                                                              namespace)
            if 'keys' in sections:
                namespace.keys_greenlet.kill()
                namespace.keys_greenlet = namespace.spawn(list_keys_from_socket, 
                                                          namespace)
            if 'monitoring' in sections:
                namespace.monitoring_greenlet.kill()
                namespace.monitoring_greenlet = namespace.spawn(check_monitoring_from_socket, 
                                                                namespace)
        
            
    channel.basic_consume(callback,
                          queue=queue_name,
                          no_ack=True)
    
    channel.start_consuming()


def check_monitoring_from_socket(namespace):
    user = namespace.user
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
    user = namespace.user    
    machines = methods.list_machines(user, backend_id)
    namespace.emit('list_machines', {'backend_id': backend_id, 
                                     'machines': machines})
    if probe:
        probes = [namespace.spawn(probe_machine_from_socket, 
                                  namespace, 
                                  backend_id, 
                                  machine['id'], 
                                  machine['public_ips'][0]) \
                  for machine in machines if machine.get('public_ips', None)]
    namespace.spawn_later(10, 
                          list_machines_from_socket,
                          namespace, 
                          backend_id,  
                          probe)


def probe_machine_from_socket(namespace, backend_id, machine_id, host, key_id='', ssh_user=''):
    user = namespace.user
    if namespace.probes.get(host, None) and time() - namespace.probes[host]['time'] < 5*60:
        # Do not reprobe in less than 5 mins
        # TODO: make this smarter
        return
    result = methods.probe(user, backend_id, machine_id, host, key_id, ssh_user)
    namespace.emit('probe', {'backend_id': backend_id,
                             'machine_id': machine_id,
                             'result': result})
    namespace.probes[host] = {'time': time(),
                               'result': result}
