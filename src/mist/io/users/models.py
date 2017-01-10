"""User entity model."""
import logging
import json
import uuid
import re
import mongoengine as me

from time import time
from uuid import uuid4
from datetime import date

from bson.dbref import DBRef
from passlib.context import CryptContext

from social.backends.utils import get_backend
from social.apps.pyramid_app.utils import get_helper

from mist.core import config

from mist.core.rbac.models import Policy
from mist.core.rbac.mappings import PermissionMapper, RBACMapping


logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)
# Passwords settings
# Here we define the password manager used for user's passwords
# It's very extensible, so that at any point we can migrate to other hashing
# functions, raise the number of iterations etc.
# User's passwords will be updated upon first successful login.
# hex_sha256 corresponds to the old (unsalted) way of storing passwords which
# we deprecate for security reasons. The new scheme is PBKDF2 using SHA-512 as
# as hash function with a minimum of 20000 rounds.
pwd_context = CryptContext(
    schemes=["pbkdf2_sha512", "hex_sha256"],
    default="pbkdf2_sha512",
    deprecated=["hex_sha256"],
    pbkdf2_sha512__min_rounds=20000
)


class HtmlSafeStrField(me.StringField):
    """Escapes < and > when reading field."""

    def to_mongo(self, value):
        if value is None:
            return value
        value = value.replace("&", "&amp;")
        value = value.replace("<", "&lt;")
        value = value.replace(">", "&gt;")
        return value


class Feedback(me.EmbeddedDocument):
    company_name = me.StringField()
    country = me.StringField()
    number_of_people = me.StringField()
    number_of_servers = me.StringField()

    submitted = me.BooleanField()
    alternatives = me.StringField()
    discover = me.StringField()
    follow_up = me.StringField()  # why not bool?
    hosted = me.ListField()
    improve = me.StringField()
    satisfied = me.StringField()

    def as_dict(self):
        return json.loads(self.to_json())


class Plan(me.EmbeddedDocument):
    title = me.StringField()
    isTrial = me.BooleanField()
    machine_limit = me.IntField(default=5)
    monitor_limit = me.IntField(default=1)
    started = me.FloatField()
    expiration = me.FloatField()
    promo_code = me.StringField()
    price = me.IntField(default=0)

    def has_expired(self):
        return bool(self.expiration and self.expiration < time())

    def extend(self, days):
        """Push expiration date that many days in the future.

        If no expiration date is set, it sets it that many days in the future
        from now.

        """
        if not self.expiration or self.expiration < time():
            self.expiration = time()
        self.expiration += 60 * 60 * 24 * days

    def as_dict(self):
        return json.loads(self.to_json())

    def __str__(self):
        import mist.core.helpers
        return "\n".join([
            "title: %s (trial=%s, promo=%s)" % (self.title, self.isTrial,
                                                self.promo_code),
            "machine_limit: %s" % self.machine_limit,
            "started: %s" % mist.core.helpers.ts_to_str(self.started),
            "expires: %s" % mist.core.helpers.ts_to_str(self.expiration),
        ])


class SocialAuthUser(me.Document):
    """
    Class used to store the data that the authentication provider shares
    with mist when a user logs or signs up using same external authentication
    mechanism.
    """

    provider = me.StringField(required=True)

    # This is the unique id that the authentication provider uses to
    uid = me.StringField(required=True, unique=True)

    # The id of the user that has connected with this account
    user_id = me.StringField(required=True)

    access_token = me.StringField()
    logged_in = me.BooleanField()

    user_data = me.DictField()

    extra_data = me.DictField()

    def get_user(self):
        if self.user_id:
            try:
                user = User.objects.get(id=self.user_id)
                return user
            except me.DoesNotExist:
                pass
        return None

    @property
    def user(self):
        if self.user_id is None:
            return None
        return User.objects.get(id=self.user_id)

    @user.setter
    def user(self, user):
        """
        Set user
        User can be an instance of `User` and nothing else
        """
        self.user_id = user.get_id()

    def as_dict(self):
        return json.loads(self.to_json())

    def set_extra_data(self, extra_data=None, save=True):
        if self.extra_data is None:
            self.extra_data = extra_data
            if save:
                self.save()
        else:
            self.extra_data.update(extra_data)
            if save:
                self.save()
        return True

    def get_backend(self, strategy):
        if self.provider is None or self.provider == '':
            raise ValueError('Provider has not been set')
        backends = get_helper('AUTHENTICATION_BACKENDS')
        return get_backend(backends, self.provider)

    def __str__(self):
        user = None
        if self.user_id:
            try:
                user = User.objects.get(id=self.user_id).email
            except User.DoesNotExist:
                user = '%s (not found)' % self.user_id
        return 'SocialAuthUser for %s on %s' % (user, self.provider)


