"""Mist Io Model

Here we define the schema of our data structure in an object oriented
way.

Simple, low level, helper functions can also be added to the
following classes. (eg user.get_num_mon_machines(), user.keys.unused()).
It is recommended that only pure functions (no side-effects) are used
as class methods.
"""


from mist.io.dal import StrField, IntField
from mist.io.dal import FloatField, BoolField
from mist.io.dal import ListField, DictField
from mist.io.dal import getModelField, getSeqFieldsField
from mist.io.dal import BaseModel
from mist.io.dal import UserEngine


class Machine(BaseModel):
    """A vm in a backend"""
    hasMonitoring = BoolField()
    uuid = StrField()
    monitor_server = DictField()


class Backend(BaseModel):
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

    starred = ListField()
    machines = getSeqFieldsField(list, getModelField(Machine))()


class Keypair(BaseModel):
    """An ssh keypair."""
    public = StrField()
    private = StrField()
    default = BoolField()
    machines = ListField()


class User(UserEngine):
    """The basic model class is User. It contains all the methods
    necessary to find and save users in memcache and in mongo.
    It transforms the user dict into an object with consistent
    attributes instead of inconsistent dict with missing keys.
    """

    email = StrField()
    password = StrField()
    backends = getSeqFieldsField(dict, getModelField(Backend))()
    keypairs = getSeqFieldsField(dict, getModelField(Keypair))()
