"""Helper functions used in views and WSGI initialization"""

import os
import re
import tempfile
import logging
from hashlib import sha1
from contextlib import contextmanager


from mist.io.model import User


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


def core_wrapper(func):
    """Dummy decorator for compatibility with core."""
    def wrapped_func(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapped_func


def user_from_request(request):
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
