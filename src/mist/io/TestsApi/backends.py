import requests
import json


def list_backends(uri):
    response = requests.get(uri + '/backends')
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        assert False, u'Exception: %s' %e


def supported_providers(uri):
    response = requests.get(uri+'/providers')
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
    except Exception as e:
        assert False, u'Exception: %s' %e

    SUPPORTED_PROVIDERS = params['supported_providers']
    print '\nSupported providers:'
    return SUPPORTED_PROVIDERS


def add_backend(uri, title, provider, apikey, apisecret, apiurl=None, tenant_name=None,):
    payload = {
        'title': title,
        'provider': provider,
        'apikey': apikey,
        'apisecret': apisecret,
        'apiurl': apiurl,
        'tenant_name': tenant_name
    }

    response = requests.post(uri+'/backends', data=json.dumps(payload))
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        assert False, u'Exception: %s' % e


def delete_backend(uri, backend_id):
    response = requests.delete(uri+'/backends/'+backend_id)
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    print "Deleted Backend with id: %s" % backend_id


def list_images(uri, backend_id, search_term = None):
    payload = {
        'search_term':search_term
    }
    if not search_term:
        response = requests.post(uri+"/backends/"+backend_id+"/images")
    else:
        response = requests.get(uri+"/backends/"+backend_id+"/images", data=json.dumps(payload))
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        assert False, u'Exception: %s' % e


def list_sizes(uri, backend_id):
    response = requests.get(uri+"/backends/"+backend_id+"/sizes")
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        return params
    except Exception as e:
        assert False, u'Exception: %s' % e


def list_locations(uri, backend_id):
    response = requests.get(uri+"/backends/"+backend_id+"/locations")
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
    try:
        params = response.json()
        return params
    except Exception as e:
        assert False, u'Exception: %s' % e