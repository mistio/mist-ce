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
    from mist.core.helpers import user_from_session_id
    from mist.core import config
    from mist.core.methods import get_stats
    multi_user = True
except ImportError:
    from mist.io.helpers import user_from_session_id
    from mist.io import config
    from mist.io.methods import get_stats
    multi_user = False

from mist.io.helpers import amqp_subscribe_user
from mist.io.methods import notify_user
from mist.io.exceptions import MachineUnauthorizedError
from mist.io.exceptions import BadRequestError
from mist.io.amqp_tornado import Consumer

from mist.io import methods
from mist.io import tasks
from mist.io.shell import Shell
from mist.io.hub.tornado_shell_client import ShellHubClient

import logging
logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)


# hold all open connections to properly clean them up in case of SIGTERM
CONNECTIONS = set()


def get_conn_info(conn_info):
    real_ip = forwarded_for = user_agent = ''
    for header in conn_info.headers:
        if header.lower() == 'x-real-ip':
            real_ip = conn_info.headers[header]
        elif header.lower() == 'x-forwarded-for':
            forwarded_for = conn_info.headers[header]
        elif header.lower() == 'user-agent':
            user_agent = conn_info.headers[header]
    ip = real_ip or forwarded_for or conn_info.ip
    session_id = ''
    if 'beaker.session.id' in conn_info.cookies.keys():
        session_id = conn_info.cookies['beaker.session.id'].value
    return ip, user_agent, session_id


class MistConnection(SockJSConnection):
    def on_open(self, conn_info):
        log.info("%s: Initializing", self.__class__.__name__)
        self.ip, self.user_agent, session_id = get_conn_info(conn_info)
        self.user = user_from_session_id(session_id)
        self.session_id = uuid.uuid4().hex
        CONNECTIONS.add(self)

    def send(self, msg, data=None):
        super(MistConnection, self).send(json.dumps({msg: data}))

    def on_close(self):
        log.info("%s: on_close event handler", self.__class__.__name__)
        CONNECTIONS.remove(self)


class ShellConnection(MistConnection):
    def on_open(self, conn_info):
        super(ShellConnection, self).on_open(conn_info)
        self.hub_client = None
        self.ssh_info = {}

    def on_shell_open(self, data):
        if self.ssh_info:
            self.close()
        self.ssh_info = {
            'backend_id': data['backend_id'],
            'machine_id': data['machine_id'],
            'host': data['host'],
            'columns': data['cols'],
            'rows': data['rows'],
            'ip': self.ip,
            'user_agent': self.user_agent,
            'email': self.user.email,
            'provider': data.get('provider', '')
        }
        self.hub_client = ShellHubClient(worker_kwargs=self.ssh_info)
        self.hub_client.on_data = self.emit_shell_data
        self.hub_client.start()
        log.info('on_shell_open finished')

    def on_shell_data(self, data):
        self.hub_client.send_data(data)

    def on_shell_resize(self, columns, rows):
        self.hub_client.resize(columns, rows)

    def emit_shell_data(self, data):
        self.send('shell_data', data)

    def on_close(self):
        if self.hub_client:
            self.hub_client.stop()
        super(ShellConnection, self).on_close()


class UserUpdatesConsumer(Consumer):
    def __init__(self, main_sockjs_conn,
                 amqp_url='amqp://guest:guest@127.0.0.1/'):
        self.sockjs_conn = main_sockjs_conn
        email = self.sockjs_conn.user.email or 'noone'
        super(UserUpdatesConsumer, self).__init__(
            amqp_url=amqp_url,
            exchange='mist-user_%s' % email.replace('@', ':'),
            queue='mist-socket-%d' % random.randrange(2 ** 20),
            exchange_type='fanout',
            exchange_kwargs={'auto_delete': True},
            queue_kwargs={'auto_delete': True, 'exclusive': True},
        )

    def on_message(self, unused_channel, basic_deliver, properties, body):
        super(UserUpdatesConsumer, self).on_message(
            unused_channel, basic_deliver, properties, body
        )
        self.sockjs_conn.process_update(
            unused_channel, basic_deliver, properties, body
        )

    def start_consuming(self):
        super(UserUpdatesConsumer, self).start_consuming()
        self.sockjs_conn.start()


class MainConnection(MistConnection):
    def on_open(self, conn_info):
        super(MainConnection, self).on_open(conn_info)
        self.running_machines = set()
        self.consumer = None

    def on_ready(self):
        log.info("Ready to go!")
        if self.consumer is None:
            self.consumer = UserUpdatesConsumer(self)
            self.consumer.run()
        else:
            log.error("It seems we have received 'on_ready' more than once.")

    def start(self):
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
                        log.info("Emitting %s from cache", key)
                        self.send(key, cached)

    def check_monitoring(self):
        try:
            from mist.core import methods as core_methods
            func = core_methods.check_monitoring
        except ImportError:
            func = methods.check_monitoring
        try:
            self.send('monitoring', func(self.user))
        except Exception as exc:
            log.warning("Check monitoring failed with: %r", exc)

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
            log.error("Exception in get_stats: %r", exc)
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
                except Exception as exc:
                    log.warning("Error while update_machine_count.delay: %r",
                                exc)
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

    def on_close(self):
        if self.consumer is not None:
            try:
                self.consumer.stop()
            except Exception as exc:
                log.error("Error closing pika consumer: %r", exc)
        super(MainConnection, self).on_close()


def make_router():
    return SockJSRouter(
        MultiplexConnection.get(
            main=MainConnection,
            shell=ShellConnection,
        ),
        '/socket'
    )
