"""mist.io.views

Here we define the HTTP API of the app. The view functions here are
responsible for taking parameters from the web requests, passing them on to
functions defined in methods and properly formatting the output. This is the
only source file where we import things from pyramid. View functions should
only check that all required params are provided. Any further checking should
be performed inside the corresponding method functions.

"""

import urllib
import requests
import json
import traceback
import mongoengine as me

from time import time
from datetime import date, datetime, timedelta

from pyramid.response import Response
from pyramid.renderers import render_to_response
from pyramid.httpexceptions import HTTPFound


from mist.io.scripts.models import CollectdScript
from mist.io.clouds.models import Cloud
from mist.io.dns.models import Zone, Record
from mist.io.machines.models import Machine
from mist.io.networks.models import Network, Subnet
from mist.io.users.models import Avatar, Owner, User, Organization
from mist.io.users.models import MemberInvitation
from mist.io.auth.models import SessionToken, ApiToken

from mist.io.users.methods import register_user

from mist.io import methods

from mist.io.exceptions import RequiredParameterMissingError
from mist.io.exceptions import NotFoundError, BadRequestError, ForbiddenError
from mist.io.exceptions import SSLError, ServiceUnavailableError
from mist.io.exceptions import KeyParameterMissingError, MistError
from mist.io.exceptions import PolicyUnauthorizedError, UnauthorizedError
from mist.io.exceptions import CloudNotFoundError, ScheduleTaskNotFound
from mist.io.exceptions import NetworkNotFoundError, SubnetNotFoundError
from mist.io.exceptions import UserUnauthorizedError, RedirectError
from mist.io.exceptions import UserNotFoundError, ConflictError

from mist.io.helpers import encrypt, decrypt
from mist.io.helpers import get_auth_header, params_from_request
from mist.io.helpers import trigger_session_update, amqp_publish_user
from mist.io.helpers import view_config, log_event, ip_from_request
from mist.io.helpers import send_email

from mist.io.auth.methods import auth_context_from_request
from mist.io.auth.methods import user_from_request, session_from_request
from mist.io.auth.methods import get_csrf_token
from mist.io.auth.methods import reissue_cookie_session
from mist.io.auth.models import get_secure_rand_token

from mist.io.logs.methods import get_events as get_log_events

from mist.io import config

import logging
logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)

OK = Response("OK", 200)


@view_config(context=Exception)
def exception_handler_mist(exc, request):
    """
    Here we catch exceptions and transform them to proper http responses
    This is a special pyramid view that gets triggered whenever an exception
    is raised from any other view. It catches all exceptions exc where
    isinstance(exc, context) is True.

    """
    # mongoengine ValidationError
    if isinstance(exc, me.ValidationError):
        trace = traceback.format_exc()
        log.warning("Uncaught me.ValidationError!\n%s", trace)
        return Response("Validation Error", 400)

    # mongoengine NotUniqueError
    if isinstance(exc, me.NotUniqueError):
        trace = traceback.format_exc()
        log.warning("Uncaught me.NotUniqueError!\n%s", trace)
        return Response("NotUniqueError", 409)

    # non-mist exceptions. that shouldn't happen! never!
    if not isinstance(exc, MistError):
        if not isinstance(exc, (me.ValidationError, me.NotUniqueError)):
            trace = traceback.format_exc()
            log.critical("Uncaught non-mist exception? WTF!\n%s", trace)
            return Response("Internal Server Error", 500)

    # mist exceptions are ok.
    log.info("MistError: %r", exc)

    # if it is a RedirectError, then send an HTTP Redirect
    if isinstance(exc, RedirectError):
        return HTTPFound(exc.url or '')

    # else translate it to HTTP response based on http_code attribute
    return Response(str(exc), exc.http_code)


@view_config(route_name='home', request_method='GET')
@view_config(route_name='ui_routes', request_method='GET')
def home(request):
    """
    User visits home page.
    Redirect to mist app if logged in, landing page otherwise.
    """
    params = params_from_request(request)

    build_path = ''
    if config.BUILD_TAG and not params.get('debug'):
        build_path = 'build/%s/bundled/' % config.BUILD_TAG

    template_inputs = config.HOMEPAGE_INPUTS
    template_inputs['build_path'] = build_path
    template_inputs['csrf_token'] = json.dumps(get_csrf_token(request))

    try:
        user = user_from_request(request)
    except UserUnauthorizedError:
        external_auth = config.USE_EXTERNAL_AUTHENTICATION
        if external_auth:
            url = request.route_url(route_name='social.auth.login',
                                    backend=external_auth)
            raise RedirectError(url)

        return render_to_response('templates/landing.pt', template_inputs)

    if not user.last_active or datetime.now() - user.last_active > timedelta(0, 300):
        user.last_active = datetime.now()
        user.save()

    auth_context = auth_context_from_request(request)
    if not auth_context.owner.last_active or \
       datetime.now() - auth_context.owner.last_active > timedelta(0, 300):
        auth_context.owner.last_active = datetime.now()
        auth_context.owner.save()

    return render_to_response('templates/ui.pt', template_inputs)


@view_config(context='pyramid.httpexceptions.HTTPNotFound')
def not_found(self, request):
    request.response.status = 404
    params = params_from_request(request)

    build_path = ''
    if config.BUILD_TAG and not params.get('debug'):
        build_path = '/build/%s/bundled/' % config.BUILD_TAG

    template_inputs = config.HOMEPAGE_INPUTS
    template_inputs['build_path'] = build_path
    template_inputs['csrf_token'] = json.dumps(get_csrf_token(request))

    try:
        user = user_from_request(request)
    except UserUnauthorizedError:
        external_auth = config.USE_EXTERNAL_AUTHENTICATION
        if external_auth:
            url = request.route_url(route_name='social.auth.login',
                                    backend=external_auth)
            raise RedirectError(url)

        return render_to_response('templates/landing.pt', template_inputs,
                                  request=request)

    current_org = show_user_organization(request)

    return render_to_response('templates/ui.pt', template_inputs,
                              request=request)


