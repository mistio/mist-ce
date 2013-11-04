"""Mist Io DAL

DAL can stand for 'Database Abstraction Layer', 'Data Access Layer' or
any of several more similar combinations.

The role of this DAL is to take control over all persistence related
operations like reading from and writing to some storage. The rest of
the application knows nothing about how the storage is implemented and
is only presented with a simple, object oriented API.

Mist io uses yaml files as its storage backend. We store data using a
main dict consisting of nested dicts, lists, ints, strs etc. This
module provides an object oriented interface on those dicts.

A basic class here is OODict that defines a dict to object mapper.
Classes that inherit OODict are initiated using a dict. Dict keys are
on the fly transformed to object attributes, based on predefined fields.
These fields (subclasses of Field) can be of a certain type and may have
a default value.

From here you should import:
StrField, IntField, FloatField, BoolField, ListField, DictField,
getOODictField, getFieldsListField, getFieldsDictField, OODict, UserEngine
"""


import logging
import os
import yaml
from time import sleep
from copy import copy, deepcopy
from collections import MutableSequence, MutableMapping
from contextlib import contextmanager


log = logging.getLogger(__name__)


### Data Access Object ###


class Field(object):
    """Field is an abstract base class meant to be subclassed.

    All field elements must inherit it so that they
    can be distinguished from other instance attributes.

    Front refers to the python side, back refers to the storage side.
    front_types and back_types must be lists of new style classes. They
    represent the valid types a field may have.
    Values will always be casted based on the first type. The rest just
    declare that they are also accepted inputs and should not raise
    errors.
    """

    front_types = []
    back_types = []
    default = None

    def cast2front(self, back_value=None):
        """Take a value from the backend and cast to frontend, replacing with
        default if None.
        """

        log.debug("%s: casting value (%s) to front",
                  type(self), type(back_value))
        return self._cast(back_value, self.back_types, self.front_types)

    def cast2back(self, front_value=None):
        """Take a value from the frontend and cast to backend, replacing with
        default if None.
        """
        log.debug("%s: casting value (%s) to back",
                  type(self), type(front_value))
        return self._cast(front_value, self.front_types, self.back_types)

    def _cast(self, val, atypes, btypes, dry=False):
        """2front and 2back is basically the same thing, this saves us code."""
        atype, btype = atypes[0], btypes[0]
        # if val is None (not set), use default value
        if val is None:
            val = deepcopy(self.default)
            log.debug("Just set default value '%s'", self.default)
        if type(val) not in [atype, btype]:
            log.warn("%s: value is %s, should preferably be %s",
                      type(self), type(val), atype)
            if type(val) not in atypes:
                log.error("%s: value is %s, should be in %s",
                          type(self), type(val), atypes)
                if type(val) not in btypes:
                    log.error("it's not even in %s!!! will try to cast "
                              "and see what happens.", btypes)
                else:
                    log.error("at least the value is in "
                              "the group to be casted %s", btypes)
        if type(val) is not btype and not dry:
            log.debug("actually casting value")
            val = btype(val)
        else:
            log.debug("no need to cast value, already of type %s" % btype)
        return val

    def __init__(self, val=None):
        if val is not None:
            val = self.front_types[0](val)
        else:
            val = self.front_types[0]()
        self.default = val

    def __repr__(self):
        default = self.default.__repr__()
        mytype = self.__class__
        return "%s(%s)" % (mytype, default)


class StrField(Field):
    """Sets a string field. Default: ''"""
    front_types = [str, unicode]
    back_types = [str, unicode]


class IntField(Field):
    """Sets an integer field. Default: 0"""
    front_types = back_types = [int, float]


class FloatField(Field):
    """Sets a floating point number field. Default: 0.0"""
    front_types = back_types = [float]


class ListField(Field):
    """Sets a list field. Default: []"""
    front_types = back_types = [list, tuple]


class DictField(Field):
    """Sets a dictionary field. Default: {}"""
    front_types = back_types = [dict]


class BoolField(Field):
    """Sets a boolean field. Default: False"""
    front_types = back_types = [bool]


