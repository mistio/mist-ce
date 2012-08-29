"""mist.io views"""
import os
import logging
import json
import tempfile

from pyramid.response import Response
from pyramid.view import view_config

from libcloud.compute.base import Node
from libcloud.compute.base import NodeSize
from libcloud.compute.base import NodeImage
from libcloud.compute.base import NodeLocation
from libcloud.compute.providers import get_driver
from libcloud.compute.deployment import SSHKeyDeployment
from libcloud.compute.types import Provider

from fabric.api import run
from fabric.api import env

from mist.io.config import BACKENDS
from mist.io.config import BASE_EC2_AMIS
from mist.io.machinecaps import get_machine_actions


log = logging.getLogger('mist.io')


def connect(request):
    """Establish backend connection using the credentials specified"""
    try:
        backend_list = request.environ['beaker.session']['backends']
    except:
        backend_list = BACKENDS

    backend_index = int(request.matchdict['backend'])
    backend = backend_list[backend_index]

    driver = get_driver(int(backend['provider']))

    if 'auth_url' in backend.keys():
        # openstack
        conn = driver(backend['id'],
                      backend['secret'],
                      ex_force_auth_url=backend.get('auth_url', None),
                      ex_force_auth_version=backend.get('auth_version', '1.0'))
    elif backend['title'] in 'Linode':
        # linode
        conn = driver(backend['secret'])
    else:
        # ec2, rackspace
        conn = driver(backend['id'], backend['secret'])
    return conn


@view_config(route_name='home',
             request_method='GET',
             renderer='templates/home.pt')
def home(request):
    """Fill in an object with backend data, taken from config.py"""
    try:
        backend_list = request.environ['beaker.session']['backends']
        session = True
    except:
        backend_list = BACKENDS
        session = False

    backends = []
    for backend in backend_list:
        backends.append({'id'           : backend['id'],
                         'title'        : backend['title'],
                         'provider'     : backend['provider'],
                         'poll_interval': backend['poll_interval'],
                         'status'       : 'off',
                         })

    return {'project': 'mist.io',
            'backends': backends,
            'session': session}


@view_config(route_name='machines', request_method='GET', renderer='json')
def list_machines(request):
    """List machines for a backend"""

    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    try:
        machines = conn.list_nodes()
    except:
        return Response('Backend unavailable', 503)

    ret = []
    for m in machines:
        # for rackspace get the tags stored in extra.metadata.tags attr, for amazon get extra.tags.tags attr
        tags = m.extra.get('tags', None) or m.extra.get('metadata', None)
        tags = tags and tags.get('tags', None) or []
        machine = {'id'           : m.id,
                  'uuid'          : m.get_uuid(),
                  'name'          : m.name,
                  # both rackspace and amazon have the image in the imageId extra attr,
                  'imageId'       : m.image or m.extra.get('imageId', None),
                  # for rackspace get flavorId extra attr, for amazon the instancetype extra attr
                  'size'          : m.size or m.extra.get('flavorId', None) or m.extra.get('instancetype', None),
                  'state'         : m.state,
                  'private_ips'   : m.private_ips,
                  'public_ips'    : m.public_ips,
                  'tags'          : tags,
                  'extra'         : m.extra,
                  }
        machine.update(get_machine_actions(m, conn))
        ret.append(machine)
    return ret


@view_config(route_name='machines', request_method='POST', renderer='json')
def create_machine(request):
    """Create a new virtual machine on the specified backend"""
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    try:
        machine_name = request.json_body['name']
        location_id = request.json_body['location']
        image_id = request.json_body['image']
        size_id = request.json_body['size']
    except Exception as e:
        return Response('Invalid payload', 400)

    size = NodeSize(size_id, name='', ram='', disk='', bandwidth='', price='',
                    driver=conn)
    image = NodeImage(image_id, name='', driver=conn)
    location = NodeLocation(location_id, name='', country='', driver=conn)

    if conn.type == Provider.RACKSPACE and len(request.registry.settings['keypairs']):
        # try to deploy node with ssh key installed
        ssh_key = SSHKeyDeployment(request.registry.settings['keypairs'][0][0])
        try:
            conn.deploy_node(name=machine_name,
                             image=image,
                             size=size,
                             location=location,
                             deploy=ssh_key)
            return []
        except:
            log.warn('Failed to deploy node with ssh key. Trying to create simple node')

    try:
        conn.create_node(name=machine_name,
                         image=image,
                         size=size,
                         location=location)
        return []
    except Exception as e:
        return Response('Something went wrong with the creation', 500)


