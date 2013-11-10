import requests
import json


def add_key(uri, name, private):
    payload = {
        'name': name,
        'priv': private
    }
    response = requests.put(uri+"/keys", data=json.dumps(payload))
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        assert False, u'Exception: %s' %e


def edit_key(uri, key_id, new_name):
    payload = {
        'key':key_id,
        'newName': new_name
    }
    response = requests.put(uri+"/keys/" + key_id,  data=json.dumps(payload))
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)


def list_keys(uri):
    response = requests.get(uri+"/keys")
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        assert False, u'Exception: %s' %e


def delete_key(uri, key_id):
    response = requests.delete(uri+"/keys/"+key_id)
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        print "Deleted Key: %s" % key_id
        return params
    except Exception as e:
        assert False, u'Exception: %s' %e


def generate_keypair(uri):
    response = requests.post(uri+"/keys")
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        print params
        return params
    except Exception as e:
        assert False, u'Exception: %s' %e


def get_private_key(uri, key_id):
    payload = {
        'action': 'private',
        'key': key_id
    }
    response = requests.get(uri+"/#/keys/"+key_id, data=payload)
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        print response.text
        assert False, u'Exception: %s' %e


def get_public_key(uri, key_id):
    payload = {
        'action': 'public',
        'key': key_id
    }
    response = requests.get(uri+"/#/keys/"+key_id, data=payload)
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        print response.text
        assert False, u'Exception: %s' %e