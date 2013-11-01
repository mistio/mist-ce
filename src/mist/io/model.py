"""Mist Io Model

Here we define the schema of our data structure in an object oriented
way.

Simple, low level, helper functions can also be added to the
following classes. (eg user.get_num_mon_machines(), user.keys.unused()).
It is recommended that only pure functions (no side-effects) are used
as class methods.
"""


import logging


from mist.io.dal import StrField, IntField
from mist.io.dal import FloatField, BoolField
from mist.io.dal import ListField, DictField
from mist.io.dal import getOODictField
from mist.io.dal import getFieldsListField, getFieldsDictField
from mist.io.dal import OODict
from mist.io.dal import UserEngine


log = logging.getLogger(__name__)


class Machine(OODict):
    """A vm in a backend"""
    hasMonitoring = BoolField()
    uuid = StrField()
    monitor_server = DictField()


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
    machines = getFieldsDictField(getOODictField(Machine))()

    def __repr__(self):
        return super(Backend, self).__repr__(['title', 'provider', 'region'])


class Keypair(OODict):
    """An ssh keypair."""
    public = StrField()
    private = StrField()
    default = BoolField()
    machines = ListField()

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
