import logging
import mongoengine as me
from mist.io.exceptions import KeyExistsError
from mist.io.exceptions import BadRequestError
from mist.io.helpers import rename_kwargs
from mist.io.helpers import trigger_session_update

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

        rename_kwargs(kwargs, 'priv', 'private')
        # Check for invalid `kwargs` keys.
        errors = {}
        for key in kwargs.keys():
            if key not in self.key._key_specific_fields:
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

        for key, value in kwargs.iteritems():
            setattr(self.key, key, value)

        if not Key.objects(owner=self.key.owner, default=True):
            self.key.default = True

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
        trigger_session_update(self.key.owner, ['keys'])

    def generate(self):
        raise NotImplementedError()

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

    def set_default(self):
        from mist.io.keys.models import Key
        """Set a new key as default key, given a key_id"""

        log.info("Setting key with id '%s' as default.", self.key.id)

        Key.objects(owner=self.key.owner, default=True).update(default=False)
        self.key.default = True
        self.key.save()

        log.info("Successfully set key with id '%s' as default.", self.key.id)
        trigger_session_update(self.key.owner, ['keys'])

    def associate(self, machine, username='root', port=22, no_connect=False):
        """Associates a key with a machine."""

        from mist.io.machines.models import Machine, KeyAssociation

        log.info("Associating key %s to machine %s", self.key.id,
                 machine.machine_id)

        # check if key already associated, if not already associated,
        # create the association.This is only needed if association doesn't
        # exist. Associations will otherwise be
        # created by shell.autoconfigure upon successful connection
        associated = False
        key_assoc = machine.key_associations.filter(keypair=self.key)
        if key_assoc:
            log.warning("Key '%s' already associated with machine '%s' "
                        "in cloud '%s'", self.key.id,
                        machine.cloud.id, machine.machine_id)
            associated = True

        if isinstance(port, basestring):
            if port.isdigit():
                port = int(port)
            elif not port:
                port = 22
            else:
                raise BadRequestError("Port is required")
        elif isinstance(port, int):
            port = port
        else:
            raise BadRequestError("Invalid port type: %r" % port)

        if not associated:
            key_assoc = KeyAssociation(keypair=self.key, last_used=0,
                                       ssh_user=username, sudo=False,
                                       port=port)
            machine.key_associations.append(key_assoc)
            machine.save()
            trigger_session_update(self.key.owner, ['keys'])
        return key_assoc

    def disassociate(self, machine):
        """Disassociates a key from a machine."""

        log.info("Disassociating key of machine '%s' " % machine.machine_id)

        # removing key association
        for assoc in machine.key_associations:
            if assoc.keypair == self.key:
                break
        machine.key_associations.remove(assoc)
        machine.save()
        trigger_session_update(self.key.owner, ['keys'])
