import json
from time import time
from base64 import b64encode

from memcache import Client as MemcacheClient

from amqp import Message
from amqp.connection import Connection

## from celery import logging

import libcloud.security

from mist.io.celery_app import app
from mist.io.exceptions import ServiceUnavailableError
from mist.io.shell import Shell
from mist.io.helpers import get_auth_header

try: # Multi-user environment
    from mist.core.helpers import user_from_email
    from mist.core import config
    cert_path = "src/mist.io/cacert.pem"
except ImportError: # Standalone mist.io
    from mist.io.helpers import user_from_email
    from mist.io import config
    cert_path = "cacert.pem"

from mist.io.helpers import amqp_publish

# libcloud certificate fix for OS X
libcloud.security.CA_CERTS_PATH.append(cert_path)

## log = logging.getLogger(__name__)


@app.task
def ssh_command(user, backend_id, machine_id, host, command,
                      key_id=None, username=None, password=None, port=22):
    shell = Shell(host)
    key_id, ssh_user = shell.autoconfigure(user, backend_id, machine_id,
                                           key_id, username, password, port)
    retval, output = shell.command(command)
    shell.disconnect()
    if retval:
        from mist.io.methods import notify_user
        notify_user(user, "[mist.io] Async command failed for machine %s (%s)" % (machine_id, host), output)


@app.task
def probe(email, backend_id, machine_id, host, key_id='', ssh_user='', flush=False):

    cache = MemcacheClient(["127.0.0.1:11211"])
    cache_key = b64encode(":".join((email, 'probe', backend_id, machine_id,
                                    host, key_id, ssh_user)))
    cached = cache.get(cache_key)
    if cached:
        age = time() - cached['timestamp']
        if age < 90:
            # emit cached result
            print "emitting cached probe result"
            amqp_publish(
                exchange=email or 'mist', queue='update',
                routing_key='probe', data=cached['payload'],
            )
            if age < 30:
                print "result too fresh, returning"
                return
    user = user_from_email(email)
    from mist.io import methods
    try:
        res = methods.probe(user, backend_id, machine_id, host,
                            key_id=key_id, ssh_user=ssh_user)
    except Exception as e:
        print "probe failed with %s" % repr(e)
        return

    ret = {'backend_id': backend_id,
           'machine_id': machine_id,
           'host': host,
           'result': res}

    print "caching result"
    cached = {'timestamp': time(), 'payload': ret}
    cache.set(cache_key, cached)

    amqp_publish(
        exchange=email or 'mist',
        queue='update',
        routing_key='probe',
        data=ret,
    )

    print "probed: ", email, ret


@app.task(bind=True, default_retry_delay=3*60)
def run_deploy_script(self, email, backend_id, machine_id, command,
                      key_id=None, username=None, password=None, port=22):
    from mist.io.methods import ssh_command, connect_provider
    from mist.io.methods import notify_user, notify_admin

    user = user_from_email(email)

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
            # filter out IPv6 addresses
            ips = filter(lambda ip: ':' not in ip, node.public_ips)
            host = ips[0]
        else:
            raise self.retry(exc=Exception(), countdown=60, max_retries=5)

        try:
            from mist.io.shell import Shell
            shell = Shell(host)
            key_id, ssh_user = shell.autoconfigure(user, backend_id, node.id,
                                                   key_id, username, password, port)

            start_time = time()
            retval, output = shell.command(command)
            execution_time = time() - start_time
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


@app.task
def ssh_command(user, backend_id, machine_id, host, command,
                      key_id=None, username=None, password=None, port=22):
    shell = Shell(host)
    key_id, ssh_user = shell.autoconfigure(user, backend_id, machine_id,
                                           key_id, username, password, port)
    retval, output = shell.command(command)
    shell.disconnect()
    if retval:
        from mist.io.methods import notify_user
        notify_user(user, "[mist.io] Async command failed for machine %s (%s)" % (machine_id, host), output)


@app.task
def list_sizes(email, backend_id):
    from mist.io import methods
    user = user_from_email(email)
    sizes = methods.list_sizes(user, backend_id)
    amqp_publish(
        exchange=email or 'mist',
        queue='update',
        routing_key='list_sizes',
        data={'backend_id': backend_id, 'sizes': sizes},
    )


@app.task
def list_locations(email, backend_id):
    from mist.io import methods
    user = user_from_email(email)
    locations = methods.list_locations(user, backend_id)
    amqp_publish(
        exchange=email or 'mist',
        queue='update',
        routing_key='list_locations',
        data={'backend_id': backend_id, 'locations': locations},
    )


@app.task
def list_images(email, backend_id):
    from mist.io import methods
    user = user_from_email(email)
    images = methods.list_images(user, backend_id)
    amqp_publish(
        exchange=email or 'mist',
        queue='update',
        routing_key='list_images',
        data={'backend_id': backend_id, 'images': images},
    )


@app.task
def list_machines(email, backend_id):
    from mist.io import methods
    user = user_from_email(email)
    machines = methods.list_machines(user, backend_id)
    amqp_publish(
        exchange=email or 'mist',
        queue='update',
        routing_key='list_machines',
        data={'backend_id': backend_id, 'machines': machines},
    )
