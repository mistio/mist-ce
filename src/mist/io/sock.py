"""mist.io.socket

Here we define the socketio Connection and handlers.

When a user loads mist.io or comes back online, their browser will request a
new socket and the initialize function will be triggered on the server within a
greenlet.

"""

import uuid
import json
import random
from time import time

import tornado.ioloop
import tornado.web
from sockjs.tornado import SockJSConnection, SockJSRouter
from mist.io.sockjs_mux import MultiplexConnection

import requests

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
from mist.io.exceptions import MachineUnauthorizedError
from mist.io.exceptions import BadRequestError

from mist.io import methods
from mist.io import tasks
from mist.io.shell import Shell
from mist.io.pika_tornado import PikaClient

import logging
logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)


class MistConnection(SockJSConnection):
    def __init__(self, *args, **kwargs):
        super(MistConnection, self).__init__(*args, **kwargs)
        # self.user = user_from_request(self.request)
        self.session_id = uuid.uuid4().hex
        # log.info("Initialized %s for user %s. Socket %s. Session %s",
        #         self.__class__.__name__, self.user.email,
        #         self.socket.sessid, self.session_id)
        self.init()

    def init(self):
        # IMPORTANT: initialize() is called automatically by BaseConnection on
        # all the classes and mixins in the order of the MRO which creates
        # weird issues when trying to subclass. Use init instead because it
        # is called only once and can use super.
        try:
            super(MistConnection, self).init()
        except AttributeError:
            pass

    def send(self, msg, data=None):
        super(MistConnection, self).send(json.dumps({msg: data}))

    def disconnect(self, silent=False):
        if multi_user:
            try:
                # reload the session to avoid saving a stale or deleted session
                self.request.environ['beaker.session'].load()
            except Exception as exc:
                log.error("%s: Error reloading request session: %r",
                          self.__class__.__name__, exc)
        log.info("Disconnecting %s for user %s. Socket %s. Session %s",
                 self.__class__.__name__, self.user.email,
                 self.socket.sessid, self.session_id)
        return super(MistConnection, self).disconnect(silent=silent)


class ShellConnection(MistConnection):
    def init(self):
        super(ShellConnection, self).init()
        self.channel = None
        self.ssh_info = {}
        self.provider = ''

    def on_shell_open(self, data):
        if self.ssh_info:
            self.disconnect()
        self.ssh_info = {
            'backend_id': data['backend_id'],
            'machine_id': data['machine_id'],
            'host': data['host'],
            'columns': data['cols'],
            'rows': data['rows'],
        }
        log.info("opened shell")
        self.provider = data.get('provider', '')
        self.shell = Shell(data['host'])
        try:
            key_id, ssh_user = self.shell.autoconfigure(
                self.user, data['backend_id'], data['machine_id']
            )
        except Exception as exc:
            if self.provider == 'docker':
                self.shell = Shell(data['host'],
                                   provider=data.get('provider', ''))
                key_id, ssh_user = self.shell.autoconfigure(
                    self.user, data['backend_id'], data['machine_id']
                )
            else:
                log.info(str(exc))
                if isinstance(exc, MachineUnauthorizedError):
                    err = 'Permission denied (publickey).'
                else:
                    err = str(exc)
                self.ssh_info['error'] = err
                self.emit_shell_data(err)
                self.disconnect()
                return
        self.ssh_info.update(key_id=key_id, ssh_user=ssh_user)
        self.channel = self.shell.invoke_shell('xterm',
                                               data['cols'],
                                               data['rows'])
        self.spawn(self.get_ssh_data)

    def on_shell_data(self, data):
        self.channel.send(data.encode('utf-8', 'ignore'))

    def on_shell_resize(self, columns, rows):
        log.info("Resizing shell to %d * %d", columns, rows)
        try:
            self.channel.resize_pty(columns, rows)
        except:
            pass

    def get_ssh_data(self):
        try:
            if self.provider == 'docker':
                try:
                    self.channel.send('\n')
                except:
                    pass
            while True:
                wait_read(self.channel.fileno())
                try:
                    data = self.channel.recv(1024).decode('utf-8', 'ignore')
                except TypeError:
                    data = self.channel.recv().decode('utf-8', 'ignore')

                if not len(data):
                    return
                self.emit_shell_data(data)
        finally:
            self.channel.close()

    def emit_shell_data(self, data):
        self.emit('shell_data', data)

    def disconnect(self, silent=False):
        if self.channel:
            self.channel.close()
        super(ShellConnection, self).disconnect(silent=silent)


