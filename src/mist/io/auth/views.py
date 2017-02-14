import mongoengine as me
from pyramid.response import Response

from mist.io.users.models import User, Organization
from mist.io.auth.models import ApiToken
from mist.io.auth.models import AuthToken, SessionToken
from mist.io.auth.methods import get_random_name_for_token
from mist.io.auth.methods import auth_context_from_request
from mist.io.auth.methods import token_with_name_not_exists

from mist.io.helpers import ip_from_request
from mist.io.helpers import view_config, params_from_request

from mist.io.exceptions import NotFoundError
from mist.io.exceptions import BadRequestError, UserUnauthorizedError
from mist.io.exceptions import RequiredParameterMissingError, ForbiddenError

from mist.core import config

OK = Response("OK", 200)


@view_config(route_name='api_v1_tokens', request_method='GET', renderer='json')
def list_tokens(request):
    """
    List user's api tokens
    ---
    """
    # FIXME: should call an optimized methods.list_tokens
    auth_context = auth_context_from_request(request)
    api_tokens = ApiToken.objects(user_id=auth_context.user.id, revoked=False)
    tokens_list = []
    for token in api_tokens:
        if token.is_valid():
            token_view = token.get_public_view()
            if token_view['last_accessed_at'] == 'None':
                token_view['last_accessed_at'] = 'Never'
            tokens_list.append(token_view)

    # If user is owner also include all active tokens in the current org context
    if auth_context.is_owner():
        org_tokens = ApiToken.objects(org=auth_context.org, revoked=False)
        for token in org_tokens:
            if token.is_valid():
                token_view = token.get_public_view()
                if token_view['last_accessed_at'] == 'None':
                    token_view['last_accessed_at'] = 'Never'
                try:
                    tokens_list.index(token_view)
                except ValueError:
                    tokens_list.append(token_view)
    return tokens_list


@view_config(route_name='api_v1_tokens', request_method='POST', renderer='json')
def create_token(request):
    """
    Create a new api token
    Used so that a user can send his credentials and produce a new api token.
    They api token itself will be returned in a json document along with it's
    id and it's name.
    If user has used su then he should provide his own credentials however the
    api token will authenticate the user that he is impersonating.
    User can also send as parameters the name and the ttl.
    If name is not sent then a random one with the format api_token_xyz where
    xyz is a number will be produced.
    If the user provides a name then there must be no other token for that user
    with the same name.
    If the user has a cookie or sends an api token in the request headers then
    the username and password must belong to him.
    Used by io to authenticate to core (when running separately. Io sends
    user's email and password. We return an access token that will be used to
    authenticate any further communications.
    An anti-CSRF token is not needed to access this api call.
    If user is coming from oauth then he will be able to create a new token
    without a password provided he is authenticated somehow.
    If you are using the /auth route please switch to /api_v1_tokens route. The
    /auth route is deprecated and will be removed completely in the future.
    ---
    email:
      description: User's email
      required: true
      type: string
    password:
      description: User's password
      required: true
      type: string
    name:
      description: Api token name
      type: string
    ttl:
      description: Time to live for the token
      type: integer
    org_id:
      description: Org id if this token is to be used in organizational context
      type: string
    """

    # requesting user is the user that POSTed the function and he is the one
    # that must provide his credentials. If the user has used
    # su then requesting_user is the effective user.
    session = request.environ['session']
    requesting_user = session.get_user(effective=True)

    params = params_from_request(request)
    email = params.get('email', '').lower()
    password = params.get('password', '')
    api_token_name = params.get('name', '')
    org_id = params.get('org_id', '')
    ttl = params.get('ttl', 60 * 60)
    if not email:
        raise RequiredParameterMissingError("No email provided")
    if (isinstance(ttl, str) or isinstance(ttl, unicode)) and not ttl.isdigit():
        raise BadRequestError('Ttl must be a number greater than 0')
    if int(ttl) < 0:
        raise BadRequestError('Ttl must be greater or equal to zero')

    # concerned user is the user by whom the api token will be used.
    if requesting_user is not None:
        concerned_user = session.get_user(effective=False)
    else:
        try:
            requesting_user = concerned_user = User.objects.get(email=email)
        except me.DoesNotExist:
            raise UserUnauthorizedError(email)

    if requesting_user.status != 'confirmed' \
            or concerned_user.status != 'confirmed':
        raise UserUnauthorizedError()

    if requesting_user.password is None or requesting_user.password == '':
        if password:
            raise BadRequestError('Wrong password')
        else:
            raise BadRequestError('Please use the GUI to set a password and '
                                  'then retry')
    else:
        if not password:
            raise BadRequestError('No password provided')
        if not requesting_user.check_password(password):
            raise BadRequestError('Wrong password')

    org = None
    if org_id:
        try:
            org = Organization.objects.get(me.Q(id=org_id) | me.Q(name=org_id))
        except me.DoesNotExist:
            raise BadRequestError("Invalid org id '%s'" % org_id)
        if concerned_user not in org.members:
            raise ForbiddenError()

    # first check if the api token name is unique if it has been provided
    # otherwise produce a new one.
    if api_token_name:
        token_with_name_not_exists(concerned_user, api_token_name)
        session.name = api_token_name
    else:
        api_token_name = get_random_name_for_token(concerned_user)
    api_tokens = ApiToken.objects(user_id=concerned_user.id, revoked=False)
    tokens_list = []
    for token in api_tokens:
        if token.is_valid():
            token_view = token.get_public_view()
            if token_view['last_accessed_at'] == 'None':
                token_view['last_accessed_at'] = 'Never'
            tokens_list.append(token_view)

    # FIXME: should call an optimized methods.list_tokens(active=True)
    if len(tokens_list) < config.ACTIVE_APITOKEN_NUM:
        new_api_token = ApiToken()
        new_api_token.name = api_token_name
        new_api_token.org = org
        new_api_token.ttl = ttl
        new_api_token.set_user(concerned_user)
        new_api_token.ip_address = ip_from_request(request)
        new_api_token.user_agent = request.user_agent
        new_api_token.save()
    else:
        raise BadRequestError("MAX number of %s active tokens reached"
                              % config.ACTIVE_APITOKEN_NUM)

    token_view = new_api_token.get_public_view()
    token_view['last_accessed_at'] = 'Never'
    token_view['token'] = new_api_token.token

    return token_view


