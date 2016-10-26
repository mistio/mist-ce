"""Definition of base classes for Clouds

This currently contains only BaseController. It includes basic functionality
for a given cloud (including libcloud calls, fetching and storing information
to db etc. Cloud specific controllers are in `mist.io.clouds.controllers`.

"""

import ssl
import logging

import mongoengine as me

from libcloud.common.types import InvalidCredsError

from mist.io.exceptions import MistError
from mist.io.exceptions import BadRequestError
from mist.io.exceptions import CloudExistsError
from mist.io.exceptions import InternalServerError
from mist.io.exceptions import CloudUnavailableError
from mist.io.exceptions import CloudUnauthorizedError

from mist.io.clouds.compute.base import ComputeController

# from mist.core.cloud.models import Machine


log = logging.getLogger(__name__)


# TODO: This should be moved to the tags directory, once it's migrated.
def tags_to_dict(tags):
    """Return a dict with each key/value tag being a dict item

    This will handle:
    - dict {key1: value1, key2: value2, ...}
    - lists of {key: value} pairs
    - lists of {"key": key, "value": value} pairs, value field is optional

    It will return:
    dict {key1: value1, key2: value2, ...}

    """

    if isinstance(tags, dict):
        return tags
    tdict = {}
    for tag in tags:
        if isinstance(tag, dict):
            if len(tag) == 1:
                key = tag.keys()[0]
                tdict[tag] = tag[key]
            elif 'key' in tag:
                tdict[tag['key']] = tag.get('value')
    return tdict


def rename_kwargs(kwargs, old_key, new_key):
    """Given a `kwargs` dict rename `old_key` to `new_key`"""
    if old_key in kwargs:
        if new_key not in kwargs:
            log.warning("Got param '%s' when expecting '%s', trasforming.",
                        old_key, new_key)
            kwargs[new_key] = kwargs.pop(old_key)
        else:
            log.warning("Got both param '%s' and '%s', will not tranform.",
                        old_key, new_key)