# SEC
@view_config(route_name='login', request_method='POST', renderer='json')
@view_config(route_name='login_service', request_method='POST',
             renderer='json')
def login(request):
    """
    User posts authentication credentials (email, password).
    If there is a 'return_to' parameter the user will be redirected to this
    local url upon successful authentication.
    There is also an optional 'service' parameter, mainly meant to be used for
    SSO.
    ---
    email:
      description: user's email
      type: string
      required: true
    password:
      description: user's password
      type: string
      required: true
    service:
      description: used for SSO
      type: string

    """
    params = params_from_request(request)
    email = params.get('email')
    password = params.get('password', '')
    service = request.matchdict.get('service') or params.get('service') or ''
    return_to = params.get('return_to')
    if return_to:
        return_to = urllib.unquote(return_to)
    else:
        return_to = '/'
    token_from_params = params.get('token')

    if not email:
        raise RequiredParameterMissingError('email')
    email = email.lower()
    try:
        user = User.objects.get(email=email)
    except (UserNotFoundError, me.DoesNotExist):
        raise UserUnauthorizedError()
    if not user.status == 'confirmed':
        raise UserUnauthorizedError("User account has not been confirmed.")

    if password:
        # rate limit user logins
        max_logins = config.FAILED_LOGIN_RATE_LIMIT['max_logins']
        max_logins_period = config.FAILED_LOGIN_RATE_LIMIT['max_logins_period']
        block_period = config.FAILED_LOGIN_RATE_LIMIT['block_period']

        # check if rate limiting in place
        incidents = get_log_events(user_id=user.id, event_type='incident',
                                   action='login_rate_limiting',
                                   start=time() - max_logins_period)
        incidents = [inc for inc in incidents
                     if inc.get('ip') == ip_from_request(request)]
        if len(incidents):
            secs = incidents[0]['time'] + block_period - time()
            raise LoginThrottledError("Try again in %d seconds." % secs)

        if not user.check_password(password):
            # check if rate limiting condition just got triggered
            logins = list(get_log_events(
                user_id=user.id, event_type='request', action='login',
                error=True, start=time() - max_logins_period))
            logins = [login for login in logins
                      if login.get('request_ip') == ip_from_request(request)]
            if len(logins) > max_logins:
                log_event(owner_id=user.id, user_id=user.id,
                          event_type='incident',
                          action='login_rate_limiting',
                          ip=ip_from_request(request))
                # alert admins something nasty is going on
                subject = config.FAILED_LOGIN_ATTEMPTS_EMAIL_SUBJECT
                body = config.FAILED_LOGIN_ATTEMPTS_EMAIL_BODY % (
                    user.email,
                    ip_from_request(request),
                    max_logins,
                    max_logins_period,
                    block_period
                )
                send_email(subject, body, config.NOTIFICATION_EMAIL['ops'])
            raise UserUnauthorizedError()
    elif token_from_params:
        try:
            auth_token = ApiToken.objects.get(user_id=user.id,
                                              token=token_from_params)
        except me.DoesNotExist:
            auth_token = None
        if not (auth_token and auth_token.is_valid()):
            raise UserUnauthorizedError()
        auth_token.touch()
        auth_token.save()
    else:
        raise RequiredParameterMissingError("'password' or 'token'")

    reissue_cookie_session(request, user)

    user.last_login = time()
    user.user_agent = request.user_agent
    user.save()

    if not service:
        # TODO: check that return_to is a local url
        redirect = return_to
    else:
        raise BadRequestError("Invalid service '%s'." % service)

    if params.get('invitoken'):
        confirm_invitation(request)

    return {
        'auth': True,
        'redirect': redirect,
        'csrf_token': get_csrf_token(request),
    }


@view_config(route_name='switch_context', request_method='GET')
@view_config(route_name='switch_context_org', request_method='GET')
def switch_org(request):
    """
    Switch user's context.
    Personal or organizational
    ---
    org_id:
      description: The team's org id
      type: string
      required: true

    """
    org_id = request.matchdict.get('org_id')
    user = user_from_request(request)
    params = params_from_request(request)
    return_to = params.get('return_to', '')
    org = None
    if org_id:
        try:
            org = Organization.objects.get(id=org_id)
        except me.DoesNotExist:
            raise ForbiddenError()
        if user not in org.members:
            raise ForbiddenError()
    reissue_cookie_session(request, user, org=org, after=1)
    raise RedirectError(urllib.unquote(return_to) or '/')


@view_config(route_name='login', request_method='GET',
             renderer='templates/home.pt')
@view_config(route_name='login_service', request_method='GET',
             renderer='templates/home.pt')
def login_get(request):
    """
    User visits login form.
    If there is a 'return_to' parameter the user will be redirected to this
    local url upon successful authentication.
    There is also an optional 'service' parameter, mainly meant to be used for
    SSO.
    ---
    return_to:
      description: if exists, redirect user
      type: string
    service:
      description: used for SSO
      type: string
    """

    # check if user sent a GET instead of POST, process it accordingly
    try:
        ret = login(request)
        if ret['auth']:
            return HTTPFound(ret['redirect'])
    except:
        pass
    service = request.matchdict.get('service', '')
    params = params_from_request(request)
    return_to = params.get('return_to', '')
    invitoken = params.get('invitoken', '')
    try:
        user = user_from_request(request)
        if not service:
            return HTTPFound(urllib.unquote(return_to) or '/')
        raise BadRequestError("Invalid service '%s'." % service)
    except UserUnauthorizedError:
        path = "sign-in"
        query_params = {}
        if return_to:
            query_params['return_to'] = return_to
        if invitoken:
            query_params['invitoken'] = invitoken
        if query_params:
            path += '?' + urllib.urlencode(query_params)
        return HTTPFound(path)

