"""Custom exceptions used by mist

Error handling in mist is done via exceptions. In this file we define a large
variety of exceptions.

There is MistError which every other exception should subclass so that it is
distinguished from other kind of exceptions not raised explicitly by mist code.

Then there are a few more basic exceptions that directly subclass MistError,
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

Using proper subclassing allows for selective handling, logging etc in the
exception handler.

"""


class MistError(Exception):
    """All custom mist exceptions should subclass this one.

    When printed, this class will always print its default message plus
    the message provided during exception initialization, if provided.

    """
    msg = "Mist Error"
    http_code = 500

    def __init__(self, msg=None):
        msg = "%s: %s" % (self.msg, msg) if msg is not None else self.msg
        super(MistError, self).__init__(msg)


# BAD REQUESTS (translated as 400 in views)
class BadRequestError(MistError):
    msg = "Bad Request"
    http_code = 400


class RequiredParameterMissingError(BadRequestError):
    msg = "Required parameter not provided"


class KeypairParameterMissingError(RequiredParameterMissingError):
    msg = "Keypair id parameter missing"


class KeyValidationError(BadRequestError):
    msg = "Invalid private key"


# UNAUTHORIZED (translated as 401 in views)
class UnauthorizedError(MistError):
    msg = "Not authorized"
    http_code = 401


class BackendUnauthorizedError(UnauthorizedError):
    msg = "Invalid backend credentials"


class MachineUnauthorizedError(UnauthorizedError):
    msg = "Couldn't authenticate to machine"


# PAYMENT REQUIRED (translated as 402 in views)
class PaymentRequiredError(MistError):
    msg = "Payment required"
    http_code = 402


# FORBIDDEN (translated as 403 in views)
class ForbiddenError(MistError):
    msg = "Forbidden"
    http_code = 403


# NOT FOUND (translated as 404 in views)
class NotFoundError(MistError):
    msg = "Not Found"
    http_code = 404


class BackendNotFoundError(NotFoundError, KeyError):
    msg = "Backend not found"


class KeypairNotFoundError(NotFoundError, KeyError):
    msg = "Keypair not found"


class MachineNotFoundError(NotFoundError, KeyError):
    msg = "Machine not found"


# NOT ALLOWED (translated as 405 in views)
class MethodNotAllowedError(MistError):
    msg = "Method Not Allowed"
    http_code = 405


# CONFLICT (translated as 409 in views)
class ConflictError(MistError):
    msg = "Conflict"
    http_code = 409


class BackendExistsError(ConflictError):
    msg = "Backend exists"


class BackendNameExistsError(ConflictError):
    msg = "Backend name exists"


class KeypairExistsError(ConflictError):
    msg = "Keypair exists"


# INTERNAL ERROR (translated as 500 in views)
class InternalServerError(MistError):
    msg = "Internal Server Error"
    http_code = 500


class MachineCreationError(InternalServerError):
    msg = "Machine creation failed"


class SSLError(MistError):
    msg = "SSL certificate verification error"


# SERVICE UNAVAILABLE (translated as 503 in views)
class ServiceUnavailableError(MistError):
    msg = "Service unavailable"
    http_code = 503


class BackendUnavailableError(ServiceUnavailableError):
    msg = "Backend unavailable"


class MachineUnavailableError(ServiceUnavailableError):
    msg = "Machine currently unavailable"