class BaseController(object):
    """Abstract base class for every cloud/provider controller

    This base controller factors out all the steps common to all or most
    clouds into a base class, and defines an interface for provider or
    technology specific cloud controllers.

    Subclasses are meant to extend or override methods of this base class to
    account for differencies between different cloud types.

    Care should be taken when considering to add new methods to a subclass.
    All controllers should have the same interface, to the degree this is
    feasible. That is to say, don't add a new method to a subclass unless
    there is a very good reason to do so.

    The following convention is followed:

    Any methods and attributes that don't start with an underscore are the
    controller's public API.

    In the `BaseController`, these public methods will in most cases contain
    a basic implementation that works for most clouds, along with the proper
    logging and error handling. In almost all cases, subclasses SHOULD NOT
    override or extend the public methods of `BaseController`. To account for
    cloud/subclass specific behaviour, one is expected to override the
    internal/private methods of `BaseController`.

    Any methods and attributes that start with an underscore are the
    controller's internal/private API.

    To account for cloud/subclass specific behaviour, the public methods of
    `BaseController` call a number of private methods. These methods will
    always start with an underscore, such as `self._connect`. When an internal
    method is only ever used in the process of one public method, it is
    prefixed as such to make identification and purpose more obvious. For
    example, method `self._list_machines__postparse_machine` is called in the
    process of `self.list_machines` to postparse a machine and inject or
    modify its attributes.

    This `BaseController` defines a strict interface to controlling clouds.
    For each different cloud type, a subclass needs to be defined. The subclass
    must at least define a proper `self._connect` method. For simple clouds,
    this may be enough. To provide cloud specific processing, hook the code on
    the appropriate private method. Each method defined here documents its
    intended purpose and use.

    """

    def __init__(self, cloud):
        """Initialize cloud controller given a cloud

        Most times one is expected to access a controller from inside the
        cloud, like this:

            cloud = mist.io.clouds.models.Cloud.objects.get(id=cloud_id)
            print cloud.ctl.list_machines()

        Subclasses SHOULD NOT override this method.

        If a subclass has to initialize a certain instance attribute, it SHOULD
        extend this method instead.

        """
        self.compute = ComputeController(self)

        self.cloud = cloud
        self._conn = None

    @property
    def connection(self):
        """Cached libcloud connection, accessible as attribute

        Subclasses SHOULD NOT have to override or extend this method.

        """
        if self._conn is None:
            self._conn = self.connect()
        return self._conn

    def connect(self):
        """Return libcloud-like connection to cloud

        This is a wrapper, an error handler, around cloud specific `_connect`
        methods.

        Subclasses SHOULD NOT override or extend this method.

        Instead, subclasses MUST override `_connect` method.

        """
        try:
            return self._connect()
        except (CloudUnavailableError, CloudUnauthorizedError) as exc:
            log.error("Error adding cloud %s: %r", self.cloud, exc)
            raise
        except InvalidCredsError as exc:
            log.warning("Invalid creds while connecting to %s: %s",
                        self.cloud, exc)
            raise CloudUnauthorizedError("Invalid creds.")
        except ssl.SSLError as exc:
            log.error("SSLError on connecting to %s: %s", self.cloud, exc)
            raise CloudUnavailableError(exc=exc)
        except Exception as exc:
            log.exception("Error while connecting to %s", self.cloud)
            raise CloudUnavailableError(exc=exc)

    def _connect(self):
        """Return libcloud-like connection to cloud

        This is called solely by `connect` which adds error handling.

        All subclasses MUST implement this method.

        """
        raise NotImplementedError()

    def check_connection(self):
        """Raise exception if we can't connect to cloud provider

        In case of error, an instance of `CloudUnavailableError` or
        `CloudUnauthorizedError` should be raised.

        For most cloud providers, who use an HTTP API, calling `connect`
        doesn't really establish a connection, so we also have to attempt to
        make an actual call such as `list_machines` to verify that the
        connection actually works.

        If a subclass's `connect` not raising errors is enough to make sure
        that establishing a connection works, then these subclasses should
        override this method and only call `connect`.

        In most cases, subclasses SHOULD NOT override or extend this method.

        """
        self.connect()
        self.compute.list_machines()

    def disconnect(self):
        """Close libcloud-like connection to cloud

        If a connection object has been initialized, this method will attempt
        to call its disconnect method.

        This method is called automatically called by the class's destructor.
        This may however be unreliable, so users should call `disconnect`
        manually to be on the safe side.

        For cloud providers whose connection object is dummy in the sense that
        it doesn't represent an actual underlying connection, this method
        doesn't really do anything.

        Subclasses SHOULD NOT override this method.

        If a subclass has to perform some special clean up, like deleting
        temporary files, it SHOULD *extend* this method instead.

        """
        if self._conn is not None:
            log.debug("Closing libcloud-like connection for %s.", self.cloud)
            try:
                self._conn.disconnect()
            except AttributeError:
                pass
            except Exception as exc:
                log.error("Error disconnecting cloud '%s': %r", self, exc)
            self._conn = None

    def add(self, fail_on_error=True, fail_on_invalid_params=True, **kwargs):
        """Add new Cloud to the database

        This is only expected to be called by `Cloud.add` classmethod to create
        a cloud. Fields `owner` and `title` are already populated in
        `self.cloud`. The `self.cloud` model is not yet saved.

        Params:
        fail_on_error: If True, then a connection to the cloud will be
            established and if it fails, a `CloudUnavailableError` or
            `CloudUnauthorizedError` will be raised and the cloud will be
            deleted.
        fail_on_invalid_params: If True, then invalid keys in `kwargs` will
            raise an Error.

        Subclasses SHOULD NOT override or extend this method.

        If a subclass has to perform special parsing of `kwargs`, it can
        override `self._add__preparse_kwargs`.

        """
        # Transform params with extra underscores for compatibility.
        rename_kwargs(kwargs, 'api_key', 'apikey')
        rename_kwargs(kwargs, 'api_secret', 'apisecret')

        # Cloud specific kwargs preparsing.
        try:
            self._add__preparse_kwargs(kwargs)
        except MistError as exc:
            log.error("Error while adding cloud %s: %r", self.cloud, exc)
            raise
        except Exception as exc:
            log.exception("Error while preparsing kwargs on add %s",
                          self.cloud)
            raise InternalServerError(exc=exc)

        try:
            self.update(fail_on_error=fail_on_error,
                        fail_on_invalid_params=fail_on_invalid_params,
                        **kwargs)
        except (CloudUnavailableError, CloudUnauthorizedError) as exc:
            # FIXME: Move this to top of the file once Machine model is
            # migrated.  The import statement is currently here to avoid
            # circular import issues.
            from mist.core.cloud.models import Machine
            # Remove any machines created from check_connection performing a
            # list_machines.
            Machine.objects(cloud=self.cloud).delete()
            # Propagate original error.
            raise

    def _add__preparse_kwargs(self, kwargs):
        """Preparse keyword arguments to `self.add`

        This is called by `self.add` when adding a new cloud, in order to apply
        preprocessing to the given params. Any subclass that requires any
        special preprocessing of the params passed to `self.add`, SHOULD
        override this method.

        Params:
        kwargs: A dict of the keyword arguments that will be set as attributes
            to the `Cloud` model instance stored in `self.cloud`. This method
            is expected to modify `kwargs` in place.

        Subclasses MAY override this method.

        """
        return

    def update(self, fail_on_error=True, fail_on_invalid_params=True,
               **kwargs):
        """Edit an existing Cloud

        Params:
        fail_on_error: If True, then a connection to the cloud will be
            established and if it fails, a `CloudUnavailableError` or
            `CloudUnauthorizedError` will be raised and the cloud changes will
            not be saved.
        fail_on_invalid_params: If True, then invalid keys in `kwargs` will
            raise an Error.

        Subclasses SHOULD NOT override or extend this method.

        If a subclass has to perform special parsing of `kwargs`, it can
        override `self._update__preparse_kwargs`.

        """

        # Close previous connection.
        self.disconnect()

        # Transform params with extra underscores for compatibility.
        rename_kwargs(kwargs, 'api_key', 'apikey')
        rename_kwargs(kwargs, 'api_secret', 'apisecret')

        # Cloud specific kwargs preparsing.
        try:
            self._update__preparse_kwargs(kwargs)
        except MistError as exc:
            log.error("Error while updating cloud %s: %r", self.cloud, exc)
            raise
        except Exception as exc:
            log.exception("Error while preparsing kwargs on update %s",
                          self.cloud)
            raise InternalServerError(exc=exc)

        # Check for invalid `kwargs` keys.
        errors = {}
        for key in kwargs.keys():
            if key not in self.cloud._cloud_specific_fields:
                error = "Invalid parameter %s=%r." % (key, kwargs[key])
                if fail_on_invalid_params:
                    errors[key] = error
                else:
                    log.warning(error)
                    kwargs.pop(key)
        if errors:
            log.error("Error updating %s: %s", self.cloud, errors)
            raise BadRequestError({
                'msg': "Invalid parameters %s." % errors.keys(),
                'errors': errors,
            })

        # Set fields to cloud model and perform early validation.
        for key, value in kwargs.iteritems():
            setattr(self.cloud, key, value)
        try:
            self.cloud.validate(clean=True)
        except me.ValidationError as exc:
            log.error("Error updating %s: %s", self.cloud, exc.to_dict())
            raise BadRequestError({'msg': exc.message,
                                   'errors': exc.to_dict()})

        # Try to connect to cloud.
        if fail_on_error:
            try:
                self.check_connection()
            except (CloudUnavailableError, CloudUnauthorizedError) as exc:
                log.error("Will not update cloud %s because "
                          "we couldn't connect: %r", self.cloud, exc)
                raise
            except Exception as exc:
                log.exception("Will not update cloud %s because "
                              "we couldn't connect.", self.cloud)
                raise CloudUnavailableError(exc=exc)

        # Attempt to save.
        try:
            self.cloud.save()
        except me.ValidationError as exc:
            log.error("Error updating %s: %s", self.cloud, exc.to_dict())
            raise BadRequestError({'msg': exc.message,
                                   'errors': exc.to_dict()})
        except me.NotUniqueError as exc:
            log.error("Cloud %s not unique error: %s", self.cloud, exc)
            raise CloudExistsError()

    def _update__preparse_kwargs(self, kwargs):
        """Preparse keyword arguments to `self.update`

        This is called by `self.update` when updating a cloud and it is also
        indirectly called during `self.add`, in order to apply preprocessing to
        the given params. Any subclass that requires any special preprocessing
        of the params passed to `self.update`, SHOULD override this method.

        Params:
        kwargs: A dict of the keyword arguments that will be set as attributes
            to the `Cloud` model instance stored in `self.cloud`. This method
            is expected to modify `kwargs` in place.

        Subclasses MAY override this method.

        """
        return

    def rename(self, title):
        self.cloud.title = title
        self.cloud.save()

    def enable(self):
        self.cloud.enabled = True
        self.cloud.save()

    def disable(self):
        self.cloud.enabled = False
        self.cloud.save()

    def __del__(self):
        """Disconnect libcloud connection upon garbage collection"""
        self.disconnect()