@view_config(route_name='logout', request_method=('GET', 'POST'))
def logout(request):
    """
    User logs out.
    If user is an admin under su, he returns to his regular user.
    """
    user = user_from_request(request)
    session = session_from_request(request)
    if isinstance(session, ApiToken):
        raise ForbiddenError('If you wish to revoke a token use the /tokens'
                             ' path')
    real_user = session.get_user(effective=False)

    # this will revoke all the tokens sent by the provider
    sso_backend = session.context.get('social_auth_backend')
    if sso_backend:
        initiate_social_auth_request(request, backend=sso_backend)
        try:
            request.backend.disconnect(user=user,
                                       association_id=None,
                                       request=request)
        except Exception as e:
            log.info('There was an exception while revoking tokens for user'
                     ' %s: %s' % (user.email, repr(e)))
    if user != real_user:
        log.warn("Su logout")
        reissue_cookie_session(request, real_user)
    else:
        reissue_cookie_session(request)

    return HTTPFound('/')


@view_config(route_name='register', request_method='POST', renderer='json')
def register(request):
    """
    New user signs up.
    """
    params = params_from_request(request)
    email = params.get('email').encode('utf-8', 'ignore')
    promo_code = params.get('promo_code')
    name = params.get('name').encode('utf-8', 'ignore')
    token = params.get('token')
    selected_plan = params.get('selected_plan')
    request_demo = params.get('request_demo', False)
    request_beta = params.get('request_beta', False)

    if not email or not email.strip():
        raise RequiredParameterMissingError('email')
    if not name or not name.strip():
        raise RequiredParameterMissingError('name')
    if type(request_demo) != bool:
        raise BadRequestError('Request demo must be a boolean value')

    name = name.strip().split(" ", 1)
    email = email.strip().lower()

    if type(name) == unicode:
        name = name.encode('utf-8', 'ignore')
    if not request_beta:
        try:
            user = User.objects.get(email=email)
            if user.status == 'confirmed' and not request_demo:
                raise ConflictError("User already registered "
                                    "and confirmed email.")
        except me.DoesNotExist:
            first_name = name[0]
            last_name = name[1] if len(name) > 1 else ""
            user, org = register_user(email, first_name, last_name, 'email',
                                      selected_plan, promo_code, token)

        if user.status == 'pending':
            # if user is not confirmed yet resend the email
            subject = config.CONFIRMATION_EMAIL_SUBJECT
            body = config.CONFIRMATION_EMAIL_BODY % ((user.first_name + " " +
                                                      user.last_name),
                                                     config.CORE_URI,
                                                     user.activation_key,
                                                     ip_from_request(request),
                                                     config.CORE_URI)

            if not send_email(subject, body, user.email):
                raise ServiceUnavailableError("Could not send "
                                              "confirmation email.")

    if request_demo:
        # if user requested a demo then notify the mist.io team
        subject = "Demo request"
        body = "User %s has requested a demo\n" % user.email
        tasks.send_email.delay(subject, body, config.NOTIFICATION_EMAIL['demo'])
        user.requested_demo = True
        user.demo_request_date = time()
        user.save()

        msg = "Dear %s %s, we will contact you within 24 hours to schedule a " \
              "demo. In the meantime, we sent you an activation email so you" \
              " can create an account to test Mist.io. If the email doesn't" \
              " appear in your inbox, check your spam folder." \
              % (user.first_name, user.last_name)
    elif request_beta:
        user = None
        # if user requested a demo then notify the mist.io team
        subject = "Private beta request"
        body = "User %s <%s> has requested access to the private beta\n" % \
            (params.get('name').encode('utf-8', 'ignore'), email)
        tasks.send_email.delay(subject, body, config.NOTIFICATION_EMAIL['demo'])

        msg = "Dear %s, we will contact you within 24 hours with more " \
              "information about the Mist.io private beta program. In the " \
              "meantime, if you have any questions don't hesitate to contact" \
              " us at info@mist.io" % params.get('name').encode('utf-8', 'ignore')
    else:
        msg = "Dear %s,\n"\
              "you will soon receive an activation email. "\
              "If it does not appear in your Inbox within "\
              "a few minutes, please check your spam folder.\n" % (user.first_name)

    return {
        'msg': msg,
        'user_ga_id': user and user.get_external_id('ga'),
        'user_id': user and user.id}


@view_config(route_name='confirm', request_method='GET')
def confirm(request):
    """
    Confirm a user's email address when signing up.
    After registering, the user is sent a confirmation email to his email
    address with a link containing a token that directs the user to this view
    to confirm his email address.
    If invitation token exists redirect to set_password
    """
    params = params_from_request(request)
    key = params.get('key')
    if not key:
        raise RequiredParameterMissingError('key')

    try:
        user = User.objects.get(activation_key=key)
    except me.DoesNotExist:
        return HTTPFound('/error?msg=bad-key')
    if user.status != 'pending' or user.password:
        # if user has an invitation token but has been confirmed call the
        # confirm invitation token
        if params.get('invitoken'):
            return confirm_invitation(request)
        else:
            return HTTPFound('/error?msg=already-confirmed')

    token = get_secure_rand_token()
    key = encrypt("%s:%s" % (token, user.email), config.SECRET)
    user.password_set_token = token
    user.password_set_token_created = time()
    user.password_set_user_agent = request.user_agent
    log.debug("will now save (register)")
    user.save()

    invitoken = params.get('invitoken')
    url = request.route_url('set_password', _query={'key': key})
    if invitoken:
        try:
            MemberInvitation.objects.get(token=invitoken)
            url += '&invitoken=' + invitoken
        except me.DoesNotExist:
            pass

    return HTTPFound(url)


