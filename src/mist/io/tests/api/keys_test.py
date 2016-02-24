import json
import string
import random
import requests

private_key = "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA8tENh4L7Pkz2AlGDNSPAjyLiF8q11QsDdT6iUTp+3xf35aaA\najEPkA7ri05zvtFbBe3f/Ezlz6PvPIgby9dpNjo7icV5ITe56Ryc2IBdN4kczEX3\n7X5Q4tpadp6iZale5iFVQ7ib4KatKg3iXqs29p7U6oY29Sk5UtYHPwjxRIuBuJed\nK49O/kJZ6joQ0531Tks+tsfso6Kw2Tl2bVAt5hkUa3sMdrnd/pnhb2qyRu6YoH7w\ndCQ6EOFR9vSMQpb4abeh1ZRomRZNKFj/lQSIyyDGCw78HHiT6wRZARgURUicJO+I\nVrEJXpSxMy460M6/XFEQl1NY+EvMmVkfANuYDwIDAQABAoIBAQC9JjSP12y3/2O0\nMqMvBga+ecH+Hp6+srGi54OyGwsx5o3pi2aFUmp5IeZCwn5Pqu5pFABjndN3iJCY\nar6cb9U5tOskS3wscCiWev+Dd5sl491XEzoq+zcvQEEwHisLXoDabCTreCeVPMGv\n/NjWPjG2s8vQVXUCTXamHKvQYrrvVOjc4QSZXl+1u+rExa2WSy3/2bRs+pa/p7Zf\nJiZ6Hm2RChG9TkReL84k5xFi+w4wy5y898Oh0aCCUopUCdeqq7FyRx98FvQgZwIk\nv4WTZgh614QaIS8+wLN+Kt4/QDOFeYgTGSOsll73X2ItjI7eWA/GB6i1d887VhuH\nAhdTEQSBAoGBAP25O63bnbJ7uGS8xsWDuuanr4im25FxDtfk41ESkUwLoSwuuusQ\n+qaIiCZ1YAWq8I9AGfI/ueoER8bohmzj76uKoWhrhraLnMH61nvE1PWjLWca5Wqj\nDIQ2OCEaQUeLGtWF2MyqbSAGH4WQGB/9royonp7FWbGubfAFOTRLhZBRAoGBAPT+\nxJwo9MuQvefGfZJ1NgP8He0bnzwTjjiYuqX3A0gST8b7+7beA4MtMUpH3UwXUd8N\nIZ1/TjMlWyjcEFAWhzobeoFdvugcs//6AzxAc8rpsNLik6DCQL6ynp/fJQMOURcX\nRSdGexffDhWwXv5OyeDBLcmWmdphaHKquM6fEepfAoGAcSapich2VIG+YxaZIr6z\nnGfN7YhURVGBSCDoi2BXce2BzD1u2KQy1A/xgA06bGymaYwxxgpLdCTCid9rC6a/\nXOYvQ20on8I1f4DJJFtMidtixSeGhn7+dvvjHkgiMrDDn9PYMrYSgoSYjC0NxT6S\nGGKekrn6XTYoCzGZKExB3XECgYAkIWJbaUrYrorjIImqTLDfm5HKQvWTxYqG3DdC\nfJA2U8UCIm03xbwc31BSlRCUxSekzmnzsS+WKV8tQm8BcKEWt7C0XV/nGTyOdo99\nlj+9YANcxl9hKOSlevAbwavSrIzW6+6d4S4MEjAgkLchp/rrs3GONjCQXScrKfRB\nPIJG3wKBgFH7BU7zThi0zyF/xSQw0wyztNZ8tW0c0Yp4EosI3uJJjW/zP3VLG9Fq\nRbVeFEdpF/E1lddB3+OAPpIbl2dXOG8PuxKJ+yp0FE4gSM2LrTT9ygenYEqLXwYW\n3fApCDmAfDDS5kOSO1rTT9vxVelVTPgkLrTSh7ebfOQkvygtl2CP\n-----END RSA PRIVATE KEY-----"

public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDy0Q2Hgvs+TPYCUYM1I8CPIuIXyrXVCwN1PqJROn7fF/flpoBqMQ+QDuuLTnO+0VsF7d/8TOXPo+88iBvL12k2OjuJxXkhN7npHJzYgF03iRzMRfftflDi2lp2nqJlqV7mIVVDuJvgpq0qDeJeqzb2ntTqhjb1KTlS1gc/CPFEi4G4l50rj07+QlnqOhDTnfVOSz62x+yjorDZOXZtUC3mGRRrewx2ud3+meFvarJG7pigfvB0JDoQ4VH29IxClvhpt6HVlGiZFk0oWP+VBIjLIMYLDvwceJPrBFkBGBRFSJwk74hWsQlelLEzLjrQzr9cURCXU1j4S8yZWR8A25gP"


