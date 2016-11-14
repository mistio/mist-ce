import logging
import mongoengine as me
from Crypto.PublicKey import RSA
from mist.io.exceptions import KeyExistsError
from mist.io.exceptions import BadRequestError
from mist.io.clouds.utils import rename_kwargs
from mist.io.helpers import trigger_session_update
from mist.io.exceptions import MachineUnauthorizedError

log = logging.getLogger(__name__)


class BaseKeyController(object):
    def __init__(self,  key):
        """Initialize a key controller given a key

        Most times one is expected to access a controller from inside the
        keypair, like this:

          key = mist.io.keys.models.Key.objects.get(id=key.id)
          key.ctl.construct_public_from_private()
        """
        self.key = key

    def add(self, fail_on_invalid_params=True, **kwargs):
        """Add an entry to the database

        This is only to be called by `Key.add` classmethod to create
        a key. Fields `owner` and `name` are already populated in
        `self.key`. The `self.key` is not yet saved.

        """
        from mist.io.keys.models import Key
        # TODO add specific func for specific key implementation
        rename_kwargs(kwargs, 'priv', 'private')
        # Check for invalid `kwargs` keys.
        errors = {}
        for key in kwargs.keys():
            if key not in self.key._fields.keys():
                error = "Invalid parameter %s=%r." % (key, kwargs[key])
                if fail_on_invalid_params:
                    errors[key] = error
                else:
                    log.warning(error)
                    kwargs.pop(key)
        if errors:
            log.error("Error adding %s: %s", self.key, errors)
            raise BadRequestError({
                'msg': "Invalid parameters %s." % errors.keys(),
                'errors': errors,
            })
        # FIXME is it necessary?
        # Set fields to cloud model and perform early validation.
        for key, value in kwargs.iteritems():
            setattr(self.key, key, value)

        self.construct_public_from_private()
        if not Key.objects(owner=self.key.owner, default=True):
            self.key.default = True
            # Attempt to save.

        try:
            self.key.validate(clean=True)
        except me.ValidationError as exc:
            log.error("Error adding %s: %s", self.key.name, exc.to_dict())
            raise BadRequestError({'msg': exc.message,
                                   'errors': exc.to_dict()})

        try:
            self.key.save()
        except me.ValidationError as exc:
            log.error("Error adding %s: %s", self.key.name, exc.to_dict())
            raise BadRequestError({'msg': exc.message,
                                   'errors': exc.to_dict()})
        except me.NotUniqueError as exc:
            log.error("Key %s not unique error: %s", self.key.name, exc)
            raise KeyExistsError()
        log.info("Added key with name '%s'", self.key.name)
        # TODO raise exist name KEYEXISTERROR

    def generate(self):
        """Generates a new RSA keypair and assignes to self."""
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

    def rename(self, name):  # replace io.methods.edit_key
        """Edit name of an existing key"""
        log.info("Renaming key '%s' to '%s'.", self.key.name, name)

        if self.key.name == name:
            log.warning("Same name provided. No reason to edit this key")
            return
        self.key.name = name
        self.key.save()
        log.info("Renamed key '%s' to '%s'.", self.key.name, name)
        trigger_session_update(self.key.owner, ['keys'])

    def set_default(self, key_id):
        from mist.io.keys.models import Key
        """Set a new key as default key, given a key_id"""

        log.info("Setting key with id '%s' as default.", key_id)

        default_key = Key.objects(owner=self.key.owner,
                                  default=True).first()
        if default_key:
            default_key.default = False
            default_key.save()

        key = Key.objects.get(owner=self.key.owner, id=key_id)
        key.default = True
        key.save()

        # TODO do we prefer this?
        # Key.objects(default=True).update(default=False)
        # Key.objects(owner=self.key.owner, id=key_id).update(default=True)

        log.info("Successfully set key with id '%s' as default.", key_id)
        trigger_session_update(self.key.owner, ['keys'])

    def associate(self, cloud_id, machine_id, host='', username=None, port=22):

        from mist.io.machines.models import Machine, KeyAssociation
        from mist.io.clouds.models import Cloud

        """Associates a key with a machine.

            If host is set it will also attempt to actually deploy it to the
            machine. To do that it requires another key (existing_key) that can
            connect to the machine.
        """
        log.info("Associating key %s to host %s", self.key.id, host)
        if not host:
            log.info("Host not given so will only create association without "
                     "actually deploying the key to the server.")

        # key = Keypair.objects.get(owner=owner, id=key_id)
        cloud = Cloud.objects.get(owner=self.key.owner, id=cloud_id)
        associated = False
        if Machine.objects(cloud=cloud,
                           key_associations__keypair__exact=self.key,
                           machine_id=machine_id):
            log.warning("Key '%s' already associated with machine '%s' "
                        "in cloud '%s'", self.key.id, cloud_id, machine_id)
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

                key_assoc = KeyAssociation(keypair=self.key, last_used=0,
                                           ssh_user=username, sudo=False,
                                           port=port)
                machine.key_associations.append(key_assoc)
                machine.save()
                trigger_session_update(self.key.owner, ['keys'])
            return

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
        cloud = Cloud.objects.get(owner=self.key.owner, id=cloud_id)
        machine = Machine.objects.get(
            cloud=cloud,
            key_associations__keypair__exact=self.key,
            machine_id=machine_id)
        # key not associated
        if not machine:
            raise BadRequestError("Key '%s' is not associated with "
                                  "machine '%s'" % (self.key.id,
                                                    machine_id))

        if host:
            self._undeploy(cloud_id, machine_id, host)

        # removing key association
        for assoc in machine.key_associations:
            if assoc.keypair == self.key:
                break
        machine.key_associations.remove(assoc)
        machine.save()
        trigger_session_update(self.key.owner, ['keys'])

    def _undeploy(self, cloud_id, machine_id, host):
        raise NotImplementedError("Undeploy implemented only for sshkeys")