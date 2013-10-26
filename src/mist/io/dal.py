"""Mist Io DAL

DAL can stand for 'Database Abstraction Layer', 'Data Access Layer' and
several more similar combinations.

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
a default value. They can also be instances of other OODict subclasses
or collections there of.

From here you should import:
StrField, IntField, FloatField, BoolField, ListField, DictField,
getOODictField, getFieldsListField, getFieldsDictField, OODict, UserEngine
"""

import logging


log = logging.getLogger()


### Data Access Object ###


class Field(object):
    """Field is an abstract base class meant to be subclassed.

    All field elements must inherit it so that they
    can be distinguished from other instance attributes.

    front_types and back_types must be lists of new style classes. They
    represent the valid types a field may have in the frontend (python)
    and in the backend (mongo). The first element takes precedence.
    Values will always be casted based on the first type. The rest just
    declare that they are also accepted inputs and should not raise
    errors.

    cast2front and cast2back must be methods that take as input a value
    from one end and cast it to the other, replacing it with the default
    value of the field if no value or None is given.
    """

    front_types = []
    back_types = []
    default = None

    def cast2front(self, back_value=None):
        log.debug("%s casting to front value %s (%s)",
                  type(self), back_value, type(back_value))
        return self._cast(back_value, back=False)

    def cast2back(self, front_value=None):
        log.debug("%s casting to back value %s (%s)",
                  type(self), front, type(front_value))
        return self._cast(front_value, back=True)

    def _cast(self, val, back=False, dry=False):
        import pdb;pdb.set_trace()
        if back:
            atypes, btypes = self.front_types, self.back_types
        else:
            atypes, btypes = self.back_types, self.front_types
        btype = btypes[0]
        if val is None:
            val = self.default
        if type(val) not in atypes and type(val) not in btypes:
            log.error("%s value: '%s' is %s, should be in %s"
                      "will try to cast and see what happens...",
                      type(self), val, type(val), atypes)
        if type(val) is not btype and not dry:
            return btype(val)
        return val

    def __init__(self, val=None):
        if val is not None:
            val = self.front_types[0](val)
        else:
            val = self.front_types[0]()
        self.default = val

    def __repr__(self):
        return self.default.__repr__()


class StrField(Field):
    """Sets a string field, inherits from str. Default: ''"""
    front_types = back_types = [str, unicode]


class IntField(Field):
    """Sets an int field, inherits from int. Default: 0"""
    front_types = back_types = [int, float]


class FloatField(Field):
    """Sets a floating point number field, inherits from float.
    Default: 0.0
    """
    front_types = back_types = [float]


class ListField(Field):
    """Sets a list field. Default: []"""
    front_types = back_types = [list, tuple]


class DictField(Field):
    """Sets a dict field. Default: {}"""
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
        ftype, btype = self.front_types[0], self.back_types[0]
        log.debug("%s casting to back value %s (%s)",
                  type(self), front_value, type(front_value))
        val = self._cast(front_value, back=True, dry=True)
        if type(val) not in [ftype, btype]:
            raise TypeError("%s is not %s or %s" % (val, ftype, btype))
        val = self.cast2front(val)
        return val.get_raw()


def getOODictField(oodict):
    """Returns a Field type. oodict must be a subclass of OODict.
    """

    if type(oodict) is not type:
        raise TypeError("oodict must be a class, subclass of OODict")
    if not issubclass(oodict, OODict):
        raise TypeError("oodict must be a class, subclass of OODict")

    class OODictField(ObjectField):
        """Sets a dict field that will be parsed by a
        BaseObject subclass.
        """

        front_types, back_types = [oodict], [dict]

    return OODictField


def getFieldsListField(field):

    if type(field) is not type:
        raise TypeError("field arg must be a class, subclass of Field.")
    if not issubclass(field, Field):
        raise TypeError("field arg must be a class, subclass of Field.")

    class FieldsListField(ObjectField):
        front_types, back_types = [getFieldsList(field)], [list]
    return FieldsListField


def getFieldsDictField(field):
    if type(field) is not type:
        raise TypeError("field arg must be a class, subclass of Field.")
    if not issubclass(field, Field):
        raise TypeError("field arg must be a class, subclass of Field.")

    class FieldsDictField(ObjectField):
        front_types, back_types = [getFieldsDict(field)], [dict]
    return FieldsDictField


class BaseObject(object):
    pass