def get_keys_with_id(id, keys):
    return filter(lambda x: x['id'] == id, keys)


def get_random_key_id(existing_keys):
    while True:
        random_key_id = ''.join([random.choice(string.ascii_letters +
                                               string.digits) for _ in
                                 range(6)])
        scripts = get_keys_with_id(random_key_id, existing_keys)
        if len(scripts) == 0:
            return random_key_id


def test_001_list_keys(pretty_print, mist_io):
    response = mist_io.list_keys().get()
    assert response.status_code == requests.codes.ok, response.content
    print response.content
    print "Success!!!"


def test_002_add_key_with_no_id_and_no_priv(pretty_print, mist_io):
    response = mist_io.add_key(id='', private='').put()
    assert response.status_code == requests.codes.bad_request
    print "Success!!!"


def test_003_add_key_with_no_private(pretty_print, cache, mist_io):
    response = mist_io.list_keys().get()
    assert response.status_code == requests.codes.ok, response.content
    keys_list = json.loads(response.content)
    cache.set('keys_tests/key_id', get_random_key_id(keys_list))
    response = mist_io.add_key(id=cache.get('keys_tests/key_id', ''),
                               private='').put()
    assert response.status_code == requests.codes.bad_request, response.content
    print "Success!!!"


def test_004_add_key_with_wrong_private(pretty_print, cache, mist_io):
    response = mist_io.add_key(id=cache.get('keys_tests/key_id', ''),
                               private=private_key[:-40]).put()
    assert response.status_code == requests.codes.bad_request, response.content
    print "Success!!!"


def test_005_add_key(pretty_print, cache, mist_io):
    response = mist_io.add_key(id=cache.get('keys_tests/key_id', ''),
                               private=private_key).put()
    assert response.status_code == requests.codes.ok, response.content
    response = mist_io.list_keys().get()
    assert response.status_code == requests.codes.ok, response.content
    script = get_keys_with_id(cache.get('keys_tests/key_id', ''),
                                json.loads(response.content))
    assert len(script) > 0, "Key was added through the api but is not " \
                            "visible in the list of keys"
    print "Success!!!"


def test_006_add_key_with_duplicate_id(pretty_print, cache, mist_io):
    response = mist_io.add_key(id=cache.get('keys_tests/key_id', ''),
                               private=private_key).put()
    assert response.status_code == requests.codes.conflict, response.content
    print "Success!!!"


def test_007_edit_key(pretty_print, cache, mist_io):
    response = mist_io.list_keys().get()
    assert response.status_code == requests.codes.ok, response.content
    new_key_id = get_random_key_id(json.loads(response.content))
    response = mist_io.edit_key(id=cache.get('keys_tests/key_id', ''),
                                new_id=new_key_id).put()
    assert response.status_code == requests.codes.ok, response.content
    response = mist_io.list_keys().get()
    assert response.status_code == requests.codes.ok, response.content
    script = get_keys_with_id(new_key_id,
                                json.loads(response.content))
    assert len(script) > 0, "Key was added through the api but is not " \
                            "visible in the list of keys"
    cache.set('keys_tests/key_id', new_key_id)
    print "Success!!!"


def test_008_edit_key_with_no_new_id(pretty_print, cache, mist_io):
    response = mist_io.edit_key(id=cache.get('keys_tests/key_id', ''),
                                new_id='').put()
    assert response.status_code == requests.codes.bad_request, response.content
    print "Success!!!"


def test_009_edit_key_with_same_id(pretty_print, cache, mist_io):
    key_id = cache.get('keys_tests/key_id', '')
    response = mist_io.edit_key(id=key_id,
                                new_id=key_id).put()
    assert response.status_code == requests.codes.ok, response.content
    print "Success!!!"


def test_010_get_private_key(pretty_print, cache, mist_io):
    response = mist_io.get_private_key(cache.get('keys_tests/key_id', '')).get()
    assert response.status_code == requests.codes.ok, response.content
    assert private_key == json.loads(response.content), response.content
    print "Success!!!"


def test_011_get_private_key_with_wrong_id(pretty_print, cache, mist_io):
    response = mist_io.get_private_key(
        cache.get('keys_tests/key_id', '')[:-2]).get()
    assert response.status_code == requests.codes.not_found, response.content
    print "Success!!!"


