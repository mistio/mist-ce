from MyRequestsClass import MyRequests
import json


def add_key(uri, name, private, cookie=None):
    payload = {
        'name': name,
        'priv': private
    }
    req = MyRequests(uri=uri+"/keys", cookie=cookie, data=json.dumps(payload))
    response = req.put()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        assert False, u'Exception: %s' %e


def edit_key(uri, key_id, new_name, cookie=None):
    payload = {
        'key':key_id,
        'newName': new_name
    }
    req = MyRequests(uri=uri+"/keys/" + key_id,  data=json.dumps(payload), cookie=cookie)
    response = req.put()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)


def list_keys(uri, cookie=None):
    req = MyRequests(uri=uri+"/keys", cookie=cookie)
    response = req.get()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        assert False, u'Exception: %s' %e


def delete_key(uri, key_id, cookie=None):
    req = MyRequests(uri=uri+"/keys/"+key_id, cookie=cookie)
    response = req.delete()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        print "Deleted Key: %s" % key_id
        return params
    except Exception as e:
        assert False, u'Exception: %s' %e


def generate_keypair(uri, cookie=None):
    req = MyRequests(uri=uri+"/keys", cookie=cookie)
    response = req.post()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        print params
        return params
    except Exception as e:
        assert False, u'Exception: %s' %e


def get_private_key(uri, key_id, cookie=None):
    req = MyRequests(uri=uri+"/keys/"+key_id+"?action=private", cookie=cookie)
    response = req.get()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        print response.text
        assert False, u'Exception: %s' %e


def get_public_key(uri, key_id, cookie=None):
    req = MyRequests(uri=uri+"/keys/"+key_id+"?action=public", cookie=cookie)
    response = req.get()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        print response.text
        assert False, u'Exception: %s' %e
