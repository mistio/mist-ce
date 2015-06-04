import uuid
import json
import signal
import logging

import amqp

import gevent
import gevent.monkey


# Exchange to be used by hub. Should be the same for servers and clients.
EXCHANGE = 'hub'

# Routing queue/key for hub requests from clients to servers.
# Should be the same for servers and clients.
REQUESTS_KEY = 'hub'


gevent.monkey.patch_all()

log = logging.getLogger(__name__)


class ProtocolError(Exception):
    pass


class Hub(object):

    def __init__(self, exchange=EXCHANGE, key=REQUESTS_KEY):

        self.uuid = uuid.uuid4().hex
        self.exchange = exchange
        self.key = key
        self.listener = None
        self.closed = False
        log.info("Hub Server: Initializing in exchange '%s' "
                 "with requests queue/key '%s'.", self.key)

        # initialize amqp connection and channel, declare exchange
        self.amqp_conn = amqp.Connection()
        self.amqp_chan = self.amqp_conn.channel()
        # self.amqp_chan.basic_qos(0, 1, False)  # prefetch count = 1
        self.amqp_chan.exchange_declare(self.exchange, 'direct')

        # will listen for incoming requests in req_queue
        self.amqp_chan.queue_declare(self.key)
        self.amqp_chan.queue_bind(self.key, self.exchange, self.key)
        self.amqp_chan.basic_consume(self.key, callback=self.on_msg)
        log.info("Hub Server: Will listen in queue / with key '%s'.", self.key)

        log.info("Hub Server: Initialized.")

    def on_msg(self, msg):
        body = msg.body
        routing_key = msg.delivery_info.get('routing_key', '')
        try:
            err_msg = "Invalid body payload %r." % body
            assert isinstance(body, dict), err_msg
            assert 'msg_type' in body, err_msg
            assert 'worker_id' in body, err_msg
            msg_type = body['msg_type']
            worker_id = body['worker_id']
            if msg_type == 'connect':
                # spawn new worker
                pass
            elif msg_type == 'close':
        except (ProtocolError, AssertionError) as exc:
            log.error("Hub Server: Exception while handling request: %s", exc)
        except Exception as exc:
            log.critical("Hub Server: Unknown exception "
                         "while handling request: %r", exc)

    def start_worker(self, **kwargs):
        return

    def parse_msg(self, msg):
        routing_key = msg.delivery_info.get('routing_key', '')
        log.info("Hub Server received message with routing key '%s'.",
                 routing_key)
        try:
            body = json.loads(msg.body)
        except (ValueError, TypeError):
            raise ProtocolError("Hub Server couldn't json load msg body: %r"
                                % msg.body)
        if not (isinstance(body, list) and len(body) == 3 and
                isinstance(body[0], basestring) and
                isinstance(body[1], list) and isinstance(body[2], dict)):
            raise ProtocolError("Invalid body payload: %r" % body)
        msg_type, args, kwargs = body
        log.info("Hub Server received %s(*%s, **%s) with routing key '%s'.",
                 msg_type, args, kwargs, routing_key)
        log.info(msg.delivery_info.keys())
        return msg_type, args, kwargs

    def on_request(self, msg):
        try:
            msg_type, args, kwargs = self.parse_msg(msg)
        except ProtocolError as exc:
            log.error("Error parsing request message: %s", exc)
            return

    def on_data(self, msg):
        try:
            msg_type, args, kwargs = self.parse_msg(msg)
        except ProtocolError as exc:
            log.error("Error parsing request message: %s", exc)
            return

    def run(self):
        if self.listener is not None:
            log.error("%s: Can't call run() twice.", self.lbl)
            return
        self.listener = gevent.spawn(self.listen)
        self.listener.join()

    def listen(self):
        try:
            while True:
                self.amqp_channel.wait()
        except BaseException as exc:
            log.error("Hub Server amqp consumer received %r, stopping.", exc)

    def stop(self):
        if self.closed:
            return
        log.info("Stopping Hub Server")
        if self.listener is not None:
            self.listener.kill()
        try:
            self.amqp_channel.close()
            self.amqp_connection.close()
        except Exception as exc:
            log.warning("Error stopping Hub Server: %r", exc)
        else:
            self.closed = True


class Worker(object):
    def __init__(self, hub, **kwargs):
        """Initialize a worker proxying a connection"""
        self.hub = hub
        self.uuid = uuid.uuid4().hex

    def on_msg(self, data):
        """Received message from amqp"""
        log.info("Worker %s received msg: %s", self.uuid, kwargs)

    def send(self, data):
        """Send message to amqp"""
        msg = data if isinstance(data, amqp.Message) else amqp.Message(data)
        self.hub.amqp_chan.basic_publish(msg, self.hub.exchange, self.uuid)

    def stop(self):
        """Stop this worker"""
        pass



class Client(object):
    def __init__(self, exchange=EXCHANGE, req_routing_key=KEY):
        log.info("Initializing Hub Client.")
        self.exchange = exchange
        self.req_routing_key = req_routing_key
        self.amqp_connection = amqp.Connection()
        self.amqp_channel = self.amqp_connection.channel()
        self.amqp_channel.exchange_declare(self.exchange, 'direct')

        self.callback_queue = self.amqp_channel.queue_declare().queue
        self.amqp_channel.queue_bind(self.data_queue, self.exchange,
                                     self.data_queue)
        self.amqp_channel.basic_consume(self.data_queue,
                                        callback=self.on_data)
        log.info("Hub Server bound requests queue '%s' to routing key '%s'.",
                 self.req_queue, self.req_routing_key)

    def send_message(self, msg_type, *args, **kwargs):
        msg = amqp.Message(json.dumps([msg_type, args, kwargs]))
        self.amqp_channel.basic_publish(msg, self.exchange, self.routing_key)

    def send_request(self, msg_type, *args, **kwargs):
        correlation_id = uuid.uuid4().hex

        msg = amqp.Message(json.dumps([msg_type, args, kwargs]))
        self.amqp_channel.basic_publish(msg, self.exchange,
                                        self.req_routing_key)


def main():
    logfmt = "[%(asctime)-15s][%(levelname)s] %(module)s - %(message)s"
    loglvl = logging.INFO
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(logfmt))
    handler.setLevel(loglvl)
    logging.root.addHandler(handler)
    logging.root.setLevel(loglvl)

    hub = Hub()

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
