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

from mist.io.helpers import amqp_publish_user
from mist.io.helpers import amqp_log

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

    id_str = ":".join((email, 'probe', backend_id, machine_id,
                       host, key_id, ssh_user))
    cache = MemcacheClient(["127.0.0.1:11211"])
    cache_key = b64encode(id_str)
    cached = cache.get(cache_key)
    if cached:
        age = time() - cached['timestamp']
        data = cached['payload']
        if age < 90:
            # emit cached result
            amqp_log("%s: emitting cached result - age = %.1f" % (id_str, age))
            ok = amqp_publish_user(email, routing_key='probe', data=data)
            if not ok:
                amqp_log("%s: exchange closed, stopping scheduling" % id_str)
            return

    user = user_from_email(email)
    from mist.io import methods
    try:
        res = methods.probe(user, backend_id, machine_id, host,
                            key_id=key_id, ssh_user=ssh_user)
    except Exception as e:
        amqp_log("%s: %r" % (id_str, repr(e)))
        return

    data = {'backend_id': backend_id,
           'machine_id': machine_id,
           'host': host,
           'result': res}



    ok = amqp_publish_user(user, routing_key='probe', data=data)
    if not ok:
        amqp_log("%s: exchange closed, stopping scheduling" % id_str)
        return

    cached = {'timestamp': time(), 'payload': data}
    cache.set(cache_key, cached)

    amqp_log("%s: will rerun in 120 secs" % id_str)
    args = (email, backend_id, machine_id, host, key_id, ssh_user)
    probe.apply_async(args, countdown=120)


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
    amqp_publish_user(user, routing_key='list_sizes',
                      data={'backend_id': backend_id, 'sizes': sizes})


@app.task
def list_locations(email, backend_id):
    from mist.io import methods
    user = user_from_email(email)
    locations = methods.list_locations(user, backend_id)
    amqp_publish_user(user, routing_key='list_locations',
                      data={'backend_id': backend_id, 'locations': locations})


@app.task
def list_images(email, backend_id):
    from mist.io import methods
    user = user_from_email(email)
    images = methods.list_images(user, backend_id)
    amqp_publish_user(user, routing_key='list_images',
                      data={'backend_id': backend_id, 'images': images})


@app.task
def list_machines(email, backend_id, repeat=False):
    id_str = ":".join((email, 'list_machines', backend_id))
    cache = MemcacheClient(["127.0.0.1:11211"])
    cache_key = b64encode(id_str)
    rescheduled = False
    if not repeat:
        cached = cache.get(cache_key)
        if cached:
            age = time() - cached['timestamp']
            rescheduled = cached['rescheduled']
            if age < 20:
                # emit cached result
                amqp_log("%s: cache hit - age = %.1fsecs" % (id_str, age))
                ok = amqp_publish_user(email, routing_key='list_machines',
                                       data=cached['payload'])
                if not ok:
                    amqp_log("%s: exchange closed" % id_str)
                return

    from mist.io import methods
    user = user_from_email(email)
    machines = methods.list_machines(user, backend_id)
    timestamp = time()
    data = {'backend_id': backend_id, 'machines': machines}
    cached = {'timestamp': timestamp, 'payload': data, 'rescheduled': False}
    ok = amqp_publish_user(user, routing_key='list_machines', data=data)
    repeat = ok and (repeat or not rescheduled)
    if repeat:
        cached['rescheduled'] = True
    cache.set(cache_key, cached)
    if repeat:
        amqp_log("%s: will rerun in 10 secs" % id_str)
        list_machines.apply_async((email, backend_id), {'repeat': True},
                                   countdown=10)
