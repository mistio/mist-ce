from mist.io.celery import app
from mist.io.methods import ssh_command, connect_provider
from mist.io.exceptions import ServiceUnavailableError


@app.task(bind=True, default_retry_delay=3*60)
def run_deploy_script(self, email, backend_id, machine_id, command, 
                      key_id=None, username=None, password=None, port=22):
    try:
        from mist.core.helpers import user_from_email
        user = user_from_email(email)
    except ImportError:
        from mist.io.model import User
        user = User()

    try:
        import libcloud.security
        libcloud.security.CA_CERTS_PATH.append("cacert.pem")        
        libcloud.security.CA_CERTS_PATH.append("src/mist.io/cacert.pem")
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
    
        print email, backend_id, machine_id, command, key_id
        try:
            shell = Shell(host)
            key_id, ssh_user = shell.autoconfigure(user, backend_id, node.id,
                                                   key_id, username, password, port)
            retval, output = shell.command(command)
            shell.disconnect()            
            if retval:
                print "deploy task failed with value %s" % retval
                print output
        except ServiceUnavailableError as exc:
            raise self.retry(exc=exc, countdown=60, max_retries=5)
    
        print output
    except Exception as exc:
        print "deploy task failed with exception %s" % repr(exc)
        try:
            from mist.core.helpers import notify_admin
            notify_admin('Deploy script failed', repr(exc))
        except ImportError:
            pass
        except Exception as e:
            print "admin notify failed with exception %s " % repr(e)
            
