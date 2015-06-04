import uuid
import signal
import logging

import amqp

import gevent
import gevent.monkey


# Exchange to be used by hub. Should be the same for server and clients.
EXCHANGE = 'hub'

# Routing queue/key for hub requests from clients to servers.
# Should be the same for server and clients.
REQUESTS_KEY = 'hub'


gevent.monkey.patch_all()

log = logging.getLogger(__name__)


class ProtocolError(Exception):
    pass


class Server(object):
    """Hub Server"""

    def __init__(self, exchange=EXCHANGE, key=REQUESTS_KEY, workers=None):
        """Initialize a Hub Server"""

        self.exchange = exchange
        self.key = key
        self.worker_cls = {'default': Worker}
        self.worker_cls.update(workers or {})
        self.workers = {}
        self.listener = None
        self.stopped = False
        self.lbl = "Hub Server"
        log.info("%s: Initializing.", self.lbl)

        # initialize amqp connection and channel, declare exchange
        self.conn = amqp.Connection()
        self.chan = self.conn.channel()
        self.chan.exchange_declare(self.exchange, 'topic')
        log.info("%s: Will use exchange '%s'.", self.lbl, self.exchange)

        # declare, bind, set consumer for rpc calls
        self.chan.basic_qos(0, 1, False)  # prefetch count = 1
        self.chan.queue_declare(self.key, exclusive=True)
        self.chan.queue_bind(self.key, self.exchange, '%s.#' % self.key)
        self.chan.basic_consume(self.key, callback=self.on_rpc)
        log.info("%s: RPC queue '%s' with routing key '%s.#'.",
                 self.lbl, self.key, self.key)

        log.info("%s: Initialized.", self.lbl)

    def on_rpc(self, msg):
        """Handle amqp rpc messages"""
        routing_key = msg.delivery_info.get('routing_key', '')
        log.info("%s: Received rpc message with routing_key '%s'.",
                 self.lbl, routing_key)
        try:
            route_parts = routing_key.split('.')
            assert len(route_parts) == 2
            assert route_parts[0] == self.key
            assert route_parts[1] in self.worker_cls
        except AssertionError:
            log.error("%s: Invalid routing key '%s'.", self.lbl, routing_key)
            return
        worker_cls = self.worker_cls[route_parts[1]]
        worker = worker_cls(msg.body, self.conn, self.exchange)
        self.workers[worker.uuid] = worker
        worker.start()

    def run(self):
        """Run the Hub Server"""
        if self.listener is not None:
            log.warning("%s: Can't call run() twice.", self.lbl)
            return
        log.info("%s: Starting.", self.lbl)
        self.listener = gevent.spawn(self.listen)
        self.listener.join()

    def listen(self):
        """Block on channel messages until an exception raises"""
        log.info("%s: Starting amqp consumer.", self.lbl)
        try:
            while True:
                self.chan.wait()
        except BaseException as exc:
            log.error("%s: Amqp consumer received %r, stopping.",
                      self.lbl, exc)

    def stop(self):
        """Stop Hub Server, kill workers, close connections"""
        if self.stopped:
            return
        log.info("%s: Stopping.", self.lbl)
        if self.listener is not None:
            self.listener.kill()
        try:
            self.chan.close()
            self.conn.close()
        except Exception as exc:
            log.warning("%s: Error stopping %r", self.lbl, exc)
        self.closed = True


