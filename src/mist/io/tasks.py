from mist.io.celery import app
from mist.io.methods import ssh_command, connect_provider
from mist.io.exceptions import ServiceUnavailableError

@app.task
def add(x, y):
    return x + y

@app.task(bind=True, default_retry_delay=3*60)
def run_deploy_script(self, email, backend_id, machine_id, command, 
                      key_id=None, username=None, password=None, port=22):
    

    try:
        from mist.core.helpers import user_from_email
        user = user_from_email(email)
    except ImportError:
        from mist.io.model import User
        user = User()

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
        output = ssh_command(user, backend_id, node.id, host, command, 
                         key_id, username, password, port)
    except ServiceUnavailableError as exc:
        raise self.retry(exc=exc, countdown=60, max_retries=5)

    print output
