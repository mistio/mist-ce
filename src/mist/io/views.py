"""mist.io views"""
import os
import logging
import json
import tempfile
import datetime

from pyramid.response import Response
from pyramid.view import view_config

from libcloud.compute.base import Node
from libcloud.compute.base import NodeSize
from libcloud.compute.base import NodeImage
from libcloud.compute.base import NodeLocation
from libcloud.compute.base import NodeAuthSSHKey
from libcloud.compute.deployment import SSHKeyDeployment
from libcloud.compute.types import Provider

from mist.io.config import STATES
from mist.io.config import BACKENDS
from mist.io.config import EC2_IMAGES
from mist.io.config import EC2_PROVIDERS
from mist.io.config import EC2_KEY_NAME
from mist.io.config import EC2_SECURITYGROUP
from mist.io.config import LINODE_DATACENTERS

from mist.io.helpers import connect
from mist.io.helpers import get_machine_actions
from mist.io.helpers import import_key
from mist.io.helpers import create_security_group
from mist.io.helpers import run_command

log = logging.getLogger('mist.io')


@view_config(route_name='home', request_method='GET',
             renderer='templates/home.pt')
def home(request):
    """Gets all the basic data for backends, project name and session status.
    """
    try:
        request.environ['beaker.session']['backends']
        session = True
    except:
        session = False

    return {'project': 'mist.io',
            'session': session}


