"""mist.io.socket

Here we define the socketio Connection and handlers.

When a user loads mist.io or comes back online, their browser will request a
new socket and the initialize function will be triggered on the server within a
greenlet.

"""

import uuid
import json
import socket
import random
from time import time

from sockjs.tornado import SockJSConnection, SockJSRouter
from mist.io.sockjs_mux import MultiplexConnection
import tornado.iostream

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
        from mist.io.model import User
        self.user = User()
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

    def on_close(self):
        log.info('on_close!')


class TornadoShell(tornado.iostream.BaseIOStream):
    def __init__(self, channel):
        super(TornadoShell, self).__init__(read_chunk_size=1024)
        self.channel = channel
        self.channel.setblocking(0)

    def fileno(self):
        return self.channel.fileno()

    def close_fd(self):
        self.channel.close()

    def read_from_fd(self):
        try:
            data = self.channel.recv(self.read_chunk_size)
            if data:
                return data.decode('utf-8', 'ignore')
            self.close()
        except socket.timeout:
            pass

    def write_to_fd(self, data):
        try:
            return self.channel.send(data.encode('utf-8', 'ignore'))
        except socket.timeout:
            return 0

    def get_fd_error(self):
        pass


class ShellConnection(MistConnection):
    def init(self):
        log.info('ShellConnection.__init__')
        super(ShellConnection, self).init()
        self.channel = None
        self.tornado_channel = None
        self.ssh_info = {}
        self.provider = ''

    def on_shell_open(self, data):
        log.info('on_shell_open')
        if self.ssh_info:
            self.close()
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
                self.close()
                return
        self.ssh_info.update(key_id=key_id, ssh_user=ssh_user)
        self.channel = self.shell.invoke_shell('xterm',
                                               data['cols'],
                                               data['rows'])

        # tornado compatible async wrapper around paramiko channel
        self.tornado_channel = TornadoShell(self.channel)

        def channel_closed(data):
            log.info('channel closed')
            self.close()

        self.tornado_channel.read_until_close(
            callback=channel_closed, streaming_callback=self.emit_shell_data
        )
        log.info('on_shell_open finished')

    def on_shell_data(self, data):
        # log.info('on_shell_data: %s', data)
        try:
            self.tornado_channel.write(bytes(data))
        except tornado.iostream.StreamClosedError:
            log.info('on_shell_data got stream error')

    def on_shell_resize(self, columns, rows):
        log.info("Resizing shell to %d * %d", columns, rows)
        try:
            self.channel.resize_pty(columns, rows)
        except Exception as exc:
            log.error("Error resizing shell: %r", exc)

    def emit_shell_data(self, data):
        self.send('shell_data', data)

    def on_close(self):
        if self.channel:
            self.channel.close()
        super(ShellConnection, self).on_close()


class MainConnection(MistConnection):
    def init(self):
        super(MainConnection, self).init()
        self.running_machines = set()

    def on_ready(self):
        log.info("Ready to go!")
        self.pika = PikaClient(self.user.email or 'noone', self.process_update)
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
            self.send('monitoring', func(self.user))
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
        self.send('stats', ret)

    def process_update(self, ch, method, properties, body):
        routing_key = method.routing_key
        try:
            result = json.loads(body)
        except:
            result = body
        log.info("Got %s", routing_key)
        if routing_key in set(['notify', 'probe', 'list_sizes', 'list_images',
                               'list_networks', 'list_machines',
                               'list_locations', 'ping']):
            self.send(routing_key, result)
            if routing_key == 'probe':
                log.warn('send probe')

            if routing_key == 'list_networks':
                backend_id = result['backend_id']
                log.warn('Got networks from %s',
                         self.user.backends[backend_id].title)
            if routing_key == 'list_machines':
                # probe newly discovered running machines
                machines = result['machines']
                backend_id = result['backend_id']
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
                        self.send('probe', cached)
                    cached = tasks.Ping().smart_delay(
                        self.user.email, backend_id, machine['id'], ips[0]
                    )
                    if cached is not None:
                        self.send('ping', cached)
        elif routing_key == 'update':
            self.user.refresh()
            sections = result
            if 'backends' in sections:
                self.list_backends()
            if 'keys' in sections:
                self.list_keys()
            if 'monitoring' in sections:
                self.check_monitoring()


def make_router():
    return SockJSRouter(
        MultiplexConnection.get(
            main=MainConnection,
            shell=ShellConnection,
        ),
        '/socket'
    )