def test_012_get_public_key(pretty_print, cache, mist_io):
    response = mist_io.get_public_key(cache.get('keys_tests/key_id', '')).get()
    assert response.status_code == requests.codes.ok, response.content
    assert public_key == json.loads(response.content), response.content
    print "Success!!!"


def test_013_get_public_key_with_wrong_id(pretty_print, cache, mist_io):
    response = mist_io.get_public_key(
        cache.get('keys_tests/key_id', '')[:-2]).get()
    assert response.status_code == requests.codes.not_found, response.content
    print "Success!!!"


def test_014_add_second_key_and_set_default(pretty_print, cache, mist_io):
    response = mist_io.list_keys().get()
    assert response.status_code == requests.codes.ok, response.content
    keys_list = json.loads(response.content)
    cache.set('keys_tests/other_key_id', get_random_key_id(keys_list))
    response = mist_io.add_key(id=cache.get('keys_tests/other_key_id', ''),
                               private=private_key).put()
    assert response.status_code == requests.codes.ok, response.content
    response = mist_io.list_keys().get()
    assert response.status_code == requests.codes.ok, response.content
    script = get_keys_with_id(cache.get('keys_tests/other_key_id', ''),
                                json.loads(response.content))
    assert len(script) > 0, "Key was added through the api but is not " \
                            "visible in the list of keys"
    response = mist_io.set_default_key(
        key_id=cache.get('keys_tests/other_key_id', '')).post()
    assert response.status_code == requests.codes.ok, response.content
    response = mist_io.list_keys().get()
    assert response.status_code == requests.codes.ok, response.content
    script = get_keys_with_id(cache.get('keys_tests/other_key_id', ''),
                                json.loads(response.content))
    assert len(script) > 0, "Key was added through the api but is not " \
                            "visible in the list of keys"
    assert script[0]['isDefault'], 'Key is not default'
    print "Success!!!"


def test_015_set_default_key_with_wrong_key_id(pretty_print, cache, mist_io):
    response = mist_io.set_default_key(
        key_id=cache.get('keys_tests/other_key_id', '')[:-2]).post()
    assert response.status_code == requests.codes.not_found, response.content
    print "Success!!!"


def test_016_test_generate_keypair(pretty_print, mist_io):
    response = mist_io.generate_keypair().post()
    assert response.status_code == requests.codes.ok, response.content
    print "Success!!!"


def test_017_delete_key(pretty_print, cache, mist_io):
    response = mist_io.delete_key(
        key_id=cache.get('keys_tests/key_id', '')).delete()
    assert response.status_code == requests.codes.ok, response.content
    response = mist_io.delete_key(
        key_id=cache.get('keys_tests/other_key_id', '')).delete()
    assert response.status_code == requests.codes.ok, response.content
    print "Success!!!"


def test_018_delete_key(pretty_print, cache, mist_io):
    response = mist_io.delete_key(
        key_id=cache.get('keys_tests/other_key_id', '')[:-2]).delete()
    assert response.status_code == requests.codes.not_found, response.content
    print "Success!!!"


def test_019_delete_multiple_keys_with_no_key_ids(pretty_print, mist_io):
    response = mist_io.delete_keys(key_ids=[]).delete()
    assert response.status_code == requests.codes.bad_request, response.content
    print "Success!!!"


def test_020_delete_multiple_wrong_key_ids(pretty_print, cache, mist_io):
    response = mist_io.delete_keys(key_ids=['bla', 'bla2']).delete()
    assert response.status_code == requests.codes.not_found, response.content
    print "Success!!!"


def test_021_delete_multiple_keys(pretty_print, mist_io):
    key_ids = []
    # add 3 more keys and then delete them
    for i in range(3):
        response = mist_io.list_keys().get()
        assert response.status_code == requests.codes.ok, response.content
        new_key_id = get_random_key_id(json.loads(response.content))
        response = mist_io.add_key(id=new_key_id, private=private_key).put()
        assert response.status_code == requests.codes.ok, response.content
        response = mist_io.list_keys().get()
        assert response.status_code == requests.codes.ok, response.content
        script = get_keys_with_id(new_key_id, json.loads(response.content))
        assert len(script) > 0, \
            "Key was added but is not visible in the list of keys"
        key_ids.append(new_key_id)

    key_ids.append('bla')
    key_ids.append('bla2')

    response = mist_io.delete_keys(key_ids=key_ids).delete()
    assert response.status_code == requests.codes.ok, response.content
    report = json.loads(response.content)
    for key_id in key_ids:
        if 'bla' not in key_id:
            assert report.get(key_id, '') == 'deleted', report
        if 'bla' in key_id:
            assert report.get(key_id, '') == 'not_found', report

    print "Success!!!"