@view_config(route_name='forgot_password', request_method='POST')
def forgot_password(request):
    """
    User visits password forgot form and submits his email
    or user presses the set password button in the account page
    and has registered through the SSO and has no previous
    password set in the database. In the latter case the email
    will be fetched from the session.
    """
    try:
        email = user_from_request(request).email
    except UserUnauthorizedError:
        email = params_from_request(request).get('email', '')

    try:
        user = User.objects.get(email=email)
    except (UserNotFoundError, me.DoesNotExist):
        # still return OK so that there's no leak on valid email
        return OK

    if user.status != 'confirmed':
        # resend confirmation email
        user.activation_key = get_secure_rand_token()
        user.save()
        subject = config.CONFIRMATION_EMAIL_SUBJECT
        body = config.CONFIRMATION_EMAIL_BODY % ((user.first_name + " " +
                                                  user.last_name),
                                                 config.CORE_URI,
                                                 user.activation_key,
                                                 ip_from_request(request),
                                                 config.CORE_URI)

        if not send_email(subject, body, user.email):
            raise ServiceUnavailableError("Could not send confirmation email.")

        return OK

    token = get_secure_rand_token()
    user.password_reset_token = token
    user.password_reset_token_created = time()
    user.password_reset_token_ip_addr = ip_from_request(request)
    log.debug("will now save (forgot)")
    user.save()

    subject = config.RESET_PASSWORD_EMAIL_SUBJECT
    body = config.RESET_PASSWORD_EMAIL_BODY
    body = body % ( (user.first_name or "") + " " + (user.last_name or ""),
                   config.CORE_URI,
                   encrypt("%s:%s" % (token, email), config.SECRET),
                   user.password_reset_token_ip_addr,
                   config.CORE_URI)
    if not send_email(subject, body, email):
        log.info("Failed to send email to user %s for forgot password link" %
                 user.email)
        raise ServiceUnavailableError()
    log.info("Sent email to user %s\n%s" % (email, body))
    return OK


# SEC
@view_config(route_name='reset_password', request_method=('GET', 'POST'))
def reset_password(request):
    """
    User visits reset password form and posts his email address
    If he is logged in when he presses the link then he will be logged out
    and then redirected to the landing page with the reset password token.
    """
    params = params_from_request(request)
    key = params.get('key')

    if not key:
        raise BadRequestError("Reset password token is missing")
    reissue_cookie_session(request)  # logout

    # SEC decrypt key using secret
    try:
        (token, email) = decrypt(key, config.SECRET).split(':')
    except:
        raise BadRequestError("invalid password token.")

    try:
        user = User.objects.get(email=email)
    except (UserNotFoundError, me.DoesNotExist):
        raise UserUnauthorizedError()

    # SEC check status, token, expiration
    if token != user.password_reset_token:
        raise BadRequestError("Invalid reset password token.")
    delay = time() - user.password_reset_token_created
    if delay > config.RESET_PASSWORD_EXPIRATION_TIME:
        raise MethodNotAllowedError("Password reset token has expired.")

    if request.method == 'GET':
        build_path = ''
        if config.BUILD_TAG and not params.get('debug'):
            build_path = '/build/%s/bundled/' % config.BUILD_TAG
        template_inputs = config.HOMEPAGE_INPUTS
        template_inputs['build_path'] = build_path
        template_inputs['csrf_token'] = json.dumps(get_csrf_token(request))

        return render_to_response('templates/landing.pt', template_inputs)
    elif request.method == 'POST':

        password = params.get('password', '')
        if not password:
            raise RequiredParameterMissingError('password')

        # change password
        user.set_password(password)
        user.status = 'confirmed'
        # in case the use has been with a pending confirm state
        user.password_reset_token_created = 0
        user.save()

        reissue_cookie_session(request, user)

        return OK
    raise BadRequestError("Bad method %s" % request.method)


# SEC
@view_config(route_name='set_password', request_method=('GET', 'POST'))
def set_password(request):
    """
    User visits confirm link and sets password.
    User set password if he/she forgot his/her password, if he/she is invited
    by owner, if he/she signs up.
    """
    params = params_from_request(request)

    key = params.get('key', '')

    invitoken = params.get('invitoken', '')

    if not key:
        raise RequiredParameterMissingError('key')

    # SEC decrypt key using secret
    try:
        (token, email) = decrypt(key, config.SECRET).split(':')
    except:
        raise BadRequestError("invalid password token.")

    try:
        user = User.objects.get(email=email)
    except (UserNotFoundError, me.DoesNotExist):
        raise UserUnauthorizedError()

    if user.status != 'pending':
        raise ForbiddenError("Already confirmed and password set.")
    if token != user.password_set_token:
        raise BadRequestError("invalid set password token.")
    delay = time() - user.password_set_token_created
    if delay > config.RESET_PASSWORD_EXPIRATION_TIME:
        raise MethodNotAllowedError("Password set token has expired.")

    if request.method == 'GET':
        build_path = ''
        if config.BUILD_TAG and not params.get('debug'):
            build_path = '/build/%s/bundled/' % config.BUILD_TAG
        template_inputs = config.HOMEPAGE_INPUTS
        template_inputs['build_path'] = build_path
        template_inputs['csrf_token'] = json.dumps(get_csrf_token(request))

        return render_to_response('templates/landing.pt', template_inputs)
    elif request.method == 'POST':
        password = params.get('password', '')
        if not password:
            raise RequiredParameterMissingError('password')
        # set password
        user.set_password(password)
        user.status = 'confirmed'
        user.activation_date = time()
        user.password_set_token = ""
        selected_plan = user.selected_plan
        user.selected_plan = ''
        user.last_login = time()

        user.save()

        # log in user
        reissue_cookie_session(request, user)

        ret = {'selectedPlan': selected_plan}
        if user.promo_codes:
            promo_code = user.promo_codes[-1]
            promo = Promo.objects.get(code=promo_code)
            ret['hasPromo'] = True
            ret['sendToPurchase'] = promo.send_to_purchase

        if invitoken:
            try:
                MemberInvitation.objects.get(token=invitoken)
                confirm_invitation(request)
            except me.DoesNotExist:
                pass

        return render_to_response('json', ret, request)
    else:
        raise BadRequestError("Invalid HTTP method")


