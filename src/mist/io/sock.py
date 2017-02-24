"""mist.io.socket.

Here we define the sockjs Connection and handlers.

When a user loads mist.io or comes back online, their browser will request a
new socket and the initialize function will be triggered on the server within a
greenlet.

"""

import uuid
import json
import random
import traceback
import datetime

import tornado.gen

from sockjs.tornado import SockJSConnection, SockJSRouter
from mist.io.sockjs_mux import MultiplexConnection

from mist.io.clouds.models import Cloud
from mist.io.machines.models import Machine
from mist.io.poller.models import ListMachinesPollingSchedule

from mist.io.auth.methods import auth_context_from_session_id

from mist.io.exceptions import BadRequestError, UnauthorizedError, MistError
from mist.io.exceptions import PolicyUnauthorizedError
from mist.io.amqp_tornado import Consumer

from mist.io.clouds.methods import filter_list_clouds
from mist.io.keys.methods import filter_list_keys
from mist.io.machines.methods import filter_list_machines
from mist.io.scripts.methods import filter_list_scripts
from mist.io.schedules.methods import filter_list_schedules

from mist.io import tasks
from mist.io.hub.tornado_shell_client import ShellHubClient

from mist.io import config

try:
    from mist.core.methods import get_stats, get_load, check_monitoring
    from mist.core.methods import get_user_data, filter_list_tags
    from mist.core.methods import filter_list_vpn_tunnels
    from mist.core.rbac.methods import filter_org
    from mist.core.orchestration.methods import filter_list_templates
    from mist.core.orchestration.methods import filter_list_stacks
    multi_user = True  # TODO what is this for?
except ImportError:
    from mist.io.dummy.methods import get_stats, get_load, check_monitoring
    from mist.io.dummy.methods import get_user_data, filter_list_tags
    from mist.io.dummy.methods import filter_list_vpn_tunnels
    from mist.io.dummy.rbac import filter_org
    from mist.io.dummy.methods import filter_list_templates
    from mist.io.dummy.methods import filter_list_stacks
    multi_user = False

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
    if 'session.id' in conn_info.cookies.keys():
        session_id = conn_info.cookies['session.id'].value
    return ip, user_agent, session_id


class MistConnection(SockJSConnection):
    closed = False

    def on_open(self, conn_info):
        log.info("%s: Initializing", self.__class__.__name__)
        self.ip, self.user_agent, session_id = get_conn_info(conn_info)
        try:
            self.auth_context = auth_context_from_session_id(session_id)
        except UnauthorizedError:
            log.error("%s: Unauthorized session_id", self.__class__.__name__)
            self.send('logout')
            self.close()
            raise
        else:
            self.user = self.auth_context.user
            self.owner = self.auth_context.owner
            self.session_id = uuid.uuid4().hex
            CONNECTIONS.add(self)

    def send(self, msg, data=None):
        super(MistConnection, self).send(json.dumps({msg: data}))

    def on_close(self, stale=False):
        if not self.closed:
            log.info("%s: on_close event handler", self.__class__.__name__)
            if stale:
                log.warning("stale conn removed")
            CONNECTIONS.remove(self)
            self.closed = True
        else:
            log.warning("%s: called on_close AGAIN!", self.__class__.__name__)
            traceback.print_stack()

    def get_dict(self):
        return {
            'name': self.session.name,
            'last_rcv': self.session.base.last_rcv,
            'user': self.user.email,
            'ip': self.ip,
            'user_agent': self.user_agent,
            'closed': self.is_closed,
            'session_id': self.session_id,
        }

    def __repr__(self):
        conn_dict = self.get_dict()
        parts = []
        dt_last_rcv = datetime.datetime.fromtimestamp(conn_dict['last_rcv'])
        conn_dict['last_rcv'] = dt_last_rcv
        for key in ('name', 'last_rcv', 'user', 'ip', 'user_agent', 'closed',
                    'session_id'):
            if key in conn_dict:
                parts.append(conn_dict.pop(key))
        parts.extend(conn_dict.values())
        return ' - '.join(map(str, parts))


