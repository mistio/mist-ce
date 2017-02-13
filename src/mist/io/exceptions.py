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


import traceback


class MistError(Exception):
    """All custom mist exceptions should subclass this one.

    When printed, this class will always print its default message plus
    the message provided during exception initialization, if provided.

    """
    msg = "Mist Error"
    http_code = 500

    def __init__(self, msg=None, exc=None):
        if exc is None and isinstance(msg, Exception):
            msg, exc = repr(msg), msg
        self.orig_exc = exc if isinstance(exc, Exception) else None
        self.orig_traceback = traceback.format_exc()
        msg = "%s: %s" % (self.msg, msg) if msg is not None else self.msg
        super(MistError, self).__init__(msg)


# REDIRECT (translated as 302 in views)
class RedirectError(MistError):
    """Redirection exception

    This is used exclusively in views to send a 302 HTTP redirection.

    """
    msg = "Redirecting user to login"

    def __init__(self, url=''):
        super(RedirectError, self).__init__(url)
        self.url = url


# MistError related exceptions
# BAD REQUESTS (translated as 400 in views)
class BadRequestError(MistError):
    msg = "Bad Request"
    http_code = 400


# FORBIDDEN (translated as 403 in views)
class ForbiddenError(MistError):
    msg = "Forbidden"
    http_code = 403


# NOT FOUND (translated as 404 in views)
class NotFoundError(MistError):
    msg = "Not Found"
    http_code = 404


# UNAUTHORIZED (translated as 401 in views)
class UnauthorizedError(MistError):
    msg = "Not authorized"
    http_code = 401


# CONFLICT (translated as 409 in views)
class ConflictError(MistError):
    msg = "Conflict"
    http_code = 409


# NOT ALLOWED (translated as 405 in views)
class MethodNotAllowedError(MistError):
    msg = "Method Not Allowed"
    http_code = 405


# INTERNAL ERROR (translated as 500 in views)
class InternalServerError(MistError):
    msg = "Internal Server Error"
    http_code = 500


# SERVICE UNAVAILABLE (translated as 503 in views)
class ServiceUnavailableError(MistError):
    msg = "Service unavailable"
    http_code = 503


class SSLError(MistError):
    msg = "SSL certificate verification error"


class RequiredParameterMissingError(BadRequestError):
    msg = "Required parameter not provided"


# Key related exceptions
class KeyParameterMissingError(RequiredParameterMissingError):
    msg = "Key id parameter missing"


class KeyValidationError(BadRequestError):
    msg = "Invalid private key"


class KeyNotFoundError(NotFoundError, KeyError):
    msg = "Key not found"


class KeyExistsError(ConflictError):
    msg = "Key name exists"


# PAYMENT REQUIRED (translated as 402 in views)
class PaymentRequiredError(MistError):
    msg = "Payment required"
    http_code = 402


# Network related exceptions
class NetworkActionNotSupported(MistError):
    msg = "Action is not supported for this cloud"
    http_code = 404


class NetworkNotFoundError(NotFoundError, KeyError):
    msg = "Network not found"


class SubnetNotFoundError(NotFoundError, KeyError):
    msg = "Subnet not found"


class NetworkError(NotFoundError, KeyError):
    msg = "Error on network action"


class NetworkCreationError(InternalServerError):
    msg = "Network creation failed"


class ZoneNotFoundError(NotFoundError):
    msg = "No zone found for the provided id"


class RecordNotFoundError(NotFoundError):
    msg = "No record found for the provided id"


# Machine related exceptions
class MachineUnauthorizedError(UnauthorizedError):
    msg = "Couldn't authenticate to machine"


class MachineNotFoundError(NotFoundError, KeyError):
    msg = "Machine not found"


class MachineCreationError(InternalServerError):
    msg = "Machine creation failed"


class MachineNameValidationError(InternalServerError):
    msg = "Error validating name"


class MachineUnavailableError(ServiceUnavailableError):
    msg = "Machine currently unavailable"


# Cloud related exceptions
class CloudExistsError(ConflictError):
    msg = "Cloud with this name already exists"


class CloudNameExistsError(ConflictError):
    msg = "Cloud name exists"


class CloudUnauthorizedError(UnauthorizedError):
    msg = "Invalid cloud credentials"