@view_config(route_name='confirm_invitation', request_method='GET')
def confirm_invitation(request):
    """
    Confirm that a user want to participate in team
    If user has status pending then he/she will be redirected to confirm
    to finalize registration and only after the process has finished
    successfully will he/she be added to the team.
    ---
    invitoken:
      description: member's invitation token
      type: string
      required: true

    """
    try:
        auth_context = auth_context_from_request(request)
    except UserUnauthorizedError:
        auth_context = None
    params = params_from_request(request)
    invitoken = params.get('invitoken', '')
    if not invitoken:
        raise RequiredParameterMissingError('invitoken')
    try:
        invitation = MemberInvitation.objects.get(token=invitoken)
    except DoesNotExist:
        raise NotFoundError('Invalid invitation token')

    user = invitation.user
    # if user registration is pending redirect to confirm registration
    if user.status == 'pending':
        key = params.get('key')
        if not key:
            key = user.activation_key
        uri = request.route_url('confirm',
                                _query={'key': key, 'invitoken': invitoken})
        raise RedirectError(uri)

    # if user is confirmed but not logged in then redirect to log in page
    if not auth_context:
        uri = request.route_url('login', _query={'invitoken': invitoken})
        raise RedirectError(uri)

    # if user is logged in then make sure it's his invitation that he is
    # confirming. if it's not redirect to home but don't confirm invitation.
    if invitation.user != auth_context.user:
        return HTTPFound('/')

    org = invitation.org
    for team_id in invitation.teams:
        try:
            org.add_member_to_team_by_id(team_id, user)
        except:
            pass

    try:
        org.save()
    except:
        raise TeamOperationError()

    try:
        invitation.delete()
    except:
        pass

    args = {
        'request': request,
        'user_id': auth_context.user,
        'org': org
    }
    if session_from_request(request).context.get('social_auth_backend'):
        args.update({
            'social_auth_backend': session_from_request(request).context.get('social_auth_backend')
        })
    reissue_cookie_session(**args)

    trigger_session_update(auth_context.owner, ['org'])

    return HTTPFound('/')


@view_config(route_name='api_v1_images', request_method='POST', renderer='json')
def list_specific_images(request):
    # FIXME: 1) i shouldn't exist, 2) i shouldn't be a post
    return list_images(request)


@view_config(route_name='api_v1_images', request_method='GET', renderer='json')
def list_images(request):
    """
    List images of specified cloud
    List images from each cloud. Furthermore if a search_term is provided, we
    loop through each cloud and search for that term in the ids and the names
    of the community images
    READ permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    search_term:
      type: string
    """

    cloud_id = request.matchdict['cloud']
    try:
        term = request.json_body.get('search_term', '')
    except:
        term = None
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')
    return methods.list_images(auth_context.owner, cloud_id, term)


@view_config(route_name='api_v1_image', request_method='POST', renderer='json')
def star_image(request):
    """
    Star/unstar an image
    Toggle image star (star/unstar)
    EDIT permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    image:
      description: Id of image to be used with the creation
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    image_id = request.matchdict['image']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "edit", cloud_id)
    return methods.star_image(auth_context.owner, cloud_id, image_id)


@view_config(route_name='api_v1_sizes', request_method='GET', renderer='json')
def list_sizes(request):
    """
    List sizes of a cloud
    List sizes (aka flavors) from each cloud.
    READ permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    return methods.list_sizes(auth_context.owner, cloud_id)


