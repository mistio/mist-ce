'''mist.io views'''
from libcloud.compute.providers import get_driver
from mist.io.config import BACKENDS
from pyramid.response import Response
import json

def home(request):
    '''Fill in an object with backend data, taken from config.py'''
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
    '''Placeholder for machines listing, actualy list_machines (see below)
    does all the heavy lifting. The latter is called from javascript in
    machines.pt, as soon as the page loads.
    '''
    return {}


def disks(request):
    '''Placeholder for machines listing'''
    return {}


def images(request):
    '''Placeholder for machines listing'''
    return {}


def networks(request):
    '''Placeholder for machines listing'''
    return {}


def connect(backend):
    '''Establish backend connection using the credentials specified'''
    try:
        Driver = get_driver(backend['provider'])
        if 'host' in backend.keys():
            conn = Driver(backend['id'],
                          backend['secret'],
                          False,
                          host=backend['host'],
                          ex_force_auth_url=backend.get('auth_url',None),
                          ex_force_auth_version=backend.get('auth_version','1.0'),
                          port=80)
        else:
            conn = Driver(backend['id'], backend['secret'])
        return conn
    except Exception as e:
        #TODO: better error handling
        return 0


def list_machines(request):
    '''List machines for a backend'''
    ret = []
    found = False
    for b in BACKENDS:
        if request.matchdict['backend'] == b['id']:
            found = True
            conn = connect(b)
            try:
                machines = conn.list_nodes()
            except AttributeError:
                print "Connection lost!"
                return Response(json.dumps([]))
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


def list_images(request):
    '''List images from each backend'''
    ret = []
    found = False
    for b in BACKENDS:
        if request.matchdict['backend'] == b['id']:
            found = True
            conn = connect(b)
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


def list_sizes(request):
    '''List sizes (aka flavors) from each backend'''
    ret = []
    found = False
    for b in BACKENDS:
        if request.matchdict['backend'] == b['id']:
            found = True
            conn = connect(b)
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
 

def create_machine(request):
    '''Create a new virtual machine on the specified backend'''
    ret = []
    found = False
    for b in BACKENDS:
        if request.matchdict['backend'] == b['id']:
            found = True
            conn = connect(b)
            #FIXME: get values from form, 
            name = request.json_body['name']
            try:
                sizes = conn.list_sizes()
                for node_size in sizes:
                    if node_size.id == request.json_body['size']:
                        size = node_size
                        break
            except:
                return Response('Invalid size', 404)

            try:
                images = conn.list_images()
                for node_image in images:
                    if node_image.id == request.json_body['image']:
                        image = node_image
                        break
            except:
                return Response('Invalid image', 404)

            try:
                node = conn.create_node(name=name, image=image, size=size)
            except:
                return Response('Something went wrong with the creation', 404)
            break

    if not found:
        return Response('Invalid backend', 404)

    return Response(json.dumps(ret))        

def start_machine(request):
    '''Start a machine, given the backend and machine id'''
    ret = []
    found = False
    backends = [b for b in BACKENDS if b['id'] == request.matchdict['backend']]
    if backends:
        backend = backends[0]
        conn = connect(backend)                
        machines = conn.list_nodes()
        for machine in machines:
            if machine.id == request.matchdict['machine']:
                found = True
                #machine.reboot()
                break
        if not found:
            return Response('Invalid machine', 404)
    else:
        return Response('Invalid backend', 404)

    return Response(json.dumps(ret))

    
def stop_machine(request):
    '''Stop a machine, given the backend and machine id'''
    ret = []
    found = False
    backends = [b for b in BACKENDS if b['id'] == request.matchdict['backend']]
    if backends:
        backend = backends[0]
        conn = connect(backend)
        machines = conn.list_nodes()
        for machine in machines:
            if machine.id == request.matchdict['machine']:
                found = True
                machine.stop()
                break
        if not found:
            return Response('Invalid machine', 404)
        else:
            return Response('Machine %s stopped' % machine.id, 200)
    else:
        return Response('Invalid backend', 404)

    return Response(json.dumps(ret))    


def reboot_machine(request):
    '''Reboot a machine, given the backend and machine id'''
    ret = []
    found = False
    backends = [b for b in BACKENDS if b['id'] == request.matchdict['backend']]
    if backends:
        backend = backends[0]
        conn = connect(backend)
        machines = conn.list_nodes()
        for machine in machines:
            if machine.id == request.matchdict['machine']:
                found = True
                machine.reboot()
                break
        if not found:
            return Response('Invalid machine', 404)
    else:
        return Response('Invalid backend', 404)

    return Response(json.dumps(ret))


def destroy_machine(request):
    '''Destroy a machine, given the backend and machine id'''
    ret = []
    found = False
    backends = [b for b in BACKENDS if b['id'] == request.matchdict['backend']]
    if backends:
        backend = backends[0]
        conn = connect(backend)
        machines = conn.list_nodes()
        for machine in machines:
            if machine.id == request.matchdict['machine']:
                found = True
                machine.destroy()
                break
        if not found:
            return Response('Invalid machine', 404)
    else:
        return Response('Invalid backend', 404)

    return Response(json.dumps(ret))