class Rule(me.Document):
    """The basic Rule Model."""

    rule_action = me.StringField()
    metric = me.StringField()  # metric_id for builtin or custom metric
    value = me.FloatField()
    cloud = me.StringField()
    machine = me.StringField()
    operator = me.StringField()
    command = me.StringField()
    action = me.StringField()
    aggregate = me.StringField(default='all')  # must be in ('all','avg','any')
    reminder_offset = me.IntField()  # seconds to wait
    # before sending notifications
    emails = me.ListField(me.StringField(), default=[])
    # email to send the alerts. Can be a list of email addresses

    def clean(self):
        # TODO: check if these are valid email addresses,
        # to avoid possible spam
        if self.emails:
            if isinstance(self.emails, basestring):
                emails = []
                for email in self.emails.split(','):
                    if re.match("[^@]+@[^@]+\.[^@]+", email):
                        if email.split('@')[1] not in config.BANNED_EMAIL_PROVIDERS:
                            emails.append(email.replace(' ', ''))
                self.emails = emails
        super(Rule, self).clean()

    def as_dict(self):
        return json.loads(self.to_json())


class Owner(me.Document):

    id = me.StringField(primary_key=True,
                        default=lambda: uuid4().hex)

    activation_date = me.FloatField()  # TODO: Use datetime object
    # this exists for preventing conflicting rule id's
    rule_counter = me.IntField(default=0)
    total_machine_count = me.IntField()

    rules = me.MapField(field=me.ReferenceField(Rule))
    alerts_email = me.ListField(me.StringField(), default=[])

    # set a global alerts email

    # billing related fields
    customerId = me.StringField()
    card = me.StringField()

    plans = me.EmbeddedDocumentListField(
        Plan
    )

    meta = {
        'allow_inheritance': True,
        'ordering': ['-activation_date'],
        'strict': False,
    }

    def count_mon_machines(self):
        from mist.io.clouds.models import Cloud
        from mist.io.machines.models import Machine
        clouds = Cloud.objects(owner=self, deleted=None)
        return Machine.objects(cloud__in=clouds,
                               monitoring__hasmonitoring=True).count()

    def get_id(self):
        # TODO: This must be deprecated
        if not self.id:
            self.id = lambda:uuid.uuid4().hex
        return self.id

    def get_external_id(self, service):
        import mist.core.helpers
        return mist.core.helpers.encrypt2(self.id, key_salt=service,
                                          no_iv=True)

    def as_dict(self):
        # FIXME: Now, this is just silly
        return json.loads(self.to_json())

    def clean(self):
        # TODO: check if these are valid email addresses,
        # to avoid possible spam
        if self.alerts_email:
            if isinstance(self.alerts_email, basestring):
                emails = []
                for email in self.alerts_email.split(','):
                    if re.match("[^@]+@[^@]+\.[^@]+", email):
                        emails.append(email.replace(' ', ''))
                self.emails = emails
        super(Owner, self).clean()