@view_config(route_name='api_v1_locations', request_method='GET', renderer='json')
def list_locations(request):
    """
    List locations of cloud
    List locations from each cloud. Locations mean different things in each cl-
    oud. e.g. EC2 uses it as a datacenter in a given availability zone, where-
    as Linode lists availability zones. However all responses share id, name
    and country even though in some cases might be empty, e.g. Openstack. In E-
    C2 all locations by a provider have the same name, so the availability zo-
    nes are listed instead of name.
    READ permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    return methods.list_locations(auth_context.owner, cloud_id)


@view_config(route_name='api_v1_subnets', request_method='GET', renderer='json')
def list_subnets(request):
    """
    List subnets of a cloud
    Currently supports the EC2, GCE and OpenStack clouds.
    For other providers this returns an empty list.
    READ permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    network_id:
      in: path
      required: true
      description: The DB ID of the network whose subnets will be returned
      type: string
    """

    cloud_id = request.matchdict['cloud']
    network_id = request.matchdict['network']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)

    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise CloudNotFoundError

    try:
        network = Network.objects.get(cloud=cloud, id=network_id)
    except Network.DoesNotExist:
        raise NetworkNotFoundError

    subnets = methods.list_subnets(cloud, network=network)

    return subnets


@view_config(route_name='api_v1_subnets', request_method='POST', renderer='json')
def create_subnet(request):
    """
    Create subnet on a given network on a cloud.
    CREATE_RESOURCES permission required on cloud.
    ---
    cloud_id:
      in: path
      required: true
      description: The Cloud ID
      type: string
    network_id:
      in: path
      required: true
      description: The ID of the Network that will contain the new subnet
      type: string
    subnet:
      required: true
      type: dict
    """
    cloud_id = request.matchdict['cloud']
    network_id = request.matchdict['network']

    params = params_from_request(request)

    auth_context = auth_context_from_request(request)

    # TODO
    if not auth_context.is_owner():
        raise PolicyUnauthorizedError()

    try:
        cloud = Cloud.objects.get(id=cloud_id, owner=auth_context.owner)
    except Cloud.DoesNotExist:
        raise CloudNotFoundError
    try:
        network = Network.objects.get(id=network_id, cloud=cloud)
    except Network.DoesNotExist:
        raise NetworkNotFoundError

    subnet = methods.create_subnet(auth_context.owner, cloud, network, params)

    return subnet.as_dict()


@view_config(route_name='api_v1_subnet', request_method='DELETE')
def delete_subnet(request):
    """
    Delete a subnet.
    CREATE_RESOURCES permission required on cloud.
    ---
    cloud_id:
      in: path
      required: true
      type: string
    network_id:
      in: path
      required: true
      type: string
    subnet_id:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    subnet_id = request.matchdict['subnet']
    network_id = request.matchdict['network']

    auth_context = auth_context_from_request(request)

    # TODO
    if not auth_context.is_owner():
        raise PolicyUnauthorizedError()

    try:
        cloud = Cloud.objects.get(id=cloud_id, owner=auth_context.owner)
    except Cloud.DoesNotExist:
        raise CloudNotFoundError

    try:
        network = Network.objects.get(id=network_id, cloud=cloud)
    except Network.DoesNotExist:
        raise NetworkNotFoundError

    try:
        subnet = Subnet.objects.get(id=subnet_id, network=network)
    except Subnet.DoesNotExist:
        raise SubnetNotFoundError

    methods.delete_subnet(auth_context.owner, subnet)

    return OK


@view_config(route_name='api_v1_probe', request_method='POST', renderer='json')
def probe(request):
    """
    Probe a machine
    Ping and SSH to machine and collect various metrics.
    READ permission required on cloud.
    READ permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    host:
      type: string
    key:
      type: string
    ssh_user:
      default: ''
      description: ' Optional. Give if you explicitly want a specific user'
      in: query
      required: false
      type: string
    """
    machine_id = request.matchdict['machine']
    cloud_id = request.matchdict['cloud']
    params = params_from_request(request)
    key_id = params.get('key', None)
    ssh_user = params.get('ssh_user', '')

    if key_id == 'undefined':
        key_id = ''
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)

    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
        host = machine.hostname
    except me.DoesNotExist:
        machine_uuid = ""
        host = None
    auth_context.check_perm("machine", "read", machine_uuid)

    ret = methods.probe(auth_context.owner, cloud_id, machine_id, host, key_id,
                        ssh_user)
    amqp_publish_user(auth_context.owner, "probe",
                 {
                    'cloud_id': cloud_id,
                    'machine_id': machine_id,
                    'result': ret
                 })
    return ret


@view_config(route_name='api_v1_ping', request_method=('GET', 'POST'), renderer='json')
def ping(request):
    """
    Check that an api token is correct.
    ---
    """
    user = user_from_request(request)
    if isinstance(session_from_request(request), SessionToken):
        raise BadRequestError('This call is for users with api tokens')
    return {'hello': user.email}


@view_config(route_name='api_v1_monitoring', request_method='GET', renderer='json')
def check_monitoring(request):
    """
    Check monitoring
    Ask the mist.io service if monitoring is enabled for this machine.
    ---
    """
    raise NotImplementedError()

    user = user_from_request(request)
    ret = methods.check_monitoring(user)
    return ret


@view_config(route_name='api_v1_update_monitoring', request_method='POST', renderer='json')
def update_monitoring(request):
    """
    Enable monitoring
    Enable monitoring for a machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    action:
      enum:
      - enable
      - disable
      type: string
    dns_name:
      type: string
    dry:
      default: false
      type: boolean
    name:
      description: ' Name of the plugin'
      type: string
    no_ssh:
      default: false
      type: boolean
    public_ips:
      items:
        type: string
      type: array
    """
    raise NotImplementedError()

    user = user_from_request(request)
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    params = params_from_request(request)
    if not user.mist_api_token:
        log.info("trying to authenticate to service first")
        email = params.get('email')
        password = params.get('password')
        if not email or not password:
            raise UnauthorizedError("You need to authenticate to mist.io.")
        payload = {'email': email, 'password': password}
        try:
            ret = requests.post(config.CORE_URI + '/auth', params=payload,
                                verify=config.SSL_VERIFY)
        except requests.exceptions.SSLError as exc:
            log.error("%r", exc)
            raise SSLError()
        if ret.status_code == 200:
            ret_dict = json.loads(ret.content)
            user.email = email
            user.mist_api_token = ret_dict.pop('token', '')
            user.save()
            log.info("succesfully check_authed")
        elif ret.status_code in [400, 401]:
            user.email = ""
            user.mist_api_token = ""
            user.save()
            raise UnauthorizedError("You need to authenticate to mist.io.")
        else:
            raise UnauthorizedError("You need to authenticate to mist.io.")

    action = params.get('action') or 'enable'
    name = params.get('name', '')
    public_ips = params.get('public_ips', [])  # TODO priv IPs?
    dns_name = params.get('dns_name', '')
    no_ssh = bool(params.get('no_ssh', False))
    dry = bool(params.get('dry', False))

    if action == 'enable':
        ret_dict = methods.enable_monitoring(
            user, cloud_id, machine_id, name, dns_name, public_ips,
            no_ssh=no_ssh, dry=dry
        )
    elif action == 'disable':
        methods.disable_monitoring(user, cloud_id, machine_id, no_ssh=no_ssh)
        ret_dict = {}
    else:
        raise BadRequestError()

    return ret_dict


