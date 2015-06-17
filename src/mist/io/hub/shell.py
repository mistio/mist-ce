import logging


import gevent
import gevent.socket


import mist.io.exceptions
import mist.io.model
import mist.io.shell
import mist.io.hub.main


log = logging.getLogger(__name__)


class ShellHubWorker(mist.io.hub.main.HubWorker):
    def __init__(self, params, exchange=mist.io.hub.main.EXCHANGE):
        super(ShellHubWorker, self).__init__(params, exchange=exchange)
        self.shell = None
        self.channel = None
        self.ssh_info = {}
        self.provider = ''
        self.user = mist.io.model.User()

    def on_connect(self, msg):
        """Connect to shell"""
        data = msg.body
        for key in ('backend_id', 'machine_id', 'host', 'columns', 'rows'):
            if key not in data:
                log.error("%s: Missing kwarg '%s' from on_connect.",
                          self.lbl, key)
        if self.shell is not None:
            log.error("%s: Can't call on_connect twice.", self.lbl)
            return
        self.ssh_info = {
            'backend_id': data['backend_id'],
            'machine_id': data['machine_id'],
            'host': data['host'],
            'columns': data['columns'],
            'rows': data['rows'],
        }
        self.provider = data.get('provider', '')
        self.shell = mist.io.shell.Shell(data['host'])
        try:
            key_id, ssh_user = self.shell.autoconfigure(
                self.user, data['backend_id'], data['machine_id']
            )
        except Exception as exc:
            if self.provider == 'docker':
                self.shell = mist.io.shell.Shell(data['host'],
                                                 provider='docker')
                key_id, ssh_user = self.shell.autoconfigure(
                    self.user, data['backend_id'], data['machine_id']
                )
            else:
                log.warning("%s: Couldn't connect with SSH, error %r.",
                            self.lbl, exc)
                if isinstance(exc,
                              mist.io.exceptions.MachineUnauthorizedError):
                    err = 'Permission denied (publickey).'
                else:
                    err = str(exc)
                self.ssh_info['error'] = err
                self.emit_shell_data(err)
                self.stop()
                return
        self.ssh_info.update(key_id=key_id, ssh_user=ssh_user)
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

    def on_close(self, msg):
        """Close shell and clean up"""
        log.info("%s: Received on_close.", self.lbl)
        self.stop()

    def stop(self):
        if self.channel is not None:
            self.channel.close()
        super(ShellHubWorker, self).stop()


class ShellHubClient(mist.io.hub.main.HubClient):
    def __init__(self, exchange=mist.io.hub.main.EXCHANGE,
                 key=mist.io.hub.main.REQUESTS_KEY, **worker_kwargs):
        super(ShellHubClient, self).__init__(exchange, key, 'shell',
                                             **worker_kwargs)

    def start(self):
        """Call super and also start stdin reader greenlet"""
        super(ShellHubClient, self).start()

    def connect(self, **kwargs):
        log.info(kwargs)
        log.info(type(kwargs))
        self.send_to_worker('connect', kwargs)

    def send_data(self, data):
        self.send_to_worker('data', data)

    def resize(self, columns, rows):
        self.send_to_worker('rezize', {'columns': columns, 'rows': rows})

    def on_data(self, msg):
        log.info("%s: Received data %r.", self.lbl, msg.body)

    def stop(self):
        self.send_to_worker('close')


if __name__ == "__main__":
    mist.io.hub.main.main(workers={'shell': ShellHubWorker},
                          client=ShellHubClient)
