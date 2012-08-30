"""Map actions to backends"""
from libcloud.compute.drivers.rackspace import RackspaceNodeDriver
from libcloud.compute.drivers.ec2 import EC2NodeDriver

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
