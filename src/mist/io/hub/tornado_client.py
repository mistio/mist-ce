import uuid
import json
import logging

import pika
import tornado.ioloop

import mist.io.amqp_tornado
import mist.io.hub.main


log = logging.getLogger(__name__)


class _HubTornadoConsumer(mist.io.amqp_tornado.Consumer):
    """AMQP consumer used by Tornado-compatible hub client"""

    def __init__(self, uuid, exchange, worker_type, key, worker_kwargs,
                 actions_callback, ready_callback, lbl=''):

        self.uuid = uuid
        self.key = key
        self.worker_type = worker_type
        self.worker_id = None
        self.worker_kwargs = worker_kwargs or {}
        self.actions_callback = actions_callback
        self.ready_callback = ready_callback
        self.lbl = lbl or ('%s (%s)' % (self.__class__.__name__, self.uuid))
        super(_HubTornadoConsumer, self).__init__(
            amqp_url='amqp://localhost',
            exchange=exchange,
            queue=self.uuid,
            exchange_type='topic',
            routing_key=self.uuid,
            exchange_kwargs={'auto_delete': True},
            queue_kwargs={'auto_delete': True, 'exclusive': True},
        )
        log.info("%s: Default ready callback.", self.lbl)

    def start_consuming(self):
        """Exchange, channel, consumer ready to start listening"""

        # send rpc request
        self.worker_id = None
        self.correlation_id = uuid.uuid4().hex
        self._channel.basic_publish(
            exchange=self.exchange,
            routing_key='%s.worker.%s' % (self.key, self.worker_type),
            properties=pika.BasicProperties(
                reply_to=self.queue,
                correlation_id=self.correlation_id,
                content_type='application/json',
            ),
            body=json.dumps(self.worker_kwargs),
        )
        log.info("%s: sent RPC request, will wait for response.", self.lbl)

        super(_HubTornadoConsumer, self).start_consuming()

    def on_message(self, unused_channel, basic_deliver, properties, body):
        super(_HubTornadoConsumer, self).on_message(
            unused_channel, basic_deliver, properties, body
        )
        if properties.content_type == 'application/json':
            try:
                body = json.loads(body)
            except (ValueError, TypeError) as exc:
                log.error("%s: Error %s loading json msg %r.",
                          self.lbl, exc, body)
        routing_key = basic_deliver.routing_key

        # waiting for RPC response
        if not self.worker_id:
            log.debug("%s: Received message with routing key '%s' and body "
                      "%r, while waiting for RPC response.",
                      self.lbl, routing_key, body)
            if not routing_key == self.queue:
                log.warning("%s: Got msg with routing key '%s' when expecting "
                            "'%s'.", self.lbl, routing_key, self.queue)
                return
            if self.correlation_id != properties.correlation_id:
                log.warning(
                    "%s: Got msg with corr_id '%s' when expecting '%s'.",
                    self.lbl, properties.correlation_id,
                    self.correlation_id
                )
                return
            self.worker_id = body
            log.info("%s: Received RPC response with body %r.", self.lbl, body)
            log.debug("%s: Will start listening for routing_key 'from_%s.#'.",
                      self.lbl, self.worker_id)
            self._channel.queue_bind(
                self.ready_callback,
                self.queue,
                self.exchange,
                'from_%s.#' % self.worker_id,
            )
            return

        # receiving messages
        if not routing_key.startswith('from_%s.' % self.worker_id):
            log.warning("%s: Got msg with routing key '%s' when expecting "
                        "it to start with 'from_%s.'.",
                        self.lbl, routing_key, self.worker_id)
        action = routing_key.split('.')[-1]
        log.debug("%s: AMQP msg action is '%s'.", self.lbl, action)
        if not action:
            log.error("%s: Error parsing AMQP msg with routing key '%s' and "
                      "body %r. %s", self.lbl, routing_key, body, exc)
        else:
            try:
                self.actions_callback(action, body)
            except Exception as exc:
                log.error("%s: Exception %r while handling AMQP msg with "
                          "routing key '%s' and body %r.",
                          self.lbl, exc, routing_key, body)


class HubClient(object):
    def __init__(self, exchange='hub', key='hub', worker_type='echo',
                 worker_kwargs=None):
        self.uuid = uuid.uuid4().hex
        self.lbl = ' '.join((self.__class__.__name__, self.uuid))
        log.debug("%s: Initializing.", self.lbl)

        self.exchange = exchange
        self.key = key
        self.worker_type = worker_type
        self.worker_kwargs = worker_kwargs or {}

        self.consumer = _HubTornadoConsumer(
            uuid=self.uuid, exchange=self.exchange, key=self.key,
            worker_type=self.worker_type, worker_kwargs=self.worker_kwargs,
            lbl=self.lbl, actions_callback=self.handle_msg,
            ready_callback=self.ready_callback,
        )

        self.started = False
        self.stopped = False

    def start(self):
        self.consumer.run()

    def handle_msg(self, action, body):
        attr = 'on_%s' % action
        if not hasattr(self, attr):
            log.error("%s: No handler found for action '%s' and body %r.",
                      self.lbl, action, body)
        else:
            log.debug("%s: Will run handler '%s'.", self.lbl, attr)
            try:
                getattr(self, attr)(body)
            except Exception as exc:
                log.error("%s: Exception %r while handling AMQP msg with "
                          "body %r in %s().",
                          self.lbl, exc, body, attr)

    def send_to_worker(self, action, msg=''):
        if not self.consumer.worker_id:
            raise Exception("Routing key not yet received in RPC response.")
        routing_key = '%s.%s' % (self.consumer.worker_id, action)
        if isinstance(msg, basestring):
            self.consumer._channel.basic_publish(exchange=self.exchange,
                                                 routing_key=routing_key,
                                                 body=msg)
        else:
            self.consumer._channel.basic_publish(
                exchange=self.exchange,
                routing_key=routing_key,
                properties=pika.BasicProperties(
                    content_type='application/json',
                ),
                body=json.dumps(msg),
            )

    def ready_callback(self, *args, **kwargs):
        log.info("%s: Ready callback triggered. Notifying worker.", self.lbl)
        self.send_to_worker('ready')

    def stop(self):
        self.consumer.stop()


class EchoHubClient(HubClient):
    def __init__(self, *args, **kwargs):
        super(EchoHubClient, self).__init__(*args, **kwargs)
        self.timer = tornado.ioloop.PeriodicCallback(self.ping, 1000)

    def start(self):
        super(EchoHubClient, self).start()
        self.timer.start()

    def ping(self):
        print 'Sending echo request: ping'
        self.send_to_worker('echo', 'ping')

    def on_echo(self, msg):
        print 'Received message:', msg


def prepare_logging(verbosity=2):
    logfmt = "[%(asctime)-15s][%(levelname)s] %(module)s - %(message)s"
    if verbosity > 1:
        loglvl = logging.DEBUG
    elif verbosity == 1:
        loglvl = logging.INFO
    else:
        loglvl = logging.WARNING
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(logfmt))
    handler.setLevel(loglvl)
    logging.root.addHandler(handler)
    logging.root.setLevel(loglvl)


if __name__ == "__main__":
    client = EchoHubClient()
    client.start()
    ioloop = tornado.ioloop.IOLoop.current()
    ioloop.start()
