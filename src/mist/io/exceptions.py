class BaseError(Exception):
    """Subclass me!"""
    msg = "Base Error"

    def __init__(self, msg=''):
        super(BaseError, self).__init__(msg or self.msg)


class BadRequestError(BaseError):
    msg = "Bad Request"


class UnauthorizedError(BaseError):
    msg = "Not authorized"


class ForbiddenError(BaseError):
    msg = "Forbidden"


class ConflictError(BaseError):
    msg = "Conflict"


class NotFoundError(BaseError):
    msg = "Not Found"


class BackendNotFoundError(NotFoundError):
    msg = "Backend not found."


class MethodNotAllowedError(BaseError):
    msg = "Method Not Allowed"


class InternalServerError(BaseError):
    msg = "Internal Server Error"


class KeyValidationError(BadRequestError):
    msg = "Keypair could not be validated"
