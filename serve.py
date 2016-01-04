import sys
import time
import signal
import logging

import tornado.web
import tornado.ioloop

import mist.io.sock


try:
    from mist.core.sock import make_router
except ImportError:
    from mist.io.sock import make_router


log = logging.getLogger(__name__)


def sig_handler(sig, frame):
    log.warning("SockJS-Tornado process received SIGTERM/SIGINT")
    if heartbeat_pc.is_running():
        heartbeat_pc.stop()
    for conn in list(mist.io.sock.CONNECTIONS):
        conn.on_close()
    tornado.ioloop.IOLoop.instance().stop()


def usr1_handler(sig, frame):
    log.warning("SockJS-Tornado process received SIGUSR1")
    for conn in list(mist.io.sock.CONNECTIONS):
        log.info(conn)


def heartbeat():
    now = time.time()
    connections = list(mist.io.sock.CONNECTIONS)
    for conn in connections:
        if conn.session.base.last_rcv < now - 60:
            log.warning("Closing stale conn %s.", conn)
            conn.on_close(stale=True)
    log.info("%d open connections in sockjs %d" % (len(connections), port))


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        ret = {}
        for conn in mist.io.sock.CONNECTIONS:
            conn_dict = conn.get_dict()
            name = conn_dict.pop('name')
            if name not in ret:
                ret[name] = []
            ret[name].append(conn_dict)
        self.write(ret)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 8081

    signal.signal(signal.SIGTERM, sig_handler)
    signal.signal(signal.SIGINT, sig_handler)  # also catch KeyboardInterrupt
    signal.signal(signal.SIGUSR1, usr1_handler)

    heartbeat_pc = tornado.ioloop.PeriodicCallback(heartbeat, 25 * 1000)
    heartbeat_pc.start()

    app = tornado.web.Application([
        (r"/", MainHandler),
    ] + make_router().urls)
    app.listen(port)
    tornado.ioloop.IOLoop.instance().start()
