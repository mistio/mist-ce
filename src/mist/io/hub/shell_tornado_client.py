import logging

import mist.io.amqp_tornado
import mist.io.hub


log = logging.getLogger(__name__)


class HubClient(object):
    def __init__(self, exchange=mist.io.hub.main.EXCHANGE,
                 key=mist.io.hub.main.REQUESTS_KEY, worker_type='default',
                 **worker_kwargs):
        self.uuid = uuid.uuid4().hex
        self.lbl = ' '.join((self.__class__.__name__, self.uuid))
        log.debug("%s: Initializing.", self.lbl)

        self.exchange = exchange
        self.key = key
        self.worker_type = worker_type
        self.worker_kwargs = worker_kwargs

        self.started = False
        self.stopped = False

    def start(self):
        pass


class ShellHubClientConsumer(mist.io.amqp_tornado.Consumer):
    """AMQP consumer for Tornado compatible SSH hub client"""
    def __init__(self):
        pass
        self.uuid = uuid.uuid4().hex
        super(ShellHubClientConsumer, self).__init__(
            amqp_url=amqp_url,
            exchange=mist.io.hub.main.EXCHANGE,
            queue=self.uuid,
            exchange_type='topic',
            routing_key=self.uuid,
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