class User(Owner):
    email = HtmlSafeStrField()
    # NOTE: deprecated. Only still used to migrate old API tokens
    mist_api_token = me.StringField()
    last_name = HtmlSafeStrField()
    feedback = me.EmbeddedDocumentField(Feedback, default=Feedback())

    activation_key = me.StringField()
    first_name = HtmlSafeStrField()
    invitation_accepted = me.FloatField()
    invitation_date = me.FloatField()
    last_login = me.FloatField()
    password = me.StringField()
    password_set_token = me.StringField()
    password_set_token_created = me.FloatField()
    password_set_user_agent = me.StringField()
    registration_date = me.FloatField()
    registration_method = me.StringField()
    requested_demo = me.BooleanField()
    demo_request_date = me.FloatField()
    role = me.StringField()
    status = me.StringField()

    # these fields will exists only for org
    # when migration from user to org completes
    promo_codes = me.ListField()
    selected_plan = me.StringField()
    enterprise_plan = me.DictField()

    is_ibm_user = me.BooleanField()

    open_id_url = HtmlSafeStrField()
    g_plus_url = HtmlSafeStrField()
    github_url = HtmlSafeStrField()

    password_reset_token_ip_addr = me.StringField()
    password_reset_token = me.StringField()
    password_reset_token_created = me.FloatField()
    user_agent = me.StringField()
    social_auth_users = me.MapField(field=me.ReferenceField(SocialAuthUser))
    username = me.StringField()

    can_create_org = me.BooleanField(default=True)
    beta_access = me.BooleanField(default=True)

    def __str__(self):
        return 'User %s' % self.email

    def set_password(self, password):
        """Update user's password."""
        # could perform strength measuring first
        hashed_pwd = pwd_context.encrypt(password)
        self.password = hashed_pwd
        self.save()

    def check_password(self, password):
        """
        Return True if password matches, False otherwise.
        This will also update the password if it's using a deprecated scheme.
        If user.password is empty because the user registered through SSO then
        the password passed as argument should be empty otherwise False will be
        returned.
        """
        if not self.password or not password:
            return False
        ok, new_hash = pwd_context.verify_and_update(password, self.password)
        if not ok:
            return False
        if new_hash:
            # hashed password was using a deprecated scheme, update it
            log.info("Updating user's password.")
            self.password = new_hash
            self.save()
        return True

    def __eq__(self, other):
        return self.id == other.id

    def clean(self):
        # make sure user.email is unique - we can't use the unique keyword on
        # the field definition because both User and Organization subclass
        # Owner but only user has an email field
        if User.objects(email=self.email, id__ne=self.id):
            raise me.ValidationError("User with email '%s' already exists."
                                     % self.email)

        super(User, self).clean()

    def get_nice_name(self):
        if self.first_name and not self.last_name:
            return self.first_name + '(' + self.email + ')'
        else:
            name = (self.first_name or '') + ' ' + (self.last_name or '')
            return name.strip() or self.email


class Promo(me.Document):
    code = me.StringField()
    url_token = me.StringField()
    plans = me.ListField()
    # these must be renamed, eventually to orgs
    users = me.ListField()
    max_users = me.IntField()
    discount = me.IntField()
    duration = me.IntField()
    expiration = me.FloatField()
    stripe_coupon_id = me.StringField()
    send_to_purchase = me.BooleanField()

    def describe(self):
        """Automatically creates a human readable description for promo."""
        discount = self.discount
        days = self.duration
        duration = "%d days" % days
        if days >= 30:
            months = round(float(days) / 30)
            duration = "%d month" % months
            if months > 1:
                duration += 's'
            if not months % 12:
                years = months / 12
                duration = "%d year" % years
                if years > 1:
                    duration += 's'
        return "%d%% off for %s" % (discount, duration)

    def __str__(self):
        return self.describe()

    def as_dict(self):
        return json.loads(self.to_json())

    def api_view(self):
        return {
            'plans': self.plans,
            'title': self.code,
            'users': self.users,
            'maxUsers': self.max_users,
            'discount': self.discount,
            'duration': self.duration,
            'expiration': date.fromtimestamp(self.expiration).isoformat(),
            'urlToken': self.url_token,
            'description': self.describe(),
            'stripeCouponId': self.stripe_coupon_id,
            'sendToPurchase': self.send_to_purchase
        }


