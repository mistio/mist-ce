"""Definition of base classes for DNS

This contains only BaseController. It includes basic functionality
for a given DNS provider. Provider specific controllers are in `mist.io.dns.controllers`.

"""

import ssl
import json
import copy
import logging
import datetime
import calendar

from mist.io import config

from mist.io.exceptions import MistError
from mist.io.exceptions import ConflictError
from mist.io.exceptions import ForbiddenError
from mist.io.exceptions import BadRequestError
from mist.io.exceptions import CloudExistsError
from mist.io.exceptions import InternalServerError
from mist.io.exceptions import MachineNotFoundError
from mist.io.exceptions import CloudUnavailableError
from mist.io.exceptions import CloudUnauthorizedError


log = logging.getLogger(__name__)


class BaseController(object):
    """Abstract base class for every cloud/provider controller

    This base controller factors out all the steps common to all or most
    DNS into a base class, and defines an interface for provider or
    technology specific DNS controllers.

    Subclasses are meant to extend or override methods of this base class to
    account for differencies between different DNS provider types.

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

    To account for DNS/subclass specific behaviour, the public methods of
    `BaseController` call a number of private methods. These methods will
    always start with an underscore, such as `self._connect`. When an internal
    method is only ever used in the process of one public method, it is
    prefixed as such to make identification and purpose more obvious. For
    example, method `self._list_machines__postparse_machine` is called in the
    process of `self.list_machines` to postparse a machine and inject or
    modify its attributes.

    This `BaseController` defines a strict interface to controlling DNS
    functionality.
    For each different cloud type, a subclass needs to be defined. The subclass
    must at least define a proper `self._connect` method. For simple DNS
    providers this may be enough. To provide cloud specific processing, hook
    the code on the appropriate private method. Each method defined here
    documents its intended purpose and use.

    """

    def __init__(self, cloud):
        """Initialize DNS controller given a Provider

        Subclasses SHOULD NOT override this method.

        If a subclass has to initialize a certain instance attribute, it SHOULD
        extend this method instead.

        """
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
            log.error("Error adding DNS provider %s: %r", self.cloud, exc)
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
            self._conn.disconnect()
            self._conn = None


    def list_zones(self):
        """
        Return list of machines for cloud

        """
        pass

    def list_records(self, zone):
        """
        Returns a list of records for the specified zone

        """
        pass


    def __del__(self):
        """Disconnect libcloud connection upon garbage collection"""
        self.disconnect()
