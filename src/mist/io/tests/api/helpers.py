import string
import random


def get_keys_with_id(id, keys):
    return filter(lambda x: x['id'] == id, keys)


def get_random_key_id(existing_keys):
    while True:
        random_key_id = ''.join([random.choice(string.ascii_letters +
                                               string.digits) for _ in
                                 range(6)])
        keys = get_keys_with_id(random_key_id, existing_keys)
        if len(keys) == 0:
            return random_key_id