class ShellConnection(MistConnection):
    def on_open(self, conn_info):
        super(ShellConnection, self).on_open(conn_info)
        self.hub_client = None
        self.ssh_info = {}

    def on_shell_open(self, data):
        if self.ssh_info:
            self.close()
        try:
            if not data.get('job_id'):
                self.auth_context.check_perm(
                    'machine', 'open_shell', data['machine_id']
                )
        except PolicyUnauthorizedError as err:
            self.emit_shell_data('%s' % err)
            self.close()
            return

        self.ssh_info = {
            'job_id': data.get('job_id', ''),
            'cloud_id': data.get('cloud_id', ''),
            'machine_id': data.get('machine_id', ''),
            'host': data.get('host'),
            'columns': data['cols'],
            'rows': data['rows'],
            'ip': self.ip,
            'user_agent': self.user_agent,
            'owner_id': self.auth_context.owner.id,
            'user_id': self.user.id,
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

    def on_close(self, stale=False):
        if self.hub_client:
            self.hub_client.stop()
        super(ShellConnection, self).on_close(stale=stale)


class OwnerUpdatesConsumer(Consumer):
    def __init__(self, main_sockjs_conn,
                 amqp_url=config.BROKER_URL):
        self.sockjs_conn = main_sockjs_conn
        super(OwnerUpdatesConsumer, self).__init__(
            amqp_url=amqp_url,
            exchange='owner_%s' % self.sockjs_conn.owner.id,
            queue='mist-socket-%d' % random.randrange(2 ** 20),
            exchange_type='fanout',
            exchange_kwargs={'auto_delete': True},
            queue_kwargs={'auto_delete': True, 'exclusive': True},
        )

    def on_message(self, unused_channel, basic_deliver, properties, body):
        super(OwnerUpdatesConsumer, self).on_message(
            unused_channel, basic_deliver, properties, body
        )
        self.sockjs_conn.process_update(
            unused_channel, basic_deliver, properties, body
        )

    def start_consuming(self):
        super(OwnerUpdatesConsumer, self).start_consuming()
        self.sockjs_conn.start()


class MainConnection(MistConnection):

    def on_open(self, conn_info):
        log.info("************** Open!")
        super(MainConnection, self).on_open(conn_info)
        self.running_machines = set()
        self.consumer = None

    def on_ready(self):
        log.info("************** Ready to go!")
        if self.consumer is None:
            self.consumer = OwnerUpdatesConsumer(self)
            self.consumer.run()
        else:
            log.error("It seems we have received 'on_ready' more than once.")

    def start(self):
        self.update_user()
        self.update_org()
        self.list_tags()
        self.list_keys()
        self.list_scripts()
        self.list_schedules()
        self.list_templates()
        self.list_stacks()
        self.list_tunnels()
        self.list_clouds()
        self.check_monitoring()
        if config.ACTIVATE_POLLER:
            self.periodic_update_poller()

    @tornado.gen.coroutine
    def periodic_update_poller(self):
        while True:
            if self.closed:
                break
            self.update_poller()
            yield tornado.gen.sleep(100)

    def update_poller(self):
        """Increase polling frequency for all clouds"""
        log.info("Updating poller for %s", self)
        for cloud in Cloud.objects(owner=self.owner, deleted=None):
            ListMachinesPollingSchedule.add(cloud=cloud, interval=10, ttl=120)

    def update_user(self):
        self.send('user', get_user_data(self.auth_context))

    def update_org(self):
        try:
            org = filter_org(self.auth_context)
        except:  # Forbidden
            org = None

        if org:
            self.send('org', org)

    def list_tags(self):
        self.send('list_tags', filter_list_tags(self.auth_context))

    def list_keys(self):
        self.send('list_keys', filter_list_keys(self.auth_context))

    def list_scripts(self):
        self.send('list_scripts', filter_list_scripts(self.auth_context))

    def list_schedules(self):
        self.send('list_schedules', filter_list_schedules(self.auth_context))

    def list_templates(self):
        self.send('list_templates', filter_list_templates(self.auth_context))

    def list_stacks(self):
        self.send('list_stacks', filter_list_stacks(self.auth_context))

    def list_tunnels(self):
        self.send('list_tunnels', filter_list_vpn_tunnels(self.auth_context))

    def list_clouds(self):
        if config.ACTIVATE_POLLER:
            self.update_poller()
        self.send('list_clouds', filter_list_clouds(self.auth_context))
        clouds = Cloud.objects(owner=self.owner, enabled=True, deleted=None)
        log.info(clouds)
        periodic_tasks = []
        if not config.ACTIVATE_POLLER:
            periodic_tasks.append(('list_machines', tasks.ListMachines()))
        else:
            for cloud in clouds:
                after = datetime.datetime.utcnow() - datetime.timedelta(days=1)
                machines = Machine.objects(cloud=cloud, missing_since=None,
                                           last_seen__gt=after)
                machines = filter_list_machines(
                    self.auth_context, cloud_id=cloud.id,
                    machines=[machine.as_dict_old() for machine in machines]
                )
                if machines:
                    log.info("Emitting list_machines from poller's cache.")
                    self.send('list_machines',
                              {'cloud_id': cloud.id, 'machines': machines})

        periodic_tasks.extend([('list_images', tasks.ListImages()),
                               ('list_sizes', tasks.ListSizes()),
                               ('list_networks', tasks.ListNetworks()),
                               ('list_locations', tasks.ListLocations()),
                               ('list_projects', tasks.ListProjects())])
        for key, task in periodic_tasks:
            for cloud in clouds:
                cached = task.smart_delay(self.owner.id, cloud.id)
                if cached is not None:
                    log.info("Emitting %s from cache", key)
                    if key == 'list_machines':
                        cached['machines'] = filter_list_machines(
                            self.auth_context, **cached
                        )
                        if cached['machines'] is None:
                            continue
                    self.send(key, cached)

    def check_monitoring(self):
        func = check_monitoring
        try:
            self.send('monitoring', func(self.owner))
        except Exception as exc:
            log.warning("Check monitoring failed with: %r", exc)

    def on_stats(self, cloud_id, machine_id, start, stop, step, request_id,
                 metrics):

        def callback(data, error=False):
            ret = {
                'cloud_id': cloud_id,
                'machine_id': machine_id,
                'start': start,
                'stop': stop,
                'request_id': request_id,
                'metrics': data,
            }
            if error:
                ret['error'] = error
            log.error(ret)
            self.send('stats', ret)

        try:
            if not cloud_id and not machine_id and (
                not metrics or metrics == ['load.shortterm']
            ):
                get_load(self.owner, start, stop, step,
                         tornado_callback=callback)
            else:
                get_stats(self.owner, cloud_id, machine_id, start, stop, step,
                          metrics=metrics, callback=callback,
                          tornado_async=True)
        except MistError as exc:
            callback([], str(exc))
        except Exception as exc:
            log.error("Exception in get_stats: %r", exc)

    def process_update(self, ch, method, properties, body):
        routing_key = method.routing_key
        try:
            result = json.loads(body)
        except:
            result = body
        log.info("Got %s", routing_key)
        if routing_key in set(['notify', 'probe', 'list_sizes', 'list_images',
                               'list_networks', 'list_machines',
                               'list_locations', 'list_projects', 'ping']):
            if routing_key == 'list_machines':
                # probe newly discovered running machines
                machines = result['machines']
                cloud_id = result['cloud_id']
                filtered_machines = filter_list_machines(
                    self.auth_context, cloud_id, machines
                )
                if filtered_machines is not None:
                    self.send(routing_key, {'cloud_id': cloud_id,
                                            'machines': filtered_machines})
                # update cloud machine count in multi-user setups
                cloud = Cloud.objects.get(owner=self.owner, id=cloud_id,
                                          deleted=None)
                for machine in machines:
                    bmid = (cloud_id, machine['id'])
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
                        # if not public IPs, search for private IPs, otherwise
                        # continue iterating over the list of machines
                        ips = filter(lambda ip: ':' not in ip,
                                     machine.get('private_ips', []))
                        if not ips:
                            continue

                    machine_obj = Machine.objects(cloud=cloud,
                                                  machine_id=machine["id"],
                                                  key_associations__not__size=0
                                                  ).first()
                    if machine_obj:
                        cached = tasks.ProbeSSH().smart_delay(
                            self.owner.id, cloud_id, machine['id'], ips[0]
                        )
                        if cached is not None:
                            self.send('probe', cached)

                    cached = tasks.Ping().smart_delay(
                        self.owner.id, cloud_id, machine['id'], ips[0]
                    )
                    if cached is not None:
                        self.send('ping', cached)
            else:
                self.send(routing_key, result)

        elif routing_key == 'update':
            self.owner.reload()
            sections = result
            if 'clouds' in sections:
                self.list_clouds()
            if 'keys' in sections:
                self.list_keys()
            if 'scripts' in sections:
                self.list_scripts()
            if 'schedules' in sections:
                self.list_schedules()
            if 'templates' in sections:
                self.list_templates()
            if 'stacks' in sections:
                self.list_stacks()
            if 'tags' in sections:
                self.list_tags()
            if 'tunnels' in sections:
                self.list_tunnels()
            if 'monitoring' in sections:
                self.check_monitoring()
            if 'user' in sections:
                self.auth_context.user.reload()
                self.update_user()
            if 'org' in sections:
                self.auth_context.org.reload()
                self.update_org()

    def on_close(self, stale=False):
        if self.consumer is not None:
            try:
                self.consumer.stop()
            except Exception as exc:
                log.error("Error closing pika consumer: %r", exc)
        super(MainConnection, self).on_close(stale=stale)


def make_router():
    return SockJSRouter(
        MultiplexConnection.get(
            main=MainConnection,
            shell=ShellConnection,
        ),
        '/socket'
    )
