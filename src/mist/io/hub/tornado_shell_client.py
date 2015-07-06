import logging

import tornado.ioloop

from mist.io.hub.tornado_client import HubClient


log = logging.getLogger(__name__)


class ShellHubClient(HubClient):
    def __init__(self, exchange='hub', key='hub', worker_kwargs=None):
        super(ShellHubClient, self).__init__(exchange, key, 'shell',
                                             worker_kwargs)

    def send_data(self, msg):
        self.send_to_worker('data', msg)

    def on_data(self, msg):
        print msg

    def resize(self, columns, rows):
        self.send_to_worker('rezize', {'columns': columns, 'rows': rows})

    def stop(self):
        self.send_to_worker('close')
        super(ShellHubClient, self).stop()


if __name__ == "__main__":
    worker_kwargs = {
        'backend_id': 'tUEMvnye1BqMeqNEoLDrFy2EiT8',
        'machine_id': 'bc41da46814e0c7b69167e2862d400c24419ec3dcdc48a72c4ede789c6ed981e',
        'host': '69.50.244.209',
        'columns': 80,
        'rows': 40,
    }
    client = ShellHubClient(worker_kwargs=worker_kwargs)
    client.start()
    ioloop = tornado.ioloop.IOLoop.current()
    try:
        ioloop.start()
    except BaseException as exc:
        log.error("Exception while running ioloop: %r", exc)
