"""mist.io.shell

This module contains everything that is need to communicate with machines via
SSH.

"""

from time import time, sleep
from StringIO import StringIO

import paramiko
import websocket
import socket
import uuid
import thread
import ssl
import tempfile

from mist.io.exceptions import BackendNotFoundError, KeypairNotFoundError
from mist.io.exceptions import MachineUnauthorizedError
from mist.io.exceptions import RequiredParameterMissingError
from mist.io.exceptions import ServiceUnavailableError

from mist.io.helpers import trigger_session_update

try:
    from mist.core import config
except ImportError:
    from mist.io import config

import logging
logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)


class ParamikoShell(object):
    """sHell

    This class takes care of all SSH related issues. It initiates a connection
    to a given host and can send commands whose output can be treated in
    different ways. It can search a user's data and autoconfigure itself for
    a given machine by finding the right private key and username. Under the
    hood it uses paramiko.

    Use it like:
    shell = Shell('localhost', username='root', password='123')
    print shell.command('uptime')

    Or:
    shell = Shell('localhost')
    shell.autoconfigure(user, backend_id, machine_id)
    for line in shell.command_stream('ps -fe'):
    print line

    """

    def __init__(self, host, username=None, key=None, password=None, port=22):
        """Initialize a Shell instance

        Initializes a Shell instance for host. If username is provided, then
        it tries to actually initiate the connection, by calling connect().
        Check out the docstring of connect().

        """

        if not host:
            raise RequiredParameterMissingError('host not given')
        self.host = host
        self.sudo = False

        self.ssh = paramiko.SSHClient()
        self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        # if username provided, try to connect
        if username:
            self.connect(username, key, password, port)

    def connect(self, username, key=None, password=None, port=22):
        """Initialize an SSH connection.

        Tries to connect and configure self. If only password is provided, it
        will be used for authentication. If key is provided, it is treated as
        and OpenSSH private RSA key and used for authentication. If both key
        and password are provided, password is used as a passphrase to unlock
        the private key.

        Raises MachineUnauthorizedError if it fails to connect.

        """

        if not key and not password:
            raise RequiredParameterMissingError("neither key nor password "
                                                "provided.")
        if key:
            rsa_key = paramiko.RSAKey.from_private_key(StringIO(key))
        else:
            rsa_key = None

        attempts = 3
        while attempts:
            attempts -= 1
            try:
                self.ssh.connect(
                    self.host,
                    port=port,
                    username=username,
                    password=password,
                    pkey=rsa_key,
                    allow_agent=False,
                    look_for_keys=False,
                    timeout=10
                )
                break
            except paramiko.AuthenticationException as exc:
                log.error("ssh exception %r", exc)
                raise MachineUnauthorizedError("Couldn't connect to %s@%s:%s. %s"
                                               % (username, self.host, port, exc))
            except socket.error as exc:
                log.error("Got ssh error: %r", exc)
                if not attempts:
                    raise ServiceUnavailableError("SSH timed-out repeatedly.")
            except Exception as exc:
                log.error("ssh exception %r", exc)
                # don't fail if SSHException or other paramiko exception,
                # eg related to network, but keep until all attempts are made
                if not attempts:
                    raise ServiceUnavailableError(repr(exc))


    def disconnect(self):
        """Close the SSH connection."""
        try:
            log.info("Closing ssh connection to %s", self.host)
            self.ssh.close()
        except:
            pass

    def check_sudo(self):
        """Checks if sudo is installed.

        In case it is self.sudo = True, else self.sudo = False

        """
        # FIXME
        stdout, stderr, channel = self.command("which sudo", pty=False)
        if not stderr:
            self.sudo = True
            return True

    def _command(self, cmd, pty=True):
        """Helper method used by command and stream_command."""
        channel = self.ssh.get_transport().open_session()
        channel.settimeout(10800)
        stdout = channel.makefile()
        stderr = channel.makefile_stderr()
        if pty:
            # this combines the stdout and stderr streams as if in a pty
            # if enabled both streams are combined in stdout and stderr file
            # descriptor isn't used
            channel.get_pty()
        # command starts being executed in the background
        channel.exec_command(cmd)
        return stdout, stderr, channel

    def command(self, cmd, pty=True):
        """Run command and return output.

        If pty is True, then it returns a string object that contains the
        combined streams of stdout and stderr, like they would appear in a pty.

        If pty is False, then it returns a two string tupple, consisting of
        stdout and stderr.

        """
        log.info("running command: '%s'", cmd)
        stdout, stderr, channel = self._command(cmd, pty)
        line = stdout.readline()
        out = ''
        while line:
            out += line
            line = stdout.readline()

        if pty:
            retval = channel.recv_exit_status()
            return retval, out
        else:
            line = stderr.readline()
            err = ''
            while line:
                err += line
                line = stderr.readline()
            retval = channel.recv_exit_status()

            return retval, out, err

    def command_stream(self, cmd):
        """Run command and stream output line by line.

        This function is a generator that returns the commands output line
        by line. Use like: for line in command_stream(cmd): print line.

        """
        log.info("running command: '%s'", cmd)
        stdout, stderr, channel = self._command(cmd)
        line = stdout.readline()
        while line:
            yield line
            line = stdout.readline()

    def autoconfigure(self, user, backend_id, machine_id,
                      key_id=None, username=None, password=None, port=22):
        """Autoconfigure SSH client.

        This will do its best effort to find a suitable keypair and username
        and will try to connect. If it fails it raises
        MachineUnauthorizedError, otherwise it initializes self and returns a
        (key_id, ssh_user) tupple. If connection succeeds, it updates the
        association information in the key with the current timestamp and the
        username used to connect.

        """

        log.info("autoconfiguring Shell for machine %s:%s",
                 backend_id, machine_id)
        if backend_id not in user.backends:
            raise BackendNotFoundError(backend_id)
        if key_id and key_id not in user.keypairs:
            raise KeypairNotFoundError(key_id)

        # get candidate keypairs if key_id not provided
        keypairs = user.keypairs
        if key_id:
            pref_keys = [key_id]
        else:
            default_keys = [key_id for key_id in keypairs
                            if keypairs[key_id].default]
            assoc_keys = []
            recent_keys = []
            root_keys = []
            sudo_keys = []
            for key_id in keypairs:
                for machine in keypairs[key_id].machines:
                    if [backend_id, machine_id] == machine[:2]:
                        assoc_keys.append(key_id)
                        if len(machine) > 2 and \
                                int(time() - machine[2]) < 7*24*3600:
                            recent_keys.append(key_id)
                        if len(machine) > 3 and machine[3] == 'root':
                            root_keys.append(key_id)
                        if len(machine) > 4 and machine[4] is True:
                            sudo_keys.append(key_id)
            pref_keys = root_keys or sudo_keys or assoc_keys
            if default_keys and default_keys[0] not in pref_keys:
                pref_keys.append(default_keys[0])

        # try to connect
        for key_id in pref_keys:
            keypair = user.keypairs[key_id]

            # find username
            users = []
            # if username was specified, then try only that
            if username:
                users = [username]
            else:
                for machine in keypair.machines:
                    if machine[:2] == [backend_id, machine_id]:
                        if len(machine) >= 4 and machine[3]:
                            users.append(machine[3])
                            break
                # if username not found, try several alternatives
                # check to see if some other key is associated with machine
                for other_keypair in user.keypairs.values():
                    for machine in other_keypair.machines:
                        if machine[:2] == [backend_id, machine_id]:
                            if len(machine) >= 4 and machine[3]:
                                ssh_user = machine[3]
                                if ssh_user not in users:
                                    users.append(ssh_user)
                            if len(machine) >= 6 and machine[5]:
                                port = machine[5]
                # check some common default names
                for name in ['root', 'ubuntu', 'ec2-user', 'user', 'azureuser']:
                    if name not in users:
                        users.append(name)
            for ssh_user in users:
                try:
                    log.info("ssh -i %s %s@%s:%s",
                             key_id, ssh_user, self.host, port)
                    self.connect(username=ssh_user,
                                 key=keypair.private,
                                 password=password,
                                 port=port)
                except MachineUnauthorizedError:
                    continue
                # this is a hack: if you try to login to ec2 with the wrong
                # username, it won't fail the connection, so a
                # MachineUnauthorizedException won't be raised. Instead, it
                # will prompt you to login as some other user.
                # This hack tries to identify when such a thing is happening
                # and then tries to connect with the username suggested in
                # the prompt.
                retval, resp = self.command('uptime')
                new_ssh_user = None
                if 'Please login as the user ' in resp:
                    new_ssh_user = resp.split()[5].strip('"')
                elif 'Please login as the' in resp:
                    # for EC2 Amazon Linux machines, usually with ec2-user
                    new_ssh_user = resp.split()[4].strip('"')
                if new_ssh_user:
                    log.info("retrying as %s", new_ssh_user)
                    try:
                        self.disconnect()
                        self.connect(username=new_ssh_user,
                                     key=keypair.private,
                                     password=password,
                                     port=port)
                        ssh_user = new_ssh_user
                    except MachineUnauthorizedError:
                        continue
                # we managed to connect succesfully, return
                # but first update key
                assoc = [backend_id,
                         machine_id,
                         time(),
                         ssh_user,
                         self.check_sudo(),
                         port]
                trigger_session_update_flag = False
                for i in range(3):
                    try:
                        with user.lock_n_load():
                            updated = False
                            for i in range(len(user.keypairs[key_id].machines)):
                                machine = user.keypairs[key_id].machines[i]
                                if [backend_id, machine_id] == machine[:2]:
                                    old_assoc = user.keypairs[key_id].machines[i]
                                    user.keypairs[key_id].machines[i] = assoc
                                    updated = True
                                    old_ssh_user = None
                                    old_port = None
                                    if len(old_assoc) > 3:
                                        old_ssh_user = old_assoc[3]
                                    if len(old_assoc) > 5:
                                        old_port = old_assoc[5]
                                    if old_ssh_user != ssh_user or old_port != port:
                                        trigger_session_update_flag = True
                            # if association didn't exist, create it!
                            if not updated:
                                user.keypairs[key_id].machines.append(assoc)
                                trigger_session_update_flag = True
                            user.save()
                    except:
                        if i == 2:
                            log.error('RACE CONDITION: shell failed to recover from previous race conditions')
                            raise
                        else:
                            log.error('RACE CONDITION: shell trying to recover from race condition')
                    else:
                        break
                if trigger_session_update_flag:
                    trigger_session_update(user.email, ['keys'])
                return key_id, ssh_user

        raise MachineUnauthorizedError("%s:%s" % (backend_id, machine_id))

    def __del__(self):
        self.disconnect()


