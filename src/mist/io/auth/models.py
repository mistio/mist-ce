import random
import string

import mongoengine as me

from functools import partial
from datetime import datetime, timedelta

from mist.io.users.models import User, Organization
from mist.core.rbac.models import Policy
from mist.io.exceptions import UserNotFoundError


def datetime_to_str(dt):
    if isinstance(dt, datetime):
        return dt.strftime('%Y/%m/%d %H:%m')
    return 'Never'


def get_secure_rand_token(num_of_chars=64):
    token = ''.join(random.SystemRandom().choice(string.hexdigits[:16])
                    for _ in range(num_of_chars))
    return token


class AuthToken(me.Document):
    token = me.StringField(required=True, unique=True,
                           min_length=64, max_length=64,
                           default=partial(get_secure_rand_token,
                                           num_of_chars=64))

    user_id = me.StringField()
    su = me.StringField()
    org = me.ReferenceField(Organization, required=False, null=True)

    created_at = me.DateTimeField(default=datetime.utcnow)
    ttl = me.IntField(min_value=0, default=0)

    last_accessed_at = me.DateTimeField()
    timeout = me.IntField(min_value=0, default=0)

    revoked = me.BooleanField(default=False)

    ip_address = me.StringField()
    user_agent = me.StringField()

    context = me.DictField()

    meta = {
        'allow_inheritance': True,
        'ordering': ['-last_accessed_at'],
        'indexes': [
            'user_id',
            {
                'fields': ['token'],
                'unique': True,
            },
        ],
    }

    def expires(self):
        if self.ttl:
            return self.created_at + timedelta(seconds=self.ttl)

    def is_expired(self):
        return self.ttl and self.expires() < datetime.utcnow()

    def timesout(self):
        if self.timeout:
            return self.last_accessed_at + timedelta(seconds=self.timeout)

    def is_timedout(self):
        return self.timeout and self.timesout() < datetime.utcnow()

    def is_valid(self):
        return not (self.revoked or self.is_expired() or self.is_timedout())

    def invalidate(self):
        self.revoked = True

    def touch(self):
        self.last_accessed_at = datetime.utcnow()

    def get_user(self, effective=True):
        """Return `su` user, if `effective` else `user`"""
        if self.user_id:
            try:
                if effective and self.su:
                    user = User.objects.get(id=self.su)
                else:
                    user = User.objects.get(id=self.user_id)
                return user
            except me.DoesNotExist:
                pass
        return None

    def set_user(self, user, effective=False):
        """Set user, if `effective` then set `su` user_id

        Param `user` can be an instance of `User`, an email or a `user_id`.

        """
        if isinstance(user, User):
            _user = user
        elif isinstance(user, basestring):
            if '@' in user:
                _user = User.objects.get(email=user)
            else:
                _user = User.objects.get(id=user)
        else:
            raise UserNotFoundError()
        user_id = _user.get_id()
        if effective:
            self.su = user_id
        else:
            self.user_id = user_id
        return _user

    def __str__(self):
        msg = "Valid" if self.is_valid() else "Invalid"
        msg += " %s '%si...'" % (self.__class__.__name__, self.token[:6])
        user = self.get_user()
        userid = "Anonymous" if user is None else user.email
        sudoer = self.get_user(False)
        if sudoer != user:
            userid += " (sudoer: %s)" % sudoer.email
        msg += " for %s - " % userid
        msg += "Expired:" if self.is_expired() else "Expires:"
        msg += " %s - " % datetime_to_str(self.expires())
        msg += "Timed out:" if self.is_timedout() else "Times out:"
        msg += " %s - " % datetime_to_str(self.timesout())
        msg += "Revoked: %s" % self.revoked
        return msg

    def get_public_view(self):
        return {
            'id': str(self.id),
            'created_at': str(self.created_at),
            'last_accessed_at': str(self.last_accessed_at),
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'org_id': self.org.id if self.org is not None else None,
            'org_name': self.org.name if self.org is not None and hasattr(self.org, 'name') else '',
            'user_id': self.user_id,
        }


class ApiToken(AuthToken):
    name = me.StringField(required=True)
    policy = me.EmbeddedDocumentField(Policy)

    def get_public_view(self):
        view = super(ApiToken, self).get_public_view()
        view.update({
            'name': self.name,
            'ttl': self.ttl,
            'token': self.token[:4] + "...",
            'policy': str(self.policy),
        })
        return view


class SessionToken(AuthToken):
    csrf_token = me.StringField(min_length=64, max_length=64,
                                default=partial(get_secure_rand_token,
                                                num_of_chars=64))