class ObjectField(Field):
    """This is an abstract base class that inherits from Field. It
    assumes that front type is a subclass of BaseObject and changes
    the way values are casted to backend accordingly.
    """

    def cast2back(self, front_value=None):
        ftypes, btypes = self.front_types, self.back_types
        ftype, btype = ftypes[0], btypes[0]
        log.debug("%s casting to back value (%s)",
                  type(self), type(front_value))
        val = self._cast(front_value, ftypes, btypes, dry=True)
        if type(val) not in [ftype, btype]:
            raise TypeError("%s is not %s or %s" % (val, ftype, btype))
        val = self.cast2front(val)
        return val.get_raw()


def getOODictField(oodict):
    """Returns a Field type that is stored as a dict in the backend and handled
    as an OODict in the frontend. oodict must be a subclass of OODict."""

    if type(oodict) is not type:
        raise TypeError("oodict must be a class, subclass of OODict")
    if not issubclass(oodict, OODict):
        raise TypeError("oodict must be a class, subclass of OODict")

    class OODictField(ObjectField):
        """Sets a dict field that will be parsed by a OODict subclass."""

        front_types, back_types = [oodict], [dict]

    return OODictField


def getFieldsListField(field):
    """Returns a Field type that is stored as a list in the backend and handled
    as an FieldsList in the frontend. field must be a subclass of Field."""

    if type(field) is not type:
        raise TypeError("field arg must be a class, subclass of Field.")
    if not issubclass(field, Field):
        raise TypeError("field arg must be a class, subclass of Field.")

    class FieldsListField(ObjectField):

        front_types, back_types = [getFieldsList(field)], [list]
    return FieldsListField


def getFieldsDictField(field):
    """Returns a Field type that is stored as a dict in the backend and handled
    as an FieldsDict in the frontend. field must be a subclass of Field."""

    if type(field) is not type:
        raise TypeError("field arg must be a class, subclass of Field.")
    if not issubclass(field, Field):
        raise TypeError("field arg must be a class, subclass of Field.")

    class FieldsDictField(ObjectField):
        front_types, back_types = [getFieldsDict(field)], [dict]
    return FieldsDictField


class OODict(object):
    """OODict is an abstract base class that defines a dict to object mapper.
    It is instantiated given a dict, as obtained by mongo for example.
    By defining (in OODict subclasses) properties that are instances of
    subclasses of Field, we define the dict schema, the names of the fields,
    the types of their values as well as default values.

    This class interfaces an existing dict. So when you give it a dict, as
    obtained by mongo or yaml or memcache or whatever, it sees which properties
    that are instances of subclasses of Field are defined. When you try to
    access that property, the call is intercepted and the values are read from
    and to the dict directly. If they are not of the correct type, they'll be
    casted. If the values are missing on the dict, they will be set to the
    default. This aproach doesn't copy data and store it seperately. It just
    interfaces.
    """

    _fields = []

    def __init__(self, _dict={}):
        """Initiate user by given dict."""
        if type(_dict) is not dict:
            raise TypeError("%s is %s, should be dict" % (_dict, type(_dict)))
        self._dict = _dict
        self._fields = [name for name in dir(self)
            if isinstance(object.__getattribute__(self, name), Field)]

    def __getattribute__(self, name):
        """Overide attributes to handle dict keys as instance attributes."""

        # if it's not a field, just return the attribute
        keys = object.__getattribute__(self, 'keys')()
        if name not in keys:
            return object.__getattribute__(self, name)

        log.debug("OODict getattr %s.", name)
        field = object.__getattribute__(self, name)
        # get real dict value
        dict_value = self._dict.get(name)
        # sanitize/cast/set default
        val = field.cast2front(dict_value)
        if dict_value is None:
            if isinstance(val, OODict) or isinstance(val, FieldsSequence):
                self.__setattr__(name, val)
        return val

    def __setattr__(self, name, value):
        """Overide attributes to handle dict keys as instance attributes."""

        # if it's not a field, just set the attribute
        if name not in self.keys():
            return object.__setattr__(self, name, value)

        log.debug("OODict setattr %s", name)
        field = object.__getattribute__(self, name)
        val = field.cast2back(value)
        self._dict[name] = val

    def keys(self):
        return object.__getattribute__(self, '_fields')

    def __str__(self):
        """Overide string conversion to print nicely."""
        lines = ["%s: %r" % (field, self.__getattribute__(field))
                for field in self.keys()]
        return "\n * ".join([str(type(self))] + lines)

    def __repr__(self, fields=[]):
        s = ", ".join(["%s: %s" % (field, self.__getattribute__(field))
                        for field in fields])
        return "%s (%s)" % (type(self), s)

    def __nonzero__(self):
        return bool(self._dict)

    def get_raw(self):
        return self._dict

    def __copy__(self):
        return type(self)(copy(self._dict))

    def __deepcopy__(self, memo):
        return type(self)(deepcopy(self._dict, memo))


