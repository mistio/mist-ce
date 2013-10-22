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

Classes that inherit BaseModel are initiated using a dict. Dict keys are
on the fly transformed to object attributes, based on predefined fields.
A BaseModel subclass can have fields that are themselves BaseModel
derivatives or collections of BaseModel derivatives.

From here you should import:
StrField, IntField, FloatField, BoolField, ListField, DictField,
getModelField, getSeqFieldsField, BaseModel, UserEngine
"""

import logging


log = logging.getLogger()


### Data Access Object ###


class Field(object):
    """Dummy class. All field elements must inherit it so that they
    can be distinguished from other instance attributes.
    """

    def back_type(self):
        """Return the type (class) with wich the data in the storage
        will be saved.
        """

    def front_type(self):
        """Return the type (class) with wich the data will be displayed
        through this layer to the app.
        """

    def raw(self):
        """Return the data as it should be saved in the storage."""


class StrField(str, Field):
    """Sets a string field, inherits from str. Default: ''"""
    _type = str
    def back_type(self):
        return unicode
    def front_type(self):
        return str


class TypeField(Field):
    """Class for fields that subclass a builtin type."""

    _type = None

    def back_type(self):
        return self._type

    def front_type(self):
        return self._type

    def raw(self):
        return self._type(self)


class IntField(int, TypeField):
    """Sets an int field, inherits from int. Default: 0"""
    _type = int


class FloatField(float, TypeField):
    """Sets a floating point number field, inherits from float.
    Default: 0.0
    """
    _type = float


class ListField(list, TypeField):
    """Sets a list field. Default: []"""
    _type = list


class DictField(dict, TypeField):
    """Sets a dict field. Default: {}"""
    _type = dict

class BoolField(Field):
    """Sets a boolean field. Default: False"""

    # We cannot inherit bool, so we mimic one
    def __init__(self, value=False):
        self.value = bool(value)

    def __nonzero__(self):
        """Evaluate as bool"""
        return self.value

    def __repr__(self):
        """Print as bool"""
        return str(self.value)

    def back_type(self):
        return bool

    def front_type(self):
        return bool

    def raw(self):
        return self.value


def getModelField(model):
    """Returns a Field type that inherits model. Model must be a
    subclass of BaseModel.
    """

    if not issubclass(model, BaseModel):
        raise TypeError("%s is not subclass of BaseModel" % model)

    class ModelField(model, Field):
        """Sets a dict field that will be parsed by a
        BaseModel subclass.
        """

        def back_type(self):
            return dict

        def front_type(self):
            return model

        def raw(self):
            return self._dict

    return ModelField


class SeqModelField(Field):
    """Sets up a basic Sequence field, whose items are being parsed by
    some Field subclass. That means you can have a list or dict with
    str values, or int, or bool, or some derivative of BaseModel.
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
        if type(value) is not self.item_type.back_type():
            logging.warn("Invalid type %s detected on storage. Should be %s"
                    % (type(value), self.item_type.back_type()))
            value = self.item_type.back_type()(value)
        if self.item_type.back_type() is not self.item_type.front_type():
            value = self.item_type.front_type()(value)
        return value

    def front_type(self):
        return type(self)

    def back_type(self):
        return self.seq_type

    def raw(self):
        return self.seq


class ListModelField(SeqModelField):
    seq_type = list


class DictModelField(SeqModelField):
    seq_type = dict

    def __repr__(self):
        items = ("%s: %s" % (key, self.seq[key].__repr__())
                 for key in self.seq)
        return "{%s}" % ','.join(items)


def getSeqFieldsField(seq_type, field_type):
    type_err = ''
    if type(seq_type) is type:
        if seq_type not in (list, dict):
            type_err += ("seq_type argument %s should be list or dict. "
                    % seq_type)
    else:
        type_err += ("seq_type argument %s should be of type 'type'. "
                    % seq_type)
    if type(field_type) is type:
        if not issubclass(field_type, Field):
            type_err += ("field_type argument %s should be subclass of \
                        Field. " % seq_type)
    else:
        type_err += ("field_type argument %s should be of type 'type'. "
                    % field_type)
    if type_err:
        raise TypeError(type_err)

    if seq_type is list:
        class ListModel(ListModelField):
            item_type = field_type
        return ListModel
    if seq_type is dict:
        class DictModel(DictModelField):
            item_type = field_type
        return DictModel


class BaseModel(object):
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
                logging.warn("Missing field '%s' on storage. Setting to default" % name)
                # set to default
                self.__setattr__(name, attr)
            elif type(dict_value) is not attr.back_type():
                # set dict value
                logging.warn("Invalid type %s detected on storage for field '%s'. Should be %s. Changing type."
                    % (type(dict_value), name, attr.back_type()))
                # resetting will fix type issue
                self.__setattr__(name, dict_value)
            # reload and cast before returning
            dict_value = self._dict[name]
            if type(dict_value) is not attr.front_type():
                logging.warn("casting from %s to %s for %s", type(dict_value), attr.front_type(), name)
                return attr.front_type()(self._dict[name])
            return dict_value
        return attr

    def __setattr__(self, name, value):
        """Overide attributes to handle dict keys as instance
        attributes.
        """

        if name not in self._fields:
            return object.__setattr__(self, name, value)

        attr = object.__getattribute__(self, name)
        bt = attr.back_type()
        ft = attr.front_type()
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
            logging.error("Invalid value '%s' for field '%s', type is %s", value, name, t)
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


### Persistence handling ###


class UserEngine(BaseModel):

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