class DockerShell(object):
    """
    Docker Shell achieved through the docker hosts API, by opening a websocket
    """
    def __init__(self, host):
        self.host = host
        self.ws = websocket.WebSocket()
        self.protocol = "ws"
        self.uri = ""
        self.sslopt = {}
        self.buffer = ""

    def autoconfigure(self, user, backend_id, machine_id, **kwargs):
        log.info("autoconfiguring DockerShell for machine %s:%s",
                 backend_id, machine_id)
        if backend_id not in user.backends:
            raise BackendNotFoundError(backend_id)

        backend = user.backends[backend_id]
        docker_port = backend.docker_port

        # For basic auth
        if backend.apikey and backend.apisecret:
            self.uri = "://%s:%s@%s:%s/containers/%s/attach/ws?logs=0&stream=1&stdin=1&stdout=1&stderr=1" % \
                       (backend.apikey, backend.apisecret, self.host, docker_port, machine_id)
        else:
            self.uri = "://%s:%s/containers/%s/attach/ws?logs=0&stream=1&stdin=1&stdout=1&stderr=1" % \
                       (self.host, docker_port, machine_id)

        # For tls
        if backend.key_file and backend.cert_file:
            self.protocol = "wss"
            tempkey = tempfile.NamedTemporaryFile(delete=False)
            with open(tempkey.name, "w") as f:
                f.write(backend.key_file)
            tempcert = tempfile.NamedTemporaryFile(delete=False)
            with open(tempcert.name, "w") as f:
                f.write(backend.cert_file)

            self.sslopt = {
                'cert_reqs': ssl.CERT_NONE,
                'keyfile': tempkey.name,
                'certfile': tempcert.name
            }
            self.ws = websocket.WebSocket(sslopt=self.sslopt)

        self.uri = self.protocol + self.uri

        log.info(self.uri)

        self.connect()

        # This need in order to be consistent with the ParamikoShell
        return None, None

    def connect(self):
        try:
            self.ws.connect(self.uri)
        except websocket.WebSocketException:
            raise MachineUnauthorizedError()

    def disconnect(self, **kwargs):
        try:
            self.ws.send_close()
            self.ws.close()
        except:
            pass

    def _wrap_command(self, cmd):
        if cmd[-1] is not "\n":
            cmd = cmd + "\n"
        return cmd

    def command(self, cmd):
        self.cmd = self._wrap_command(cmd)
        log.error(self.cmd)

        self.ws = websocket.WebSocketApp(self.uri,
                                         on_message=self._on_message,
                                         on_error=self._on_error,
                                         on_close=self._on_close)

        log.error(self.ws)
        self.ws.on_open = self._on_open
        self.ws.run_forever(ping_interval=3, ping_timeout=10)
        self.ws.close()
        retval = 0
        output = self.buffer.split("\n")[1:-1]
        return retval, "\n".join(output)

    def _on_message(self, ws, message):
        self.buffer = self.buffer + message

    def _on_close(self, ws):
        ws.close()
        self.ws.close()

    def _on_error(self, ws, error):
        log.error("Got Websocker error: %s" % error)

    def _on_open(self, ws):
        def run(*args):
            ws.send(self.cmd)
            sleep(1)
        thread.start_new_thread(run, ())


    def __del__(self):
        self.disconnect()


