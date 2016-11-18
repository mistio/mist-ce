"""Keypair entity model"""
from uuid import uuid4
import mongoengine as me
import mist.core.tag.models
from Crypto.PublicKey import RSA
from mist.core.user.models import Owner, Organization
from mist.io.exceptions import BadRequestError
from mist.io.keys import controllers
from mist.io.keys.base import BaseKeyController
from mist.io.exceptions import RequiredParameterMissingError


class Key(me.Document):
    """Abstract base class for every key/machine attr mongoengine model.

    This class defines the fields common to all keys of all types. For each
    different key type, a subclass should be created adding any key
    specific fields and methods.

    Documents of all Key subclasses will be stored on the same mongo
    collection.

    One can perform a query directly on Key to fetch all key types, like
    this:

        Key.objects(owner=owner).count()

    This will return an iterable of keys for that owner. Each key will be
    an instance of its respective Key subclass, like SSHKey and SignedSSHKey
    instances.

    Keys of a specific type can be queried like this:

        SSKey.objects(owner=owner).count()

    This will return an iterable of SSHKey instances.

    To create a new key, one should initialize a Key subclass like
    SSHKey. Initializing directly a Key instance won't have any fields
    or associated handler to work with.

    Each Key subclass should define a `_controller_cls` class attribute. Its
    value should be a subclass of
    `mist.io.keys.controllers.BaseKeyController'. These
    subclasses are stored in `mist.io.keys.BaseKeyController`. When a key is
    instanciated, it is given a `ctl` attribute which gives access to the
    keys controller. This way it is possible to do things like:

        key = Key.objects.get(id=key_id)
        key.ctl.generate()

    """
    meta = {
        'allow_inheritance': True,
        'collection': 'keys',
        'indexes': [
            {
                'fields': ['owner', 'name'],
                'sparse': False,
                'unique': True,
                'cls': False,
            },
        ],
    }

    id = me.StringField(primary_key=True,
                        default=lambda: uuid4().hex)
    name = me.StringField(required=True)
    owner = me.ReferenceField(Owner)
    default = me.BooleanField(default=False)

    _private_fields = ()
    _controller_cls = None

    def __init__(self, *args, **kwargs):
        super(Key, self).__init__(*args, **kwargs)

        # Set attribute `ctl` to an instance of the appropriate controller.
        if self._controller_cls is None:
            raise NotImplementedError(
                "Can't initialize %s. Key is an abstract base class and "
                "shouldn't be used to create cloud instances. All Key "
                "subclasses should define a `_controller_cls` class attribute "
                "pointing to a `BaseController` subclass." % self
            )
        elif not issubclass(self._controller_cls, BaseKeyController):
            raise TypeError(
                "Can't initialize %s.  All Key subclasses should define a"
                " `_controller_cls` class attribute pointing to a "
                "`BaseController` subclass." % self
            )
        self.ctl = self._controller_cls(self)

        # Calculate and store key type specific fields.
        self._key_specific_fields = [field for field in type(self)._fields
                                          if field not in Key._fields]

    @classmethod
    def add(cls, owner, name, id='', **kwargs):
        """Add key

        This is a class method, meaning that it is meant to be called on the
        class itself and not on an instance of the class.

        You 're not meant to be calling this directly, but on a key subclass
        instead like this:

            key = SSHKey.add(owner=org, name='unicorn', **kwargs)
        """
        if not name:
            raise RequiredParameterMissingError('title')
        if not owner or not isinstance(owner, Owner):
            raise BadRequestError('owner')
        key = cls(owner=owner, name=name)
        if id:
            key.id = id
        key.ctl.add(**kwargs)
        return key

    def delete(self):
        super(Key, self).delete()
        mist.core.tag.models.Tag.objects(resource=self).delete()

    def as_dict(self):
        # Return a dict as it will be returned to the API
        mdict = {
            'id': self.id,
            'name': self.name,
            'owner': self.owner.id,
            'default': self.default,
        }

        mdict.update({key: getattr(self, key)
                      for key in self._key_specific_fields
                      if key not in self._private_fields})
        return mdict

    def __str__(self):
        return '%s key %s (%s) of %s' % (type(self), self.name,
                                         self.id, self.owner)


class SSHKey(Key):
    """An ssh key."""
    meta = {
        'allow_inheritance': True,
    }

    public = me.StringField(required=True)
    private = me.StringField(required=True)

    _controller_cls = controllers.SSHKeyController
    _private_fields = ('private',)

    def clean(self):
        """Ensures that self is a valid RSA keypair."""
        from Crypto import Random
        Random.atfork()
        message = 'Message 1234567890'
        if self.public and 'ssh-rsa' in self.public:
            public_key_container = RSA.importKey(self.public)
            private_key_container = RSA.importKey(self.private)
            encr_message = public_key_container.encrypt(message, 0)
            decr_message = private_key_container.decrypt(encr_message)
            if message == decr_message:
                return True
            raise me.ValidationError("Invalid RSA keypair")  # TODO is it ok?


class SignedSSHKey(SSHKey):
    """An signed ssh key"""
    certificate = me.StringField(required=True)

    _controller_cls = controllers.SSHKeyController

    def clean(self):
        """
        # Checks if certificate is specific ssh-rsa-cert
           and ensures that self is a valid RSA keypair."""
        super(SignedSSHKey, self).clean()
        if (self.certificate and
                not self.certificate.startswith('ssh-rsa-cert-v01@openssh.com'
                                                )):
            self.certificate = ''
