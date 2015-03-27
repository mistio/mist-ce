"""Helper functions used in views and WSGI initialization"""

import os
import re
import sys
import time
import json
import random
import tempfile
import logging
import functools
from hashlib import sha1
from contextlib import contextmanager

from amqp import Message
from amqp.connection import Connection
from amqp.exceptions import NotFound as AmqpNotFound

from mist.io.model import User

try:
    from mist.core import config
except ImportError:
    from mist.io import config

import logging
logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)


@contextmanager
def get_temp_file(content):
    """Creates a temporary file on disk and saves 'content' in it.

    It is meant to be used like this:
    with get_temp_file(my_string) as filepath:
        do_stuff(filepath)

    Once the with block is exited, the file is always deleted, even if an
    exception has been rised.

    """
    (tmp_fd, tmp_path) = tempfile.mkstemp()
    f = os.fdopen(tmp_fd, 'w+b')
    f.write(content)
    f.close()
    try:
        yield tmp_path
    finally:
        try:
            os.remove(tmp_path)
        except:
            pass


def params_from_request(request):
    """Get the parameters dict from request.

    Searches if there is a json payload or http parameters and returns
    the dict.

    """
    try:
        params = request.json_body
    except:
        params = request.params
    return params


def user_from_request(request):
    return User()


def user_from_email(email):
    return User()


def b58_encode(num):
    """Returns num in a base58-encoded string."""
    alphabet = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
    base_count = len(alphabet)
    encode = ''
    if (num < 0):
        return ''
    while (num >= base_count):
        mod = num % base_count
        encode = alphabet[mod] + encode
        num = num / base_count
    if (num):
        encode = alphabet[num] + encode
    return encode


def get_auth_header(user):
    """The value created here is added as an "Authorization" header in HTTP
    requests towards the hosted mist core service.
    """
    return "mist_1 %s:%s" % (user.email, user.mist_api_token)


def parse_ping(stdout):
    """Parse ping's stdout and return dict of extracted metrics."""
    re_header = "^--- (.*) ping statistics ---$"
    re_packets = "^([\d]+) packets transmitted, ([\d]+)"
    re_rtt = ".*min/avg/max/[a-z]* = ([\d]+\.[\d]+)/([\d]+\.[\d]+)/([\d]+\.[\d]+)"
    lines = stdout.split("\n")
    for i in range(len(lines) - 2):
        line = lines[i]
        # match statistics header line
        match = re.match(re_header, line)
        if match is None:
            continue
        host = match.groups()[0]
        # match packets statistics line
        line = lines[i + 1]
        match = re.match(re_packets, line)
        if match is None:
            break
        packets_tx = int(match.groups()[0])
        packets_rx = int(match.groups()[1])
        packets_loss = float(packets_tx - packets_rx) / packets_tx
        # match rtt statistics line
        line = lines[i + 2]
        match = re.match(re_rtt, line)
        if match is None:
            break
        rtt_min = float(match.groups()[0])
        rtt_avg = float(match.groups()[1])
        rtt_max = float(match.groups()[2])
        return {
            ## "host": host,
            "packets_tx": packets_tx,
            "packets_rx": packets_rx,
            "packets_loss": packets_loss,
            "rtt_min": rtt_min,
            "rtt_avg": rtt_avg,
            "rtt_max": rtt_max,
        }
    # parsing failed. good job..
    log.error("Ping parsing failed for stdout '%s'", stdout)
    return {}


def amqp_publish(exchange, routing_key, data,
                 ex_type='fanout', ex_declare=False):
    connection = Connection()
    channel = connection.channel()
    if ex_declare:
        channel.exchange_declare(exchange=exchange, type=ex_type)
    msg = Message(json.dumps(data))
    channel.basic_publish(msg, exchange=exchange, routing_key=routing_key)
    channel.close()
    connection.close()


def amqp_subscribe(exchange, callback, queue='',
                   ex_type='fanout', routing_keys=None):
    def json_parse_dec(func):
        @functools.wraps(func)
        def wrapped(msg):
            try:
                msg.body = json.loads(msg.body)
            except:
                pass
            return func(msg)
        return wrapped

    connection = Connection()
    channel = connection.channel()
    channel.exchange_declare(exchange=exchange, type=ex_type)
    resp = channel.queue_declare(queue, exclusive=True)
    if not routing_keys:
        channel.queue_bind(resp.queue, exchange)
    else:
        for routing_key in routing_keys:
            channel.queue_bind(resp.queue, exchange, routing_key=routing_key)
    channel.basic_consume(queue=queue,
                          callback=json_parse_dec(callback),
                          no_ack=True)
    try:
        while True:
            channel.wait()
    except BaseException as exc:
        # catch BaseException so that it catches KeyboardInterrupt
        channel.close()
        connection.close()
        amqp_log("SUBSCRIPTION ENDED: %s %s %r" % (exchange, queue, exc))


def _amqp_user_exchange(user):
    # The exchange/queue name consists of a non-empty sequence of these
    # characters: letters, digits, hyphen, underscore, period, or colon.
    if isinstance(user, basestring):
        email = user
    else:
        email = user.email
    tag = email.replace('@', ':') or 'noone'
    return "mist-user_%s" % tag


def amqp_publish_user(user, routing_key, data):
    try:
        amqp_publish(_amqp_user_exchange(user), routing_key, data)
    except AmqpNotFound:
        return False
    except Exception:
        return False
    return True


def amqp_subscribe_user(user, queue, callback):
    amqp_subscribe(_amqp_user_exchange(user), callback, queue)


def amqp_user_listening(user):
    connection = Connection()
    channel = connection.channel()
    try:
        channel.exchange_declare(exchange=_amqp_user_exchange(user),
                                 type='fanout', passive=True)
    except AmqpNotFound:
        return False
    else:
        return True
    finally:
        channel.close()
        connection.close()


def trigger_session_update(email, sections=['clouds','keys','monitoring']):
    amqp_publish_user(email, routing_key='update', data=sections)


def amqp_log(msg):
    msg = "[%s] %s" % (time.strftime("%Y-%m-%d %H:%M:%S %Z"), msg)
    try:
        amqp_publish('mist_debug', '', msg)
    except:
        pass


def amqp_log_listen():
    def echo(msg):
        ## print msg.delivery_info.get('routing_key')
        print msg.body

    amqp_subscribe('mist_debug', echo)


class StdStreamCapture(object):
    def __init__(self, stdout=True, stderr=True, func=None, pass_through=True):
        """Starts to capture sys.stdout/sys.stderr"""
        self.func = func
        self.pass_through = pass_through
        self.buff = []
        self.streams = {}
        if stdout:
            self.streams['stdout'] = sys.stdout
        if stderr:
            self.streams['stderr'] = sys.stderr

        class Stream(object):
            def __init__(self, name):
                self.name = name

            def write(_self, text):
                self._write(_self.name, text)

        for name in self.streams:
            setattr(sys, name, Stream(name))

    def _write(self, name, text):
        self.buff.append((name, text))
        if self.pass_through:
            self.streams[name].write(text)
        if self.func is not None:
            self.func(name, text)

    def _get_capture(self, names=('stdout', 'stderr')):
        buff = ""
        for name, text in self.buff:
            if name in names:
                buff += text
        return buff

    def get_stdout(self):
        return self._get_capture(['stdout'])

    def get_stderr(self):
        return self._get_capture(['stderr'])

    def get_mux(self):
        return self._get_capture()

    def close(self):
        for name in self.streams:
            setattr(sys, name, self.streams[name])
        return self.get_mux()
