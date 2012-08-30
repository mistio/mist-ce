"""Map actions to backends"""
import tempfile

from libcloud.compute.types import Provider
from libcloud.compute.providers import get_driver
from libcloud.compute.drivers.rackspace import RackspaceNodeDriver
from libcloud.compute.drivers.ec2 import EC2NodeDriver

from fabric.api import env

from mist.io.config import BACKENDS


def connect(request):
    """Establishes backend connection using the credentials specified.

    It has been tested with:

        * EC2, but not alternative providers like EC2_EU,
        * Rackspace, only the old style and not the openstack powered one,
        * Openstack Diablo through Trystack, should also try Essex,
        * Linode

    TODO: needs testing with more providers
    TODO: why do we always connect before doing something and not connect
          once and for all?
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
    """Return available machine actions

    This depends on the backend driver
    """
    can_start = True
    can_stop = True
    can_destroy = True
    can_reboot = True

    if type(backend) is RackspaceNodeDriver:
        can_start = False
        can_stop = False

    if machine.state == 1:
        can_start = False
        can_stop = False
        can_reboot = False
    elif machine.state == 2:
        can_stop = False
        can_reboot = False
    elif machine.state in (3, 4) :
        can_start = False
        can_destroy = False
        can_stop = False
        can_reboot = False

    return {'can_stop': can_stop, \
            'can_start': can_start, \
            'can_destroy': can_destroy, \
            'can_reboot': can_reboot}


def config_fabric(ip, private_key):
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
