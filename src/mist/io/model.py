"""Mist Io Model

Here we define the schema of our data structure in an object oriented
way.

Simple, low level, helper functions can also be added to the
following classes. (eg user.get_num_mon_machines(), user.keys.unused()).
It is recommended that only pure functions (no side-effects) are used
as class methods.

How this works:
The basic class is the OODict. This defines a dict to object mapper.
When we need a new data structure, we define a new subclass of OODict.
Class properties that are instances of Field subclasses are considered to be
OODict fields. These are the keys in the underlying dict that will be used.
There is a large variety of standard type fields.
One can create an OODict that has a field which is also parsed by some OODict.
To do so, you define a field on the outer OODict that is created by make_field.
Finally, list or dict like collections can be created by subclassing FieldsList
and FieldsDict. The items of these collections will be parsed according to
the field type defined in the class. This collection can be used as a field
in some OODict by use of make_field. If it sounds too complicated, just look
the code below, it should be pretty self-explanatory.

"""


import os
import logging


from Crypto.PublicKey import RSA
from hashlib import sha256

from mist.io.dal import StrField, IntField, FloatField, BoolField
from mist.io.dal import ListField, DictField
from mist.io.dal import OODict, FieldsDict, FieldsList, make_field
from mist.io.dal import UserEngine
from mist.io.exceptions import BackendNotFoundError, KeypairNotFoundError


log = logging.getLogger(__name__)


class Backend(OODict):
    """A cloud vm provider backend"""

    enabled = BoolField()
    machine_count = IntField()
    apiurl = StrField()
    apikey = StrField()
    apisecret = StrField()
    title = StrField()
    tenant_name = StrField()
    region = StrField()
    poll_interval = IntField()
    provider = StrField()
    datacenter = StrField()

    starred = ListField()

    def __repr__(self):
        print_fields = ['title', 'provider', 'region']
        return super(Backend, self).__repr__(print_fields)

    def get_id(self):
        concat = '%s:%s:%s' % (self.provider, self.region, self.apikey)
        return sha256(concat).hexdigest()


class Backends(FieldsDict):

    _item_type = make_field(Backend)

    def __getitem__(self, key):
        try:
            return super(Backends, self).__getitem__(key)
        except KeyError:
            raise BackendNotFoundError(key)

    def __setitem__(self, key, value):
        try:
            return super(Backends, self).__setitem__(key, value)
        except KeyError:
            raise BackendNotFoundError(key)

    def __delitem__(self, key):
        try:
            return super(Backends, self).__delitem__(key)
        except KeyError:
            raise BackendNotFoundError(key)


class Keypair(OODict):
    """An ssh keypair."""

    public = StrField()
    private = StrField()
    default = BoolField()
    machines = ListField()

    def generate(self):
        """Generates a new RSA keypair and assignes to self."""

        key = RSA.generate(2048, os.urandom)
        self.private = key.exportKey()
        self.public = key.exportKey('OpenSSH')

    def isvalid(self):
        """Checks if self is a valid RSA keypair."""

        message = 'Message 1234567890'
        if 'ssh-rsa' in self.public:
            public_key_container = RSA.importKey(self.public)
            private_key_container = RSA.importKey(self.private)
            encr_message = public_key_container.encrypt(message, 0)
            decr_message = private_key_container.decrypt(encr_message)
            if message == decr_message:
                return True
        return False

    def construct_public_from_private(self):
        """Constructs pub key from self.private and assignes to self.public.
        Only works for RSA.

        """

        if 'RSA' in self.private:
            try:
                key = RSA.importKey(self.private)
                public = key.publickey().exportKey('OpenSSH')
                self.public = public
                return True
            except:
                pass
        return False

    def __repr__(self):
        return super(Keypair, self).__repr__(['default', 'machines'])


class Keypairs(FieldsDict):

    _item_type = make_field(Keypair)

    def __getitem__(self, key):
        try:
            return super(Keypairs, self).__getitem__(key)
        except KeyError:
            raise KeypairNotFoundError(key)

    def __setitem__(self, key, value):
        try:
            return super(Keypairs, self).__setitem__(key, value)
        except KeyError:
            raise KeypairNotFoundError(key)

    def __delitem__(self, key):
        try:
            return super(Keypairs, self).__delitem__(key)
        except KeyError:
            raise KeypairNotFoundError(key)


class User(UserEngine):
    """The basic model class is User. It contains all the methods
    necessary to find and save users in memcache and in mongo.
    It transforms the user dict into an object with consistent
    attributes instead of inconsistent dict with missing keys.

    """

    email = StrField()
    password = StrField()
    backends = make_field(Backends)()
    keypairs = make_field(Keypairs)()

    def __repr__(self):
        return super(User, self).__repr__(['email'])
