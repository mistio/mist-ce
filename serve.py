from socketio.server import SocketIOServer
from pyramid.paster import get_app
from gevent import monkey; monkey.patch_all()

if __name__ == '__main__':

    app = get_app('development.ini')
    print 'Listening on port http://127.0.0.1:8080 and on port 843 (flash policy server)'
    SocketIOServer(('127.0.0.1', 8080), app, policy_server=False,
                   transports=['websocket']).serve_forever()