class Team(me.EmbeddedDocument):
    id = me.StringField(default=lambda: uuid.uuid4().hex)
    name = me.StringField(required=True)
    description = me.StringField()
    members = me.ListField(me.ReferenceField(User))
    visible = me.BooleanField(default=True)
    policy = me.EmbeddedDocumentField(Policy,
                                      default=lambda: Policy(operator='DENY'),
                                      required=True)
    mappings = me.ListField(me.ReferenceField(RBACMapping))

    def validate(self, clean=True):
        """Pre-save validation checks to ensure RBAC Mappings are properly
        initialized for all Teams.
        """
        if self.name == 'Owners':
            if self.mappings:
                raise me.ValidationError('RBAC Mappings are not intended for '
                                         'Team Owners')
        elif self.mappings:
            if len(self.mappings) is not 2:
                # Each Team should have RBAC Mappings
                # for permissions: READ and READ_LOGS
                raise me.ValidationError('RBAC Mappings not properly '
                                         'initialized for Team %s' % self)
        super(Team, self).validate(clean=clean)

    def clean(self):
        """Ensure RBAC Mappings are initialized."""
        if not self.name == 'Owners':
            if not self.mappings:
                self.init_mappings()

    def init_mappings(self, actions=['read', 'read_logs']):
        """Initialization of the RBAC Mappings for a newly created Team."""
        if self.name == 'Owners':
            return
        if self.mappings:
            raise me.ValidationError('RBAC Mappings already exist for %s. '
                                     'Cannot re-initialize' % self)
        for action in actions:
            rbac_mapping = RBACMapping(permission=action).save()
            self.mappings.append(rbac_mapping)

    def drop_mappings(self):
        """Deletes the RBAC Mappings upon a Team's removal from an Org."""
        RBACMapping.objects(
            id__in=[mapping.id for mapping in self.mappings]
        ).delete()

    def as_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'members': self.members,
            'policy': self.policy,
            'visible': self.visible
        }

    def __str__(self):
        return '%s (%d members)' % (self.name, len(self.members))


