from mist.io.users.models import User
from mist.io.users.models import Promo
from mist.io.users.models import Organization

from mongoengine import ValidationError
from mongoengine import OperationError

from mist.core.methods import assign_promo
from mist.core.methods import get_secure_rand_token
from mist.core.helpers import log_event

from mist.core import config

from mist.core.exceptions import BadRequestError
from mist.core.exceptions import MethodNotAllowedError
from mist.core.exceptions import OrganizationOperationError

from time import time

import logging
log = logging.getLogger(__name__)


def get_all_promos():
    return Promo.objects()


def get_all_users(mongo_uri=None):
    return User.objects()


def get_users_count(mongo_uri=None, confirmed=False):
    # return the number of all users, optionally confirmed only users
    if confirmed:
        return User.objects(status="confirmed").count()
    else:
        return User.objects().count()


def register_user(email, first_name, last_name, registration_method,
                  selected_plan=None, promo_code=None, token=None,
                  status='pending', create_organization=True):
    # User does not exist so we have to add him/her to the database
    # First make sure that email is not banned
    # Then create the User objects and the Organization
    if email.split('@')[1] in config.BANNED_EMAIL_PROVIDERS:
        raise MethodNotAllowedError("Email provider is banned.")

    user = User()
    user.email = email
    user.first_name = first_name
    user.last_name = last_name
    user.registration_method = registration_method
    user.registration_date = time()
    user.status = status
    user.activation_key = get_secure_rand_token()
    user.can_create_org = True
    user.save()

    log_event_args = {
        'owner_id': '',
        'user_id': user.id,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'company': user.feedback.company_name,
        'event_type': 'request',
        'action': 'register',
        'authentication_provider': registration_method
    }

    # For some users registering through sso it might not be necessary to
    # create an organization, hence the flag
    org = create_org_for_user(user, '', promo_code, token, selected_plan) \
        if create_organization else None

    if org:
        log_event_args.update({
            'org_id': org.id,
            'org_name': org.name
        })

    # Create log for the registration of a user and if an org has been created
    # add the id and name of the org
    log_event(**log_event_args)

    return user, org


def create_org_for_user(user, org_name='', promo_code=None, token=None,
                        selected_plan=None):
    org = Organization(name=org_name, selected_plan=selected_plan)
    org.add_member_to_team('Owners', user)
    org.name = org_name
    try:
        org.save()
    except ValidationError as e:
        raise BadRequestError({"msg": e.message, "errors": e.to_dict()})
    except OperationError:
        raise OrganizationOperationError()

    # assign promo if applicable
    if promo_code or token:
        assign_promo(org, promo_code, token)
    return org
