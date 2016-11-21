import logging
import mongoengine as me
from Crypto.PublicKey import RSA
from mist.io.exceptions import KeyExistsError
from mist.io.exceptions import BadRequestError
from mist.io.helpers import trigger_session_update
from mist.io.exceptions import MachineUnauthorizedError

from mist.io.keys.base import BaseKeyController

log = logging.getLogger(__name__)


class SSHKeyController(BaseKeyController):

    def _add__parse_key(self):
        self.construct_public_from_private()

    def generate(self):
        """Generates a new RSA keypair and assigns to self."""
        from Crypto import Random
        Random.atfork()
        key = RSA.generate(2048)
        self.key.private = key.exportKey()
        self.key.public = key.exportKey('OpenSSH')

    def construct_public_from_private(self):
        """Constructs pub key from self.private and assignes to self.public.
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

    def associate(self, machine, username='root', port=22):
        super(SSHKeyController, self).associate(machine=machine,
                                                username=username,
                                                port=port)
        if machine.hostname:
            self.deploy(machine=machine, username=username, port=port)

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

        try:
            # deploy key
            ssh_command(self.key.owner, machine.cloud.id, machine.machine_id,
                        machine.hostname, command,
                        username=username, port=port)
        except MachineUnauthorizedError:
            # couldn't deploy key
            try:
                # maybe key was already deployed?
                ssh_command(self.key.owner, machine.cloud.id,
                            machine.machine_id, machine.hostname,
                            'uptime', key_id=self.key.id,
                            username=username, port=port)
                log.info("Key was already deployed, "
                         "local association created.")
            except MachineUnauthorizedError:
                # oh screw this
                raise MachineUnauthorizedError(
                    "Couldn't connect to deploy new SSH key."
                )
        else:
            # deployment probably succeeded
            # attempt to connect with new key
            # if it fails to connect it'll raise exception
            # there is no need to manually set the association
            # in keypair.machines that is automatically handled by Shell,
            # if it is configured by
            # shell.autoconfigure (which ssh_command does)
            ssh_command(self.key.owner, machine.cloud.id, machine.machine_id,
                        machine.hostname, 'uptime', key_id=self.key.id,
                        username=username, port=port)
            log.info("Key associated and deployed successfully.")

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

    def _undeploy(self, machine):
        self.undeploy(machine=machine)
