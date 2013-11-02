"""Mist Io Model

Here we define the schema of our data structure in an object oriented
way.

Simple, low level, helper functions can also be added to the
following classes. (eg user.get_num_mon_machines(), user.keys.unused()).
It is recommended that only pure functions (no side-effects) are used
as class methods.
"""


import os
import logging


from Crypto.PublicKey import RSA


from mist.io.dal import StrField, IntField
from mist.io.dal import FloatField, BoolField
from mist.io.dal import ListField, DictField
from mist.io.dal import getOODictField
from mist.io.dal import getFieldsListField, getFieldsDictField
from mist.io.dal import OODict
from mist.io.dal import UserEngine


log = logging.getLogger(__name__)


class MonitorServer(OODict):
    """A monitor server's details in a machine in a backend."""

    status = StrField()
    uri = StrField()
    users = IntField()


class MonMachine(OODict):
    """A vm in a backend"""

    hasMonitoring = BoolField()
    uuid = StrField()
    monitor_server = getOODictField(MonitorServer)
    dns_name = StrField()
    public_ips = getFieldsListField(StrField)
    collectd_password = StrField()
    name = StrField()


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

    starred = getFieldsListField(StrField)
    machines = getFieldsDictField(getOODictField(MonMachine))()

    def __repr__(self):
        print_fields = ['title', 'provider', 'region']
        return super(Backend, self).__repr__(print_fields)


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
            encrypted_message = public_key_container.encrypt(message, 0)
            decrypted_message = private_key_container.decrypt(encrypted_message)
            if message == decrypted_message:
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


class User(UserEngine):
    """The basic model class is User. It contains all the methods
    necessary to find and save users in memcache and in mongo.
    It transforms the user dict into an object with consistent
    attributes instead of inconsistent dict with missing keys.

    """

    email = StrField()
    password = StrField()
    backends = getFieldsDictField(getOODictField(Backend))()
    keypairs = getFieldsDictField(getOODictField(Keypair))()

    def __repr__(self):
        return super(User, self).__repr__(['email'])