class FieldsSequence(object):
    """Sets up a basic Sequence field, whose items are being parsed by
    some Field subclass. That means you can have a list or dict with
    str values, or int, or bool, or etc. This is an abstract base class.
    It interfaces upon an existing sequence without copying it and treats its
    items based on a field type.

    Here we provide getitem, setitem, delitem and len methods for the
    containers. These methods are complemented by others in the subclasses.
    """

    _seq = None          # the actual seq being interfaced
    _item_type = None    # must be a type, subclass of Field

    def __init__(self, seq_type, *args, **kwargs):
        """Argument 'seq_type' must be either dict or list.
        This class will operate directly on a sequence, without copying it.
        """

        seq = None
        if not kwargs and len(args) == 1:
            arg = args[0]
            if arg is None:
                seq = seq_type()
            elif type(arg) is type(self):
                seq = arg.get_raw()
            elif type(arg) is seq_type:
                seq = arg
        if seq is None:
            seq = seq_type(*args, **kwargs)
        self._seq = seq

    def __getitem__(self, key):
        val = self._seq[key]
        return self._item_type().cast2front(val)

    def __setitem__(self, key, value):
        if type(value) is not self._item_type:
            log.error("Trying to set item in FieldsSequence of %s. "
                "(Should be %s.Will try and see what happens.",
                type(value), self._item_type)
        val = self._item_type().cast2back(value)
        self._seq[key] = val

    def __delitem__(self, key):
        del self._seq[key]

    def __len__(self):
        return len(self._seq)

    def get_raw(self):
        return self._seq

    def __copy__(self):
        return type(self)(copy(self._seq))

    def __deepcopy__(self, memo):
        return type(self)(deepcopy(self._seq, memo))


def getFieldsList(field):
    class FieldsList(FieldsSequence, MutableSequence):
        """This defines a list like container object that parses the real list
        in the backend by treating the items as fields. It inherits basic
        container methods getitem, setitem, delitem and len from FieldsSequence
        and adds the insert method. Based on these basic container methods, the
        MutableSequence ABC provides the rest of the list api, so you can use
        this container just as you would do with a list (append, pop etc).
        """

        _item_type = field

        def __init__(self, *args, **kwargs):
            super(FieldsList, self).__init__(list, *args, **kwargs)

        def insert(self, index, value):
            val = self._item_type().cast2back(value)
            self._seq.insert(index, val)

        def __str__(self):
            """Overide string conversion to print nicely."""
            s = str(type(self)) + "\n"
            for item in self:
                s += "  %r\n" % item
            return s

    return FieldsList


def getFieldsDict(field):
    class FieldsDict(FieldsSequence, MutableMapping):
        """This defines a dict like container object that parses the real dict
        in the backend by treating the items as fields. It inherits basic
        container methods getitem, setitem, delitem and len from FieldsSequence
        and adds the iter method. Based on these basic container methods, the
        MutableMapping ABC provides the rest of the dict api, so you can use
        this container just as you would do with a dict(clear, setdefault etc).
        """

        _item_type = field

        def __init__(self, *args, **kwargs):
            super(FieldsDict, self).__init__(dict, *args, **kwargs)

        def __iter__(self):
            for key in self._seq.keys():
                # if key is unicode, try to transform to str
                if type(key) is unicode:
                    try:
                        key = str(key)
                    except:
                        pass
                yield key

        def __repr__(self):
            d = {key: self[key] for key in self.keys()}
            return "%s: %r" % (type(self), d)

        def __str__(self):
            lines = [str(type(self))]
            lines += ["%r: %r" % (key, self[key]) for key in self.keys()]
            return "\n  * ".join(lines)

    return FieldsDict


