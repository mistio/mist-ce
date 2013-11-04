import os
import sys
import socket
import logging
import subprocess
import tempfile

#import gevent
#import gevent.socket

#from gevent import monkey
#monkey.patch_socket()

import StringIO
import paramiko
import socket

from pyramid.request import Request
from pyramid.response import Response
from mist.io.helpers import connect, run_command, get_ssh_user_from_keypair, get_user
#from mist.io.views import get_preferred_keypairs

log = logging.getLogger('mistshell')

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
                backend = self.app.routes_mapper(request)['match']['backend']
                machine = self.app.routes_mapper(request)['match']['machine']
                host = request.params.get('host', None)
                ssh_user = request.params.get('ssh_user', None)
                command = request.params.get('command', None)
                request.registry = self.app.registry

                if not ssh_user or ssh_user == 'undefined':
                    log.debug("Will select root as the ssh-user as we don't know who we are")
                    ssh_user = 'root'

                with get_user(request, readonly=True) as user:
                    keypairs = user['keypairs']

                preferred_keypairs = get_preferred_keypairs(keypairs, backend, machine)
                log.debug("preferred keypairs = %s" % preferred_keypairs)
              
                if preferred_keypairs:
                    keypair = keypairs[preferred_keypairs[0]]
                    private_key = keypair['private']
                    s_user = get_ssh_user_from_keypair(keypair, backend, machine)
                    log.debug("get user from keypair returned: %s" % s_user)
                    if s_user:
                        ssh_user = s_user
                        log.debug("Will select %s as the ssh-user" % ssh_user)
                else:
                    private_key = None
                    log.error("Missing private key")
                    raise Exception("Missing private key")

                conn = connect(request, backend)
                if conn:
                    return self.stream_command(conn, machine, host, ssh_user, 
                                               private_key, command, 
                                               start_response)
                else:
                    raise
            except:
                # leave error handling up to the app
                return self.app(environ, start_response)
        else:
            return self.app(environ, start_response)

        
    def stream_command(self, conn, machine, host, ssh_user, private_key, command, start_response):
        """ 
            Generator function that streams the output of the remote command 
            using the hidden iframe web pattern
        """
        #TODO: add timeout
        outputPrefix = u'[%s] out:' % host
        
        # save private key in temp file
        (tmp_key, key_path) = tempfile.mkstemp()
        key_fd = os.fdopen(tmp_key, 'w+b')
        key_fd.write(private_key)
        key_fd.close()
        
        # start the http response
        start_response('200 OK', [('Content-Type','text/html')])
        # send some blank data to get webkit browsers to display what's sent
        yield 1024*'\0'
        
        # start the html response
        yield '<html><body>\n'

        # run the command as a seperate process using fab
        cmd = ['./bin/fab','-H', host , '-u', ssh_user, '-k', '-i', key_path, '--', command]
        proc = subprocess.Popen(cmd, bufsize=0, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        while True:
            # get commands output, line by line
            line = proc.stdout.readline()
            if line == '' and proc.poll() != None:
                break
            if line != '':
                sys.stdout.write(line)
                sys.stdout.flush()
                if outputPrefix.encode('utf-8','ignore') in line: # remove logging decorators
                    line = line[len(outputPrefix):]
                    # send the actual output
                    yield "<script type='text/javascript'>parent.appendShell('%s');</script>\n" % line.replace('\'','\\\'').replace('\n','<br/>') #.replace('<','&lt;').replace('>', '&gt;')
        # wait for child
        stdout, stderr = proc.communicate()
        
        # remove temp key
        os.remove(key_path)
        
        yield "<script type='text/javascript'>parent.completeShell(%s);</script>\n" % proc.returncode        
        yield '</body></html>\n'   

class Shell(object):
    """ This is a new Shell class. Rather generic, all it does is initialize a new
    Shell object. Its main attributes are host, username. You can either user
    password or private key for connecting and authorizing.
    """

    def __init__(self, host, username="root", password=None, pkey=None, autoConnect=True):
        """
        @param host: The host to be connected to
        @param username: Username
        @param password: By default password is None. This means that we'll use
        the private key by default. However, password can be useful in two cases.
        Either with bare-metal support or when needed as passphrase by a private key
        @param pkey: Pkey is given as a string when provided by users.keypairs[keypair].private
        @param connect: If connect is set to False, then Shell object will not initialize the
        connection. It will just create a Shell object
        """
        self.host = host
        self.username = username
        self.pkey = None
        self.sudo = False
        if password:
            self.password = password
        if pkey:
            (tmp_key, key_path) = tempfile.mkstemp()
            key_fd = os.fdopen(tmp_key, 'w+b')
            key_fd.write(pkey)
            key_fd.close()
            self.pkey = paramiko.RSAKey.from_private_key_file(key_path)
            os.remove(key_path)

        self.ssh = paramiko.SSHClient()
        self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        if autoConnect:
            self.connect()

        self.stdout = ""
        self.stderr = ""

    def connect(self):
        try:
            if self.pkey:
                self.ssh.connect(self.host, username=self.username, pkey=self.pkey)
            else:
                self.ssh.connect(self.host, username=self.username, password=self.password)
        except:
            self.close_connection()

    def checkSudo(self):
        """
        Checks if sudo is installed. In case it is self.sudo = True,
        else self.sudo = False
        """
        stdin, stdout, stderr = self.ssh.exec_command("which sudo")
        if not stderr.read():
            self.sudo = True

    def command(self, cmd):
        try:
            stdin, stdout, stderr = self.ssh.exec_command(cmd)
            self.stdout = stdout.read()
            return self.stdout
        except:
            self.close_connection()

    def command_stream(self, cmd):
        self.channel = self.ssh.get_transport().open_session()
        self.channel.settimeout(10800)

        try:
            self.channel.exec_command(cmd)
            contents = StringIO.StringIO()
            error = StringIO.StringIO()

            while not self.channel.exit_status_ready():

                if self.channel.recv_ready():
                    data = self.channel.recv(1024)
                    while data:
                        contents.write(data)
                        #output = contents.getvalue()
                        #print output
                        yield data.strip()
                        data = self.channel.recv(1024)

                if self.channel.recv_stderr_ready():
                    error_buff = self.channel.recv_stderr(1024)
                    while error_buff:
                        error.write(error_buff)
                        error_buff = self.channel.recv_stderr(1024)
            #exist_status = self.channel.recv_exit_status()
        except socket.timeout:
            raise socket.timeout

        #output = contents.getvalue()
        #error_value = error.getvalue()

        #print output, error_value, exist_status

    def output(self, stream=False):
        for line in self.stdout.splitlines():
            print line

    def close_connection(self):
        try:
            self.ssh.close()
        except:
            pass
