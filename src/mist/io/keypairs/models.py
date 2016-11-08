"""Keypair entity model"""
import json
from uuid import uuid4
import mongoengine as me
import mist.core.tag.models
from Crypto.PublicKey import RSA
from mist.core.user.models import Owner, Organization
from mist.io.exceptions import BadRequestError
from mist.io.keypairs.controllers import KeypairController
from mist.io.exceptions import RequiredParameterMissingError

# TODO rename sshkeys
class Keypair(me.Document):
    """An ssh keypair."""
    id = me.StringField(primary_key=True,
                        default=lambda: uuid4().hex)
    name = me.StringField(required=True, unique_with="owner")
    public = me.StringField(required=True)
    private = me.StringField(required=True)
    certificate = me.StringField(required=False)
    default = me.BooleanField(default=False)
    owner = me.ReferenceField(Owner)   # TODO Organization required?

    def __init__(self, *args, **kwargs):
        super(Keypair, self).__init__(*args, **kwargs)
        self.ctl = self.KeypairController(self)

    @classmethod
    def add(cls, owner, name, id='', **kwargs):
        """Add keypair
        """
        if not name:
            raise RequiredParameterMissingError('title')
        if not owner or not isinstance(owner, Organization):
            raise BadRequestError('owner')
        keypair = cls(owner=owner, name=name)
        keypair.ctl.add(**kwargs)
        return keypair

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
        raise me.ValidationError("Invalid RSA keypair") # FIXME is it correct?

    def delete(self):
        super(Keypair, self).delete()
        mist.core.tag.models.Tag.objects(resource=self).delete()

    def as_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'owner': self.owner.id,
            'public': self.public,
            'default': self.default,
            'certificate': self.certificate,
        }

    def __str__(self):
        return 'Keypair %s (%s) of %s' % (self.name, self.id, self.owner)
