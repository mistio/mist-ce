from socketio.server import SocketIOServer
from pyramid.paster import get_app
from gevent import monkey; monkey.patch_all()

if __name__ == '__main__':

    app = get_app('development.ini')
    print 'Listening on port http://127.0.0.1:6543'
    # TODO: try flashsocket transport
    SocketIOServer(('127.0.0.1', 6543), app, policy_server=False,
                   transports=['websocket', 'xhr-polling']).serve_forever()
