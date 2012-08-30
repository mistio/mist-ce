"""mist.io views

TODO: why do we always check for the session, the try should be refactored
      to a single function, it is used almost everywhere.
TODO: Besides returning error responses should we also log the error? This
      could be helpful especially in case that the call fails because the
      backend does not support an action e.g. start/stop machine.
TODO: Are we going to support rebuild, resize actions for Rackspace, Openstack
      and Linode?
"""
import os
import logging
import json

from pyramid.response import Response
from pyramid.view import view_config

from libcloud.compute.base import Node
from libcloud.compute.base import NodeSize
from libcloud.compute.base import NodeImage
from libcloud.compute.base import NodeLocation
from libcloud.compute.deployment import SSHKeyDeployment
from libcloud.compute.types import Provider

from fabric.api import run

from mist.io.config import BACKENDS
from mist.io.config import BASE_EC2_AMIS
from mist.io.helpers import connect
from mist.io.helpers import get_machine_actions
from mist.io.helpers import config_fabric


log = logging.getLogger('mist.io')


@view_config(route_name='home',
             request_method='GET',
             renderer='templates/home.pt')
def home(request):
    """Gets all the basic data for backends, project name and session status.

    TODO: here we set status to off while in list_backends we set it to online
          Which one is the default after all?
    TODO: For status we should either use off/on or offline/online
    """
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


@view_config(route_name='backends', request_method='GET', renderer='json')
def list_backends(request):
    """Gets the available backends.

    .. note:: Currently, this is only used by the backends controller in js.

    TODO: why do we always set status to online, what if enabled if false in
          config?
    """
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


@view_config(route_name='machines', request_method='GET', renderer='json')
def list_machines(request):
    """Gets machines and their metadata for a backend.

    Because each provider stores metadata in different places several checks
    are needed.

    The folowing are considered:

        * For tags, Rackspace stores them in extra.metadata.tags while EC2 in
          extra.tags.tags.
        * For images, both EC2 and Rackpace have an image and an etra.imageId
          attribute
        * For flavors, EC2 has an extra.instancetype attribute while Rackspace
          an extra.flavorId. however we also expect to get size attribute.

    TODO: why the tags = tags and tags.get('tags', None) or [] ???
    TODO: we get imageId and size, should the last be sizeId?
    """
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
        tags = m.extra.get('tags', None) or m.extra.get('metadata', None)
        tags = tags and tags.get('tags', None) or []
        imageId = m.image or m.extra.get('imageId', None)
        size = m.size or m.extra.get('flavorId', None)
        size = size or m.extra.get('instancetype', None)
        machine = {'id'           : m.id,
                   'uuid'          : m.get_uuid(),
                   'name'          : m.name,
                   'imageId'       : imageId,
                   'size'          : size,
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
    """Creates a new virtual machine on the specified backend.

    If the backend is Rackspace it attempts to deploy the node with an ssh key
    provided in config.

    TODO: test ssh deploy with EC2, keep in mind the conn.ex_import_keypair
    TODO: test simple and ssh deploy with Openstack
    TODO: test simple and ssh deploy with Linode
    TODO: we automatically select a key, the user should decide
    """
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

    has_key = len(request.registry.settings['keypairs'])
    if conn.type == Provider.RACKSPACE and has_key:
        key = SSHKeyDeployment(request.registry.settings['keypairs'][0][0])
        try:
            conn.deploy_node(name=machine_name,
                             image=image,
                             size=size,
                             location=location,
                             deploy=key)
            return []
        except:
            log.warn('Failed to deploy node with ssh key, attempting without')

    try:
        conn.create_node(name=machine_name,
                         image=image,
                         size=size,
                         location=location)
        return []
    except Exception as e:
        return Response('Something went wrong with node creation', 500)


@view_config(route_name='machine',
             request_method='POST',
             request_param='action=start',
             renderer='json')
def start_machine(request):
    """Starts a machine on backends that support it.

    Currently only EC2 supports that.

    .. note:: Normally try won't get an AttributeError exception because this
              action is not allowed for machines that don't support it. Check
              helpers.get_machine_actions.

    TODO: does Linode support it?
    TODO: should try return a 503 when it is not possible to communicate with
          the backend?
    """
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
    try:
        # In liblcoud it is not possible to call this with machine.start()
        conn.ex_start_node(machine)
    except AttributeError:
        return Response('Action not supported for this machine', 404)
    except:
        return []


@view_config(route_name='machine',
             request_method='POST',
             request_param='action=stop',
             renderer='json')
def stop_machine(request):
    """Stops a machine on backends that support it.

    Currently only EC2 supports that.

    .. note:: Normally try won't get an AttributeError exception because this
              action is not allowed for machines that don't support it. Check
              helpers.get_machine_actions.

    TODO: does Linode support it?
    TODO: should try return a 503 when it is not possible to communicate with
          the backend?
    """
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

    try:
        # In libcloud it is not possible to call this with machine.stop()
        conn.ex_stop_node(machine)
    except AttributeError:
        return Response('Action not supported for this machine', 404)
    except:
        return []


@view_config(route_name='machine',
             request_method='POST',
             request_param='action=reboot',
             renderer='json')
def reboot_machine(request):
    """Reboots a machine on a certain backend."""
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
    """Gets image metadata based on image id.

    Right now (libcloud 0.11.0) get_image() is supported for EC2 and not for
    RACKSPACE, LINODE and OPENSTACK.
    """
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    try:
        image = conn.get_image(request.params['id'])
    except NotImplementedError:
        return Response('Action not supported for this backend', 404)
    except:
        return Response('Backend unavailable', 503)

    if image is None:
        ret = {}
    else:
        ret = {'id'    : image.id,
               'extra' : image.extra,
               'name'  : image.name,
               }
    return ret


@view_config(route_name='machine_key', request_method='GET', renderer='json')
def machine_key(request):
    """Check if the machine has a key pair deployed"""
    tmp_path = config_fabric(request.params.get('ip', None),
                             request.registry.settings['keypairs'][0][1])

    # if run('uptime').failed:
    #     ret = {'has_key': False}
    # else:
    #     ret = {'has_key': True}
    ret = {'has_key': False}

    os.remove(tmp_path)

    return ret


@view_config(route_name='machine_shell', request_method='POST', renderer='json')
def shell_command(request):
    """Send a shell command to a machine over ssh"""

    tmp_path = config_fabric(request.params.get('ip', None),
                             request.registry.settings['keypairs'][0][1])

    # try:
    #     cmd_output = run(request.params.get('command', None))
    # except:
    #     cmd_output = ''; # FIXME grab the UNIX error
    cmd_output = ''

    os.remove(tmp_path)

    return cmd_output


@view_config(route_name='machine_uptime', request_method='GET', renderer='json')
def machine_uptime(request):
    """Check if the machine has a key pair deployed"""
    tmp_path = config_fabric(request.params.get('ip', None),
                             request.registry.settings['keypairs'][0][1])

    #uptime =  run('cat /proc/uptime')
    uptime = None

    if uptime:
        uptime = float(uptime.split()[0]) * 1000

    return {'uptime': uptime }
