from libcloud.compute.types import Provider
from libcloud.compute.providers import get_driver
from mist.io.config import BACKENDS
from pyramid.response import Response
import json


def home(request):
    backends = []
    for b in BACKENDS:
        backends.append({'id'           : b['id'],
                         'title'        : b['title'],
                         'provider'     : b['provider'],
                         'poll_interval': b['poll_interval'],
                         'status'       : 'off',
                        })
    return {'project': 'mist.io', 'backends': backends}


def machines(request):
    return {}


def disks(request):
    return {}


def images(request):
    return {}


def networks(request):
    return {}


def list_machines(request):
    ret = []
    found = False
    for b in BACKENDS:
        if request.matchdict['backend'] == b['id']:
            found = True
            try:
                Driver = get_driver(b['provider'])
                if 'host' in b.keys():
                    conn = Driver(b['id'],
                                  b['secret'],
                                  False,
                                  host=b['host'],
                                  url=b.get('auth_url',None),
                                  port=80)
                else:
                    conn = Driver(b['id'], b['secret'])
                machines = conn.list_nodes()
                break
            except Exception as e:
                #import pdb;pdb.set_trace()
                return Response(str(e), 500)

    if not found:
        return Response('Invalid backend', 404)

    for m in machines:
        ret.append({'id'            : m.id,
                    'uuid'          : m.get_uuid(),
                    'name'          : m.name,
                    'image'         : m.image,
                    'size'          : m.size,
                    'state'         : m.state,
                    'private_ips'   : m.private_ips,
                    'public_ips'    : m.public_ips,
                    'extra'         : m.extra,
                    })
    return Response(json.dumps(ret))

def reboot_machine(request):
    "Reboot a machine, given the backend and machine id"
    ret = []
    BACKEND = [b for b in BACKENDS if b['id'] == request.matchdict['backend']]
    if BACKEND:
        BACKEND = BACKEND[0]
        try:
            Driver = get_driver(BACKEND['provider'])
            if 'host' in BACKEND.keys():
                conn = Driver(BACKEND['id'],
                              BACKEND['secret'],
                              False,
                              host=BACKEND['host'],
                              port=80)
            else:
                conn = Driver(BACKEND['id'], BACKEND['secret'])
            machines = conn.list_nodes()
            for machine in machines:         
                if machine.id == request.matchdict['machine']:
                    machine.reboot()
        except Exception as e:
            return Response(e, 500)
    else:
        return Response('Invalid backend', 404)

    return Response(json.dumps(ret))

def destroy_machine(request):
    "destroy a machine, given the backend and machine id"
    ret = []
    BACKEND = [b for b in BACKENDS if b['id'] == request.matchdict['backend']]
    if BACKEND:
        BACKEND = BACKEND[0]
        try:
            Driver = get_driver(BACKEND['provider'])
            if 'host' in BACKEND.keys():
                conn = Driver(BACKEND['id'],
                              BACKEND['secret'],
                              False,
                              host=BACKEND['host'],
                              port=80)
            else:
                conn = Driver(BACKEND['id'], BACKEND['secret'])
            machines = conn.list_nodes()
            for machine in machines:         
                if machine.id == request.matchdict['machine']:
                    #machine.destroy()
                    print 'destroying machine', machine.id
        except Exception as e:
            return Response(e, 500)
    else:
        return Response('Invalid backend', 404)

    return Response(json.dumps(ret))

def stop_machine(request):
    "stop a machine, given the backend and machine id"
    ret = []
    BACKEND = [b for b in BACKENDS if b['id'] == request.matchdict['backend']]
    if BACKEND:
        BACKEND = BACKEND[0]
        try:
            Driver = get_driver(BACKEND['provider'])
            if 'host' in BACKEND.keys():
                conn = Driver(BACKEND['id'],
                              BACKEND['secret'],
                              False,
                              host=BACKEND['host'],
                              port=80)
            else:
                conn = Driver(BACKEND['id'], BACKEND['secret'])
            machines = conn.list_nodes()
            for machine in machines:         
                if machine.id == request.matchdict['machine']:
                    #machine.stop()
                    #TODO: check which providers are stopped by libcloud, and inform the used
                    print 'stoping machine', machine.id
        except Exception as e:
            return Response(e, 500)
    else:
        return Response('Invalid backend', 404)

    return Response(json.dumps(ret))

def list_images(self):
    ret = []
    found = False
    for b in BACKENDS:
        if request.matchdict['backend'] == b['id']:
            found = True
            try:
                Driver = get_driver(b['provider'])
                if 'host' in b.keys():
                    conn = Driver(b['id'], b['secret'], False, host=b['host'], port=80)
                else:
                    conn = Driver(b['id'], b['secret'])
                images = conn.list_images()
                break
            except Exception as e:
                return Response(e, 500)

    if not found:
        return Response('Invalid backend', 404)

    for i in images:
        ret.append({'id'            : i.id,
                    'extra'         : i.extra,})
    return Response(json.dumps(ret))
