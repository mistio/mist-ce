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
import mongoengine as me

from mist.io.exceptions import CloudNotFoundError, KeyNotFoundError
from mist.io.exceptions import MachineUnauthorizedError
from mist.io.exceptions import RequiredParameterMissingError
from mist.io.exceptions import ServiceUnavailableError

from mist.io.helpers import trigger_session_update
from mist.io.helpers import sanitize_host

from mist.core.helpers import get_story

try:
    from mist.core.user.models import User
    from mist.io.clouds.models import Cloud
    from mist.io.machines.models import Machine, KeyAssociation
    from mist.io.keys.models import Key, SignedSSHKey
    from mist.core import config
except ImportError:
    from mist.io import config

from mist.core.vpn.methods import destination_nat as dnat

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
    shell.autoconfigure(user, cloud_id, machine_id)
    for line in shell.command_stream('ps -fe'):
    print line

    """

    def __init__(self, host, username=None, key=None, password=None, cert_file=None, port=22):
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
            self.connect(username, key, password, cert_file, port)

    def connect(self, username, key=None, password=None, cert_file=None, port=22):
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
            if isinstance(key, SignedSSHKey) and cert_file:
                # signed ssh key, use RSACert
                rsa_key = paramiko.RSACert(privkey_file_obj=StringIO(key),
                                           cert_file_obj=StringIO(cert_file))
            else:
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
                raise MachineUnauthorizedError("Couldn't connect to "
                                               "%s@%s:%s. %s"
                                               % (username, self.host,
                                                  port, exc))
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

    def autoconfigure(self, user, cloud_id, machine_id,
                      key_id=None, username=None, password=None, port=22):
        """Autoconfigure SSH client.

        This will do its best effort to find a suitable key and username
        and will try to connect. If it fails it raises
        MachineUnauthorizedError, otherwise it initializes self and returns a
        (key_id, ssh_user) tuple. If connection succeeds, it updates the
        association information in the key with the current timestamp and the
        username used to connect.

        """
        log.info("autoconfiguring Shell for machine %s:%s",
                 cloud_id, machine_id)

        cloud = Cloud.objects.get(owner=user, id=cloud_id)
        try:
            machine = Machine.objects.get(cloud=cloud, machine_id=machine_id)
        except me.DoesNotExist:
            machine = Machine(cloud=cloud, machine_id=machine_id)
        if key_id:
            keys = [Key.objects.get(owner=user, id=key_id)]
        else:
            keys = [key_assoc.keypair
                    for key_assoc in machine.key_associations
                    if isinstance(key_assoc.keypair, Key)]
        if username:
            users = [username]
        else:
            users = list(set([key_assoc.ssh_user
                              for key_assoc in machine.key_associations
                              if key_assoc.ssh_user]))
        if not users:
            for name in ['root', 'ubuntu', 'ec2-user', 'user', 'azureuser',
                         'core', 'centos', 'cloud-user', 'fedora']:
                if not name in users:
                    users.append(name)
        if port != 22:
            ports = [port]
        else:
            ports = list(set([key_assoc.port
                              for key_assoc in machine.key_associations]))
        if 22 not in ports:
            ports.append(22)
        # store the original destination IP to prevent rewriting it when NATing
        ssh_host = self.host
        for key in keys:
            for ssh_user in users:
                for port in ports:
                    try:
                        # store the original ssh port in case of NAT
                        # by the OpenVPN server
                        ssh_port = port
                        self.host, port = dnat(user, ssh_host, port)
                        log.info("ssh -i %s %s@%s:%s",
                                 key.name, ssh_user, self.host, port)
                        cert_file = ''
                        if isinstance(key, SignedSSHKey):
                            cert_file = key.certificate

                        self.connect(username=ssh_user,
                                     key=key.private,
                                     password=password,
                                     cert_file=cert_file,
                                     port=port)
                    except MachineUnauthorizedError:
                        continue

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
                            cert_file = ''
                            if isinstance(key, SignedSSHKey):
                                cert_file = key.certificate
                            self.connect(username=new_ssh_user,
                                         key=key.private,
                                         password=password,
                                         cert_file=cert_file,
                                         port=port)
                            ssh_user = new_ssh_user
                        except MachineUnauthorizedError:
                            continue
                    # we managed to connect successfully, return
                    # but first update key
                    updated = False
                    for key_assoc in machine.key_associations:
                        if key_assoc.keypair == key:
                            key_assoc.ssh_user = ssh_user
                            updated = True
                            trigger_session_update_flag = True
                            break
                    if not updated:
                        trigger_session_update_flag = True
                        # in case of a private host do NOT update the key
                        # associations with the port allocated by the OpenVPN
                        # server, instead use the original ssh_port
                        key_assoc = KeyAssociation(keypair=key,
                                                   ssh_user=ssh_user,
                                                   port=ssh_port,
                                                   sudo=self.check_sudo())
                        machine.key_associations.append(key_assoc)
                    machine.save()

                    if trigger_session_update_flag:
                        trigger_session_update(user.id, ['keys'])
                    return key.name, ssh_user

        raise MachineUnauthorizedError("%s:%s" % (cloud_id, machine_id))

    def __del__(self):
        self.disconnect()


class DockerWebSocket(object):
    """
    Base WebSocket class inherited by DockerShell
    """
    def __init__(self):
        self.ws = websocket.WebSocket()
        self.protocol = "ws"
        self.uri = ""
        self.sslopt = {}
        self.buffer = ""

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


class DockerShell(DockerWebSocket):
    """
    DockerShell achieved through the Docker host's API by opening a WebSocket
    """
    def __init__(self, host):
        self.host = host
        super(DockerShell, self).__init__()

    def autoconfigure(self, user, cloud_id, machine_id, **kwargs):
        shell_type = 'logging' if kwargs.get('job_id', '') else 'interactive'
        config_method = '%s_shell' % shell_type

        getattr(self, config_method)(user,
                                     cloud_id=cloud_id, machine_id=machine_id,
                                     job_id=kwargs.get('job_id', ''))
        self.connect()
        # This is for compatibility purposes with the ParamikoShell
        return None, None

    def interactive_shell(self, user, **kwargs):
        docker_port, cloud = \
            self.get_docker_endpoint(user, cloud_id=kwargs['cloud_id'])
        log.info("Autoconfiguring DockerShell for machine %s:%s",
                 cloud.id, kwargs['machine_id'])

        ssl_enabled = cloud.key_file and cloud.cert_file
        self.uri = self.build_uri(kwargs['machine_id'], docker_port, cloud=cloud,
                                  ssl_enabled=ssl_enabled)

    def logging_shell(self, user, log_type='CFY', **kwargs):
        docker_port, container_id = \
            self.get_docker_endpoint(user, cloud_id=None, job_id=kwargs['job_id'])
        log.info('Autoconfiguring DockerShell to stream %s logs from ' \
                 'container %s (User: %s)', log_type, container_id, user.id)

        # TODO: SSL for CFY container
        self.uri = self.build_uri(container_id, docker_port, allow_logs=1,
                                                             allow_stdin=0)

    def get_docker_endpoint(self, user, cloud_id, job_id=None):
        if job_id:
            event = get_story(job_id)
            assert user.id == event['owner_id'], 'Owner ID mismatch!'
            self.host, docker_port = config.DOCKER_IP, config.DOCKER_PORT
            return docker_port, event['logs'][0]['container_id']

        cloud = Cloud.objects.get(owner=user, id=cloud_id)
        self.host, docker_port = dnat(user, self.host, cloud.port)
        return docker_port, cloud

    def build_uri(self, container_id, docker_port, cloud=None, ssl_enabled=False,
                  allow_logs=0, allow_stdin=1):
        if ssl_enabled:
            self.protocol = 'wss'
            ssl_key, ssl_cert = self.ssl_credentials(cloud)
            self.sslopt = {
                'cert_reqs': ssl.CERT_NONE,
                'keyfile': ssl_key,
                'certfile': ssl_cert
            }
            self.ws = websocket.WebSocket(sslopt=self.sslopt)

        if cloud and cloud.username and cloud.password:
            uri = '%s://%s:%s@%s:%s/containers/%s/attach/ws?logs=%s&stream=1&stdin=%s&stdout=1&stderr=1' % \
                   (self.protocol, cloud.username, cloud.password, self.host,
                    docker_port, container_id, allow_logs, allow_stdin)
        else:
            uri = '%s://%s:%s/containers/%s/attach/ws?logs=%s&stream=1&stdin=%s&stdout=1&stderr=1' % \
                  (self.protocol, self.host, docker_port, container_id,
                   allow_logs, allow_stdin)

        return uri

    @staticmethod
    def ssl_credentials(cloud=None):
        if cloud:
            _key, _cert = cloud.key_file, cloud.cert_file

            tempkey = tempfile.NamedTemporaryFile(delete=False)
            with open(tempkey.name, 'w') as f:
                f.write(_key)
            tempcert = tempfile.NamedTemporaryFile(delete=False)
            with open(tempcert.name, 'w') as f:
                f.write(_cert)

            return tempkey.name, tempcert.name


class Shell(object):
    """
    Proxy Shell Class to distinguish whether we are talking about Docker or Paramiko Shell
    """
    def __init__(self, host, provider=None, username=None, key=None,
                 password=None, cert_file=None, port=22, enforce_paramiko=False):
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
            self._shell = ParamikoShell(host, username=username, key=key,
                                        password=password, cert_file=cert_file, port=port)
            self.ssh = self._shell.ssh

    def autoconfigure(self, user, cloud_id, machine_id, key_id=None,
                      username=None, password=None, port=22, **kwargs):
        if isinstance(self._shell, ParamikoShell):
            return self._shell.autoconfigure(
                user, cloud_id, machine_id, key_id=key_id,
                username=username, password=password, port=port
            )
        elif isinstance(self._shell, DockerShell):
            return self._shell.autoconfigure(user, cloud_id, machine_id, **kwargs)

    def connect(self, username, key=None, password=None, cert_file=None, port=22):
        if isinstance(self._shell, ParamikoShell):
            self._shell.connect(username, key=key, password=password,
                        cert_file=cert_file, port=port)
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
