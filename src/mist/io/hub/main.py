import sys
import uuid
import json
import signal
import logging
import argparse
import traceback

import amqp

import gevent
import gevent.socket
import gevent.monkey

try:  # Multi-user environment
    from mist.core import config
except ImportError:  # Standalone mist.io
    from mist.io import config

# Exchange to be used by hub. Should be the same for server and clients.
EXCHANGE = 'hub'

# Routing queue/key for hub requests from clients to servers.
# Should be the same for server and clients.
REQUESTS_KEY = 'hub'


log = logging.getLogger(__name__)


class AmqpGeventBase(object):
    """Abstract base class that provides AMQP/GEVENT related helpers"""

    def __init__(self, exchange=EXCHANGE):
        """Initialize basic instance attributes"""
        self.exchange = exchange
        self.uuid = uuid.uuid4().hex
        self.lbl = ' '.join((self.__class__.__name__, self.uuid))
        log.info("%s: Initializing.", self.lbl)

        self.started = False
        self.stopped = False
        self.conns = {}
        self.chans = {}
        self.greenlets = {}

    @property
    def greenlet_id(self):
        """Find current greenlet's id

        Parts of this class will be called in different greenlets. Greenlet Id
        is used to differentiate between greenlet specific instance resources
        that can't be shared between greenlets.

        """
        return id(gevent.getcurrent())

    @property
    def conn(self):
        """Find or create current greenlet's AMQP connection"""
        gid = self.greenlet_id
        if gid not in self.conns:
            log.debug("%s: Opening new AMQP connection.", self.lbl)
            self.conns[gid] = amqp.Connection(config.AMQP_URI)
        return self.conns[gid]

    def close_conn(self):
        """Close current greenlet's AMQP connection"""
        gid = self.greenlet_id
        if gid not in self.conns:
            log.warning("%s: No AMQP connection open to close.", self.lbl)
        else:
            log.debug("%s: Closing AMQP connection.", self.lbl)
            self.conns.pop(gid).close()

    @property
    def chan(self):
        """Find or create current greenlet's AMQP channel"""
        gid = self.greenlet_id
        if gid not in self.chans:
            i = 0
            while True:
                try:
                    conn = self.conn
                except:
                    i += 1
                    log.error("Connecting to amqp has failed %d times.", i)
                    if i > 50:
                        raise
                    gevent.sleep(5)
                else:
                    break
            log.debug("%s: Opening new AMQP channel.", self.lbl)
            self.chans[gid] = conn.channel()
        return self.chans[gid]

    def close_chan(self):
        """Close current greenlet's AMQP channel"""
        gid = self.greenlet_id
        if gid not in self.chans:
            log.warning("%s: No AMQP channel open to close.", self.lbl)
        else:
            log.debug("%s: Closing AMQP channel.", self.lbl)
            self.chans.pop(gid).close()

    def start(self):
        """Start all greenlets"""
        if self.started:
            log.warning("%s: Already started, can't start again.", self.lbl)
        else:
            log.info("%s: Starting.", self.lbl)
            self.greenlets['amqp_consumer'] = gevent.spawn(self.amqp_consume)
            self.started = True

    def amqp_consume(self):
        """Block on AMQP channel messages until an exception raises"""
        log.info("%s: Starting AMQP consumer.", self.lbl)
        try:
            while True:
                self.chan.wait()
        except BaseException as exc:
            log.error("%s: AMQP consumer exception %r, stopping.",
                      self.lbl, exc)
            self.close_chan()
            self.close_conn()

    def parse_json_msg(self, msg):
        if msg.properties.get('content_type') == 'application/json':
            if isinstance(msg.body, basestring):
                try:
                    msg.body = json.loads(msg.body)
                except Exception as exc:
                    log.error("%s: Error json parsing msg body with content "
                              "type application/json %r.", self.lbl, exc)

    def amqp_handle_msg(self, msg):
        """Handle incoming AMQP message

        A message's body with routing key <self.key_prefix>.<action> will be
        forwarded to self.on_<action> with the message's body as its single
        argument.

        Each subclass should specifically use this method as a callback in
        some basic_consume call if it needs to receive messages via AMQP.

        """
        self.parse_json_msg(msg)
        body = msg.body
        routing_key = msg.delivery_info.get('routing_key', '')
        log.debug("%s: Received message with routing key '%s' and body %r.",
                  self.lbl, routing_key, body)
        try:
            parts = routing_key.split('.')
            assert len(parts) >= 2, "Routing key must contain at least 2 parts"
            action = parts[1]
            log.debug("%s: AMQP msg action is '%s'.", self.lbl, action)
            assert action, "Action must be single word."
            attr = 'on_%s' % action
            assert hasattr(self, attr), "No handler for action '%s'." % action
        except AssertionError as exc:
            log.error("%s: Error parsing AMQP msg with routing key '%s' and "
                      "body %r. %s", self.lbl, routing_key, body, exc)
        else:
            log.debug("%s: Will run handler '%s'.", self.lbl, attr)
            try:
                return getattr(self, attr)(msg)
            except Exception as exc:
                log.error("%s: Exception %r while handling AMQP msg with "
                          "routing key '%s' and body %r in %s().",
                          self.lbl, exc, routing_key, body, attr)
                log.error(traceback.format_exc())

    def amqp_send_msg(self, msg='', routing_key=''):
        """Publish AMQP message"""
        if not isinstance(msg, amqp.Message):
            if isinstance(msg, basestring):
                msg = amqp.Message(msg)
            else:
                msg = amqp.Message(json.dumps(msg),
                                   content_type='application/json')
        log.debug("%s: Sending AMQP msg with routing key '%s' and body %r.",
                  self.lbl, routing_key, msg.body)
        self.chan.basic_publish(msg, self.exchange, routing_key)

    def stop(self):
        """Close all AMQP connections and channels, stop greenlets"""
        if self.stopped:
            log.warning("%s: Already stopped, can't stop again.", self.lbl)
            return
        log.debug("%s: Closing all AMQP channels.", self.lbl)
        for gid in self.chans.keys():
            try:
                self.chans.pop(gid).close()
            except Exception as exc:
                log.warning("%s: Closing AMQP channel exception %r.",
                            self.lbl, exc)
        log.debug("%s: Closing all AMQP connections.", self.lbl)
        for gid in self.conns.keys():
            try:
                self.conns.pop(gid).close()
            except Exception as exc:
                log.warning("%s: Closing AMQP connection exception %r.",
                            self.lbl, exc)
        if self.greenlets:
            log.debug("%s: Stopping all greenlets %s.",
                      self.lbl, tuple(self.greenlets.keys()))
            gevent.killall(self.greenlets.values())
            gevent.joinall(self.greenlets.values())
            self.greenlets.clear()
        self.stopped = True

    def __del__(self):
        """Properly clean up when garbage collected by calling stop()"""
        if not self.stopped:
            log.debug("%s: Cleaning up during garbage collection, stop() not "
                      "explicitely called.", self.lbl)
            self.stop()


