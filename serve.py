import sys
import signal
import logging

import tornado.web
import tornado.ioloop

import mist.io.sock


log = logging.getLogger(__name__)


def sig_handler(sig, frame):
    log.warning("SockJS-Tornado process received SIGTERM/SIGINT")
    for conn in list(mist.io.sock.CONNECTIONS):
        conn.on_close()
    tornado.ioloop.IOLoop.instance().stop()


if __name__ == '__main__':
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 8081

    signal.signal(signal.SIGTERM, sig_handler)
    signal.signal(signal.SIGINT, sig_handler)  # also catch KeyboardInterrupt

    app = tornado.web.Application(mist.io.sock.make_router().urls)
    app.listen(port)
    tornado.ioloop.IOLoop.instance().start()
