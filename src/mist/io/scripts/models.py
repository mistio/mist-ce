"""Script entity model."""
from uuid import uuid4
import mongoengine as me
import mist.core.tag.models
from urlparse import urlparse
from mist.core.user.models import Owner
from mist.io.exceptions import BadRequestError
from mist.io.scripts.base import BaseScriptController
from mist.io.exceptions import RequiredParameterMissingError

import mist.io.scripts.controllers as controllers


class Location(me.EmbeddedDocument):
    """Abstract Base class used as a common interface for location types.
        There are three different types
        for now: InLineLocation, GithubLocation, UrlLocation
    """
    meta = {'allow_inheritance': True}

    def as_dict(self):
        NotImplementedError()


class InlineLocation(Location):
    type = 'inline'
    source_code = me.StringField(required=True)

    def as_dict(self):
        return {'source_code': self.source_code}

    def __unicode__(self):
        return 'Script is {0.source_code}'.format(self)


class GithubLocation(Location):
    type = 'github'
    repo = me.StringField(required=True)
    entrypoint = me.StringField()

    def clean(self):
        script_url = urlparse(self.repo)
        if len(script_url.path[1:].split('/')) != 2:
            raise BadRequestError(
                "'repo' must be in "
                "the form of either 'https://github.com/owner/repo' or "
                "simply 'owner/repo'."
            )

    def as_dict(self):
        return {'repo': self.repo,
                'entrypoint': self.entrypoint or ''}

    def __unicode__(self):
        if self.entrypoint:
            return 'Script is in repo {0.repo} ' \
                   'and entrypoint {0.entrypoint}'.format(self)
        else:
            return 'Script is in repo {0.repo}'.format(self)


class UrlLocation(Location):
    type = 'url'
    url = me.StringField(required=True)  # TODO maybe URLField
    entrypoint = me.StringField()

    def clean(self):
        if not (self.url.startswith('http://') or
                self.url.startswith('https://')):
            raise BadRequestError("When 'location_type' is 'url', 'script' "
                                  "must be a valid url starting with "
                                  "'http://' or 'https://'.")

    def as_dict(self):
        return {'url': self.url,
                'entrypoint': self.entrypoint or ''}

    def __unicode__(self):
        if self.entrypoint:
            return 'Script is in url {0.repo} and ' \
                   'entrypoint {0.entrypoint}'.format(self)
        else:
            return 'Script is in repo {0.repo}'.format(self)


