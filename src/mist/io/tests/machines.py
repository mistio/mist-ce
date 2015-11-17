from MyRequestsClass import MyRequests
import json
from time import sleep

def list_machines(uri, cloud_id, cookie=None, csrf=None):
    req = MyRequests(uri=uri+'/clouds/'+cloud_id+"/machines",
                     cookie=cookie, csrf=csrf)
    response = req.get()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
    try:
        params = response.json()
        return params
    except Exception as e:
        assert False, u'Exception: %s' % e

#! disk and image_extra are required only for Linode
def create_machine(uri, cloud_id, key_id, name, location, image, size,
                   script=None, disk=None, image_extra=None, cookie=None,
                   csrf=None):
    payload = {
        #'cloud': cloud_id,
        'key': key_id,
        'name': name,
        'location': location,
        'image': image,
        'size': size,
        'script': script,
        'disk': disk,
        'image_extra': image_extra
    }
    req = MyRequests(uri=uri+"/clouds/"+cloud_id+"/machines",
                     cookie=cookie, data=json.dumps(payload), timeout=600,
                     csrf=csrf)
    response = req.post()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

    try:
        params = response.json()
        print "Created machine with Name: %s and id %s a" % (params['name'], params['id'])
        return params
    except Exception as e:
        assert False, u'Exception: %s' % e


def destroy_machine(uri, cloud_id, machine_id, cookie=None, csrf=None):
    payload = {
        'action': 'destroy'
    }
    req = MyRequests(uri=uri+"/clouds/"+cloud_id+"/machines/"+machine_id,
                     data=json.dumps(payload), cookie=cookie, csrf=csrf)
    response = req.post()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
    print "Destroyed machine with id: %s" % machine_id


def reboot_machine(uri, cloud_id, machine_id, cookie=None, csrf=None):
    payload = {
        'action': 'reboot'
    }
    req = MyRequests(uri=uri+"/clouds/"+cloud_id+"/machines/"+machine_id,
                     cookie=cookie, data=json.dumps(payload), csrf=csrf)
    response = req.post()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
    print "Rebooted machine with id: %s" % machine_id


def stop_machine(uri, cloud_id, machine_id, cookie=None, csrf=None):
    payload = {
        'action': 'stop'
    }
    req = MyRequests(uri=uri+"/clouds/"+cloud_id+"/machines/"+machine_id,
                     data=json.dumps(payload), cookie=cookie, csrf=csrf)
    response = req.post()
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
    print "Stopped machine with id: %s" % machine_id


def start_machine(uri, cloud_id, machine_id, cookie=None, csrf=None):
    sleep(30)
    payload = {
        'action': 'start'
    }
    req = MyRequests(uri=uri+"/clouds/"+cloud_id+"/machines/"+machine_id,
                     data=json.dumps(payload), cookie=cookie, csrf=csrf)
    response = req.post()
    if response.status_code == 503:
        print "Machine state is not yet ready to be started"
        return
    assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
    print "Started machine with id: %s" % machine_id
