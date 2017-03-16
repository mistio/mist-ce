import logging

from mist.io.helpers import log_event, ip_from_request
from mist.io.helpers import params_from_request

from mist.io.auth.models import ApiToken
from mist.io.auth.models import SessionToken

from mist.io.auth.methods import session_from_request

from pyramid.request import Request


log = logging.getLogger(__name__)


class AuthMiddleware(object):
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        request = Request(environ)
        session_from_request(request)

        def session_start_response(status, headers, exc_info=None):
            session = environ['session']  # reload in case it was reissued
            if isinstance(session, SessionToken):
                if not session.last_accessed_at:
                    cookie = 'session.id=%s; Path=/;' % session.token
                    headers.append(('Set-Cookie', cookie))

            first_entry_cookie = 'first_entry=true; Path=/;'
            headers.append(('Set-Cookie', first_entry_cookie))

            # ApiTokens with 'dummy' in name are handed out by session from
            # request function when the api token is not correct, to prevent
            # csrf checks by the CsrfMiddleware but allow calls to function
            # that don't require authentication. When the response is sent out
            # they are to be thrown away, not saved.
            if not (isinstance(session, ApiToken) and
                    'dummy' in session.name):
                session.touch()
                session.save()
            return start_response(status, headers, exc_info)

        return self.app(environ, session_start_response)


class CsrfMiddleware(object):
    """Middleware that performs CSRF token validation."""

    exempt = ('/new_metrics', '/rule_triggered', '/stripe', '/tokens',
              '/api/v1/tokens', '/auth', '/api/v1/insights/register',
              '/api/v1/dev/register', '/api/v1/dev/users')

    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        request = Request(environ)
        session = environ['session']
        # when someone is POSTing to /auth (check_auth) then he is trying
        # to authenticate and does not have a csrf token in the SessionToken
        # which has been produced by default
        if request.path not in self.exempt and \
           isinstance(session, SessionToken) and \
           request.method in ('POST', 'PUT', 'PATCH', 'DELETE'):
            csrf_token = request.headers.get('Csrf-Token', '').lower()
            if csrf_token != session.csrf_token:
                log.error("Bad CSRF token '%s'", csrf_token)
                user = session.get_user()
                if user is not None:
                    owner_id = user_id = user.id
                    email = user.email
                else:
                    owner_id = user_id = None
                    params = params_from_request(request)
                    email = params.get('email', '')
                log_event(
                    owner_id=owner_id,
                    user_id=user_id,
                    email=email,
                    request_method=request.method,
                    request_path=request.path,
                    request_ip=ip_from_request(request),
                    user_agent=request.user_agent,
                    csrf_token=csrf_token,
                    session_csrf=session.csrf_token,
                    event_type='request',
                    action='csrf_validation',
                    error=True,
                )
                start_response('403 Forbidden',
                               [('Content-Type', 'text/plain')])
                return ["Invalid csrf token\n"]
        return self.app(environ, start_response)