class HubServer(AmqpGeventBase):
    """Hub Server"""

    def __init__(self, exchange=EXCHANGE, key=REQUESTS_KEY, workers=None):
        """Initialize a Hub Server"""
        super(HubServer, self).__init__(exchange)
        self.key = key
        self.worker_cls = {'echo': EchoHubWorker}
        self.worker_cls.update(workers or {})
        self.workers = {}

    def amqp_consume(self):
        # initialize amqp connection and channel, declare exchange
        self.chan.exchange_declare(self.exchange, 'topic')
        log.info("%s: Will use exchange '%s'.", self.lbl, self.exchange)

        # declare, bind, set consumer for rpc calls
        self.chan.basic_qos(0, 1, False)  # prefetch count = 1
        self.chan.queue_declare(self.key, exclusive=True)
        self.chan.queue_bind(self.key, self.exchange, '%s.#' % self.key)
        self.chan.basic_consume(self.key, callback=self.amqp_handle_msg,
                                no_ack=True)
        log.info("%s: RPC queue '%s' with routing key '%s.#'.",
                 self.lbl, self.key, self.key)
        super(HubServer, self).amqp_consume()

    def get_resp_details(self, msg):
        """Find correlation_id and reply_to key for RPC response"""
        if not (msg.properties.get('correlation_id') and
                msg.properties.get('reply_to')):
            raise Exception("%s: No reply_to or correlation_id found in %s.",
                            self.lbl, msg.properties)
        correlation_id = msg.properties['correlation_id']
        reply_to = msg.properties['reply_to']
        log.debug("%s: Msg has correlation_id '%s' and reply_to '%s'.",
                  self.lbl, correlation_id, reply_to)
        return correlation_id, reply_to

    def send_rpc_response(self, msg, response=''):
        correlation_id, reply_to = self.get_resp_details(msg)
        msg = amqp.Message(json.dumps(response),
                           correlation_id=correlation_id,
                           content_type='application/json')
        self.amqp_send_msg(msg, reply_to)

    def on_worker(self, msg):
        routing_key = msg.delivery_info.get('routing_key', '')
        log.info("%s: Received RPC AMQP message with routing_key '%s'.",
                 self.lbl, routing_key)
        try:
            route_parts = routing_key.split('.')
            assert len(route_parts) == 3
            assert route_parts[2] in self.worker_cls
        except AssertionError:
            log.error("%s: Invalid routing key '%s'.", self.lbl, routing_key)
            return
        worker_cls = self.worker_cls[route_parts[2]]
        self.parse_json_msg(msg)
        correlation_id, reply_to = self.get_resp_details(msg)
        worker = worker_cls(self, reply_to, correlation_id, msg.body,
                            self.exchange)
        self.workers[worker.uuid] = worker
        worker.start()

    def list_workers(self):
        types_to_names = {val: key for key, val in self.worker_cls.items()}
        workers_list = [{'uuid': uuid,
                         'type': types_to_names[type(worker)],
                         'params': worker.params}
                        for uuid, worker in self.workers.items()]
        log.info("%s: Current workers: %s", self.lbl, workers_list)
        return workers_list

    def on_list_workers(self, msg):
        self.send_rpc_response(msg, self.list_workers())

    def on_stop(self, msg=''):
        log.info("%s: Received STOP message, stopping.", self.lbl)
        self.stop()
        self.send_rpc_response(msg)

    def on_stop_worker(self, msg):
        log.info("%s: Received STOP %s message, stopping.", self.lbl, msg.body)
        if msg.body in self.workers:
            self.workers[msg.body].stop()
        self.send_rpc_response(msg)

    def stop(self):
        """Stop all workers and then call super"""
        if self.stopped:
            log.warning("%s: Already stopped, can't stop again.", self.lbl)
            return
        if self.workers:
            log.debug("%s: Stopping all workers %s.",
                      self.lbl, tuple(self.workers.keys()))
            for worker_id in self.workers.keys():
                self.workers[worker_id].stop()
        super(HubServer, self).stop()


