"""mist.io.shell

This module contains everything that is need to communicate with machines via
SSH.

"""


import logging
from time import time
from StringIO import StringIO


import paramiko
import socket


from mist.io.exceptions import BackendNotFoundError, KeypairNotFoundError
from mist.io.exceptions import MachineUnauthorizedError
from mist.io.exceptions import RequiredParameterMissingError
from mist.io.exceptions import ServiceUnavailableError


log = logging.getLogger(__name__)


class Shell(object):
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
        stdout, stderr = self.command("which sudo", pty=False)
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
        return stdout, stderr

    def command(self, cmd, pty=True):
        """Run command and return output.

        If pty is True, then it returns a string object that contains the
        combined streams of stdout and stderr, like they would appear in a pty.

        If pty is False, then it returns a two string tupple, consisting of
        stdout and stderr.

        """
        log.info("running command: '%s'", cmd)
        stdout, stderr = self._command(cmd, pty)
        if pty:
            return stdout.read()
        else:
            return stdout.read(), stderr.read()

    def command_stream(self, cmd):
        """Run command and stream output line by line.

        This function is a generator that returns the commands output line
        by line. Use like: for line in command_stream(cmd): print line.

        """
        log.info("running command: '%s'", cmd)
        stdout, stderr = self._command(cmd)
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
                for name in ['root', 'ubuntu', 'ec2-user', 'user']:
                    if name not in users:
                        users.append(name)
            for ssh_user in users:
                try:
                    log.info("ssh -i %s %s@%s",
                             key_id, ssh_user, self.host)
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
                resp = self.command('uptime')
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
                with user.lock_n_load():
                    updated = False
                    for i in range(len(user.keypairs[key_id].machines)):
                        machine = user.keypairs[key_id].machines[i]
                        if [backend_id, machine_id] == machine[:2]:
                            user.keypairs[key_id].machines[i] = assoc
                            updated = True
                    # if association didn't exist, create it!
                    if not updated:
                        user.keypairs[key_id].machines.append(assoc)
                    user.save()
                return key_id, ssh_user

        raise MachineUnauthorizedError("%s:%s" % (backend_id, machine_id))

    def __del__(self):
        self.disconnect()
