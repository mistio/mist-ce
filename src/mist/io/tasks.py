from celery import logging

import libcloud.security

from mist.io.celery import app
from mist.io.methods import ssh_command, connect_provider
from mist.io.methods import notify_user, notify_admin
from mist.io.exceptions import ServiceUnavailableError


log = logging.getLogger(__name__)


@app.task
def add(x,y):
    return x+y


@app.task(bind=True, default_retry_delay=3*60)
def run_deploy_script(self, email, backend_id, machine_id, command, 
                      key_id=None, username=None, password=None, port=22):
    
    try: # Multi-user environment
        from mist.core.helpers import user_from_email
        user = user_from_email(email)
        cert_path = "src/mist.io/cacert.pem"
    except ImportError: # Standalone mist.io
        from mist.io.model import User
        user = User()
        cert_path = "cacert.pem"

    # libcloud certificate fix for OS X
    libcloud.security.CA_CERTS_PATH.append(cert_path)
        
    try:
        # find the node we're looking for and get its hostname
        conn = connect_provider(user.backends[backend_id])
        nodes = conn.list_nodes()
        node = None
        for n in nodes:
            if n.id == machine_id:
                node = n
                break
    
        if node and len(node.public_ips):
            host = node.public_ips[0]
        else:
            raise self.retry(exc=Exception(), countdown=60, max_retries=5)
    
        try:
            from mist.io.shell import Shell
            shell = Shell('google.com')
            key_id, ssh_user = shell.autoconfigure(user, backend_id, node.id,
                                                   key_id, username, password, port)
            import time
            start_time = time.time()
            retval, output = shell.command(command)
            execution_time = time.time() - start_time
            shell.disconnect()
            msg = """
Command: %s
Return value: %s
Duration: %s seconds
Output:
%s""" % (command, retval, execution_time, output)
                              
            if retval:
                notify_user(user, "[mist.io] Deployment script failed for machine %s (%s)" % (node.name, node.id), msg)
            else:
                notify_user(user, "[mist.io] Deployment script succeeded for machine %s (%s)" % (node.name, node.id), msg)
                
        except ServiceUnavailableError as exc:
            raise self.retry(exc=exc, countdown=60, max_retries=5)  
    except Exception as exc:
        if str(exc).startswith('Retry'):
            return
        print "Deploy task failed with exception %s" % repr(exc)
        notify_user(user, "Deployment script failed for machine %s after 5 retries" % node.id)
        notify_admin("Deployment script failed for machine %s in backend %s by user %s after 5 retries" % (node.id, backend_id, email), repr(exc))
            
