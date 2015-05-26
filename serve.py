import sys

import tornado.web
import tornado.ioloop
from mist.io.sock import make_router


if __name__ == '__main__':
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 8081
    app = tornado.web.Application(make_router().urls)
    app.listen(port)
    tornado.ioloop.IOLoop.instance().start()
