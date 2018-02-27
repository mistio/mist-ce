"""
Default configuration options for ClearGLASS Community
"""
PORTAL_NAME = "ClearGLASS"
THEME = "clearglass"

ENABLE_MONITORING = True

LANDING_CATEGORIES = [{
    'href': '/',
    'name': 'home',
    'template': 'home',
    'title': 'Home',
    'items': {
        "fold": {
            "copy" : "",
            "subcopy" :
                "ClearGLASS is a single dashboard to manage multi-cloud infrastructure",
            "image" : "",
            "alt" : "ClearGLASS cloud management dashboard",
            "cta" : "Get Started"
        },
        "social": [{
                "icon" : "facebook",
                "href" : "https://www.facebook.com/clearcenter",
                "color": "#fff",
                "size" : "24"
            },{
                "icon" : "linkedin",
                "href" : "https://www.linkedin.com/company/clearcenter",
                "color": "#fff",
                "size" : "24"
            },{
                "icon" : "twitter",
                "href" : "https://twitter.com/getclearcenter",
                "color": "#fff",
                "size" : "24"
            },{
                "icon" : "googleplus",
                "href" : "https://plus.google.com/b/117698302019888725708/+Clearcenter/posts",
                "color": "#fff",
                "size" : "24"
            }]
    }
}]


EC2_SECURITYGROUP = {
    'name': 'clearglass',
    'description': 'Security group created by ClearGLASS'
}


CONFIRMATION_EMAIL_SUBJECT = "[ClearGLASS] Confirm your registration"

CONFIRMATION_EMAIL_BODY = \
"""Hi %s,

we received a registration request to ClearGLASS from this email address.

To activate your account, please click on the following link:

%s/confirm?key=%s

This request originated from the IP address %s. If it wasn't you, simply ignore
this message.

Best regards,
The ClearGLASS team

--
%s
Govern the clouds
"""


RESET_PASSWORD_EMAIL_SUBJECT = "[ClearGLASS] Password reset request"

RESET_PASSWORD_EMAIL_BODY = \
"""Hi %s,

We have received a request to change your password.
Please click on the following link:

%s/reset-password?key=%s

This request originated from the IP address %s. If it wasn't you, simply ignore
this message. Your password has not been changed.


Best regards,
The ClearGLASS team

--
%s
Govern the clouds
"""


WHITELIST_IP_EMAIL_SUBJECT = "[ClearGLASS] Account IP whitelist request"

WHITELIST_IP_EMAIL_BODY = \
"""Hi %s,

We have received a request to whitelist the IP you just tried to login with.
Please click on the following link to finish this action:

%s/confirm-whitelist?key=%s

This request originated from the IP address %s. If it wasn't you, simply ignore
this message. The above IP will not be whitelisted.


Best regards,
The ClearGLASS team

--
%s
Govern the clouds
"""


FAILED_LOGIN_ATTEMPTS_EMAIL_SUBJECT = "[ClearGLASS] Failed login attempts warning"


ORG_NOTIFICATION_EMAIL_SUBJECT = "[ClearGLASS] Subscribed to team"

USER_NOTIFY_ORG_TEAM_ADDITION = \
"""Hi

You have been added to the team "%s" of organization %s.

Best regards,
The ClearGLASS team

--
%s
"""

USER_CONFIRM_ORG_INVITATION_EMAIL_BODY = \
"""Hi

You have been invited by %s to join the %s organization
as a member of the %s.

To confirm your invitation, please click on the following link:

%s/confirm-invitation?invitoken=%s

Once you are done with the confirmation process,
you will be able to login to your ClearGLASS user account
as a member of the team%s.

Best regards,
The ClearGLASS team

--
%s
"""

ORG_INVITATION_EMAIL_SUBJECT = "[ClearGLASS] Confirm your invitation"

REGISTRATION_AND_ORG_INVITATION_EMAIL_BODY = \
"""Hi

You have been invited by %s to join the %s organization
as a member of the %s.

Before joining the team you must also activate your account in  ClearGLASS and set
a password. To activate your account and join the team, please click on the
following link:

%s/confirm?key=%s&invitoken=%s

Once you are done with the registration process,
you will be able to login to your ClearGLASS user account
as a member of the team%s.

Best regards,
The ClearGLASS team

--
%s
"""

NOTIFY_REMOVED_FROM_TEAM = \
"""Hi

You have been removed from team %s of organization %s by the
administrator %s.

Best regards,
The ClearGLASS team

--
%s
"""

NOTIFY_REMOVED_FROM_ORG = \
"""Hi

You are no longer a member of the organization %s.

Best regards,
The ClearGLASS team

--
%s
"""

NOTIFY_INVITATION_REVOKED_SUBJECT = "Invitation for organization revoked"

NOTIFY_INVITATION_REVOKED = \
"""Hi

Your invitation to the organization %s has been revoked.

Best regards,
The ClearGLASS team

--
%s
"""