@view_config(route_name='machine',
             request_method='POST',
             request_param='action=start',
             renderer='json')
def start_machine(request):
    """Starts a machine on backends that supported start/stop"""
    #TODO: in which providers could this work?
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    machine_id = request.matchdict['machine']
    machine = Node(machine_id,
                   name=machine_id,
                   state=0,
                   public_ips=[],
                   private_ips=[],
                   driver=conn)
    #machine.start()

    return []


@view_config(route_name='machine',
             request_method='POST',
             request_param='action=stop',
             renderer='json')
def stop_machine(request):
    """Stops a machine on backends that supported start/stop"""
    #TODO: in which providers could this work?
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    machine_id = request.matchdict['machine']
    machine = Node(machine_id,
                   name=machine_id,
                   state=0,
                   public_ips=[],
                   private_ips=[],
                   driver=conn)
    #if conn.has('ex_stop'):
    conn.ex_stop(machine)

    return []


@view_config(route_name='machine',
             request_method='POST',
             request_param='action=reboot',
             renderer='json')
def reboot_machine(request):
    """Reboots a machine on a certain backend"""
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    machine_id = request.matchdict['machine']
    machine = Node(machine_id,
                   name=machine_id,
                   state=0,
                   public_ips=[],
                   private_ips=[],
                   driver=conn)
    machine.reboot()
    return []


@view_config(route_name='machine',
             request_method='POST',
             request_param='action=destroy',
             renderer='json')
def destroy_machine(request):
    """Destroys a machine on a certain backend"""
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    machine_id = request.matchdict['machine']
    machine = Node(machine_id,
                   name=machine_id,
                   state=0,
                   public_ips=[],
                   private_ips=[],
                   driver=conn)
    machine.destroy()

    return []


@view_config(route_name='metadata', request_method='POST')
def set_metadata(request):
    """Sets metadata for a machine, given the backend and machine id"""
    #TODO: the following are not working
    """Examples
    Openstack:
        conn.ex_set_metadata(machine,
                            {'name': 'ServerX',
                             'description': 'all the money'})
    EC2:
        conn2.ex_create_tags(machine, {'something': 'something_something'})
    """
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
                    #e.g. Openstack
                    metadata = conn.ex_set_metadata(machine, metadata)
                    done = True
                except:
                    try:
                        #e.g. EC2
                        metadata = conn.ex_create_tags(machine, metadata)
                        done = True
                    except:
                        return Response('Not implemented for this backend', 404)
                break
    if not done:
        return Response('Invalid backend', 404)

    return Response(json.dumps(ret))


@view_config(route_name='images', request_method='GET', renderer='json')
def list_images(request):
    """List images from each backend"""
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    try:
        try:
            backend_list = request.environ['beaker.session']['backends']
        except:
            backend_list = BACKENDS
        backend_index = int(request.matchdict['backend'])
        backend = backend_list[backend_index]
        if backend['provider'] == Provider.EC2:
            images = conn.list_images(None, BASE_EC2_AMIS.keys())
        else:
            images = conn.list_images()
    except:
        return Response('Backend unavailable', 503)

    ret = []
    for image in images:
        ret.append({'id'    : image.id,
                    'extra' : image.extra,
                    'name'  : image.name,
                    })
    return ret