@view_config(route_name='api_v1_stats', request_method='GET', renderer='json')
def get_stats(request):
    """
    Get monitor data for a machine
    Get all monitor data for this machine
    READ permission required on cloud.
    READ permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    start:
      description: ' Time formatted as integer, from when to fetch stats (default now)'
      in: query
      required: false
      type: string
    stop:
      default: ''
      description: Time formatted as integer, until when to fetch stats (default +10 seconds)
      in: query
      required: false
      type: string
    step:
      default: ''
      description: ' Step to fetch stats (default 10 seconds)'
      in: query
      required: false
      type: string
    metrics:
      default: ''
      in: query
      required: false
      type: string
    request_id:
      default: ''
      in: query
      required: false
      type: string
    """
    raise NotImplementedError()

    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']

    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "read", machine_uuid)

    data = methods.get_stats(
        auth_context.owner,
        cloud_id,
        machine_id,
        request.params.get('start'),
        request.params.get('stop'),
        request.params.get('step'),
        request.params.get('metrics')
    )
    data['request_id'] = request.params.get('request_id')
    return data


@view_config(route_name='api_v1_metrics', request_method='GET', renderer='json')
def find_metrics(request):
    """
    Get metrics of a machine
    Get all metrics associated with specific machine
    READ permission required on cloud.
    READ permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    """
    raise NotImplementedError()

    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "read", machine_uuid)
    return methods.find_metrics(auth_context.owner, cloud_id, machine_id)


@view_config(route_name='api_v1_metrics', request_method='PUT', renderer='json')
def assoc_metric(request):
    """
    Associate metric with machine
    Associate metric with specific machine
    READ permission required on cloud.
    EDIT_GRAPHS permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    metric_id:
      description: ' Metric_id '
      type: string
    """
    raise NotImplementedError()

    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    params = params_from_request(request)
    metric_id = params.get('metric_id')
    if not metric_id:
        raise RequiredParameterMissingError('metric_id')
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "edit_graphs", machine_uuid)
    methods.assoc_metric(auth_context.owner, cloud_id, machine_id, metric_id)
    return {}


@view_config(route_name='api_v1_metrics', request_method='DELETE', renderer='json')
def disassoc_metric(request):
    """
    Disassociate metric from machine
    Disassociate metric from specific machine
    READ permission required on cloud.
    EDIT_GRAPHS permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    metric_id:
      description: ' Metric_id '
      type: string
    """
    raise NotImplementedError()

    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    params = params_from_request(request)
    metric_id = params.get('metric_id')
    if not metric_id:
        raise RequiredParameterMissingError('metric_id')
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "edit_graphs", machine_uuid)
    methods.disassoc_metric(auth_context.owner, cloud_id, machine_id,
                            metric_id)
    return {}


@view_config(route_name='api_v1_metric', request_method='PUT', renderer='json')
def update_metric(request):
    """
    Update a metric configuration
    Update a metric configuration
    READ permission required on cloud.
    EDIT_CUSTOM_METRICS required on machine.
    ---
    metric:
      description: ' Metric_id (provided by self.get_stats() )'
      in: path
      required: true
      type: string
    cloud_id:
      required: true
      type: string
    host:
      type: string
    machine_id:
      required: true
      type: string
    name:
      description: Name of the plugin
      type: string
    plugin_type:
      type: string
    unit:
      description: ' Optional. If given the new plugin will be measured according to this
        unit'
      type: string
    """
    raise NotImplementedError()

    metric_id = request.matchdict['metric']
    params = params_from_request(request)
    machine_id = params.get('machine_id')
    cloud_id = params.get('cloud_id')
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "edit_custom_metrics", machine_uuid)
    methods.update_metric(
        auth_context.owner,
        metric_id,
        name=params.get('name'),
        unit=params.get('unit'),
        cloud_id=cloud_id,
        machine_id=machine_id
    )
    return {}


@view_config(route_name='api_v1_deploy_plugin', request_method='POST', renderer='json')
def deploy_plugin(request):
    """
    Deploy a plugin on a machine.
    Deploy a plugin on the specific machine.
    READ permission required on cloud.
    EDIT_CUSTOM_METRICS required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    plugin:
      in: path
      required: true
      type: string
    name:
      required: true
      type: string
    plugin_type:
      default: python
      enum:
      - python
      required: true
      type: string
    read_function:
      required: true
      type: string
    unit:
      type: string
    value_type:
      default: gauge
      type: string
    """
    raise NotImplementedError()

    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    plugin_id = request.matchdict['plugin']
    params = params_from_request(request)
    plugin_type = params.get('plugin_type')
    auth_context = auth_context_from_request(request)
    # SEC check permission READ on cloud
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
    except me.DoesNotExist:
        raise NotFoundError("Machine %s doesn't exist" % machine_id)

    # SEC check permission EDIT_CUSTOM_METRICS on machine
    auth_context.check_perm("machine", "edit_custom_metrics", machine.id)

    try:
        Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except me.DoesNotExist:
        raise NotFoundError('Cloud id %s does not exist' % cloud_id)

    if not machine.monitoring.hasmonitoring:
        raise NotFoundError("Machine doesn't seem to have monitoring enabled")

    # create a collectdScript
    extra = {'value_type': params.get('value_type', 'gauge'),
             'value_unit': ''}
    name = plugin_id
    kwargs = {'location_type': 'inline',
              'script': params.get('read_function'),
              'extra': extra}
    script = CollectdScript.add(auth_context.owner, name, **kwargs)

    if plugin_type == 'python':
        ret = script.ctl.deploy_python_plugin(machine)
        methods.update_metric(
            auth_context.owner,
            metric_id=ret['metric_id'],
            name=params.get('name'),
            unit=params.get('unit'),
            cloud_id=cloud_id,
            machine_id=machine_id,
        )
        return ret
    else:
        raise BadRequestError("Invalid plugin_type: '%s'" % plugin_type)


