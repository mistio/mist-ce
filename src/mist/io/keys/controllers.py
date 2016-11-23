import logging
from Crypto.PublicKey import RSA
from mist.io.keys.base import BaseKeyController
from mist.io.exceptions import MachineUnauthorizedError

log = logging.getLogger(__name__)


class SignedSSHKeyController(BaseKeyController):

    def construct_public_from_private(self):
        """Constructs pub key from self.private and assigns to self.public.
        Only works for RSA.

        """
        from Crypto import Random
        Random.atfork()
        if 'RSA' in self.key.private:
            try:
                key = RSA.importKey(self.key.private)
                public = key.publickey().exportKey('OpenSSH')
                self.key.public = public
                return True
            except:
                pass
        return False


class SSHKeyController(SignedSSHKeyController):

    def generate(self):
        """Generates a new RSA keypair and assigns to self."""
        from Crypto import Random
        Random.atfork()
        key = RSA.generate(2048)
        self.key.private = key.exportKey()
        self.key.public = key.exportKey('OpenSSH')

    def associate(self, machine, username='root', port=22, no_connect=False):
        super(SSHKeyController, self).associate(machine, username=username,
                                                port=port,
                                                no_connect=no_connect)

        if not no_connect:
            self.deploy(machine, username=username, port=port)

    def disassociate(self, machine):
        log.info("Undeploy key = %s" % machine.hostname)

        self.undeploy(machine)
        super(SSHKeyController, self).disassociate(machine)

    def deploy(self, machine, username=None, port=22):
        """"""
        # try to actually deploy
        log.info("Deploying key to machine.")
        filename = '~/.ssh/authorized_keys'
        grep_output = '`grep \'%s\' %s`' % (self.key.public, filename)
        new_line_check_cmd = (
            'if [ "$(tail -c1 %(file)s; echo x)" != "\\nx" ];'
            ' then echo "" >> %(file)s; fi' % {'file': filename}
        )
        append_cmd = ('if [ -z "%s" ]; then echo "%s" >> %s; fi'
                      % (grep_output, self.key.public, filename))
        command = new_line_check_cmd + " ; " + append_cmd
        log.debug("command = %s", command)

        # FIXME
        from mist.io.methods import ssh_command

        deploy_error = False
        try:
            # Deploy key.
            ssh_command(self.key.owner, machine.cloud.id, machine.machine_id,
                        machine.hostname, command,
                        username=username, port=port)
            log.info("Key associated and deployed successfully.")
        except MachineUnauthorizedError:
            # Couldn't deploy key, maybe key was already deployed?
            deploy_error = True
        try:
            ssh_command(self.key.owner, machine.cloud.id, machine.machine_id,
                        machine.hostname, 'uptime', key_id=self.key.id,
                        username=username, port=port)
        except MachineUnauthorizedError:
            if deploy_error:
                raise MachineUnauthorizedError("Couldn't connect to "
                                               "deploy new SSH key.")
            raise

    def undeploy(self, machine):
        log.info("Trying to actually remove key from authorized_keys.")
        command = \
            'grep -v "' + self.key.public + \
            '" ~/.ssh/authorized_keys ' + \
            '> ~/.ssh/authorized_keys.tmp ; ' + \
            'mv ~/.ssh/authorized_keys.tmp ~/.ssh/authorized_keys ' + \
            '&& chmod go-w ~/.ssh/authorized_keys'
        try:
            # FIXME
            from mist.io.methods import ssh_command
            ssh_command(self.key.owner, machine.cloud.id,
                        machine.machine_id, machine.hostname, command)
        except:
            pass
