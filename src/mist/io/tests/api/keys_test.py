import json
import requests

from mist.io.tests.api.helpers import *


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


def test_004_add_key_with_wrong_private(pretty_print, cache, mist_io,
                                        private_key):
    response = mist_io.add_key(id=cache.get('keys_tests/key_id', ''),
                               private=private_key[:-40]).put()
    assert response.status_code == requests.codes.bad_request, response.content
    print "Success!!!"


def test_005_add_key(pretty_print, cache, mist_io, private_key):
    response = mist_io.add_key(id=cache.get('keys_tests/key_id', ''),
                               private=private_key).put()
    assert response.status_code == requests.codes.ok, response.content
    response = mist_io.list_keys().get()
    assert response.status_code == requests.codes.ok, response.content
    keys = get_keys_with_id(cache.get('keys_tests/key_id', ''),
                            json.loads(response.content))
    assert len(keys) > 0, "Key was added through the api but is not " \
                          "visible in the list of keys"
    print "Success!!!"


def test_006_add_key_with_duplicate_id(pretty_print, cache, mist_io,
                                       private_key):
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
    keys = get_keys_with_id(new_key_id,
                            json.loads(response.content))
    assert len(keys) > 0, "Key was added through the api but is not " \
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


def test_010_get_private_key(pretty_print, cache, mist_io, private_key):
    response = mist_io.get_private_key(cache.get('keys_tests/key_id', '')).get()
    assert response.status_code == requests.codes.ok, response.content
    assert private_key == json.loads(response.content), response.content
    print "Success!!!"


def test_011_get_private_key_with_wrong_id(pretty_print, cache, mist_io):
    response = mist_io.get_private_key(
        cache.get('keys_tests/key_id', '')[:-2]).get()
    assert response.status_code == requests.codes.not_found, response.content
    print "Success!!!"


def test_012_get_public_key(pretty_print, cache, mist_io, public_key):
    response = mist_io.get_public_key(cache.get('keys_tests/key_id', '')).get()
    assert response.status_code == requests.codes.ok, response.content
    assert public_key == json.loads(response.content), response.content
    print "Success!!!"


def test_013_get_public_key_with_wrong_id(pretty_print, cache, mist_io):
    response = mist_io.get_public_key(
        cache.get('keys_tests/key_id', '')[:-2]).get()
    assert response.status_code == requests.codes.not_found, response.content
    print "Success!!!"


def test_014_add_second_key_and_set_default(pretty_print, cache, mist_io,
                                            private_key):
    response = mist_io.list_keys().get()
    assert response.status_code == requests.codes.ok, response.content
    keys_list = json.loads(response.content)
    cache.set('keys_tests/other_key_id', get_random_key_id(keys_list))
    response = mist_io.add_key(id=cache.get('keys_tests/other_key_id', ''),
                               private=private_key).put()
    assert response.status_code == requests.codes.ok, response.content
    response = mist_io.list_keys().get()
    assert response.status_code == requests.codes.ok, response.content
    keys = get_keys_with_id(cache.get('keys_tests/other_key_id', ''),
                            json.loads(response.content))
    assert len(keys) > 0, "Key was added through the api but is not " \
                          "visible in the list of keys"
    response = mist_io.set_default_key(
        key_id=cache.get('keys_tests/other_key_id', '')).post()
    assert response.status_code == requests.codes.ok, response.content
    response = mist_io.list_keys().get()
    assert response.status_code == requests.codes.ok, response.content
    keys = get_keys_with_id(cache.get('keys_tests/other_key_id', ''),
                            json.loads(response.content))
    assert len(keys) > 0, "Key was added through the api but is not " \
                          "visible in the list of keys"
    assert keys[0]['isDefault'], 'Key is not default'
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


def test_021_delete_multiple_keys(pretty_print, mist_io, private_key):
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
        keys = get_keys_with_id(new_key_id, json.loads(response.content))
        assert len(keys) > 0, \
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
