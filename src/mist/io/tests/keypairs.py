from MyRequestsClass import MyRequests
import json


def add_key(uri, name, private, cookie=None, csrf=None):
    payload = {
        'id': name,
        'priv': private
    }
    req = MyRequests(uri=uri+"/keys", cookie=cookie, data=json.dumps(payload),
                     csrf=csrf)
    response = req.put()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        assert False, u'Exception: %s' %e


def edit_key(uri, key_id, new_name, cookie=None, csrf=None):
    payload = {
        'new_id': new_name
    }
    req = MyRequests(uri=uri+"/keys/" + key_id,  data=json.dumps(payload),
                     cookie=cookie, csrf=csrf)
    response = req.put()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)


def list_keys(uri, cookie=None, csrf=None):
    req = MyRequests(uri=uri+"/keys", cookie=cookie, csrf=csrf)
    response = req.get()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        assert False, u'Exception: %s' %e


def delete_key(uri, key_id, cookie=None, csrf=None):
    req = MyRequests(uri=uri+"/keys/"+key_id, cookie=cookie, csrf=csrf)
    response = req.delete()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        print "Deleted Key: %s" % key_id
        return params
    except Exception as e:
        assert False, u'Exception: %s' %e


def generate_keypair(uri, cookie=None, csrf=None):
    req = MyRequests(uri=uri+"/keys", cookie=cookie, csrf=csrf)
    response = req.post()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        print params
        return params
    except Exception as e:
        assert False, u'Exception: %s' %e


def get_private_key(uri, key_id, cookie=None, csrf=None):
    req = MyRequests(uri=uri+"/keys/"+key_id+"/private", cookie=cookie,
                     csrf=csrf)
    response = req.get()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        print response.text
        assert False, u'Exception: %s' %e


def get_public_key(uri, key_id, cookie=None, csrf=None):
    req = MyRequests(uri=uri+"/keys/"+key_id+"/public", cookie=cookie,
                     csrf=csrf)
    response = req.get()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        print response.text
        assert False, u'Exception: %s' % e