class Worker(object):
    """Hub Worker"""

    def __init__(self, params, conn, exchange=EXCHANGE):
        """Initialize a worker proxying a connection"""
        self.uuid = uuid.uuid4().hex
        self.lbl = "Hub Worker %s" % self.uuid
        log.info("%s: Initializing.", self.lbl)

        self.exchange = exchange
        self.conn = conn
        self.channels = {}
        self.greenlets = {}
        self.stopped = False

        log.info("%s: Initialized.", self.lbl)

    def get_chan(self):
        gid = id(gevent.getcurrent())
        log.debug("%s: Get channel with greenlet id '%s'.", self.lbl, gid)
        if gid not in self.channels:
            self.channels[gid] = self.conn.channel()
        return self.channels[gid]

    def start(self):
        """Start all greenlets for this worker"""
        if self.greenlets:
            log.warning("%s: Can't call start() twice.", self.lbl)
            return
        log.info("%s: Starting.", self.lbl)
        self.greenlets['amqp_listener'] = gevent.spawn(self.listen_amqp)

    def listen_amqp(self):
        """Block on channel messages until an exception raises"""
        log.info("%s: Starting amqp subscriber.""", self.lbl)
        # must start new channel because this will run in a greenlet
        # chan = self.get_chan()
        chan = self.conn.channel()
        chan.queue_declare(self.uuid, exclusive=True)
        chan.queue_bind(self.uuid, self.exchange, '%s.#' % self.uuid)
        chan.basic_consume(self.uuid, callback=self.handle_amqp_msg)
        log.info("%s: Exchange '%s', queue '%s' with routing key '%s.#'.",
                 self.lbl, self.exchange, self.uuid, self.uuid)
        try:
            while True:
                chan.wait()
        except BaseException as exc:
            log.error("%s: Amqp consumer received %r, stopping.",
                      self.lbl, exc)
            chan.close()

    def handle_amqp_msg(self, msg):
        """Handle an incoming message from amqp

        A message's body with routing key <uuid>.action will be forwarded
        to self.on_<action> with the message's body as its single argument.

        """
        body = msg.body
        routing_key = msg.delivery_info.get('routing_key', '')
        log.info("%s: Received message with routing key '%s' and body %r.",
                 self.lbl, routing_key, body)
        try:
            route_parts = routing_key.split('.')
            assert len(route_parts) == 2, "Routing key should have 2 parts."
            assert route_parts[0] == self.uuid, "Worker uuid mismatch."
            action = route_parts[1]
            attr = 'on_%s' % action
            assert hasattr(self, attr), "Invalid action %s." % action
        except AssertionError as exc:
            log.error("%s: Error parsing amqp msg with routing key '%s' and "
                      "body %r. %s", self.lbl, routing_key, body, exc)
            return
        try:
            getattr(self, attr)(msg.body)
        except Exception as exc:
            log.error("%s: Error parsing amqp msg with routing key '%s' and "
                      "body %r. %s", self.lbl, routing_key, body, exc)

    def send_amqp_msg(self, data):
        """Send message to amqp"""
        log.info("%s: Sending message to amqp with body %r.", self.lbl, data)
        chan = self.get_chan()
        msg = data if isinstance(data, amqp.Message) else amqp.Message(data)
        chan.basic_publish(msg, self.exchange, self.uuid)

    def on_echo(self, data):
        """Echo message handler"""
        log.info("%s: Received on_echo %r. Will echo back.", self.lbl, data)
        self.send_amqp_msg(data)

    def stop(self):
        """Stop this worker"""
        if self.stopped:
            return
        log.info("%s: Stopping.", self.lbl)
        gevent.killall(self.greenlets.values())
        try:
            for chan in self.channels.values():
                chan.close()
        except Exception as exc:
            log.warning("%s: Error stopping %r", self.lbl, exc)
        self.closed = True


class Client(object):
    def __init__(self, exchange=EXCHANGE, key=REQUESTS_KEY):
        self.lbl = "Hub Client"
        log.info("%s: Initializing.", self.lbl)
        self.exchange = exchange
        self.key = key

        self.conn = amqp.Connection()
        self.chan = self.conn.channel()
        self.queue = self.chan.queue_declare(exclusive=True).queue
        self.chan.queue_bind(self.queue, self.exchange, self.queue)
        self.chan.basic_consume(self.queue, callback=self.on_msg)
        self.send_request()

    def send_request(self, worker_type='default', **kwargs):
        correlation_id = uuid.uuid4().hex
        reply_to = self.queue
        routing_key = '%s.%s' % (self.key, worker_type)
        msg = amqp.Message(correlation_id=correlation_id, reply_to=reply_to)
        self.chan.basic_publish(msg, self.exchange, routing_key)

    def on_msg(self, msg):
        body = msg.body
        routing_key = msg.delivery_info.get('routing_key', '')
        log.info("%s: Received message with routing key '%s' and body %r.",
                 self.lbl, routing_key, body)


def main():
    logfmt = "[%(asctime)-15s][%(levelname)s] %(module)s - %(message)s"
    loglvl = logging.DEBUG
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(logfmt))
    handler.setLevel(loglvl)
    logging.root.addHandler(handler)
    logging.root.setLevel(loglvl)

    hub = Server()

    def sig_handler(sig=None, frame=None):
        log.warning("Hubo process received SIGTERM/SIGINT")
        hub.stop()

    # gevent.signal(signal.SIGTERM, sig_handler)
    # gevent.signal(signal.SIGINT, sig_handler)  # also catch KeyboardInterrupt

    try:
        hub.run()
    except BaseException as exc:
        log.error("Hub run interrupted by exception: %r", exc)
        hub.stop()


if __name__ == "__main__":
    main()