@view_config(route_name='sizes', request_method='GET', renderer='json')
def list_sizes(request):
    """List sizes (aka flavors) from each backend"""
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    try:
        sizes = conn.list_sizes()
    except:
        return Response('Backend unavailable', 503)

    ret = []
    for size in sizes:
        ret.append({'id'        : size.id,
                    'bandwidth' : size.bandwidth,
                    'disk'      : size.disk,
                    'driver'    : size.driver.name,
                    'name'      : size.name,
                    'price'     : size.price,
                    'ram'       : size.ram,
                    })

    return ret


@view_config(route_name='locations', request_method='GET', renderer='json')
def list_locations(request):
    """List locations from each backend"""
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    try:
        locations = conn.list_locations()
    except:
        return Response('Backend unavailable', 503)

    ret = []
    for location in locations:
        ret.append({'id'        : location.id,
                    'name'      : location.name,
                    'country'   : location.country,
                    })

    return ret


@view_config(route_name='image_details', request_method='GET', renderer='json')
def get_image_details(request):
    """get_image_details"""
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    try:
        image = conn.get_image(request.params['id'])
    except:
        return Response('Backend unavailable', 503)

    if image is None:
        ret = {}
    else:
        ret = {'id'     : image.id,
               'extra' : image.extra,
               'name'  : image.name,
               }
    return ret


@view_config(route_name='backends', request_method='GET', renderer='json')
def get_backends(request):
    """get_backends"""
    try:
        backend_list = request.environ['beaker.session']['backends']
    except:
        backend_list = BACKENDS

    backends = []
    index = 0
    for backend in backend_list:
        backends.append({'index'        : index,
                         'id'           : backend['id'],
                         'title'        : backend['title'],
                         'provider'     : backend['provider'],
                         'poll_interval': backend['poll_interval'],
                         'status'       : 'online',
                         })
        index = index + 1

    return backends


def config_fabric_ssh(ip, private_key):
    """Configures the ssh connection used by fabric.

    The problem is that fabric does not support passing the private key as a
    string, but only as a file. To solve this we use a temporary file. After
    the connection is closed you should erase this file. That's why this
    function returns the path of the temporary file.
    """
    if not ip or not private_key:
        log.info('IP or private key missing. SSH configuration failed.')
        return False

    env.host_string = ip
    env.user = 'root'
    #env.connection_attempts - defaults to 1
    #env.timeout - e.g. 20 in secs defaults to 10

    (tmp_key, tmp_path) = tempfile.mkstemp()
    key_fd = os.fdopen(tmp_key, 'w+b')
    key_fd.write(private_key)
    key_fd.close()
    env.key_filename = [tmp_path]

    return tmp_path


@view_config(route_name='machine_key', request_method='GET', renderer='json')
def machine_key(request):
    """Check if the machine has a key pair deployed"""
    tmp_path = config_fabric_ssh(request.params.get('ip', None),
                                 request.registry.settings['keypairs'][0][1])

    if run('uptime').failed:
        ret = {'has_key': False}
    else:
        ret = {'has_key': True}

    os.remove(tmp_path)

    return ret


@view_config(route_name='machine_shell', request_method='POST', renderer='json')
def shell_command(request):
    """Send a shell command to a machine over ssh"""

    tmp_path = config_fabric_ssh(request.params.get('ip', None),
                                 request.registry.settings['keypairs'][0][1])

    try:
        cmd_output = run(request.params.get('command', None))
    except:
        cmd_output = ''; # FIXME grab the UNIX error

    os.remove(tmp_path)

    return cmd_output


@view_config(route_name='machine_uptime', request_method='GET', renderer='json')
def machine_uptime(request):
    """Check if the machine has a key pair deployed"""
    tmp_path = config_fabric_ssh(request.params.get('ip', None),
                                 request.registry.settings['keypairs'][0][1])

    uptime =  run('cat /proc/uptime')
    if uptime:
        uptime = float(uptime.split()[0]) * 1000

    return {'uptime': uptime }