class HubWorker(AmqpGeventBase):
    """Hub Worker"""

    def __init__(self, server, reply_to, correlation_id, params,
                 exchange=EXCHANGE):
        """Initialize a worker proxying a connection"""
        super(HubWorker, self).__init__(exchange=exchange)
        self.server = server
        self.reply_to = reply_to
        self.correlation_id = correlation_id
        self.params = params

    def send_ready(self):
        """Send RPC response back to client when worker is ready"""
        log.info("%s: Sending back RPC AMQP response.", self.lbl)
        msg = amqp.Message(self.uuid, correlation_id=self.correlation_id)
        self.chan.basic_publish(msg, self.exchange, self.reply_to)

    def on_ready(self, msg=''):
        """Client is ready"""
        log.info("%s: Got 'ready' from client.", self.lbl)

    def amqp_consume(self):
        """Block on channel messages until an exception raises"""
        self.chan.queue_declare(self.uuid, exclusive=True)
        self.chan.queue_bind(self.uuid, self.exchange, '%s.#' % self.uuid)
        self.send_ready()
        self.chan.basic_consume(self.uuid, callback=self.amqp_handle_msg,
                                no_ack=True)
        log.debug("%s: Exchange '%s', queue '%s' with routing key '%s.#'.",
                  self.lbl, self.exchange, self.uuid, self.uuid)
        super(HubWorker, self).amqp_consume()

    def amqp_handle_msg(self, msg):
        """Make sure routing key is correct before calling super()"""
        routing_key = msg.delivery_info.get('routing_key', '')
        if not routing_key.startswith('%s.' % self.uuid):
            log.error("%s: Invalid routing key '%s', should start with '%s.",
                      self.lbl, routing_key, self.uuid)
        else:
            super(HubWorker, self).amqp_handle_msg(msg)

    def send_to_client(self, action, msg=''):
        """Send AMQP message to clients"""
        self.amqp_send_msg(msg, routing_key='from_%s.%s' % (self.uuid, action))

    def stop(self):
        if self.uuid in self.server.workers:
            self.server.workers.pop(self.uuid)
        super(HubWorker, self).stop()

    def on_close(self, msg=''):
        """Stop self when msg with routing suffix 'close' received"""
        log.info("%s: Received on_close.", self.lbl)
        self.stop()


class EchoHubWorker(HubWorker):
    """Echoes back messages sent with routing suffix 'echo'"""

    def on_echo(self, msg):
        """Echo back messages sent with routing suffix 'echo'"""
        print "%s: Received on_echo %r. Will echo back." % (self.lbl, msg.body)
        self.send_to_client('echo', msg.body)


