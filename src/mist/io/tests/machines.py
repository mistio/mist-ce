from MyRequestsClass import MyRequests
import json
from time import sleep

def list_machines(uri, backend_id, cookie=None):
    req = MyRequests(uri=uri+'/backends/'+backend_id+"/machines", cookie=cookie)
    response = req.get()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
    try:
        params = response.json()
        return params
    except Exception as e:
        assert False, u'Exception: %s' % e

#! disk and image_extra are required only for Linode
def create_machine(uri, backend_id, key_id, name, location, image, size, script=None, disk=None, image_extra=None, cookie=None):
    payload = {
        #'backend': backend_id,
        'key': key_id,
        'name': name,
        'location': location,
        'image': image,
        'size': size,
        'script': script,
        'disk': disk,
        'image_extra': image_extra
    }
    req = MyRequests(uri=uri+"/backends/"+backend_id+"/machines", cookie=cookie, data=json.dumps(payload), timeout=600)
    response = req.post()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        print "Created machine with Name: %s and id %s a" % (params['name'], params['id'])
        return params
    except Exception as e:
        assert False, u'Exception: %s' % e

#!Our API does not accept json in this post!
def destroy_machine(uri, backend_id, machine_id, cookie=None):
    payload = {
        'action': 'destroy'
    }
    req = MyRequests(uri=uri+"/backends/"+backend_id+"/machines/"+machine_id, data=payload, cookie=cookie)
    response = req.post()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
    print "Destroyed machine with id: %s" % machine_id


def reboot_machine(uri, backend_id, machine_id, cookie=None):
    payload = {
        'action': 'reboot'
    }
    req = MyRequests(uri=uri+"/backends/"+backend_id+"/machines/"+machine_id, cookie=cookie, data=payload)
    response = req.post()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
    print "Rebooted machine with id: %s" % machine_id

def stop_machine(uri, backend_id, machine_id, cookie=None):
    payload = {
        'action': 'stop'
    }
    req = MyRequests(uri=uri+"/backends/"+backend_id+"/machines/"+machine_id, data=payload, cookie=cookie)
    response = req.post()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
    print "Stopped machine with id: %s" % machine_id

def start_machine(uri, backend_id, machine_id, cookie=None):
    sleep(30)
    payload = {
        'action': 'start'
    }
    req = MyRequests(uri=uri+"/backends/"+backend_id+"/machines/"+machine_id, data=payload, cookie=cookie)
    response = req.post()
    if response.status_code == 503:
        print "Machine state is not yet ready to be started"
        return
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
    print "Started machine with id: %s" % machine_id