class MainConnection(MistConnection):
    def init(self):
        super(MainConnection, self).init()
        self.update_greenlet = None
        self.running_machines = set()
        from mist.io.model import User
        self.user = User()

    def on_ready(self):
        log.info("Ready to go!")
        self.pika = PikaClient(self.user.email, self.process_update)
        self.pika.connect()
        self.list_keys()
        self.list_backends()
        self.check_monitoring()

    def list_keys(self):
        self.send('list_keys', methods.list_keys(self.user))

    def list_backends(self):
        backends = methods.list_backends(self.user)
        self.send('list_backends', backends)
        for key, task in (('list_machines', tasks.ListMachines()),
                          ('list_images', tasks.ListImages()),
                          ('list_sizes', tasks.ListSizes()),
                          ('list_networks', tasks.ListNetworks()),
                          ('list_locations', tasks.ListLocations()),):
            for backend_id in self.user.backends:
                if self.user.backends[backend_id].enabled:
                    cached = task.smart_delay(self.user.email, backend_id)
                    if cached is not None:
                        self.send(key, cached)

    def check_monitoring(self):
        try:
            from mist.core import methods as core_methods
            func = core_methods.check_monitoring
        except ImportError:
            func = methods.check_monitoring
        try:
            self.send('monitoring', func(user))
        except:
            pass

    def on_stats(self, backend_id, machine_id, start, stop, step, request_id,
                 metrics):
        error = False
        try:
            data = get_stats(self.user, backend_id, machine_id,
                             start, stop, step)
        except BadRequestError as exc:
            error = str(exc)
            data = []
        except Exception as exc:
            amqp_log("Error getting stats: %r" % exc)
            return

        ret = {
            'backend_id': backend_id,
            'machine_id': machine_id,
            'start': start,
            'stop': stop,
            'request_id': request_id,
            'metrics': data,
        }
        if error:
            ret['error'] = error
        self.emit('stats', ret)

    def process_update(self, msg):
        routing_key = msg.delivery_info.get('routing_key')
        log.info("Got %s", routing_key)
        if routing_key in set(['notify', 'probe', 'list_sizes', 'list_images',
                               'list_networks', 'list_machines',
                               'list_locations', 'ping']):
            self.emit(routing_key, msg.body)
            if routing_key == 'probe':
                log.warn('send probe')

            if routing_key == 'list_networks':
                backend_id = msg.body['backend_id']
                log.warn('Got networks from %s',
                         self.user.backends[backend_id].title)
            if routing_key == 'list_machines':
                # probe newly discovered running machines
                machines = msg.body['machines']
                backend_id = msg.body['backend_id']
                # update backend machine count in multi-user setups
                try:
                    mcount = self.user.backends[backend_id].machine_count
                    if multi_user and len(machines) != mcount:
                        tasks.update_machine_count.delay(self.user.email,
                                                         backend_id,
                                                         len(machines))
                        log.info('Updated machine count for user %s',
                                 self.user.email)
                except Exception as e:
                    log.error('Cannot update machine count for user %s: %r',
                              self.user.email, e)
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
                self.monitoring_greenlet = self.spawn(
                    check_monitoring_from_socket, self
                )


def make_router():
    return SockJSRouter(
        MultiplexConnection.get(
            main=MainConnection,
            shell=ShellConnection,
        ),
        '/socket'
    )