class Script(me.Document):
    """Abstract base class for every script attr mongoengine model.

        This class defines the fields common to all scripts of all types.
        For each different script type, a subclass should be created adding
        any script specific fields and methods.

        Documents of all Script subclasses will be stored on the same mongo
        collection.

        One can perform a query directly on Script to fetch all script types,
        like this:
            Script.objects(owner=owner).count()

        This will return an iterable of scripts for that owner. Each key will
        be an instance of its respective Script subclass, like AnsibleScript
        and CollectdScript instances.

        Scripts of a specific type can be queried like this:
            AnsibleScript.objects(owner=owner).count()

        This will return an iterable of AnsibleScript instances.

        To create a new script, one should initialize a Script subclass like
        AmazonScript. Initializing directly a Script instance won't have any
        fields or associated handler to work with.

        Each Script subclass should define a `_controller_cls` class attribute.
        Its value should be a subclass of
        `mist.io.scripts.controllers.BaseScriptController'. These
        subclasses are stored in `mist.io.scripts.BaseScriptController`.
        When a script is instanciated, it is given a `ctl` attribute which
        gives access to the scripts controller.
        This way it is possible to do things like:

            script = AnsibleScript.objects.get(id=key_id)
            script.ctl.get_file()
        """

    meta = {
        'allow_inheritance': True,
        'collection': 'scripts',
        'indexes': [
            {
                'fields': ['owner', 'name'],  # 'deleted' # TODO after mappings
                'sparse': False,
                'unique': True,
                'cls': False,
            },
        ],
    }

    id = me.StringField(primary_key=True,
                        default=lambda: uuid4().hex)

    name = me.StringField(required=True)
    description = me.StringField()
    owner = me.ReferenceField(Owner, required=True) # TODO Org when port users
    location = me.EmbeddedDocumentField(Location, required=True)

    deleted = me.BooleanField(default=False)
    # deleted = me.DateTimeField() # FIXME after mappings

    _controller_cls = None

    def __init__(self, *args, **kwargs):
        super(Script, self).__init__(*args, **kwargs)
        # Set attribute `ctl` to an instance of the appropriate controller.
        if self._controller_cls is None:
            raise NotImplementedError(
                "Can't initialize %s. Script is an abstract base class and "
                "shouldn't be used to create script instances. All Script "
                "subclasses should define a `_controller_cls` class attribute "
                "pointing to a `BaseController` subclass." % self
            )
        elif not issubclass(self._controller_cls, BaseScriptController):
            raise TypeError(
                "Can't initialize %s.  All Script subclasses should define a"
                " `_controller_cls` class attribute pointing to a "
                "`BaseController` subclass." % self
            )
        self.ctl = self._controller_cls(self)
        # Calculate and store script type specific fields.
        self._script_specific_fields = [field for field in type(self)._fields
                                        if field not in Script._fields]

    @classmethod
    def add(cls, owner, name, id='', **kwargs):
        """Add script
        This is a class method, meaning that it is meant to be called on the
        class itself and not on an instance of the class.
        You 're not meant to be calling this directly, but on a script subclass
        instead like this:
            script = Script.add(owner=org, name='unicorn', **kwargs)
        """
        if not name:
            raise RequiredParameterMissingError('name')
        if not owner or not isinstance(owner, Owner):
            raise BadRequestError('owner')
        script = cls(owner=owner, name=name)
        if id:
            script.id = id
        script.ctl.add(**kwargs)
        return script

    @property
    def script(self):  # TODO only for as_dict_old, replace with location.type
        if isinstance(self.location, InlineLocation):
            return self.location.source_code
        elif isinstance(self.location, GithubLocation):
            return self.location.repo
        elif isinstance(self.location, UrlLocation):
            return self.location.url

    # def get_jobs(self):
    #     """Get jobs related to script."""
    #     conn = MongoClient(config.MONGO_URI)
    #     db = conn['mist']
    #     cursor = db.ansible_jobs.find({'script_id': self.id})
    #     # FIXME what is this?

    def delete(self):
        super(Script, self).delete()
        mist.core.tag.models.Tag.objects(resource=self).delete()

    def as_dict_old(self):
        """Data representation for api calls.
           Use this for backwards compatibility"""

        if isinstance(self.location, InlineLocation): # TODO replace with type
            entrypoint = ''
        else:
            entrypoint = self.location.entrypoint or ''

        sdict = {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'location_type': self.location.type,
            'entrypoint': entrypoint,
            'script': self.script,
            'exec_type': self.exec_type,
        }

        sdict.update({key: getattr(self, key)
                      for key in self._script_specific_fields})

        return sdict

    def as_dict(self):
        """Data representation for api calls."""

        sdict = {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'exec_type': self.exec_type,
            'location': self.location.as_dict(),
        }

        return sdict

    def __str__(self):
        return 'Script %s (%s) of %s' % (self.name, self.id, self.owner)


class AnsibleScript(Script):

    exec_type = 'ansible'

    _controller_cls = controllers.AnsibleScriptController


class ExecutableScript(Script):

    exec_type = 'executable'

    _controller_cls = controllers.ExecutableScriptController


class CollectdScript(Script):

    exec_type = 'executable'
    # ex. a dict with value_type='gauge', value_unit=''
    extra = me.DictField()

    _controller_cls = controllers.CollectdScriptController