class OODict(BaseObject):
    """Base model class"""

    _fields = []

    def __init__(self, _dict={}):
        """Initiate user by given dict."""
        self._dict = _dict
        self._fields = []
        for name in dir(self):
            attr = object.__getattribute__(self, name)
            t = type(attr)
            if issubclass(t, Field):
                # find fields
                self._fields.append(name)
                # reset fields to their default values
                #~ if t in [FieldList, FieldDict]:
                    #~ new = t(attr._model, attr)
                #~ else:
                    #~ new = t(attr)
                #~ object.__setattr__(self, name, new)

    def __getattribute__(self, name):
        """Overide attributes to handle dict keys as instance
        attributes.
        """

        # get real object attribute
        attr = object.__getattribute__(self, name)
        # if it's a field
        if issubclass(type(attr), Field):
            # get real dict value
            dict_value = self._dict.get(name)
            # if real value not set or wrong type:
            if dict_value is None:
                logging.warn("Missing field '%s' on storage. "
                             "Setting to default" % name)
                # set to default
                self.__setattr__(name, attr)
            elif type(dict_value) not in attr.back_types:
                # set dict value
                logging.warn("Invalid type %s detected on storage for "
                             "field '%s'. Should be %s. Changing type."
                           % (type(dict_value), name, attr.back_types))
                # resetting will fix type issue
                self.__setattr__(name, dict_value)
            # reload and cast before returning
            dict_value = self._dict[name]
            if type(dict_value) is not attr.front_types[0]:
                logging.warn("casting from %s to %s for %s",
                            type(dict_value), attr.front_types[0], name)
                return attr.front_types[0](self._dict[name])
            return dict_value
        return attr

    def __setattr__(self, name, value):
        """Overide attributes to handle dict keys as instance
        attributes.
        """

        if name not in self._fields:
            return object.__setattr__(self, name, value)

        attr = object.__getattribute__(self, name)
        bt = attr.back_types[0]
        ft = attr.front_types[0]
        t = type(value)
        if ft is bt and issubclass(t, bt):
            if t is bt:
                self._dict[name] = value
            else:
                self._dict[name] = bt(value)
        elif t is ft:
            if issubclass(t, Field):
                self._dict[name] = value.raw()
            else:
                self._dict[name] = value
        elif issubclass(t, bt):
            logging.warn("You are trying to write using the \
                backend value instead of the frontend one.")
            if t is bt:
                self._dict[name] = value
            else:
                self._dict[name] = bt(value)
        else:
            logging.error("Invalid value '%s' for field "
                          "'%s', type is %s", value, name, t)
            self._dict[name] = bt(value)
#~ raise TypeError("You are trying to write using an invalid value.")

    def __str__(self):
        """Overide string conversion to print nicely."""
        s = ""
        for name in self._fields:
            s += "%s: %s\n" % (name, self.__getattribute__(name))
        return s

    def __nonzero__(self):
        return bool(self._dict)


class FieldsSequence(BaseObject):
    """Sets up a basic Sequence field, whose items are being parsed by
    some Field subclass. That means you can have a list or dict with
    str values, or int, or bool, or some derivative of BaseObject.
    This class and its subclasses interface upon an existing sequence,
    without copying it.
    """

    seq = None          # the actual seq being interfaced
    seq_type = None     # must be a type, either list or dict
    item_type = None    # must be a type, subclass of Field

    def __init__(self, seq=None):
        """Argument 'seq'  can be a sequence of type self.seq_type.
        This class will operate directly on this seq, without copying it.
        If a seq is not passed, a new sequence will be created.
        """

        if seq is not None and type(seq) is not self.seq_type:
            raise TypeError("%s is type %s, should be type %s"
                            % (seq, type(seq), self.seq_type))
        if seq is None:
            seq = self.seq_type()
        self.seq = seq

    def __getitem__(self, key):
        value = self.seq[key]
        if type(value) not in self.item_type.back_types:
            logging.warn("Invalid type %s detected on "
                         "storage. Should be in %s",
                         type(value), self.item_type.back_types)
            value = self.item_type(value).cast2back()
        if type(value) is not self.item_type.front_types[0]:
            value = self.item_type(value).cast2front()
        return value

    def __len__(self):
        return len(self.seq)


def getFieldsList(field):
    class FieldsList(FieldsSequence):
        seq_type = list
        item_type = field
    return FieldsList


def getFieldsDict(field):
    class FieldsDict(FieldsSequence):
        seq_type = dict
        item_type = field

        def keys(self):
            return self.seq.keys()

        def __repr__(self):
            items = ("%s: %s" % (key, self.seq[key].__repr__())
                     for key in self.seq)
            return "{%s}" % ','.join(items)

    return FieldsDict


### Persistence handling ###


class UserEngine(OODict):

    def __init__(self, _dict={}):
        """Set the storage resources and initiate the user.
        _dict should be a user dict, as returned by mongo
        """
        super(UserEngine, self).__init__(_dict)

    def refresh(self, flush=False):
        """Dummy method, doesn't really do anything."""

    def lock_n_load(self):
        """Dummy lock, doesn't actually do anything.
        It must be used with a 'with' statement as follows:
            with user.lock_n_load():
                # edit user
                user.save()
        Lock is automatically released after exiting the 'with' block.
        """

        try:
            self._lock = True
            yield   # here execution returns to the with statement
        except Exception as e:
            # This block is executed if an exception is raised in the try
            # block above or inside the with statement that called this.
            # Returning False will reraise it.
            logging.error("lock_n_load got an exception: %s" % e)
            raise e
        finally:
            self._lock = False

    def save(self):
        """Save user data to storage. Raises exception if not in a
        "with user.lock_n_load():" code block.
        """
        if not self._lock:
            raise Exception("Attempting to save without prior lock. \
                             You should be ashamed of yourself.")
