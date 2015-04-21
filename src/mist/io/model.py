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
from hashlib import sha1

from mist.io.dal import StrField, HtmlSafeStrField
from mist.io.dal import IntField, FloatField, BoolField
from mist.io.dal import ListField, DictField
from mist.io.dal import OODict, FieldsDict, FieldsList, make_field
try:
    from mist.core.dal import User as DalUser
    from mist.core.dal import FieldsDict  # escapes dots in keys (for mongo)
except ImportError:
    from mist.io.dal import User as DalUser
from mist.io import exceptions

try:
    from mist.core import config
except ImportError:
    from mist.io import config

import logging
logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)


class Machine(OODict):
    """A saved machine in the machines list of some backend.

    For the time being, only bare metal machines are saved, for API backends
    we get the machine list from the provider.

    """

    ## hasMonitoring = BoolField()
    uuid = StrField()
    ## monitor_server = make_field(MonitorServer)()
    dns_name = HtmlSafeStrField()
    public_ips = ListField()
    ## collectd_password = StrField()
    name = HtmlSafeStrField()
    ssh_port = IntField(22)
    os_type = StrField('unix')
    remote_desktop_port = IntField(3389)


class Machines(FieldsDict):
    """Collection of machines of a certain backend.

    For the time being, only bare metal machines are saved, for API backends
    we get the machine list from the provider.

    """

    _item_type = make_field(Machine)
    _key_error = exceptions.MachineNotFoundError


class Backend(OODict):
    """A cloud vm provider backend"""

    enabled = BoolField()
    machine_count = IntField()
    apiurl = StrField()
    apikey = HtmlSafeStrField()
    apisecret = StrField()
    title = HtmlSafeStrField()
    tenant_name = HtmlSafeStrField()
    auth_version = HtmlSafeStrField()
    region = HtmlSafeStrField()
    poll_interval = IntField(10000)
    provider = HtmlSafeStrField()
    ## datacenter = StrField()
    compute_endpoint = StrField()
    key_file = StrField()
    cert_file = StrField()
    ssh_port = IntField(22)
    docker_port = IntField(4243)
    machines = make_field(Machines)()
    starred = ListField()
    unstarred = ListField()

    def __repr__(self):
        print_fields = ['title', 'provider', 'region']
        return super(Backend, self).__repr__(print_fields)

    def get_id(self):
        from mist.io.helpers import b58_encode
        if self.provider == 'docker':
            concat = '%s%s%s' % (self.provider, self.title, self.apiurl)
        elif self.provider == 'bare_metal':
            name = self.machines.values()[0].name
            concat = '%s%s%s' % (self.provider, '', name)
        elif self.provider == 'openstack' or 'hpcloud' in self.provider:
            concat = "%s%s%s%s%s" % (self.provider, self.region, self.apikey, self.apiurl, self.tenant_name)
        elif self.provider == 'libvirt':
            concat = "%s%s" % (self.provider, self.apiurl)
        elif self.provider in ['vcloud', 'indonesian_vcloud', 'vsphere']:
            concat = "%s%s%s%s" % (self.provider, self.apikey, self.apisecret, self.apiurl)
        else:
            concat = '%s%s%s' % (self.provider, self.region, self.apikey)
        return b58_encode(int(sha1(concat).hexdigest(), 16))


class Backends(FieldsDict):

    _item_type = make_field(Backend)
    _key_error = exceptions.BackendNotFoundError


class Keypair(OODict):
    """An ssh keypair."""

    public = StrField()
    private = StrField()
    default = BoolField()
    machines = ListField()

    def generate(self):
        """Generates a new RSA keypair and assignes to self."""
        from Crypto import Random
        Random.atfork()
        key = RSA.generate(2048)
        self.private = key.exportKey()
        self.public = key.exportKey('OpenSSH')

    def isvalid(self):
        """Checks if self is a valid RSA keypair."""
        from Crypto import Random
        Random.atfork()
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
        from Crypto import Random
        Random.atfork()
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
    _key_error = exceptions.KeypairNotFoundError


class User(DalUser):
    """The basic model class is User. It contains all the methods
    necessary to find and save users in memcache and in mongo.
    It transforms the user dict into an object with consistent
    attributes instead of inconsistent dict with missing keys.

    """

    email = StrField()
    mist_api_token = StrField()
    backends = make_field(Backends)()
    keypairs = make_field(Keypairs)()

    def __repr__(self):
        return super(User, self).__repr__(['email'])
