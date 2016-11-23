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

