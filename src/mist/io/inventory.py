try:
    from mist.core.user.models import User
    from mist.io.clouds.models import Cloud
    from mist.io.machines.models import Machine, KeyAssociation
    from mist.io.keypairs.models import Keypair
    from mist.core import config
    from mist.core.vpn.methods import destination_nat as dnat
except ImportError:
    from mist.io import config, model

import mist.io.methods


class MistInventory(object):
    def __init__(self, user, machines=None):
        self.user = user
        self.hosts = {}
        self.keys = {}
        self._cache = {}
        self.load(machines)

    def load(self, machines=None):
        self.hosts = {}
        self.keys = {}
        if not machines:
            clouds = Cloud.objects(owner=self.user)
            machines = [(machine.cloud.id, machine.machine_id)
                        for machine in Machine.objects(cloud__in=clouds)]
        for bid, mid in machines:
            try:
                name, ip_addr = self.find_machine_details(bid, mid)
                key_id, ssh_user, port = self.find_ssh_settings(bid, mid)
            except Exception as exc:
                print exc
                continue
            ip_addr, port = dnat(self.user, ip_addr, port)
            if key_id not in self.keys:
                keypair = Keypair.objects.get(owner=self.user, name=key_id)
                self.keys[key_id] = keypair.private
                if keypair.certificate:
                    # if signed ssh key, provide the key appending a -cert.pub
                    # on the name since this is how ssh will include it as
                    # an identify file
                    self.keys['%s-cert.pub' % key_id] = keypair.certificate
                    # pub key also needed for openssh 7.2
                    self.keys['%s.pub' % key_id] = keypair.public
            if name in self.hosts:
                num = 2
                while ('%s-%d' % (name, num)) in self.hosts:
                    num += 1
                name = '%s-%d' % (name, num)

            self.hosts[name] = {
                'ansible_ssh_host': ip_addr,
                'ansible_ssh_port': port,
                'ansible_ssh_user': ssh_user,
                'ansible_ssh_private_key_file': 'id_rsa/%s' % key_id,
            }

    def export(self, include_localhost=True):
        ans_inv = ''
        if include_localhost:
            ans_inv += 'localhost\tansible_connection=local\n\n'
        for name, host in self.hosts.items():
            vars_part = ' '.join(["%s=%s" % item for item in host.items()])
            ans_inv += '%s\t%s\n' % (name, vars_part)
        ans_inv += ('\n[all:vars]\n'
                    'ansible_python_interpreter="/usr/bin/env python2"\n')
        ans_cfg = '[defaults]\nhostfile=./inventory\nhost_key_checking=False\n'
        files = {'ansible.cfg': ans_cfg, 'inventory': ans_inv}
        for key_id, private_key in self.keys.items():
             files.update({'id_rsa/%s' % key_id: private_key})
        return files

    def _list_machines(self, cloud_id):
        if cloud_id not in self._cache:
            print 'Actually doing list_machines for %s' % cloud_id
            machines = mist.io.methods.list_machines(self.user, cloud_id)
            self._cache[cloud_id] = machines
        return self._cache[cloud_id]

    def find_machine_details(self, cloud_id, machine_id):
        machines = self._list_machines(cloud_id)
        for machine in machines:
            if machine['id'] == machine_id:
                name = machine['name'].replace(' ', '_')
                ips = [ip for ip in machine['public_ips'] if ':' not in ip]
                # in case ips is empty search for private IPs
                if not ips:
                    ips = [ip for ip in machine['private_ips'] if ':' not in ip]
                if not name:
                    name = machine_id
                if not ips:
                    raise Exception('Machine ip not found in list machines')
                ip_addr = ips[0] if ips else ''  # can be either public or priv
                return name, ip_addr
        raise Exception('Machine not found in list_machines')

    def find_ssh_settings(self, cloud_id, machine_id):
        cloud = Cloud.objects.get(owner=self.user, id=cloud_id)
        machine = Machine.objects.get(cloud=cloud, machine_id=machine_id)
        if not machine.key_associations:
            raise Exception("Machine doesn't have SSH association")
        assoc = sorted(machine.key_associations, key=lambda a: a.last_used)[-1]
        return assoc.keypair.name, assoc.ssh_user or 'root', assoc.port
