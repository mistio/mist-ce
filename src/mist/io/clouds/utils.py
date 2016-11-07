import logging


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


def rename_kwargs(kwargs, old_key, new_key):
    """Given a `kwargs` dict rename `old_key` to `new_key`"""
    if old_key in kwargs:
        if new_key not in kwargs:
            log.warning("Got param '%s' when expecting '%s', trasforming.",
                        old_key, new_key)
            kwargs[new_key] = kwargs.pop(old_key)
        else:
            log.warning("Got both param '%s' and '%s', will not tranform.",
                        old_key, new_key)
