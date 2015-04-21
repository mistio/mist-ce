import os
import socket
import httplib

from libcloud.compute.types import NodeState
from libcloud.compute.base import Node


VALID_RESPONSE_CODES = [httplib.OK, httplib.ACCEPTED, httplib.CREATED,
                        httplib.NO_CONTENT]

NODE_STATE_MAP = {
    'on': NodeState.RUNNING,
    'off': NodeState.UNKNOWN,
    'unknown': NodeState.UNKNOWN,
}

try:
    from mist.core import config
except ImportError:
    from mist.io import config

import logging
logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)


class BareMetalDriver(object):
    """
    Bare Metal Driver class.

    """
    type = 'bare_metal'
    name = 'BareMetal'

    def __init__(self, list_of_machines):
        self.machines = list_of_machines

    def __repr__(self):
        return ('<BareMetalDriver>')

    def list_nodes(self):
        nodes = [self._to_node(machine_id, machine)
                 for machine_id, machine in self.machines.items()]
        return nodes

    def list_sizes(self):
        return []

    def list_locations(self):
        return []

    def list_images(self):
        return []

    def reboot_node(self, node):
        result = httplib.OK
        return result in VALID_RESPONSE_CODES

    def ex_stop_node(self, node):
        result = httplib.OK
        return result in VALID_RESPONSE_CODES

    def _to_node(self, machine_id, machine):
        state = self.check_host(machine.dns_name, machine.ssh_port)
        extra = {}
        if hasattr(machine, 'os_type') and machine.os_type:
            extra['os_type'] = machine.os_type
            if machine.os_type == 'windows' and hasattr(machine, 'remote_desktop_port'):
                extra['remote_desktop_port'] = machine.remote_desktop_port

        node = Node(id=machine_id, name=machine.name, state=state,
                    public_ips=machine.public_ips, private_ips=[],
                    driver=self, extra=extra)
        return node

    def check_host(self, hostname, ssh_port=22):
        """Check if host is running.

        Initially attempt a connection to ssh port specified for host and
        also to a list of common ports. If connection is successfull,
         then consider host as running. If not, send an ICMP package
        with ping. If this fails too, consider host state as stopped.
        Still needs to be improved to perform more robust checks.

        """

        state = NODE_STATE_MAP['unknown']
        if not hostname:
            return state
        socket.setdefaulttimeout(5)
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        ports_list = [22, 80, 443, 3389]
        if ssh_port not in ports_list:
            ports_list.insert(0, ssh_port, )
        for port in ports_list:
            try:
                s.connect((hostname, port))
                s.shutdown(2)
                state = NODE_STATE_MAP['on']
                break
            except:
                pass
            if state == NODE_STATE_MAP['unknown']:
                ping_response = self.ping_host(hostname)
                if ping_response == 0:
                    state = NODE_STATE_MAP['on']
        return state

    def ping_host(self, hostname):
        """Pings given host

        Use ping utility, since a python implementation would require root privileges
        (ICMP packages need be sent by root), while ping gets around this by being set SUID.
        Will fail if ping is not found on system

        """
        if not hostname:
            return 256
        try:
            response = os.system("ping -c 1 -w5 " + hostname + " > /dev/null 2>&1")
        except:
            response = 256
        return response
