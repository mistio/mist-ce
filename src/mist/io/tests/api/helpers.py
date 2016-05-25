import string
import random


def get_keys_with_name(name, keys):
    return filter(lambda x: x['name'] == name, keys)


def get_random_key_name(existing_keys):
    while True:
        random_key_name = ''.join([random.choice(string.ascii_letters +
                                               string.digits) for _ in
                                 range(6)])
        keys = get_keys_with_name(random_key_name, existing_keys)
        if len(keys) == 0:
            return random_key_name
