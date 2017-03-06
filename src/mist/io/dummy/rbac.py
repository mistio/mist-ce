import mist.io.users.models
import mist.io.auth.models
import mist.io.tag.models


class AuthContext(object):
    def __init__(self, user, token):

        assert isinstance(user, mist.io.users.models.User)
        self.user = user

        assert isinstance(token, mist.io.auth.models.AuthToken)
        self.token = token

        assert (
            hasattr(token, 'org') and
            isinstance(token.org, mist.io.users.models.Organization)
        )
        self.org = token.org

        # For backwards compatibility.
        self.owner = self.org

    def is_owner(self):
        return self.user in self.org.teams.get(name='Owners').members

    def _raise(self, rtype, action, rid='', rtags=''):
        pass

    def check_perm(self, rtype, action, rid):
        return None

    def get_security_tags(self):
        return []

    def get_allowed_resources(self, action='read', rtype=None):
        return

    def _get_matching_tags(self, rtype, action):
        return {}


def validate_rule_rid(rule, owner):
    pass


def filter_org(auth_context):
    return None


def rbac_filter(auth_context, query):
    return None
