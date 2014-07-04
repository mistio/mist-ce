from socketio.server import SocketIOServer
from pyramid.paster import get_app
from gevent import monkey; monkey.patch_all()

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = 8081
    app = get_app('uwsgi.ini')
    print 'Listening on port http://127.0.0.1:%s' % port
    # TODO: try flashsocket transport
    SocketIOServer(('127.0.0.1', port), app, policy_server=False,
                   transports=['websocket', 'xhr-polling']).serve_forever()
