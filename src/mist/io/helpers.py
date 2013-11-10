"""Helper functions used in views and WSGI initialization"""

import os
import tempfile
import logging
from hashlib import sha1
from contextlib import contextmanager


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