class HubClient(AmqpGeventBase):
    def __init__(self, exchange=EXCHANGE, key=REQUESTS_KEY,
                 worker_type='default', worker_kwargs=None):
        super(HubClient, self).__init__(exchange=exchange)
        self.key = key
        self.worker_type = worker_type
        self.worker_kwargs = worker_kwargs or {}

    def amqp_consume(self):
        """Connect to Hub Server and set up and start AMQP consumer"""
        # define callback queue
        self.queue = self.chan.queue_declare(exclusive=True).queue
        self.chan.queue_bind(self.queue, self.exchange, self.queue)
        self.chan.basic_consume(self.queue, callback=self.amqp_handle_msg,
                                no_ack=True)
        log.debug("%s: Initialized amqp connection, channel, queue.", self.lbl)

        # send rpc request
        self.worker_id = None
        self.correlation_id = uuid.uuid4().hex
        reply_to = self.queue
        routing_key = '%s.worker.%s' % (self.key, self.worker_type)
        msg = amqp.Message(json.dumps(self.worker_kwargs),
                           correlation_id=self.correlation_id,
                           reply_to=reply_to,
                           content_type='application/json')
        self.amqp_send_msg(msg, routing_key)
        log.info("%s: sent RPC request, will wait for response.", self.lbl)

        # wait for rpc response
        try:
            while not self.worker_id:
                log.debug("%s: Waiting for RPC response.", self.lbl)
                self.chan.wait()
        except BaseException as exc:
            log.error("%s: Amqp consumer received %r while waiting for RPC "
                      "response. Stopping.", self.lbl, exc)
        log.info("%s: Finished waiting for RPC response.", self.lbl)
        super(HubClient, self).amqp_consume()

    def amqp_handle_msg(self, msg):
        self.parse_json_msg(msg)
        body = msg.body
        routing_key = msg.delivery_info.get('routing_key', '')
        if not self.worker_id:
            # waiting for RPC response
            log.debug("%s: Received message with routing key '%s' and body "
                      "%r, while waiting for RPC response.",
                      self.lbl, routing_key, body)
            if not routing_key == self.queue:
                log.warning("%s: Got msg with routing key '%s' when expecting "
                            "'%s'.", self.lbl, routing_key, self.queue)
                return
            if self.correlation_id != msg.properties.get('correlation_id'):
                log.warning(
                    "%s: Got msg with corr_id '%s' when expecting '%s'.",
                    self.lbl, msg.properties.get('correlation_id'),
                    self.correlation_id
                )
                return
            self.worker_id = msg.body
            log.info("%s: Received RPC response with body %r.",
                     self.lbl, msg.body)
            log.debug("%s: Will start listening for routing_key 'from_%s.#'.",
                      self.lbl, self.worker_id)
            self.chan.queue_bind(self.queue, self.exchange,
                                 'from_%s.#' % self.worker_id)
            log.info("%s: Notifying worker that we're ready.", self.lbl)
            self.send_to_worker('ready')
        else:
            # receiving messages
            if not routing_key.startswith('from_%s.' % self.worker_id):
                log.warning("%s: Got msg with routing key '%s' when expecting "
                            "it to start with 'from_%s.'.",
                            self.lbl, routing_key, self.worker_id)
                return
            super(HubClient, self).amqp_handle_msg(msg)

    def send_to_worker(self, action, msg=''):
        if not self.worker_id:
            raise Exception("Routing key not yet received in RPC response.")
        self.amqp_send_msg(msg, '%s.%s' % (self.worker_id, action))

    def send_close(self, msg=''):
        self.send_to_worker('close', msg)


class EchoHubClient(HubClient):
    """Sends echo request to EchoHubWorker and logs echo response"""

    def __init__(self, exchange=EXCHANGE, key=REQUESTS_KEY,
                 worker_kwargs=None):
        super(EchoHubClient, self).__init__(exchange, key, 'echo',
                                            worker_kwargs)

    def start(self):
        """Call super and also start stdin reader greenlet"""
        super(EchoHubClient, self).start()
        self.greenlets['stdin'] = gevent.spawn(self.echo_stdin)

    def echo_stdin(self):
        """Continuously read lines from stdin and send them to worker"""
        while True:
            gevent.socket.wait_read(sys.stdin.fileno())
            self.send_echo_request(sys.stdin.readline())
            gevent.sleep(0)

    def on_echo(self, msg):
        """Called on echo event"""
        print "%s: Received on_echo with msg body %r." % (self.lbl, msg.body)

    def send_echo_request(self, msg):
        """Sends an echo request the response to which will trigger on_echo"""
        log.debug("%s: Sending echo request to worker with msg %r.",
                  self.lbl, msg)
        self.send_to_worker('echo', msg)

    def stop(self):
        self.send_close()
        super(EchoHubClient, self).stop()


