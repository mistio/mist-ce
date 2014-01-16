"""Helper functions used in views and WSGI initialization"""

import os
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
