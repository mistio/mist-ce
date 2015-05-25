import json
import logging

from sockjs.tornado import conn, session
from sockjs.tornado.transports import base


session.ConnectionInfo._exposed_headers.add('user-agent')
log = logging.getLogger(__name__)


class ChannelSession(session.BaseSession):
    def __init__(self, conn, server, base, name):
        super(ChannelSession, self).__init__(conn, server)
        self.base = base
        self.name = name

    def send_message(self, msg, stats=True, binary=False):
        # TODO: Handle stats
        self.base.send('msg,' + self.name + ',' + msg)

    def on_message(self, msg):
        msg_parts = msg.split(',', 1)
        handler = 'on_%s' % msg_parts[0]
        args = msg_parts[1] if len(msg_parts) > 1 else ()
        try:
            args = json.loads(args)
        except:
            log.warning("Couldn't json parse args: %r", args)
        if hasattr(self.conn, handler):
            log.info("Calling %s with args %s", handler, args)
            getattr(self.conn, handler)(*args)
        else:
            log.warning("Couldn't find handler '%s', will call on_message(%s)",
                        handler, msg)
            self.conn.on_message(msg)

    def close(self, code=3000, message='Go away!'):
        self.base.send('uns,' + self.name)
        self._close(code, message)

    # Non-API version of the close, without sending the close message
    def _close(self, code=3000, message='Go away!'):
        super(ChannelSession, self).close(code, message)


class DummyHandler(base.BaseTransportMixin):
    name = 'multiplex'

    def __init__(self, conn_info):
        self.conn_info = conn_info

    def get_conn_info(self):
        return self.conn_info


class MultiplexConnection(conn.SockJSConnection):
    channels = dict()

    def on_open(self, info):
        self.endpoints = dict()
        self.handler = DummyHandler(self.session.conn_info)

    def on_message(self, msg):
        parts = msg.split(',', 2)
        op, chan = parts[0], parts[1]

        if chan not in self.channels:
            return

        if chan in self.endpoints:
            session = self.endpoints[chan]

            if op == 'uns':
                del self.endpoints[chan]
                session._close()
            elif op == 'msg':
                session.on_message(parts[2])
        else:
            if op == 'sub':
                session = ChannelSession(self.channels[chan],
                                         self.session.server,
                                         self,
                                         chan)
                session.set_handler(self.handler)
                session.verify_state()

                self.endpoints[chan] = session

    def on_close(self):
        for chan in self.endpoints:
            self.endpoints[chan]._close()

    @classmethod
    def get(cls, **kwargs):
        return type('MultiplexRouter', (MultiplexConnection,),
                    dict(channels=kwargs))
