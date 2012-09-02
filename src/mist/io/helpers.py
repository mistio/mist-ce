"""Map actions to backends"""
import os
import tempfile
import logging

from libcloud.compute.types import Provider
from libcloud.compute.types import NodeState
from libcloud.compute.providers import get_driver

from fabric.api import env

from mist.io.config import BACKENDS


log = logging.getLogger('mist.io')


def connect(request):
    """Establishes backend connection using the credentials specified.

    It has been tested with:

        * EC2, but not alternative providers like EC2_EU,
        * Rackspace, only the old style and not the openstack powered one,
        * Openstack Diablo through Trystack, should also try Essex,
        * Linode
    """
    try:
        backend_list = request.environ['beaker.session']['backends']
    except:
        backend_list = BACKENDS

    backend_index = int(request.matchdict['backend'])
    backend = backend_list[backend_index]

    driver = get_driver(int(backend['provider']))

    if backend['provider'] == Provider.OPENSTACK:
        conn = driver(backend['id'],
                      backend['secret'],
                      ex_force_auth_url=backend.get('auth_url', None),
                      ex_force_auth_version=backend.get('auth_version',
                                                        '2.0_password'))
    elif backend['provider'] == Provider.LINODE:
        conn = driver(backend['secret'])
    else:
        # ec2, rackspace
        conn = driver(backend['id'], backend['secret'])
    return conn


def get_machine_actions(machine, backend):
    """Returns available machine actions based on backend type.

    Rackspace, Linode and openstack support the same options, but EC2 also
    supports start/stop.

    The available actions are updates based on the machine state. The state
    codes mist.io supports are:

        * 0 = running
        * 1 = rebooting
        * 2 = stopped
        * 3 = pending
        * 4 = unknown

    The mapping takes place in js/app/models/machine.js
    """
    EC2 = (Provider.EC2,
           Provider.EC2_EU,
           Provider.EC2_US_EAST,
           Provider.EC2_AP_NORTHEAST,
           Provider.EC2_EU_WEST,
           Provider.EC2_US_WEST,
           Provider.EC2_AP_SOUTHEAST,
           Provider.EC2_SA_EAST,
           Provider.EC2_US_WEST_OREGON
           )

    # defaults for running state
    can_start = False
    can_stop = False
    can_destroy = True
    can_reboot = True
    if backend.type in EC2:
        can_start = True
        can_stop = True

    # for other states
    if machine.state is NodeState.REBOOTING:
        can_start = False
        can_stop = False
        can_reboot = False
    elif machine.state is NodeState.TERMINATED:
        can_stop = False
        can_reboot = False
    elif machine.state in (NodeState.PENDING, NodeState.UNKNOWN) :
        can_start = True # FIXME: change this to false after corecting states
        can_destroy = False
        can_stop = False
        can_reboot = False

    return {'can_stop': can_stop,
            'can_start': can_start,
            'can_destroy': can_destroy,
            'can_reboot': can_reboot}


def config_fabric(ip, private_key):
    """Configures the ssh connection used by fabric.

    Fabric does not support passing the private key as a string, but only as a
    file. To solve this, a temporary file with the private key is created and
    its path is returned.

    .. warning:: Each function calling this one should delete the temporary
                 file after closing the connection.

    A few useful parameters for fabric configuration that are not currently
    used:

        * env.connection_attempts, defaults to 1
        * env.timeout - e.g. 20 in secs defaults to 10
    """
    if not ip or not private_key:
        log.info('IP or private key missing. SSH configuration failed.')
        return False

    env.host_string = ip
    env.user = 'root'

    (tmp_key, tmp_path) = tempfile.mkstemp()
    key_fd = os.fdopen(tmp_key, 'w+b')
    key_fd.write(private_key)
    key_fd.close()
    env.key_filename = [tmp_path]

    return tmp_path
