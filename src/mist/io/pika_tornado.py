"""Pika client for user within tornado

originally taken from:
https://stackoverflow.com/questions/16376865/broadcasting-message-to-all-clients-using-pika-sockjs-tornado

"""

import logging

import pika
from pika.adapters.tornado_connection import TornadoConnection


log = logging.getLogger(__name__)


class PikaClient(object):

    def __init__(self, email, callback):
        self.exchange = 'mist-user_%s' % email.replace('@', ':')
        self.callback = callback
        self.connected = False
        self.connecting = False
        self.connection = None
        self.channel = None

    def connect(self):
        log.info('CONNECTING')
        if self.connecting:
            log.info('%s: Already connecting to RabbitMQ',
                     self.__class__.__name__)
            return

        log.info('%s: Connecting to RabbitMQ on localhost:5672',
                 self.__class__.__name__)
        self.connecting = True
        param = pika.ConnectionParameters(host='127.0.0.1', port=5672)
        self.connection = TornadoConnection(param,
                                            on_open_callback=self.on_connected)
        self.connection.add_on_close_callback(self.on_closed)

    def on_connected(self, connection):
        log.info('%s: Connected to RabbitMQ on localhost:5672',
                 self.__class__.__name__)
        self.connected = True
        self.connection = connection
        self.connection.channel(self.on_channel_open)

    def on_channel_open(self, channel):
        log.info('%s: Channel Open, Declaring Exchange %s',
                 self.__class__.__name__, self.exchange)
        self.channel = channel
        self.channel.exchange_declare(
            exchange=self.exchange,
            type='fanout',
            callback=self.on_exchange_declared
        )

    def on_exchange_declared(self, frame):
        log.info('%s: Exchange Declared, Declaring Queue',
                 self.__class__.__name__)
        self.channel.queue_declare(exclusive=True,
                                   callback=self.on_queue_declared)

    def on_queue_declared(self, frame):
        log.info('%s: Queue Declared, Binding Queue %s',
                 self.__class__.__name__, frame.method.queue)
        self.queue_name = frame.method.queue
        self.channel.queue_bind(
            exchange=self.exchange,
            queue=frame.method.queue,
            callback=self.on_queue_bound
        )

    def on_queue_bound(self, frame):
        log.info('Consuming on queue %s', self.queue_name)
        self.channel.basic_consume(consumer_callback=self.callback,
                                   queue=self.queue_name)

    def on_closed(self, connection):
        log.info('%s: Connection Closed', self.__class__.__name__)
        self.connected = False
        self.connection = None
        self.connecting = False
        self.channel = None
        self.connection = self.connect()
