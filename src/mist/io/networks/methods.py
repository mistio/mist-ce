from mist.io.clouds.models import Cloud
from mist.io.networks.models import NETWORKS

from mist.io.exceptions import CloudNotFoundError
from mist.io.helpers import trigger_session_update

from mist.io.methods import connect_provider

from libcloud.compute.types import Provider


def create_network(owner, cloud, network_params):
    """
    Creates a new network on the specified cloud.
    Network_params is a dict containing all the necessary values that
    describe a network.
    """
    if not hasattr(cloud.ctl, 'network'):
        raise NotImplementedError()

    # Create a DB document for the new network and call libcloud
    #  to declare it on the cloud provider
    new_network = NETWORKS[cloud.ctl.provider].add(cloud=cloud,
                                                   **network_params)

    # Schedule a UI update
    trigger_session_update(owner, ['clouds'])

    return new_network


def delete_network(owner, network):
    """
    Delete a network.
    All subnets attached to the network will be deleted before
    the network itself.
    """
    network.ctl.delete()

    # Schedule a UI update
    trigger_session_update(owner, ['clouds'])


def list_networks(owner, cloud_id):
    """List networks from each cloud.
    Currently EC2, Openstack and GCE clouds are supported. For other providers
    this returns an empty list.
    """
    ret = {'public': [],
           'private': [],
           'routers': []}

    try:
        cloud = Cloud.objects.get(owner=owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise CloudNotFoundError

    if not hasattr(cloud.ctl, 'network'):
        return ret

    networks = cloud.ctl.network.list_networks()

    for network in networks:

        network_dict = network.as_dict()
        network_dict['subnets'] = [subnet.as_dict() for
                                   subnet in network.ctl.list_subnets()]

    # TODO: Backwards-compatible network privacy detection, to be replaced
        if not network_dict.get('router_external'):
            ret['private'].append(network_dict)
        else:
            ret['public'].append(network_dict)
    return ret


def associate_ip(owner, cloud_id, network_id, ip,
                 machine_id=None, assign=True):
    cloud = Cloud.objects.get(owner=owner, id=cloud_id, deleted=None)
    conn = connect_provider(cloud)

    if conn.type != Provider.NEPHOSCALE:
        return False

    return conn.ex_associate_ip(ip, server=machine_id, assign=assign)
