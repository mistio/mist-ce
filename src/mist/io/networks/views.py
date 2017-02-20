import mongoengine as me
from pyramid.response import Response

import mist.io.networks.methods as methods

from mist.io.clouds.models import Cloud
from mist.io.machines.models import Machine
from mist.io.networks.models import Network

from mist.io.auth.methods import auth_context_from_request

from mist.io.exceptions import CloudNotFoundError
from mist.io.exceptions import RequiredParameterMissingError
from mist.io.exceptions import PolicyUnauthorizedError, NetworkNotFoundError

from mist.io.helpers import params_from_request, view_config

from mist.io.methods import create_subnet

OK = Response("OK", 200)


@view_config(route_name='api_v1_networks',
             request_method='GET', renderer='json')
def list_networks(request):
    """
    List networks of a cloud.
    Currently supports the EC2, GCE and OpenStack clouds.
    For other providers this returns an empty list.
    READ permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)

    try:
        Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except me.DoesNotExist:
        raise CloudNotFoundError

    networks = methods.list_networks(auth_context.owner, cloud_id)

    return networks


@view_config(route_name='api_v1_networks',
             request_method='POST', renderer='json')
def create_network(request):
    """
    Create network on a cloud
    Creates a new network. If subnet dict is specified,
    after creating the network it will use the new
    network's id to create a subnet.
    CREATE_RESOURCES permission required on cloud.
    ---
    cloud_id:
      in: path
      required: true
      description: The Cloud ID
      type: string
    network:
      required: true
      type: dict
    subnet:
      type: dict
    """
    cloud_id = request.matchdict['cloud']

    params = params_from_request(request)
    network_params = params.get('network')
    subnet_params = params.get('subnet')

    auth_context = auth_context_from_request(request)

    if not network_params:
        raise RequiredParameterMissingError('network')

    # TODO
    if not auth_context.is_owner():
        raise PolicyUnauthorizedError()

    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except me.DoesNotExist:
        raise CloudNotFoundError

    network = methods.create_network(auth_context.owner, cloud, network_params)
    network_dict = network.as_dict()

    # Bundling Subnet creation in this call because it is required
    #  for backwards compatibility with the current UI
    if subnet_params:
        try:
            subnet = create_subnet(auth_context.owner, cloud,
                                   network, subnet_params)
        except Exception as exc:
            # Cleaning up the network object in case subnet creation
            #  fails for any reason
            network.ctl.delete()
            raise exc
        network_dict['subnet'] = subnet.as_dict()

    return network.as_dict()


@view_config(route_name='api_v1_network', request_method='DELETE')
def delete_network(request):
    """
    Delete a network.
    CREATE_RESOURCES permission required on cloud.
    ---
    cloud_id:
      in: path
      required: true
      type: string
    network_id:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    network_id = request.matchdict['network']

    auth_context = auth_context_from_request(request)

    # TODO
    if not auth_context.is_owner():
        raise PolicyUnauthorizedError()

    try:
        cloud = Cloud.objects.get(id=cloud_id, owner=auth_context.owner)
    except Cloud.DoesNotExist:
        raise CloudNotFoundError
    try:
        network = Network.objects.get(id=network_id, cloud=cloud)
    except me.DoesNotExist:
        raise NetworkNotFoundError

    methods.delete_network(auth_context.owner, network)

    return OK


@view_config(route_name='api_v1_network', request_method='POST')
def associate_ip(request):
    """
    Associate ip
    Associate ip with the specific network and machine
    READ permission required on cloud.
    EDIT permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    network:
      in: path
      required: true
      type: string
    assign:
      default: true
      type: boolean
    ip:
      required: true
      type: string
    machine:
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    network_id = request.matchdict['network']
    params = params_from_request(request)
    ip = params.get('ip')
    machine_id = params.get('machine')
    assign = params.get('assign', True)
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "edit", machine_uuid)

    ret = methods.associate_ip(auth_context.owner, cloud_id, network_id,
                               ip, machine_id, assign)
    if ret:
        return OK
    else:
        return Response("Bad Request", 400)
