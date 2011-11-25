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

def make_connection(b):
    "Establish connection with the credentials specified"
    try:
        Driver = get_driver(b['provider'])
        if 'host' in b.keys():
            conn = Driver(b['id'],
                          b['secret'],
                          False,
                          host=b['host'],
                          ex_force_auth_url=b.get('auth_url',None),
                          ex_force_auth_version=b.get('auth_version','1.0'),
                          port=80)
        else:
            conn = Driver(b['id'], b['secret'])
        return conn
    except Exception as e:
        #TODO: more proper error handling
        return 0


def list_machines(request):
    "list machines for a backend"
    ret = []
    found = False
    for b in BACKENDS:
        if request.matchdict['backend'] == b['id']:
            found = True
            conn = make_connection(b)
            machines = conn.list_nodes()
            break
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

def start_machine(request):
    "Start a machine"
    ret = []
    BACKEND = [b for b in BACKENDS if b['id'] == request.matchdict['backend']]
    if BACKEND:
        BACKEND = BACKEND[0]
        conn = make_connection(b)
        print "start a machine call"
    else:
        return Response('Invalid backend', 404)

    return Response(json.dumps(ret))

def reboot_machine(request):
    "Reboot a machine, given the backend and machine id"
    ret = []
    BACKEND = [b for b in BACKENDS if b['id'] == request.matchdict['backend']]
    if BACKEND:
        BACKEND = BACKEND[0]
        conn = make_connection(b)
        machines = conn.list_nodes()
        for machine in machines:         
            if machine.id == request.matchdict['machine']:
                machine.reboot()
    else:
        return Response('Invalid backend', 404)

    return Response(json.dumps(ret))

def destroy_machine(request):
    "destroy a machine, given the backend and machine id"
    ret = []
    BACKEND = [b for b in BACKENDS if b['id'] == request.matchdict['backend']]
    if BACKEND:
        BACKEND = BACKEND[0]
        conn = make_connection(b)
        machines = conn.list_nodes()
        for machine in machines:         
            if machine.id == request.matchdict['machine']:
                #machine.destroy()
                print 'destroying machine', machine.id
    else:
        return Response('Invalid backend', 404)

    return Response(json.dumps(ret))

def stop_machine(request):
    "stop a machine, given the backend and machine id"
    ret = []
    BACKEND = [b for b in BACKENDS if b['id'] == request.matchdict['backend']]
    if BACKEND:
        BACKEND = BACKEND[0]
        conn = make_connection(b)
        machines = conn.list_nodes()
        for machine in machines:         
            if machine.id == request.matchdict['machine']:
                #machine.stop()
                #TODO: check which providers are stopped by libcloud, and inform the used
                print 'stoping machine', machine.id
    else:
        return Response('Invalid backend', 404)

    return Response(json.dumps(ret))

def list_images(request):
    ret = []
    found = False
    for b in BACKENDS:
        if request.matchdict['backend'] == b['id']:
            found = True
            conn = make_connection(b)
            images = conn.list_images()
            #TODO: investigate case of far too many images (eg Amazon)
            break

    if not found:
        return Response('Invalid backend', 404)

    for i in images:
        ret.append({'id' : i.id,
                    'extra': i.extra,
                    'name': i.name,})
    return Response(json.dumps(ret))

# list sizes or flavors, may want to change the name depending on libcloud
def list_sizes(request):
    ret = []
    found = False
    for b in BACKENDS:
        if request.matchdict['backend'] == b['id']:
            found = True
            conn = make_connection(b)
            sizes = conn.list_sizes()
            break

    if not found:
        return Response('Invalid backend', 404)

    for i in sizes:
        ret.append({'id'            : i.id,
                    'bandwidth'         : i.bandwidth,
                    'disk'         : i.disk,
                    'driver'         : i.driver.name,
                    'name'         : i.name,
                    'price'         : i.price,
                    'ram'         : i.ram})

    return Response(json.dumps(ret))


