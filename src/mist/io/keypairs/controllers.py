import logging
import mongoengine as me
from Crypto.PublicKey import RSA
from mist.io.exceptions import KeyExistsError
from mist.io.exceptions import BadRequestError
from mist.io.clouds.utils import rename_kwargs
from mist.io.helpers import trigger_session_update
from mist.io.exceptions import MachineUnauthorizedError

log = logging.getLogger(__name__)


class KeypairController(object):
    def __init__(self,  keypair):
        """Initialize a keypair controller given a keypair

        Most times one is expected to access a controller from inside the
        keypair, like this:

          keypair = mist.io.keypairs.models.Keypair.objects.get(id=keypair.id)
          keypair.ctl.construct_public_from_private()
        """
        self.keypair = keypair

    def add(self, fail_on_invalid_params=True, **kwargs):
        from mist.io.keypairs.models import Keypair

        rename_kwargs(kwargs, 'priv', 'private')

        # Check for invalid `kwargs` keys.
        errors = {}
        for key in kwargs.keys():
            if key not in self.keypair._fields.keys():
                error = "Invalid parameter %s=%r." % (key, kwargs[key])
                if fail_on_invalid_params:
                    errors[key] = error
                else:
                    log.warning(error)
                    kwargs.pop(key)
        if errors:
            log.error("Error adding %s: %s", self.keypair, errors)
            raise BadRequestError({
                'msg': "Invalid parameters %s." % errors.keys(),
                'errors': errors,
            })
        # FIXME is it necessary?
        # Set fields to cloud model and perform early validation.
        for key, value in kwargs.iteritems():
            setattr(self.keypair, key, value)

        self.construct_public_from_private()
        if not Keypair.objects(owner=self.keypair.owner, default=True):
            self.keypair.default = True
            # Attempt to save.

        try:
            self.keypair.validate(clean=True)
        except me.ValidationError as exc:
            log.error("Error adding %s: %s", self.keypair.name, exc.to_dict())
            raise BadRequestError({'msg': exc.message,
                                   'errors': exc.to_dict()})

        try:
            self.keypair.save()
        except me.ValidationError as exc:
            log.error("Error adding %s: %s", self.keypair.name, exc.to_dict())
            raise BadRequestError({'msg': exc.message,
                                   'errors': exc.to_dict()})
        except me.NotUniqueError as exc:
            log.error("Cloud %s not unique error: %s", self.keypair.name, exc)
            raise KeyExistsError()
        log.info("Added key with name '%s'", self.keypair.name)
        # TODO raise exist name KEYEXISTERROR

    def generate(self):
        """Generates a new RSA keypair and assignes to self."""
        from Crypto import Random
        Random.atfork()
        key = RSA.generate(2048)
        self.keypair.private = key.exportKey()
        self.keypair.public = key.exportKey('OpenSSH')

    def construct_public_from_private(self):
        """Constructs pub key from self.private and assignes to self.public.
        Only works for RSA.

        """
        from Crypto import Random
        Random.atfork()
        if 'RSA' in self.keypair.private:
            try:
                key = RSA.importKey(self.keypair.private)
                public = key.publickey().exportKey('OpenSSH')
                self.keypair.public = public
                return True
            except:
                pass
        return False

    def rename(self, name):  # replace io.methods.edit_key
        """Edit name of an existing key"""
        log.info("Renaming key '%s' to '%s'.", self.keypair.name, name)

        if self.keypair.name == name:
            log.warning("Same name provided. No reason to edit this key")
            return
        self.keypair.name = name
        self.keypair.save()
        log.info("Renamed key '%s' to '%s'.", self.keypair.name, name)
        trigger_session_update(self.keypair.owner, ['keys'])

    def set_default(self, key_id):
        from mist.io.keypairs.models import Keypair
        """Set a new key as default key, given a key_id"""

        log.info("Setting key with id '%s' as default.", key_id)

        default_key = Keypair.objects(owner=self.keypair.owner,
                                      default=True).first()
        if default_key:
            default_key.default = False
            default_key.save()

        key = Keypair.objects.get(owner=self.keypair.owner, id=key_id)
        key.default = True
        key.save()

        log.info("Successfully set key with id '%s' as default.", key_id)
        trigger_session_update(self.keypair.owner, ['keys'])
        # FIXME  like this key.objects(owner=owner).update(default=False)

    def associate(self, cloud_id, machine_id,
                  host='', username=None, port=22):
        from mist.io.machines.models import Machine, KeyAssociation
        from mist.io.clouds.models import Cloud
        """Associates a key with a machine.

            If host is set it will also attempt to actually deploy it to the
            machine. To do that it requires another key (existing_key) that can
            connect to the machine.
        """
        log.info("Associating key %s to host %s", self.keypair.id, host)
        if not host:
            log.info("Host not given so will only create association without "
                     "actually deploying the key to the server.")

        # key = Keypair.objects.get(owner=owner, id=key_id)
        cloud = Cloud.objects.get(owner=self.keypair.owner, id=cloud_id)
        associated = False
        if Machine.objects(cloud=cloud,
                           key_associations__keypair__exact=self.keypair,
                           machine_id=machine_id):
            log.warning("Key '%s' already associated with machine '%s' "
                        "in cloud '%s'", self.keypair.id, cloud_id, machine_id)
            associated = True

        # check if key already associated, if not already associated,
        # create the association.This is only needed if association doesn't
        # exist and host is not provided. Associations will otherwise be
        # created by shell.autoconfigure upon successful connection
        if isinstance(port, basestring):
            if port.isdigit():
                port = int(port)
            # else:
            #     port = 22 # FIXME wd son't need this
        elif isinstance(port, int):
            port = port
        else:
            port = 22

        if not host:
            if not associated:
                try:
                    machine = Machine.objects.get(cloud=cloud,
                                                  machine_id=machine_id)
                except me.DoesNotExist:
                    machine = Machine(cloud=cloud, machine_id=machine_id)

                key_assoc = KeyAssociation(keypair=self.keypair, last_used=0,
                                           ssh_user=username, sudo=False,
                                           port=port)
                machine.key_associations.append(key_assoc)
                machine.save()
                trigger_session_update(self.keypair.owner, ['keys'])
            return

        # if host is specified, try to actually deploy
        log.info("Deploying key to machine.")
        filename = '~/.ssh/authorized_keys'
        grep_output = '`grep \'%s\' %s`' % (self.keypair.public, filename)
        new_line_check_cmd = (
            'if [ "$(tail -c1 %(file)s; echo x)" != "\\nx" ];'
            ' then echo "" >> %(file)s; fi' % {'file': filename}
        )
        append_cmd = ('if [ -z "%s" ]; then echo "%s" >> %s; fi'
                      % (grep_output, self.keypair.public, filename))
        command = new_line_check_cmd + " ; " + append_cmd
        log.debug("command = %s", command)

        # FIXME
        from mist.io.methods import ssh_command
        try:
            # deploy key
            ssh_command(self.keypair.owner, cloud_id, machine_id, host,
                        command, username=username, port=port)
        except MachineUnauthorizedError:
            # couldn't deploy key
            try:
                # maybe key was already deployed?
                ssh_command(self.keypair.owner, cloud_id, machine_id,
                            host, 'uptime', key_id=self.keypair.id,
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
            ssh_command(self.keypair.owner, cloud_id, machine_id, host,
                        'uptime', key_id=self.keypair.id,
                        username=username, port=port)
            log.info("Key associated and deployed successfully.")

    def disassociate(self, cloud_id, machine_id, host=None):
        """Disassociates a key from a machine.
            If host is set it will also attempt to actually remove it from
            the machine.
            """
        from mist.io.machines.models import Machine
        from mist.io.clouds.models import Cloud

        log.info("Disassociating key, undeploy = %s" % host)
        # key = Keypair.objects.get(owner=owner, id=key_id)
        # FIXME
        cloud = Cloud.objects.get(owner=self.keypair.owner, id=cloud_id)
        machine = Machine.objects.get(
            cloud=cloud,
            key_associations__keypair__exact=self.keypair,
            machine_id=machine_id)
        # key not associated
        if not machine:
            raise BadRequestError("Key '%s' is not associated with "
                                  "machine '%s'" % (self.keypair.id,
                                                    machine_id))

        if host:
            log.info("Trying to actually remove key from authorized_keys.")
            command = \
                'grep -v "' + self.keypair.public + \
                '" ~/.ssh/authorized_keys ' + \
                '> ~/.ssh/authorized_keys.tmp ; ' + \
                'mv ~/.ssh/authorized_keys.tmp ~/.ssh/authorized_keys ' + \
                '&& chmod go-w ~/.ssh/authorized_keys'
            try:
                # FIXME
                from mist.io.methods import ssh_command
                ssh_command(self.keypair.owner, cloud_id,
                            machine_id, host, command)
            except:
                pass
        # removing key association
        for assoc in machine.key_associations:
            if assoc.keypair == self.keypair:
                break
        machine.key_associations.remove(assoc)
        machine.save()
        trigger_session_update(self.keypair.owner, ['keys'])
