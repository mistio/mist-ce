from libcloud.compute.types import Provider
from libcloud.compute.providers import get_driver
from mist.io.config import BACKENDS
from pyramid.response import Response
import json

def home(request):
    return {'project':'mist.io','backends' : [b['id'] for b in BACKENDS]}

def list_machines(request):
    ret = []
    for b in BACKENDS:
        if request.matchdict['backend'] == b['id']:
            Driver = get_driver(b['provider'])
            if 'host' in b.keys():
                conn = Driver(b['id'], b['secret'], False, host=b['host'], port=80)
            else:
                conn = Driver(b['id'], b['secret'])
            machines = conn.list_nodes()
    for m in machines:
        ret.append({'id'            : m.id,
                    'uuid'          : m.get_uuid(),
                    'name'          : m.name,
                    'image'         : m.image,
                    'size'          : m.size,
                    'state'         : m.state,
                    'private_ips'   : m.private_ips,
                    'public_ips'    : m.public_ips,
                    'extra'         : m.extra,})
    return Response(json.dumps(ret))

def machines(request):
    nodes = []
    images = []
    sizes = []
    for b in BACKENDS:
        Driver = get_driver(b['provider'])
        if 'host' in b.keys():
            conn = Driver(b['id'], b['secret'], False, host=b['host'], port=80)
        else:
            conn = Driver(b['id'], b['secret'])
        nodes += conn.list_nodes()
        #images += conn.list_images()
        images = []
        sizes += conn.list_sizes()
    return {'nodes': nodes,
            'images': images,
            'sizes': sizes,
            'backends': BACKENDS}

def disks(request):
    return {}

def images(request):
    images = []
    for b in BACKENDS:
        Driver = get_driver(b['provider'])
        if 'host' in b.keys():
            conn = Driver(b['id'], b['secret'], False, host=b['host'], port=80)
        else:
            conn = Driver(b['id'], b['secret'])
        images += conn.list_images()
    return {'images': images}

def network(request):
    networks = {}
    nodes = []
    for b in BACKENDS:
        Driver = get_driver(b['provider'])
        if 'host' in b.keys():
            conn = Driver(b['id'], b['secret'], False, host=b['host'], port=80)
        else:
            conn = Driver(b['id'], b['secret'])
        nodes += conn.list_nodes()

    for node in nodes:
        networks.update({node.name : { 'public_ip': node.public_ip,
                                       'private_ip' : node.private_ip}})
    return {'networks': networks }