class Shell(object):
    """
    Proxy Shell Class to distinguish weather we are talking about Docker or Paramiko Shell
    """
    def __init__(self, host, provider=None, username=None, key=None, password=None, port=22, enforce_paramiko=False):
        """

        :param provider: If docker, then DockerShell
        :param host: Host of machine/docker
        :param enforce_paramiko: If True, then Paramiko even for Docker containers. This is useful
        if we want SSH Connection to Docker containers
        :return:
        """

        self._shell = None
        self.host = host
        self.channel = None
        self.ssh = None

        if provider == 'docker' and not enforce_paramiko:
            self._shell = DockerShell(host)
        else:
            self._shell = ParamikoShell(host, username=username, key=key, password=password, port=port)
            self.ssh = self._shell.ssh

    def autoconfigure(self, user, backend_id, machine_id, key_id=None,
                      username=None, password=None, port=22):
        if isinstance(self._shell, ParamikoShell):
            return self._shell.autoconfigure(user, backend_id, machine_id, key_id=key_id,
                                             username=username, password=password, port=port)
        elif isinstance(self._shell, DockerShell):
            return self._shell.autoconfigure(user, backend_id, machine_id)

    def connect(self, username, key=None, password=None, port=22):
        if isinstance(self._shell, ParamikoShell):
            self._shell.connect(username, key=key, password=password, port=port)
        elif isinstance(self._shell, DockerShell):
            self._shell.connect()

    def invoke_shell(self, term='xterm', cols=None, rows=None):
        if isinstance(self._shell, ParamikoShell):
            return self._shell.ssh.invoke_shell(term, cols, rows)
        elif isinstance(self._shell, DockerShell):
            return self._shell.ws

    def recv(self, default=1024):
        if isinstance(self._shell, ParamikoShell):
            return self._shell.ssh.recv(default)
        elif isinstance(self._shell, DockerShell):
            return self._shell.ws.recv()

    def disconnect(self):
            self._shell.disconnect()

    def command(self, cmd, pty=True):
        if isinstance(self._shell, ParamikoShell):
            return self._shell.command(cmd, pty=pty)
        elif isinstance(self._shell, DockerShell):
            return self._shell.command(cmd)

    def command_stream(self, cmd):
        if isinstance(self._shell, ParamikoShell):
            yield self._shell.command_stream(cmd)