@view_config(route_name='backends', request_method='GET', renderer='json')
def list_backends(request):
    """Gets the available backends.

    .. note:: Currently, this is only used by the backends controller in js.
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
                         'enabled'      : backend['enabled'],
                         'state'        : 'wait',
                         })
        index = index + 1

    return backends


@view_config(route_name='machines', request_method='GET', renderer='json')
def list_machines(request):
    """Gets machines and their metadata for a backend.

    Because each provider stores metadata in different places several checks
    are needed.

    The folowing are considered:::

        * For tags, Rackspace stores them in extra.metadata.tags while EC2 in
          extra.tags.tags.
        * For images, both EC2 and Rackpace have an image and an etra.imageId
          attribute
        * For flavors, EC2 has an extra.instancetype attribute while Rackspace
          an extra.flavorId. however we also expect to get size attribute.
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
        tags = tags or {}
        tags = [value for key, value in tags.iteritems() if key != 'Name']

        if m.extra.get('availability', None):
            # for EC2
            tags.append(m.extra['availability'])
        elif m.extra.get('DATACENTERID', None):
            # for Linode
            tags.append(LINODE_DATACENTERS[m.extra['DATACENTERID']])

        imageId = m.image or m.extra.get('imageId', None)

        size = m.size or m.extra.get('flavorId', None)
        size = size or m.extra.get('instancetype', None)

        machine = {'id'            : m.id,
                   'uuid'          : m.get_uuid(),
                   'name'          : m.name,
                   'imageId'       : imageId,
                   'size'          : size,
                   'state'         : STATES[m.state],
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
    provided in config. the method used is the only one working in the old
    Rackspace backend. create_node(), from libcloud.compute.base, with 'auth'
    kwarg doesn't do the trick. Didn't test if you can upload some ssh related
    files using the 'ex_files' kwarg from openstack 1.0 driver.

    In Linode creation is a bit different. There you can pass the key file
    directly during creation. The Linode API also requires to set a disk size
    and doesn't get it from size.id. So, send size.disk from the client and
    use it in all cases just to avoid provider checking. Finally, Linode API
    does not support association between a machine and the image it came from.
    We could set this, at least for machines created through mist.io in
    ex_comment, lroot or lconfig. lroot seems more appropriate. However,
    liblcoud doesn't support linode.config.list at the moment, so no way to
    get them. Also, it will create inconsistencies for machines created
    through mist.io and those from the Linode interface.

    TODO: test the new rackspace backend
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
        # these are required only for Linode, passing them anyway
        image_extra = request.json_body['image_extra']
        disk = request.json_body['disk']
    except Exception as e:
        return Response('Invalid payload', 400)

    size = NodeSize(size_id, name='', ram='', disk=disk, bandwidth='',
                    price='', driver=conn)
    image = NodeImage(image_id, name='', extra=image_extra, driver=conn)
    location = NodeLocation(location_id, name='', country='', driver=conn)

    has_key = len(request.registry.settings['keypairs'])
    if conn.type in RACKSPACE_PROVIDERS and has_key:
        key = SSHKeyDeployment(request.registry.settings['keypairs'][0][0])
        try:
            conn.deploy_node(name=machine_name,
                             image=image,
                             size=size,
                             location=location,
                             deploy=key)
            return []
        except:
            log.warn('Failed to deploy node with ssh key, attempt without')
    elif conn.type in EC2_PROVIDERS and has_key:
        key = request.registry.settings['keypairs'][0][0]
        imported_key = import_key(conn, key, EC2_KEY_NAME)
        created_security_group = create_security_group(conn, EC2_SECURITYGROUP)
        if imported_key and created_security_group:
            try:
                conn.create_node(name=machine_name,
                                 image=image,
                                 size=size,
                                 location=location,
                                 ex_keyname=EC2_KEY_NAME,
                                 ex_securitygroup=EC2_SECURITYGROUP['name'])
                return []
            except:
                log.warn('Failed to deploy node with ssh key, attempt without')
    elif conn.type is Provider.LINODE and has_key:
        key = request.registry.settings['keypairs'][0][0]
        auth = NodeAuthSSHKey(key)
        try:
            conn.create_node(name=machine_name,
                             image=image,
                             size=size,
                             location=location,
                             auth=auth)
            return []
        except:
            log.warn('Failed to deploy node with ssh key, attempt without')

    try:
        conn.create_node(name=machine_name,
                         image=image,
                         size=size,
                         location=location)
        return []
    except Exception as e:
        return Response('Something went wrong with node creation', 500)


@view_config(route_name='machine', request_method='POST',
             request_param='action=start', renderer='json')
def start_machine(request):
    """Starts a machine on backends that support it.

    Currently only EC2 supports that.

    .. note:: Normally try won't get an AttributeError exception because this
              action is not allowed for machines that don't support it. Check
              helpers.get_machine_actions.
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


@view_config(route_name='machine', request_method='POST',
             request_param='action=stop', renderer='json')
def stop_machine(request):
    """Stops a machine on backends that support it.

    Currently only EC2 supports that.

    .. note:: Normally try won't get an AttributeError exception because this
              action is not allowed for machines that don't support it. Check
              helpers.get_machine_actions.
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


@view_config(route_name='machine', request_method='POST',
             request_param='action=reboot', renderer='json')
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


@view_config(route_name='machine', request_method='POST',
             request_param='action=destroy', renderer='json')
def destroy_machine(request):
    """Destroys a machine on a certain backend."""
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


@view_config(route_name='machine_metadata', request_method='POST',
             renderer='json')
def set_machine_metadata(request):
    """Sets metadata for a machine, given the backend and machine id.

    Libcloud handles this differently for each provider. Especially
    Linode doesn't support any metadata actions.
    """
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    if conn.type is Provider.LINODE:
        return Response('Metadata actions are not supported for Linode', 501)

    machine_id = request.matchdict['machine']
    machine = Node(machine_id,
                   name='',
                   state=0,
                   public_ips=[],
                   private_ips=[],
                   driver=conn)
    try:
        tag = request.json_body['tag']
        unique_key = 'mist.io_tag-' + datetime.datetime.now().isoformat()
        pair = {unique_key: tag}
    except:
        return Response('Malformed metadata format', 400)

    if conn.type in EC2_PROVIDERS:
        try:
            conn.ex_create_tags(machine, pair)
        except:
            return Response('Error while setting metadata in EC2', 503)
    else:
        try:
            conn.ex_set_metadata(machine, pair)
        except:
            return Response('Error while setting metadata', 503)

    return Response('Success', 200)


@view_config(route_name='machine_metadata', request_method='DELETE',
             renderer='json')
def delete_machine_metadata(request):
    """Delete metadata for a machine, given the machine id and the tag to be
    deleted.

    Libcloud handles this differently for each provider. Linode doesn't
    support it. In EC2 you can delete just the tag you like. In Openstack/
    Rackspace you can only set a new list and not delete from the existing.
    """
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    if conn.type is Provider.LINODE:
        return Response('Metadata actions are not supported for Linode', 501)

    try:
        tag = request.json_body['tag']
    except:
        return Response('Malformed metadata format', 400)

    machine_id = request.matchdict['machine']
    machine = Node(machine_id,
                   name=machine,
                   state=0,
                   public_ips=[],
                   private_ips=[],
                   driver=conn)

    if conn.type in EC2_PROVIDERS:
        try:
            metadata = conn.ex_delete_tags(machine, {'tag': tag})
        except:
            return Response('Error while deleting metadata in EC2', 503)
    else:
        try:
            nodes = conn.list_nodes()
            for node in nodes:
                if node.id is machine_id:
                    machine = node
                    break
        except:
            return Response('Not found machine', 404)

        # this exists only in Openstack/Rackspace machines
        tags = machine.extra.get('metadata', None)
        try:
            for mkey, mdata in tags.iteritems():
                if tag is mdata:
                    updated_metadata = tags.pop(mkey)
                    break
        except:
            return Response('Tag does not exist', 404)

        try:
            conn.ex_set_metadata(machine, updated_metadata)
        except:
            return Response('Error while setting metadata', 503)

    return Response('Success', 200)


@view_config(route_name='machine_shell', request_method='POST',
             renderer='json')
def shell_command(request):
    """Send a shell command to a machine over ssh, using fabric."""
    conn = connect(request)
    machine_id = request.matchdict['machine']
    host = request.params.get('host', None)
    ssh_user = request.params.get('ssh_user', None)
    command = request.params.get('command', None)

    backend_index = int(request.matchdict['backend'])
    try:
        private_key = request['beaker.session']['backends'][backend_index]\
                             ['private_key']
    except KeyError:
        private_key = request.registry.settings['keypairs'][0][1]

    return run_command(conn, machine_id, host, ssh_user, private_key,
                      command)


@view_config(route_name='images', request_method='GET', renderer='json')
def list_images(request):
    """List images from each backend."""
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    try:
        if conn.type in EC2_PROVIDERS:
            images = conn.list_images(None, EC2_IMAGES[conn.type].keys())
            for image in images:
                image.name = EC2_IMAGES[conn.type][image.id]
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


@view_config(route_name='image_metadata', request_method='GET',
             renderer='json')
def get_image_metadata(request):
    """Gets image metadata based on image id.

    Right now (libcloud 0.11.0) get_image() is supported for EC2 and not for
    RACKSPACE, LINODE and OPENSTACK.
    """
    try:
        conn = connect(request)
    except:
        return Response('Backend not found', 404)

    try:
        image_id = request.matchdict['image']
        image = conn.get_image(image_id)
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


@view_config(route_name='sizes', request_method='GET', renderer='json')
def list_sizes(request):
    """List sizes (aka flavors) from each backend."""
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
    """List locations from each backend.

    Locations mean different things in each backend. e.g. EC2 uses it as a
    datacenter in a given availability zone, whereas Linode lists availability
    zones. However all responses share id, name and country eventhough in some
    cases might be empty, e.g. Openstack.

    In EC2 all locations by a provider have the same name, so the availability
    zones are listed instead of name.
    """
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
        if conn.type in EC2_PROVIDERS:
            name = location.availability_zone.name
        else:
            name = location.name

        ret.append({'id'        : location.id,
                    'name'      : name,
                    'country'   : location.country,
                    })

    return ret
