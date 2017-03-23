import random
import string
import urllib
from mongoengine import DoesNotExist

from mist.io.users.models import Organization, User

import mist.io.helpers

from mist.io.exceptions import ConflictError
from mist.io.exceptions import RedirectError
from mist.io.exceptions import UserNotFoundError
from mist.io.exceptions import UserUnauthorizedError
from mist.io.exceptions import AdminUnauthorizedError
from mist.io.exceptions import InternalServerError

from mist.io.tasks import revoke_token

try:
    from mist.core.rbac.methods import AuthContext
except:
    from mist.io.dummy.rbac import AuthContext

from mist.io.auth.models import ApiToken
from mist.io.auth.models import SessionToken


def migrate_old_api_token(request):
    """Migrate old API tokens (aka mist_1: email:token) to new ApiTokens"""

    # check if auth header with old api token format and migrate if needed
    auth_header = request.headers.get('Authorization', '').lower()
    if not auth_header:
        return
    parts = auth_header.split(" ", 1)
    mist_label = parts[0]
    if not mist_label.startswith('mist_'):
        return
    if len(parts) == 1:
        return
    api_version = mist_label[5:]
    header_content = parts[1]
    if api_version != "1":
        return
    parts = header_content.split(":")
    if len(parts) != 2:
        return
    email, mist_api_token = parts

    if not mist_api_token:
        return

    if len(mist_api_token) > 64:
        raise ValueError('Token is larger than 64 characters')

    # migrate old api token to new ApiToken if needed
    try:
        # if token is less than 64 characters then add 0's at the beginning
        # and search for that token
        padding = 64 - len(mist_api_token)
        padded_mist_api_token = '0' * padding + mist_api_token
        token = ApiToken.objects.get(token=padded_mist_api_token)
    except DoesNotExist:
        try:
            user = User.objects.get(email=email)
        except UserNotFoundError:
            return
        if not user.mist_api_token or user.mist_api_token != mist_api_token:
            return

        # if token is shorter than 64 chars then add padding with 0's
        # and save it that way
        padding = 64 - len(mist_api_token)
        padded_mist_api_token = '0' * padding + mist_api_token

        token = ApiToken(token=padded_mist_api_token, user_id=user.get_id(),
                         name=get_random_name_for_token(user),
                         ip_address=mist.io.helpers.ip_from_request(request),
                         user_agent=request.user_agent)
        token.save()
    return token


def session_from_request(request):
    """Get SessionToken or ApiToken instance from request"""
    if 'session' in request.environ:
        return request.environ['session']
    session = migrate_old_api_token(request)
    if session is None:
        token_from_request = request.headers.get('Authorization', '').lower()
        if token_from_request:
            try:
                api_token = ApiToken.objects.get(
                    token=token_from_request
                )
            except DoesNotExist:
                api_token = None
            if api_token and api_token.is_valid():
                session = api_token
            else:
                session = ApiToken()
                session.name = 'dummy_token'
    if session is None:
        try:
            session_token = SessionToken.objects.get(
                token=request.cookies.get('session.id')
            )
            if session_token.is_valid():
                session = session_token
        except DoesNotExist:
            pass
    if session is None:
        session = SessionToken(
            user_agent=request.user_agent,
            ip_address=mist.io.helpers.ip_from_request(request)
        )
        session.save()
    request.environ['session'] = session
    return session


def user_from_request(request, admin=False, redirect=False):
    """Given request, initiate User instance (mist.io.users.model.User)

    First try to check if there is a valid api token header, else check if
    there is a valid cookie session, else raise UserUnauthorizedError.

    If admin is True, it will check if user obtained is an admin and will raise
    an AdminUnauthorizedError otherwise.

    If redirect is True and no valid api token or cookie session exists,
    redirect user to login. Once logged in, he will be redirected back to the
    page he was trying to visit the first time.

    If no exceptions were raised and no redirects made, it returns the user
    object.

    """
    token = session_from_request(request)
    user = token.get_user()
    if user is None:
        # Redirect to login
        if redirect and request.method == 'GET':
            if not isinstance(token, SessionToken) or not token.get_user():
                query = ''
                if request.query_string:
                    query = '?' + request.query_string
                return_to = urllib.quote(request.path + query)
                url = "/login?return_to=" + return_to
                raise RedirectError(url)
        raise UserUnauthorizedError()
    # check if admin
    if admin and user.role != 'Admin':
        raise AdminUnauthorizedError(user.email)
    return user


