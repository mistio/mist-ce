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

from StringIO import StringIO

from pyramid.request import Request
from pyramid.response import Response
from mist.io.helpers import connect, run_command, get_keypair, get_ssh_user_from_keypair
from mist.io.views import get_preferred_keypairs

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

                try:
                    keypairs = environ['beaker.session']['keypairs']
                except:
                    keypairs = request.registry.settings.get('keypairs', {})

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