### Persistence handling ###
# Completely untested, just POC. Shoud be easy though to make it work


class UserEngine(OODict):
    """This takes care of all storage related operations."""

    _lock = None

    def __init__(self):
        """Loads user from db.yaml"""
        super(UserEngine, self).__init__(self._load_from_settings())

    def _load_from_settings(self):
        """Load user settings from db.yaml We have seperated
        user-specific settings from general settings
        and everything regarding the user dict is
        now in db.yaml (as if it were a database). General
        settings like js_build etc remain in settings.yaml file"""

        yaml_db = os.getcwd() + "/db.yaml"
        try:
            config_file = open(yaml_db, 'r')
        except IOError:
            log.warn('db.yaml does not exist.')
            config_file = open(yaml_db, 'w')
            config_file.close()
            config_file = open(yaml_db, 'r')

        try:
            user_config = yaml.load(config_file) or {}
            config_file.close()
        except:
            log.error('Error parsing db.yaml.')
            config_file.close()
            raise
        return user_config


    def refresh(self, flush=False):
        """Dummy method, doesn't really do anything."""
        self.__init__()


    @contextmanager
    def lock_n_load(self):
        """Dummy lock, doesn't actually do anything.
        It must be used with a 'with' statement as follows:
            with user.lock_n_load():
                # edit user
                user.save()
        Lock is automatically released after exiting the 'with' block.
        """

        #~ sleep_interval = 0.1
        #~ max_wait = 10
        #~ lock_dir = os.getcwd() + "/db.yaml.lock"
        #~ times = 0
        #~ while True:
            #~ try:
                #~ os.mkdir(lock_dir)
            #~ except:
                #~ log.debug("Lock set, sleeping")
                #~ if times * sleep_interval > max_wait:
                    #~ log.critical("DEAD LOCK: Breaking lock")
                    #~ os.rmdir(lock_dir)
                #~ sleep(sleep_interval)
                #~ times += 1
            #~ else:
                #~ log.info("Acquired lock")
                #~ break
        self._lock = True
        try:
            yield
        except:
            raise
        finally:
            log.info("Releasing lock")
            self.lock = False
            #~ os.rmdir(lock_dir)
            
        #~ try:
            #~ self._lock = True
            #~ yield   # here execution returns to the with statement
        #~ except Exception as e:
            #~ # This block is executed if an exception is raised in the try
            #~ # block above or inside the with statement that called this.
            #~ # Returning False will reraise it.
            #~ logging.error("lock_n_load got an exception: %s", e)
            #~ raise e
        #~ finally:
            #~ self._lock = False

    def save(self):
        """Save user data to storage. Raises exception if not in a
        "with user.lock_n_load():" code block.
        """
        if not self._lock:
            raise Exception("Attempting to save without prior lock. "
                            "You should be ashamed of yourself.")

        class folded_unicode(unicode): pass
        class literal_unicode(unicode): pass
        class literal_string(str): pass

        def literal_unicode_representer(dumper, data):
            return dumper.represent_scalar(u'tag:yaml.org,2002:str',
                                           data, style='|')

        def literal_string_representer(dumper, data):
            return dumper.represent_scalar(u'tag:yaml.org,2002:str',
                                           data, style='|')

        def folded_unicode_representer(dumper, data):
            return dumper.represent_scalar(u'tag:yaml.org,2002:str',
                                           data, style='>')

        def unicode_representer(dumper, uni):
            return yaml.ScalarNode(tag=u'tag:yaml.org,2002:str', value=uni)

        yaml.add_representer(unicode, unicode_representer)
        yaml.add_representer(literal_unicode, literal_unicode_representer)
        yaml.add_representer(literal_string, literal_string_representer)
        yaml_db = os.getcwd() + "/db.yaml"
        config_file = open(yaml_db, 'w')
        yaml.dump(self._dict, config_file, default_flow_style=False, )
        config_file.close()
