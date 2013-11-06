"""Helper functions used in views and WSGI initialization"""
import os
import tempfile
import logging
from time import time
from hashlib import sha1
from contextlib import contextmanager

from pyramid.response import Response

from libcloud.compute.types import Provider
from libcloud.compute.providers import get_driver

from mist.io.config import COMMAND_TIMEOUT

# add curl ca-bundle default path to prevent libcloud certificate error
import libcloud.security
libcloud.security.CA_CERTS_PATH.append('/usr/share/curl/ca-bundle.crt')


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


def generate_backend_id(provider, region, apikey):
    i = int(sha1('%s%s%s' % (provider, region, apikey)).hexdigest(), 16)
    return b58_encode(i)


alphabet = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
base_count = len(alphabet)

def b58_encode(num):
    """Returns num in a base58-encoded string."""
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


def b58_decode(s):
    """Decodes the base58-encoded string s into an integer."""
    decoded = 0
    multi = 1
    s = s[::-1]
    for char in s:
        decoded += multi * alphabet.index(char)
        multi = multi * base_count

    return decoded