class Organization(Owner):
    name = me.StringField(required=True)
    members = me.ListField(me.ReferenceField(User), required=True)
    teams = me.EmbeddedDocumentListField(
        Team,
        default=lambda: [Team(name='Owners', policy=Policy(operator='ALLOW'))]
    )
    # These are assigned only to organization from now on
    promo_codes = me.ListField()
    selected_plan = me.StringField()
    enterprise_plan = me.DictField()

    @property
    def mapper(self):
        """Returns the `PermissionMapper` for the current Org context."""
        return PermissionMapper(self)

    def __str__(self):
        return 'Org %s (%d teams - %d members)' % (self.name, len(self.teams),
                                                   len(self.members))

    def get_email(self):
        return self.teams.get(name='Owners').members[0].email

    def get_emails(self):
        emails = []
        for user in self.teams.get(name='Owners').members:
            emails.append(user.email)
        return emails

    def get_team(self, team_name):
        return self.teams.get(name=team_name)

    def get_team_by_id(self, team_id):
        return self.teams.get(id=team_id)

    def add_member_to_team(self, team_name, user):
        team = self.get_team(team_name)
        if user not in team.members:
            team.members.append(user)
        if user not in self.members:
            self.members.append(user)

    def add_member_to_team_by_id(self, team_id, user):
        team = self.get_team_by_id(team_id)
        if user not in team.members:
            team.members.append(user)
        if user not in self.members:
            self.members.append(user)

    def remove_member_from_team(self, team_name, user):
        team = self.get_team(team_name)
        for i, member in enumerate(team.members):
            if user == member:
                team.members.pop(i)
                break

    def remove_member_from_team_by_id(self, team_id, user):
        team = self.get_team_by_id(team_id)
        for i, member in enumerate(team.members):
            if user == member:
                team.members.pop(i)
                break

    def remove_member_from_members(self, user):
        for i, member in enumerate(self.members):
            if user == member:
                self.members.pop(i)
                break

    def as_dict(self):
        view = json.loads(self.to_json())
        view_id = view["_id"]
        del view["_id"]
        del view["_cls"]
        view["id"] = view_id
        view["members"] = []
        for member in self.members:
            name = ""
            name = (member.first_name or ' ') + (member.last_name or '')
            name = (name.strip() or member.email)
            view["members"].append({
                "id": member.id,
                "name": name,
                "email": member.email,
                "pending": False
            })
        team_pending_members = {}
        invitations = MemberInvitation.objects(org=self)
        for invitation in invitations:
            member = invitation.user
            name = ""
            name = (member.first_name or ' ') + (member.last_name or '')
            name = (name.strip() or member.email)
            view["members"].append({
                "id": member.id,
                "name": name,
                "email": member.email,
                "pending": True
            })
            for team_id in invitation.teams:
                if team_id not in team_pending_members:
                    team_pending_members[team_id] = []
                team_pending_members[team_id].append(member.id)
        for team in view['teams']:
            if team['id'] in team_pending_members:
                team['members'].extend(team_pending_members[team['id']])

        return view

    def clean(self):
        # make sure that each team's name is unique
        used = set()
        for team in self.teams:
            if team.name in used:
                raise me.ValidationError("Team name exists.")
            used.add(team.name)

        # make sure that all team members are also org members
        for team in self.teams:
            for i, member in enumerate(list(team.members)):
                if member not in self.members:
                    team.members.pop(i)

        # make sure that owners team is present
        try:
            owners = self.teams.get(name='Owners')
        except me.DoesNotExist:
            raise me.ValidationError("Owners team can't be removed.")

        # make sure that owners team is not empty
        if not owners.members:
            raise me.ValidationError("Owners team can't be empty.")

        # make sure owners policy allows all permissions
        if owners.policy.operator != 'ALLOW':
            raise me.ValidationError("Owners policy must be set to ALLOW.")

        # make sure owners policy doesn't contain specific rules
        if owners.policy.rules:
            raise me.ValidationError("Can't set policy rules for Owners team.")

        # make sure org name is unique - we can't use the unique keyword on the
        # field definition because both User and Organization subclass Owner
        # but only Organization has a name
        if self.name and Organization.objects(name=self.name, id__ne=self.id):
            raise me.ValidationError("Organization with name '%s' "
                                     "already exists." % self.name)

        super(Organization, self).clean()


class MemberInvitation(me.Document):
    id = me.StringField(primary_key=True, default=lambda: uuid4().hex)
    user = me.ReferenceField(User, required=True)
    org = me.ReferenceField(Organization, required=True)
    teams = me.ListField(me.StringField(), required=True)
    token = me.StringField(required=True)


class Metric(me.Document):
    """A custom metric"""

    owner = me.ReferenceField(Owner, required=True)
    metric_id = me.StringField(required=True)
    name = me.StringField()
    unit = me.StringField()

    meta = {
        'indexes': [
            {
                'fields': ['owner', 'metric_id'],
                'sparse': False,
                'unique': True,
                'cls': False,
            },
        ],
    }

    def clean(self):
        if not self.name and self.metric_id:
            self.name = self.metric_id.replace('.', ' ').capitalize()
        super(Metric, self).clean()

    def format_value(self, value):
        if self.unit in ('B', 'B/s'):
            if value < 1024:
                fval = "%d B" % int(value)
            elif value < 1024 * 1024:
                fval = "%.1f KB" % (float(value) / 1024)
            else:
                fval = "%.1f MB" % (float(value) / 1024 / 1024)
            if self.unit == 'B/s':
                fval += '/s'
        elif self.unit in ('%',):
            fval = "%.1f%%" % float(value)
        else:
            fval = "%s %s" % (value, self.unit)
        return fval

    def as_dict(self):
        return {
            "metric_id": self.metric_id,
            "name": self.name,
            "unit": self.unit,
        }
