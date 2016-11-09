"""Definition of base main controllers for clouds

This currently contains only BaseMainController. It includes basic
functionality common to all clouds, such as add, update, rename, disable etc.

The main controller also acts as a gateway to specific controllers. For
example, one may do

    cloud.ctl.enable()
    cloud.ctl.compute.list_machines()

Cloud specific main controllers are in
`mist.io.clouds.controllers.main.controllers`.

"""

import logging

import mongoengine as me

from mist.io.exceptions import MistError
from mist.io.exceptions import BadRequestError
from mist.io.exceptions import CloudExistsError
from mist.io.exceptions import InternalServerError
from mist.io.exceptions import CloudUnavailableError
from mist.io.exceptions import CloudUnauthorizedError

from mist.io.clouds.controllers.compute.base import BaseComputeController
from mist.io.clouds.utils import rename_kwargs

# from mist.core.cloud.models import Machine


log = logging.getLogger(__name__)


class BaseMainController(object):
    """Base main controller class for all cloud types

    BaseMainController defines common cloud operations, such as add, update,
    disable, that mainly affect mist, instead of interacting with the remote
    cloud itself. These operations are mostly the same for all different
    clouds.

    Main controllers act as a gateway to specific controllers. For example, one
    may do

        cloud.ctl.enable()
        cloud.ctl.compute.list_machines()

    For this to work, subclasses must define the appropriate subcontroller
    class, by defining for example a `ComputeController` attribute with a
    subclass of mist.io.clouds.controllers.compute.base.BaseComputeController.

    For specific clouds, main controllers are defined in
    `mist.io.clouds.controllers.main.controllers`.

    Subclasses are meant to extend or override methods of this base class to
    account for differencies between different cloud types.

    Care should be taken when considering to add new methods to a subclass.
    All controllers should have the same interface, to the degree this is
    feasible. That is to say, don't add a new method to a subclass unless
    there is a very good reason to do so.

    Any methods and attributes that don't start with an underscore are the
    controller's public API.

    In the `BaseMainController`, these public methods will in most cases
    contain a basic implementation that works for most clouds, along with the
    proper logging and error handling. In almost all cases, subclasses SHOULD
    NOT override or extend the public methods of `BaseMainController`. To
    account for cloud/subclass specific behaviour, one is expected to override
    the internal/private methods of `BaseMainController`.

    """

    ComputeController = None
    # DnsController = None
    # NetworkController = None

    def __init__(self, cloud):
        """Initialize main cloud controller given a cloud

        Most times one is expected to access a controller from inside the
        cloud, like this:

            cloud = mist.io.clouds.models.Cloud.objects.get(id=cloud_id)
            print cloud.ctl.disable()

        Subclasses SHOULD NOT override this method.

        If a subclass has to initialize a certain instance attribute, it MAY
        extend this method instead.

        """

        self.cloud = cloud
        self._conn = None

        # Initialize compute controller.
        assert issubclass(self.ComputeController, BaseComputeController)
        self.compute = self.ComputeController(self)

        # TODO: Initialize dns controller.
        # if self.DnsController is not None:
        #     assert issubclass(self.DnsController, DnsController)
        #     self.dns = self.DnsController(self)

        # TODO: Initialize network controller.
        # if self.NetworkController is not None:
        #     assert issubclass(self.NetworkController, NetworkController)
        #     self.network = self.NetworkController(self)

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
            from mist.io.machines.models import Machine
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
                self.compute.check_connection()
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

    def disconnect(self):
        self.compute.disconnect()