class Manager():
    def __init__(self, exchange=EXCHANGE, key=REQUESTS_KEY):
        self.exchange = exchange
        self.key = key
        self.response = None
        self.correlation_id = ''

        self.conn = amqp.Connection()
        self.chan = self.conn.channel()

        # define callback queue
        self.queue = self.chan.queue_declare(exclusive=True).queue
        self.chan.queue_bind(self.queue, self.exchange, self.queue)
        self.chan.basic_consume(self.queue, callback=self._recv,
                                no_ack=True)
        log.debug("Initialized amqp connection, channel, queue.")

    def _send(self, command, payload=None):

        # send rpc request
        if self.correlation_id:
            raise Exception("Can't send second request while already waiting.")
        self.response = None
        self.correlation_id = uuid.uuid4().hex
        routing_key = '%s.%s' % (self.key, command)
        msg = amqp.Message(json.dumps(payload),
                           correlation_id=self.correlation_id,
                           reply_to=self.queue,
                           content_type='application/json')
        log.debug("Sending AMQP msg with routing key '%s' and body %r.",
                  routing_key, msg.body)
        self.chan.basic_publish(msg, self.exchange, routing_key)
        log.info("Sent RPC request, will wait for response.")

        # wait for rpc response
        try:
            while self.correlation_id:
                log.debug("Waiting for RPC response.")
                self.chan.wait()
        except BaseException as exc:
            log.error("Amqp consumer received %r while waiting for RPC "
                      "response. Stopping.", exc)
        log.info("Finished waiting for RPC response.")
        response = self.response
        self.response = None
        return response

    def _recv(self, msg):
        routing_key = msg.delivery_info.get('routing_key', '')
        try:
            body = json.loads(msg.body)
        except (ValueError, TypeError):
            body = msg.body
        log.debug("Received message with routing key '%s' and body "
                  "%r, while waiting for RPC response.",
                  routing_key, body)
        if not self.correlation_id:
            log.error("Received msg with routing_key %s and body %s while "
                      "not expecting an RPC response.",
                      routing_key, body)
            return
        if not routing_key == self.queue:
            log.warning("Got msg with routing key '%s' when expecting '%s'.",
                        routing_key, self.queue)
            return
        if self.correlation_id != msg.properties.get('correlation_id'):
            log.warning(
                "Got msg with corr_id '%s' when expecting '%s'.",
                msg.properties.get('correlation_id'), self.correlation_id
            )
            return
        self.response = body
        self.correlation_id = ''

    def list_workers(self):
        return self._send('list_workers')

    def stop_worker(self, worker_uuid):
        return self._send('stop_worker', worker_uuid)

    def stop(self):
        return self._send('stop')


def run_forever():
    while True:
        gevent.sleep(1)


def prepare_argparse():
    parser = argparse.ArgumentParser(description="Start Hub Server or client")
    parser.add_argument('mode', help="Must be 'server' or 'client'.")
    parser.add_argument('-v', '--verbose', action='count',
                        help="Increase verbosity, can be specified twice.")
    return parser


def prepare_logging(verbosity=0):
    logfmt = "[%(asctime)-15s][%(levelname)s] %(module)s - %(message)s"
    if verbosity > 1:
        loglvl = logging.DEBUG
    elif verbosity == 1:
        loglvl = logging.INFO
    else:
        loglvl = logging.WARNING
    # handler = logging.StreamHandler()
    # handler.setFormatter(logging.Formatter(logfmt))
    # handler.setLevel(loglvl)
    # logging.root.addHandler(handler)
    logging.root.setLevel(loglvl)


def main(args=None, workers=None, client=EchoHubClient, worker_kwargs=None):
    gevent.monkey.patch_all()
    args = args if args else prepare_argparse().parse_args()
    prepare_logging(args.verbose or 1)

    if args.mode == 'server':
        hub = HubServer(workers=workers)
    elif args.mode == 'client':
        hub = client(worker_kwargs=worker_kwargs)
    else:
        raise Exception("Unknown mode '%s'." % args.mode)

    def sig_handler(sig=None, frame=None):
        log.warning("Hub process received SIGTERM/SIGINT")
        hub.stop()
        log.info("Sig handler completed.")

    gevent.signal(signal.SIGTERM, sig_handler)
    gevent.signal(signal.SIGINT, sig_handler)  # KeyboardInterrupt also

    hub.start()
    gevent.wait()


if __name__ == "__main__":
    main()
