import sys
import logging


import gevent
import gevent.socket


import mist.io.exceptions
import mist.io.model
import mist.io.shell
import mist.io.hub.main


log = logging.getLogger(__name__)


class ShellHubWorker(mist.io.hub.main.HubWorker):
    def __init__(self, *args, **kwargs):
        super(ShellHubWorker, self).__init__(*args, **kwargs)
        self.shell = None
        self.channel = None
        for key in ('email', 'cloud_id', 'machine_id', 'host',
                    'columns', 'rows'):
            if not self.params.get(key):
                log.error("%s: Param '%s' missing from worker kwargs.",
                          self.lbl, key)
                self.stop()
        self.provider = ''
        self.user = mist.io.model.User()

    def on_ready(self, msg=''):
        super(ShellHubWorker, self).on_ready(msg)
        self.connect()

    def connect(self):
        """Connect to shell"""
        if self.shell is not None:
            log.error("%s: Can't call on_connect twice.", self.lbl)
            return
        data = self.params
        self.provider = data.get('provider', '')
        self.shell = mist.io.shell.Shell(data['host'])
        try:
            key_id, ssh_user = self.shell.autoconfigure(
                self.user, data['cloud_id'], data['machine_id']
            )
        except Exception as exc:
            if self.provider == 'docker':
                self.shell = mist.io.shell.Shell(data['host'],
                                                 provider='docker')
                key_id, ssh_user = self.shell.autoconfigure(
                    self.user, data['cloud_id'], data['machine_id']
                )
            else:
                log.warning("%s: Couldn't connect with SSH, error %r.",
                            self.lbl, exc)
                if isinstance(exc,
                              mist.io.exceptions.MachineUnauthorizedError):
                    err = 'Permission denied (publickey).'
                else:
                    err = str(exc)
                self.emit_shell_data(err)
                self.params['error'] = err
                self.stop()
                return
        self.params.update(key_id=key_id, ssh_user=ssh_user)
        self.channel = self.shell.invoke_shell('xterm',
                                               data['columns'], data['rows'])
        self.greenlets['read_stdout'] = gevent.spawn(self.get_ssh_data)

    def on_data(self, msg):
        """Received data that must be forwarded to shell's stdin"""
        self.channel.send(msg.body.encode('utf-8', 'ignore'))

    def on_resize(self, msg):
        """Received resize shell window command"""
        if isinstance(msg.body, dict):
            if 'columns' in msg.body and 'rows' in msg.body:
                columns, rows = msg.body['columns'], msg.body['rows']
                log.info("%s: Resizing shell to (%s, %s).",
                         self.lbl, columns, rows)
                try:
                    self.channel.resize_pty(columns, rows)
                    return columns, rows
                except Exception as exc:
                    log.warning("%s: Error resizing shell to (%s, %s): %r.",
                                self.lbl, columns, rows, exc)

    def emit_shell_data(self, data):
        self.send_to_client('data', data)

    def get_ssh_data(self):
        try:
            if self.provider == 'docker':
                try:
                    self.channel.send('\n')
                except:
                    pass
            while True:
                gevent.socket.wait_read(self.channel.fileno())
                try:
                    data = self.channel.recv(1024).decode('utf-8', 'ignore')
                except TypeError:
                    data = self.channel.recv().decode('utf-8', 'ignore')

                if not len(data):
                    return
                self.emit_shell_data(data)
        finally:
            self.channel.close()

    def stop(self):
        if self.channel is not None:
            self.channel.close()
        super(ShellHubWorker, self).stop()


class ShellHubClient(mist.io.hub.main.HubClient):
    def __init__(self, exchange=mist.io.hub.main.EXCHANGE,
                 key=mist.io.hub.main.REQUESTS_KEY, worker_kwargs=None):
        super(ShellHubClient, self).__init__(exchange, key, 'shell',
                                             worker_kwargs)

    def start(self):
        """Call super and also start stdin reader greenlet"""
        super(ShellHubClient, self).start()
        gevent.sleep(1)
        self.greenlets['stdin'] = gevent.spawn(self.send_stdin)

    def send_stdin(self):
        """Continuously read lines from stdin and send them to worker"""
        while True:
            gevent.socket.wait_read(sys.stdin.fileno())
            self.send_data(sys.stdin.readline())
            gevent.sleep(0)

    def send_data(self, data):
        self.send_to_worker('data', data)

    def resize(self, columns, rows):
        self.send_to_worker('rezize', {'columns': columns, 'rows': rows})

    def on_data(self, msg):
        print msg.body

    def stop(self):
        self.send_close()
        super(ShellHubClient, self).stop()


if __name__ == "__main__":
    worker_kwargs = {
        'cloud_id': 'tUEMvnye1BqMeqNEoLDrFy2EiT8',
        'machine_id': 'bc41da46814e0c7b69167e2862d400c24419ec3dcdc48a72c4ede789c6ed981e',
        'host': '69.50.244.209',
        'columns': 80,
        'rows': 40,
    }
    mist.io.hub.main.main(workers={'shell': ShellHubWorker},
                          client=ShellHubClient, worker_kwargs=worker_kwargs)