@view_config(route_name='api_v1_sessions', request_method='GET', renderer='json')
def list_sessions(request):
    """
    List active sessions
    ---
    """
    auth_context = auth_context_from_request(request)
    session = request.environ['session']
    # Get active sessions for the current user
    session_tokens = SessionToken.objects(user_id=auth_context.user.id, revoked=False)
    sessions_list = []
    for token in session_tokens:
        if token.is_valid():
            public_view = token.get_public_view()
            if isinstance(session, SessionToken) and session.id == token.id:
                public_view['active'] = True
            sessions_list.append(public_view)

    # If user is owner include all active sessions in the org context
    if auth_context.is_owner():
        org_tokens = SessionToken.objects(org=auth_context.org, revoked=False)
        for token in org_tokens:
            if token.is_valid():
                public_view = token.get_public_view()
                if isinstance(session, SessionToken) and session.id == token.id:
                    public_view['active'] = True
                try:
                    sessions_list.index(public_view)
                except ValueError:
                    sessions_list.append(public_view)

    return sessions_list


# SEC FIXME add permission checks
@view_config(route_name='api_v1_tokens', request_method='DELETE')
def revoke_token(request):
    """
    Revoke api token
    ---
    id:
      description: Api token ID
    """
    return revoke_session(request)


# SEC do we need permission checks here ?
@view_config(route_name='api_v1_sessions', request_method='DELETE')
def revoke_session(request):
    """
    Revoke an active session
    ---
    id:
      description: Session ID
    """

    auth_context = auth_context_from_request(request)
    params = params_from_request(request)
    auth_token_id = params.get("id")

    if not auth_token_id:
        raise RequiredParameterMissingError("No token id parameter provided")

    try:
        if auth_context.is_owner():
            auth_token = AuthToken.objects.get(org=auth_context.org,
                                               id=auth_token_id)
        else:
            auth_token = AuthToken.objects.get(user_id=
                                               auth_context.user.get_id(),
                                               id=auth_token_id)
        if auth_token.is_valid():
            auth_token.invalidate()
            auth_token.save()

    except me.DoesNotExist:
        raise NotFoundError('Session not found')

    return OK