@view_config(route_name='api_v1_deploy_plugin',
             request_method='DELETE', renderer='json')
def undeploy_plugin(request):
    """
    Undeploy a plugin on a machine.
    Undeploy a plugin on the specific machine.
    READ permission required on cloud.
    EDIT_CUSTOM_METRICS required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    plugin:
      in: path
      required: true
      type: string
    host:
      required: true
      type: string
    plugin_type:
      default: python
      enum:
      - python
      required: true
      type: string
    """
    raise NotImplementedError()

    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    plugin_id = request.matchdict['plugin']
    params = params_from_request(request)
    plugin_type = params.get('plugin_type')
    host = params.get('host')
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "edit_custom_metrics", machine_uuid)
    if plugin_type == 'python':
        ret = methods.undeploy_python_plugin(auth_context.owner, cloud_id,
                                             machine_id, plugin_id, host)
        return ret
    else:
        raise BadRequestError("Invalid plugin_type: '%s'" % plugin_type)


# @view_config(route_name='metric', request_method='DELETE', renderer='json')
# def remove_metric(request):
    # user = user_from_request(request)
    # metric_id = request.matchdict['metric']
    # url = "%s/metrics/%s" % (config.CORE_URI, metric_id)
    # headers={'Authorization': get_auth_header(user)}
    # try:
        # resp = requests.delete(url, headers=headers,
        #                        verify=config.SSL_VERIFY)
    # except requests.exceptions.SSLError as exc:
        # raise SSLError()
    # except Exception as exc:
        # log.error("Exception removing metric: %r", exc)
        # raise exceptions.ServiceUnavailableError()
    # if not resp.ok:
        # log.error("Error removing metric %d:%s", resp.status_code, resp.text)
        # raise exceptions.BadRequestError(resp.text)
    # return resp.json()


@view_config(route_name='api_v1_rules', request_method='POST', renderer='json')
def update_rule(request):
    """
    Creates or updates a rule.
    ---
    """
    raise NotImplementedError()

    user = user_from_request(request)
    params = params_from_request(request)
    try:
        ret = requests.post(
            config.CORE_URI + request.path,
            params=params,
            headers={'Authorization': get_auth_header(user)},
            verify=config.SSL_VERIFY
        )
    except requests.exceptions.SSLError as exc:
        log.error("%r", exc)
        raise SSLError()
    if ret.status_code != 200:
        log.error("Error updating rule %d:%s", ret.status_code, ret.text)
        raise ServiceUnavailableError()
    trigger_session_update(user, ['monitoring'])
    return ret.json()


@view_config(route_name='api_v1_rule', request_method='DELETE')
def delete_rule(request):
    """
    Delete rule
    Deletes a rule.
    ---
    rule:
      description: ' Rule id '
      in: path
      required: true
      type: string
    """
    raise NotImplementedError()

    user = user_from_request(request)
    try:
        ret = requests.delete(
            config.CORE_URI + request.path,
            headers={'Authorization': get_auth_header(user)},
            verify=config.SSL_VERIFY
        )
    except requests.exceptions.SSLError as exc:
        log.error("%r", exc)
        raise SSLError()
    if ret.status_code != 200:
        log.error("Error deleting rule %d:%s", ret.status_code, ret.text)
        raise ServiceUnavailableError()
    trigger_session_update(user, ['monitoring'])
    return OK


@view_config(route_name='api_v1_providers', request_method='GET', renderer='json')
def list_supported_providers(request):
    """
    List supported providers
    Return all of our SUPPORTED PROVIDERS
    ---
    api_version:
      enum:
      - 1
      - 2
      in: header
      type: integer
    """
    api_version = request.headers.get('Api-Version', 1)
    if int(api_version) == 2:
        return {'supported_providers': config.SUPPORTED_PROVIDERS_V_2}
    else:
        return {'supported_providers': config.SUPPORTED_PROVIDERS}


@view_config(route_name='api_v1_avatars',
             request_method='POST', renderer='json')
def upload_avatar(request):
    user = user_from_request(request)
    body = request.POST['file'].file.read()
    if len(body) > 256*1024:
        raise BadRequestError("File too large")
    from mist.io.users.models import Avatar
    avatar = Avatar()
    avatar.owner = user
    avatar.body = body
    avatar.save()
    return {'id': avatar.id}


@view_config(route_name='api_v1_avatar', request_method='GET')
def get_avatar(request):
    """
    Returns the requested avatar
    ---
    avatar:
      description: 'Avatar Id'
      in: path
      required: true
      type: string
    """
    avatar_id = request.matchdict['avatar']

    try:
        avatar = Avatar.objects.get(id=avatar_id)
    except me.DoesNotExist:
        raise NotFoundError()

    return Response(content_type=str(avatar.content_type), body=str(avatar.body))


@view_config(route_name='api_v1_avatar', request_method='DELETE')
def delete_avatar(request):
    """
    Deletes the requested avatar
    ---
    avatar:
      description: 'Avatar Id'
      in: path
      required: true
      type: string
    """
    avatar_id = request.matchdict['avatar']
    auth_context = auth_context_from_request(request)

    try:
        avatar = Avatar.objects.get(id=avatar_id, owner=auth_context.user)
    except me.DoesNotExist:
        raise NotFoundError()

    try:
        org = Owner.objects.get(avatar=avatar_id)
        org.avatar = ''
        org.save()
    except me.DoesNotExist:
        pass

    avatar.delete()
    trigger_session_update(auth_context.owner, ["org"])
    return OK
