import ssl

import logging

from libcloud.common.types import InvalidCredsError

from mist.io.exceptions import CloudUnavailableError
from mist.io.exceptions import CloudUnauthorizedError


log = logging.getLogger(__name__)


class ConnectionProxy(object):
    """Wraps a connection with a destructor to disconnect upon gc"""

    def __init__(self, conn):
        """Initialize with a libcloud-like connection object"""
        self.conn = conn

    def disconnect(self):
        """Close libcloud-like connection to cloud"""
        if self.conn is None:
            return
        log.debug("Closing libcloud-like connection %s.", self.conn)
        try:
            self._conn.disconnect()
        except AttributeError:
            pass
        except Exception as exc:
            log.error("Error disconnecting conn '%s': %r", self.conn, exc)
        self.conn = None

    def __del__(self):
        """When garbage collected, make sure to disconnect the connection"""
        self.disconnect()


class BaseController(object):
    """Abstract base class for every cloud/provider controller (except main)

    This base controller takes care of instance initialization, connection
    caching and closing.

    """

    def __init__(self, main_ctl):
        """Initialize cloud controller given a cloud

        Most times one is expected to access a controller from inside the
        cloud, like this:

            cloud = mist.io.clouds.models.Cloud.objects.get(id=cloud_id)
            print cloud.ctl.list_machines()

        Subclasses SHOULD NOT override this method.

        If a subclass has to initialize a certain instance attribute, it SHOULD
        extend this method instead.

        """
        # FIXME: Solve circular dependencies.
        from mist.io.clouds.controllers.main.base import BaseMainController
        assert isinstance(main_ctl, BaseMainController)
        self.cloud = main_ctl.cloud
        self.provider = main_ctl.provider
        self._conn = None

    def _connect(self):
        """Return libcloud-like connection to cloud

        This is called solely by `connect` which adds error handling.

        All subclasses MUST implement this method.

        """
        raise NotImplementedError()

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

    @property
    def connection(self):
        """Cached libcloud (?) connection, accessible as attribute

        Subclasses SHOULD NOT have to override or extend this method.

        """
        if self._conn is None:
            self._conn = ConnectionProxy(self.connect())
        return self._conn.conn

    def check_connection(self):
        """Raise exception if we can't connect to cloud provider

        In case of error, an instance of `CloudUnavailableError` or
        `CloudUnauthorizedError` should be raised.

        For most cloud providers, who use an HTTP API, calling `connect`
        doesn't really establish a connection, so subclasses shoult attempt to
        make an actual call such as `list_machines` to verify that the
        connection actually works.

        In most cases, subclasses SHOULD override or extend this method.

        """
        self.connect()

    def disconnect(self):
        if self._conn is not None:
            self._conn.disconnect()
            self._conn = None
