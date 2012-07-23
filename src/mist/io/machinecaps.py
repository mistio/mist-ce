"""Map actions to backends"""


def get_machine_actions(machine, backend):
    """Return available machine actions

    This depends on the backend driver
    """

    #TODO

    return {'can_stop': True, \
            'can_start': True, \
            'can_destroy': True, \
            'can_reboot': True}