def user_from_session_id(session_id):
    """Returns user associated with given cookie session id"""
    try:
        user = SessionToken.objects.get(token=session_id).get_user()
        if user is not None:
            return user
    except DoesNotExist:
        pass
    raise UserUnauthorizedError()


def auth_context_from_auth_token(token):
    user = token.get_user()
    if user is None:
        raise UserUnauthorizedError()
    return AuthContext(user, token)


def auth_context_from_request(request):
    return auth_context_from_auth_token(session_from_request(request))


def auth_context_from_session_id(session_id):
    """Returns auth_context associated with given cookie session id"""
    try:
        session = SessionToken.objects.get(token=session_id)
    except DoesNotExist:
        raise UserUnauthorizedError()
    return auth_context_from_auth_token(session)


def reissue_cookie_session(request, user_id='', su='', org=None, after=0,
                           **kwargs):
    """Invalidate previous cookie session and issue a fresh one

    Params `user_id` and `su` can be instances of `User`, `user_id`s or emails.

    """
    # First invalidate the current empty session
    session = session_from_request(request)
    if not isinstance(session, SessionToken):
        raise Exception("Can not reissue an API token session.")

    if after:
        revoke_token.apply_async(args=(session.token, ), countdown=after)
    else:
        session.invalidate()
        session.save()

    # And then issue the new session
    new_session = SessionToken()

    # Pass on fingerprint & experiment choice to new session
    if session.fingerprint:
        new_session.fingerprint = session.fingerprint
    if session.experiment:
        new_session.experiment = session.experiment
    if session.choice:
        new_session.choice = session.choice

    session = new_session
    if user_id or su:
        # A user will be set to the session
        user_for_session = su if su else user_id
        user_is_effective = not user_id
        if isinstance(user_for_session, basestring):
            # Get the user object if an id has been provided
            if '@' in user_for_session:
                user_for_session = User.objects.get(email=user_for_session)
            else:
                user_for_session = User.objects.get(id=user_for_session)

        session.set_user(user_for_session, effective=user_is_effective)

        if not org:
            # If no org is provided then get the org from the last session
            old_session = SessionToken.objects(user_id=user_for_session.id).first()
            if old_session and old_session.org and \
                    user_for_session in old_session.org.members:
                # if the old session has an organization and user is still a
                # member of that organization then use that context
                org = old_session.org
            else:
                # If there is no previous session just get the first
                # organization that the user is a member of.
                orgs = Organization.objects(members=user_for_session)
                if len(orgs) > 0:
                    org = orgs.first()
                else:
                    # if for some reason the user is not a member of any
                    # existing organization then create an anonymous one now
                    from mist.io.users.methods import create_org_for_user
                    org = create_org_for_user(user_for_session)

    if kwargs.get('ttl') and kwargs.get('ttl') >= 0:
        session.ttl = kwargs['ttl']
    if kwargs.get('timeout') and kwargs.get('timeout') >= 0:
        session.timeout = kwargs['timeout']
    if kwargs.get('social_auth_backend'):
        session.context['social_auth_backend'] = kwargs.get('social_auth_backend')

    session.ip_address = mist.io.helpers.ip_from_request(request)
    session.user_agent = request.user_agent
    session.org = org
    session.su = su
    session.save()
    request.environ['session'] = session
    return session


def token_with_name_not_exists(user, name):
    api_tokens = ApiToken.objects(user_id=user.get_id(), name=name)
    for token in api_tokens:
        if token.is_valid():
            raise ConflictError('Token with name %s already exists' % name)


def get_random_name_for_token(user):
    # produce a random name and make sure that this will not fall in an
    # infinite loop. if it can't get a valid new name then throw an exception
    for _ in range(10000):
        xyz = ''.join(random.choice(string.digits) for _ in range(5))
        api_token_name = "api_token_" + xyz
        try:
            token_with_name_not_exists(user, api_token_name)
            return api_token_name
        except ConflictError:
            pass
    raise InternalServerError('Could not produce random api token name for '
                              'user %s' % user.email)

def get_csrf_token(request):
    """
    Returns the CSRF token registered to this request's user session.
    """
    session = session_from_request(request)
    return session.csrf_token if isinstance(session, SessionToken) else ''