import os
import logging
import tempfile
from time import time

import paramiko

from pyramid.request import Request

from mist.io.model import User
from mist.io.exceptions import BackendNotFoundError, KeypairNotFoundError
log = logging.getLogger(__name__)

def user_from_request(request):
    return User()


class ShellMiddleware(object):
    """Shell middleware that intercepts requests for shell commands and streams 
       the output"""
    def __init__(self, app):
        #mist.io app
        self.app = app
        self.routes_mapper = app.routes_mapper
        self.registry = app.registry

    def __call__(self, environ, start_response):
        request = Request(environ)
        if request.path.endswith('shell') and request.method == 'GET':
            try:
                backend_id = self.app.routes_mapper(request)['match']['backend']
                machine_id = self.app.routes_mapper(request)['match']['machine']
                host = request.params.get('host', None)
                #~ ssh_user = request.params.get('ssh_user', None)
                command = request.params.get('command', None)
                request.registry = self.app.registry

                #~ if not ssh_user or ssh_user == 'undefined':
                    #~ log.debug("Will select root as the ssh-user as we don't know who we are")
                    #~ ssh_user = 'root'
                user = user_from_request(request)
                keypairs = user.keypairs
                shell = Shell(host)
                ret = shell.autoconfigure(user, backend_id, machine_id)
                if ret is None:
                    return
                stdout_lines = shell.command_stream(command)
                start_response('200 OK', [('Content-Type','text/html')])
                return self.stream_command(stdout_lines)
            except:
                # leave error handling up to the app
                return self.app(environ, start_response)
        else:
            return self.app(environ, start_response)

        
    def stream_command(self, stdout_lines):
        """ 
            Generator function that streams the output of the remote command 
            using the hidden iframe web pattern
        """

        # send some blank data to get webkit browsers to display what's sent
        yield 1024*'\0'
        
        # start the html response
        yield '<html><body>\n'

        for line in stdout_lines:
            # get commands output, line by line
            yield "<script type='text/javascript'>parent.appendShell('%s');</script>\n" % line.replace('\'','\\\'').replace('\n','<br/>') #.replace('<','&lt;').replace('>', '&gt;')
        # FIXME
        yield "<script type='text/javascript'>parent.completeShell(%s);</script>\n" % 0        
        yield '</body></html>\n'   


