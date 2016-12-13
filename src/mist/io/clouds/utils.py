import logging
import json
import ssl

from libcloud.common.types import LibcloudError, InvalidCredsError, MalformedResponseError
from libcloud.common.exceptions import BaseHTTPError, RateLimitReachedError
import mist.io.exceptions


log = logging.getLogger(__name__)


def tags_to_dict(tags):
    """Return a dict with each key/value tag being a dict item

    This will handle:
    - dict {key1: value1, key2: value2, ...}
    - lists of {key: value} pairs
    - lists of {"key": key, "value": value} pairs, value field is optional

    It will return:
    dict {key1: value1, key2: value2, ...}

    """

    if isinstance(tags, dict):
        return tags
    tdict = {}
    for tag in tags:
        if isinstance(tag, dict):
            if len(tag) == 1:
                key = tag.keys()[0]
                tdict[tag] = tag[key]
            elif 'key' in tag:
                tdict[tag['key']] = tag.get('value')
    return tdict


def fix_dict_encoding(dictionary):
    for key, val in dictionary.iteritems():
        try:
            json.dumps(val)
        except TypeError:
            dictionary[key] = str(val)
    return dictionary


class LibcloudExceptionHandler(object):
    def __init__(self, exception_class):
        self.exception_class = exception_class

    def __call__(self, func, *args, **kwargs):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except InvalidCredsError as exc:
                log.error("Invalid creds on running %: %s", func.__name__, exc)
                raise mist.io.exceptions.CloudUnauthorizedError(exc=exc, msg=exc.message)
            except ssl.SSLError as exc:
                log.error("SSLError on running %s: %s", func.__name__, exc)
                raise mist.io.exceptions.CloudUnavailableError(exc=exc, msg=exc.message)
            except MalformedResponseError as exc:
                log.error("MalformedResponseError on running %s: %s", exc)
                raise mist.io.exceptions.MalformedResponseError(exc=exc, msg=exc.message)
            except RateLimitReachedError as exc:
                log.error("Rate limit error on running %s: %s", func.__name__, exc)
                raise mist.io.exceptions.RateLimitError(exc=exc, msg=exc.message)
            except BaseHTTPError as exc:  # Libcloud errors caused by invalid parameters are raised as this type
                log.error("Bad request on running %s: %s", func.__name__, exc)
                raise mist.io.exceptions.BadRequestError(exc=exc, msg=exc.message)
            except LibcloudError as exc:
                log.error("Error on running %s: %s", func.__name__, exc)
                raise self.exception_class(exc=exc, msg=exc.message)

        return wrapper