class NetworkExistsError(ConflictError):
    msg = "Network already exists"


class SubnetExistsError(ConflictError):
    msg = "Subnet already exists"


#  Rate Limit Error (translated as 429 in views)
class RateLimitError(MistError):
    msg = "Rate Limit Error"
    http_code = 429


# INTERNAL ERROR (translated as 500 in views)
class InternalServerError(MistError):
    msg = "Internal Server Error"
    http_code = 500


class CloudNotFoundError(NotFoundError, KeyError):
    msg = "Cloud not found"


class CloudUnavailableError(ServiceUnavailableError):
    msg = "Cloud unavailable"


# Schedule related exceptions
class ScheduleTaskNotFound(NotFoundError):
    msg = "Couldn't find task"


class ScheduleNameExistsError(ConflictError):
    msg = "Schedule name exists"


class NetworkListingError(InternalServerError):
    msg = "Error while getting a network listing"


class NetworkDeletionError(InternalServerError):
    msg = "Network deletion failed"


class SubnetCreationError(InternalServerError):
    msg = "Subnet creation failed"


class SubnetListingError(InternalServerError):
    msg = "Error while getting a subnet listing"


class SubnetDeletionError(InternalServerError):
    msg = "Subnet deletion failed"


class SSLError(MistError):
    msg = "SSL certificate verification error"


#  BAD GATEWAY (translated as 502 in views)
class BadGatewayError(MistError):
    """Used to notify about failures in upstream services according to RFC 2616"""
    msg = "Bad Gateway"
    http_code = 502


class MalformedResponseError(BadGatewayError):
    msg = "Malformed response received from upstream service"


# SERVICE UNAVAILABLE (translated as 503 in views)
class ServiceUnavailableError(MistError):
    msg = "Service unavailable"
    http_code = 503


class ScheduleOperationError(BadRequestError):
    msg = "Attempt to update a document not yet saved"


class InvalidSchedule(BadRequestError):
    msg = "Scheduler is not valid"


# Script related exceptions
class ScriptNotFoundError(NotFoundError):
    msg = "Script not found"


class ScriptFormatError(MistError):
    msg = "Script was not formatted properly"


# CONFLICT (translated as 409 in views)
class ScriptNameExistsError(ConflictError):
    msg = "Script name exists"


# Organization related exceptions
class OrganizationNotFound(NotFoundError):
    msg = 'Organization not found'


class OrganizationNameExistsError(ConflictError):
    msg = 'Organization name exists'


class OrganizationOperationError(BadRequestError):
    msg = "Attempt to update a document not yet saved"


# UNAUTHORIZED (translated as 401 in views)
class OrganizationAuthorizationFailure(UnauthorizedError):
    msg = "You are not authorized to view or edit the organization"


class TeamNotFound(NotFoundError):
    msg = 'Team not found'


class TeamNameExistsError(ConflictError):
    msg = 'Team name exists'


class TeamOperationError(BadRequestError):
    msg = "Attempt to update a document not yet saved"


# UNAUTHORIZED (translated as 401 in views)
class TeamFailure(UnauthorizedError):
    msg = "You are not authorized to view team entry"


class TeamForbidden(ForbiddenError):
    msg = "You cannot delete Owners team"


class MemberNotFound(NotFoundError):
    msg = 'Member not found'


class MemberConflictError(ConflictError):
    msg = 'Member exists'


class PolicyError(BadRequestError):
    msg = "Policy Rule Error"


# UNAUTHORIZED (translated as 401 in views)
class PolicyUnauthorizedError(ForbiddenError):
    msg = "Policy Unauthorized Error"


class InvalidApiToken(MistError):
    msg = 'Api Token is not valid'


# FORBIDDEN (translated as 403 in views)
class LoginThrottledError(ForbiddenError):
    msg = "Maximum number of failed login attempts reached"


# UNAUTHORIZED (translated as 401 in views)
class UserUnauthorizedError(UnauthorizedError):
    msg = "User not authenticated. Please log in"


# NOT FOUND (translated as 404 in views)
class UserNotFoundError(NotFoundError):
    msg = "Couldn't find user"


class AdminUnauthorizedError(UserUnauthorizedError):
    msg = "User is not authorized as an administrator"