class Shell(object):
    """ This is a new Shell class. Rather generic, all it does is initialize a new
    Shell object. Its main attributes are host, username. You can either user
    password or private key for connecting and authorizing.
    """

    def __init__(self, host, username=None, key=None, password=None, port=22):
        """
        @param host: The host to be connected to
        @param username: Username to be used, by default it is root.
        @param password: By default password is None. This means that we'll use
        the private key by default. However, password can be useful in two cases.
        Either with bare-metal support or when needed as passphrase by a private key
        @param pkey: Pkey is given as a string when provided by users.keypairs[keypair].private
        @param connect: If connect is set to False, then Shell object will not initialize the
        connection. It will just create a Shell object

        """
        if not host:
            raise Exception('host not given')
        self.host = host

        self.ssh = paramiko.SSHClient()
        self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        # if username provided, try to connect
        if username:
            self.connect(username, key, password, port)

    def connect(self, username, key=None, password=None, port=22):
        try:
            if key:
                tmp_key_fd, tmp_key_path = tempfile.mkstemp()
                key_fd = os.fdopen(tmp_key_fd, 'w+b')
                key_fd.write(key)
                key_fd.close()
                rsa_key = paramiko.RSAKey.from_private_key_file(tmp_key_path)
                os.remove(tmp_key_path)
                self.ssh.connect(self.host, username=username, pkey=rsa_key,
                                 password=password, port=port)
            else:
                self.ssh.connect(self.host, username=username,
                                 password=password, port=port)
            log.info("Succesfully connected to %s@%s:%s.",
                      username, self.host, port)
            return True
        except paramiko.SSHException as e:
            log.error("Couldn't connect to %s@%s:%s.",
                       username, self.host, port)
            return False

    def disconnect(self):
        try:
            self.ssh.close()
        except:
            pass

    def checkSudo(self):
        """
        Checks if sudo is installed. In case it is self.sudo = True,
        else self.sudo = False
        """
        stdout, stderr = self.command("which sudo", pty=False)
        if not stderr:
            self.sudo = True

    def _command(self, cmd, pty=True):
        channel = self.ssh.get_transport().open_session()
        channel.settimeout(10800)
        stdout = channel.makefile()
        stderr = channel.makefile_stderr()
        if pty:
            # this combines the stdout and stderr streams as if in a pty
            # if enabled both streams are combined in stdout and stderr file
            # descriptor isn't used
            channel.get_pty()
        channel.exec_command(cmd)
        return stdout, stderr

    def command(self, cmd, pty=True):
        """
        @param cmd: Command to run
        @return: Returns a tuple with the stdout and stderr
        """
        stdout, stderr = self._command(cmd, pty)
        if pty:
            return stdout.read()
        else:
            return stdout.read(), stderr.read()

    def command_stream(self, cmd):
        stdout, stderr = self._command(cmd)
        line = stdout.readline()
        while line:
            yield line
            line = stdout.readline()

    def autoconfigure(self, user, backend_id, machine_id, key_id=None, password=None):
        if backend_id not in user.backends:
            raise BackendNotFoundError(backend_id)
        if key_id is not None and key_id not in user.keypairs:
            raise KeypairNotFoundError(key_id)

        # get candidate keypairs if key_id not provided
        keypairs = user.keypairs
        if key_id:
            pref_keys = [key_id]
        else:
            default_keys = filter(lambda key_id: keypairs[key_id].default, keypairs)
            assoc_keys = []
            recent_keys = []
            root_keys = []
            sudo_keys = []
            for key_id in keypairs:
                for machine in keypairs[key_id].machines:
                    if [backend_id, machine_id] == machine[:2]:
                        assoc_keys.append(key_id)
                        if len(machine) > 2 and int(time() - machine[2]) < 7*24*3600:
                            recent_keys.append(key_id)
                        if len(machine) > 3 and machine[3] == 'root':
                            root_keys.append(key_id)
                        if len(machine) > 4 and machine[4] == True:
                            sudo_keys.append(key_id) 
            pref_keys = root_keys or sudo_keys or assoc_keys
            if default_keys and default_keys[0] not in pref_keys:
                pref_keys.append(default_keys[0])

        # try to connect
        for key_id in pref_keys:
            keypair = user.keypairs[key_id]

            # find username
            saved_ssh_user = ''
            for machine in keypair.machines:
                if machine[:2] == [backend_id, machine_id]:
                    try:
                        # this should be the user, since machine =
                        # [backend_id, machine_id, timestamp, ssh_user, sudoer]
                        saved_ssh_user = machine[3]
                    except:
                        pass
            # if username not found, try several alternatives
            if saved_ssh_user:
                users = [saved_ssh_user]
            else:
                users = ['root']
            for ssh_user in users:
                # if connection succesfull, return!
                if self.connect(username=ssh_user,
                                key=keypair.private,
                                password=password):
                    resp = self.command('uptime')
                    new_ssh_user = None
                    if 'Please login as the user ' in resp:
                        new_ssh_user = resp.split()[5].strip('"')
                    elif 'Please login as the' in resp:
                        # for EC2 Amazon Linux machines, usually with ec2-user
                        new_ssh_user = resp.split()[4].strip('"')
                    if new_ssh_user:
                        log.info("retrying as %s", new_ssh_user)
                        self.disconnect()
                        self.connect(username=new_ssh_user,
                                      key=keypair.private,
                                      password=password)
                        ssh_user = new_ssh_user
                    return key_id, ssh_user
        return None
