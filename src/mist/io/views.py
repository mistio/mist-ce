'''mist.io views'''
import json
from pyramid.response import Response
from libcloud.compute.providers import get_driver
from libcloud.compute.base import NodeAuthSSHKey
from libcloud.compute.deployment import MultiStepDeployment
from mist.io.config import BACKENDS


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

# cpsaltis: is this used somewhere?
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
            machines = conn.list_nodes()
            break
    if not found:
        return Response('Invalid backend', 404)

    for m in machines:
        # for rackspace get the tags stored in extra.metadata.tags attr, for amazon get extra.tags.tags attr
        tags = m.extra.get('tags',None) or m.extra.get('metadata',None)
        tags = tags and tags.get('tags', None) or []
        ret.append({'id'            : m.id,
                    'uuid'          : m.get_uuid(),
                    'name'          : m.name,
                    # both rackspace and amazon have the image in the imageId extra attr,
                    'image'         : m.image or m.extra.get('imageId', None),
                    # for rackspace get flavorId extra attr, for amazon the instancetype extra attr
                    'size'          : m.size or m.extra.get('flavorId', None) or m.extra.get('instancetype', None), 
                    'state'         : m.state,
                    'private_ips'   : m.private_ips,
                    'public_ips'    : m.public_ips,
                    'tags'          : tags,
                    'extra'         : m.extra,
                    })
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
                locations = conn.list_locations()
                for node_location in locations:
                    if node_location.id == request.json_body['location']:
                        location = node_location
                        break
            except:
                return Response('Invalid image', 404)
            try:
                node = conn.create_node(name=name, image=image, size=size, location=location)
                #conn.deploy_node will be used for transfering pub keys etc. deploy_node waits for
                #the node to be up with public ip, otherwise hangs. (default 60*10 sec)
                #try:
                    #key = NodeAuthSSHKey(BACKENDS[0]['public_key']) #read the key
                    #msd = MultiStepDeployment([key])
                    #node = conn.deploy_node(name=name, image=image, size=size, location=location, deploy=msd)
                #except:
                    #problems with the key, and/or deployment
            except Exception as e:
                return Response('Something went wrong with the creation', 404)
            break

    if not found:
        return Response('Invalid backend', 404)

# cpsaltis: all the following must be replaced by machine_action(request)
'''
def start_machine(request):
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
'''

def machine_action(request):
    '''
    Parses all machine action related REST calls (start/stop/restart/destroy)
    and makes the appropriate libcloud calls
    '''
    #TODO: populate this
    return True


def list_metadata(request):
    '''Lists metadata for a machine, given the backend and machine id'''
    ret = []
    found = False
    backends = [b for b in BACKENDS if b['id'] == request.matchdict['backend']]
    if backends:
        backend = backends[0]
        conn = connect(backend)
        machines = conn.list_nodes()
        for machine in machines:
            if machine.id == request.matchdict['machine']:
                try:
                    metadata = conn.ex_get_metadata(machine) #eg Openstack
                    found = True
                except:
                    try:
                        metadata = conn.ex_describe_tags(machine) #eg EC2
                        found = True
                    except:
                        return Response('Not implemented for this backend', 404)
                break
    if not found:
        return Response('Invalid backend', 404)

    return Response(json.dumps(metadata))


def set_metadata(request):
    '''Sets metadata for a machine, given the backend and machine id'''
    ret = []
    done = False
    backends = [b for b in BACKENDS if b['id'] == request.matchdict['backend']]
    if backends:
        backend = backends[0]
        conn = connect(backend)
        machines = conn.list_nodes()
        for machine in machines:
            if machine.id == request.matchdict['machine']:
                try:
                    metadata = request.json_body
                    #get metadata from request
                except:
                    return Response('Not proper format for metadata', 404)
                try:
                    metadata = conn.ex_set_metadata(machine, metadata) #eg Openstack
                    done = True
                except:
                    try:
                        metadata = conn.ex_create_tags(machine, metadata) #eg EC2
                        done = True
                    except:
                        return Response('Not implemented for this backend', 404)
                break
    if not done:
        return Response('Invalid backend', 404)

    return Response(json.dumps(ret))

    #example Openstack: conn.ex_set_metadata(machine, {'name': 'ServerX', 'description': 'all the money'})
    #example EC2: conn2.ex_create_tags(machine, {'something': 'something_something'})


def list_alerts(request):
    '''View alert history'''
    #TODO: populate this
    return True


def send_alert(request):
    '''Forwards an alert event'''
    #TODO: populate this
    return True


def list_alert_settings(request):
    '''List all the alert rules'''
    #TODO: populate this
    return True


def update_alert(request):
    '''Update/set and alert rule'''
    #TODO: populate this
    return True


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


def list_locations(request):
    '''List locations from each backend'''
    ret = []
    found = False
    for b in BACKENDS:
        if request.matchdict['backend'] == b['id']:
            found = True
            conn = connect(b)
            locations = conn.list_locations()
            break

    if not found:
        return Response('Invalid backend', 404)

    for i in locations:
        ret.append({'id'            : i.id,
                    'name'         : i.name,
                    'country'         : i.country,})

    return Response(json.dumps(ret))
