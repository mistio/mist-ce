"""Custom exceptions used by mist

Error handling in mist is done via exceptions. In this file we define a large
variety of exceptions.

There is BaseError which every other exception should subclass so that it is
distinguished from other kind of exceptions not raised explicitly by mist code.

Then there are a few more basic exceptions that directly subclass BaseError,
like BadRequestError, NotAuthorizedError, NotFoundError etc. Think of them as
basic or category exceptions. All the other exceptions subclass one of these
basic ones. This umbrella exceptions are mainly used to make the mapping to
http status codes easier.

The rule of thumb is that there should be as many exceptions are there are
errors. Feel free to create a new exception when an existing one doesn't quite
fit the purpose.

Exceptions raised like that can easily and selectively be caught in try except
statements and handled with appropriately. If they are not caught explicitely,
they will be caught in the exception_handler special view in views.py and
transformed to appropriate http responses.

All exceptions should be named CamelCase and always use the Error suffix.

"""


class BaseError(Exception):
    """All custom mist exceptions should subclass this one.

    When printed, this class will always print its default message plus
    the message provided during exception initialization, if provided.

    """

    msg = "Error"

    def __init__(self, msg=None):
        msg = "%s: %s" % (self.msg, msg) if msg is not None else self.msg
        super(BaseError, self).__init__(msg)


class BadRequestError(BaseError):
    msg = "Bad Request"


class RequiredParameterNotProvidedError(BaseError):
    msg = "Required parameter not provided"


class UnauthorizedError(BaseError):
    msg = "Not authorized"


class BackendUnauthorizedError(UnauthorizedError):
    msg = "Invalid backend credentials"


class MachineUnauthorizedError(UnauthorizedError):
    msg = "Couldn't authenticate to machine"


class ForbiddenError(BaseError):
    msg = "Forbidden"


class ConflictError(BaseError):
    msg = "Conflict"


class NotFoundError(BaseError):
    msg = "Not Found"


class BackendNotFoundError(NotFoundError):
    msg = "Backend not found"


class KeypairNotFoundError(NotFoundError):
    msg = "Keypair not found"


class MachineNotFoundError(NotFoundError):
    msg = "Machine not found"


class MethodNotAllowedError(BaseError):
    msg = "Method Not Allowed"


class InternalServerError(BaseError):
    msg = "Internal Server Error"


class MachineCreationError(InternalServerError):
    msg = "Machine creation failed"


class KeyValidationError(BadRequestError):
    msg = "Keypair could not be validated"

