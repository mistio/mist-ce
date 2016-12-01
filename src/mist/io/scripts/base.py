import uuid
import urllib
import logging
import requests
import mongoengine as me
from mist.core import config
from mist.io.exceptions import BadRequestError
from mist.io.helpers import trigger_session_update
from mist.core.exceptions import ScriptNameExistsError
from mist.io.exceptions import RequiredParameterMissingError

log = logging.getLogger(__name__)


class BaseScriptController(object):
    def __init__(self, script):
        """Initialize a script controller given a script

        Most times one is expected to access a controller from inside the
        script, like this:

            script = mist.io.scripts.models.Script.objects.get(id=script.id)
            script.ctl.edit('renamed')
        """
        self.script = script

    def add(self, fail_on_invalid_params=True, **kwargs):

        """Add an entry to the database

        This is only to be called by `Script.add` classmethod to create
        a script. Fields `owner` and `name` are already populated in
        `self.script`. The `self.script` is not yet saved.
        """
        import mist.io.scripts.models as scripts

        # set location
        location_type = kwargs.pop('location_type')
        if location_type not in ['inline', 'url', 'github', None]:
            raise BadRequestError('location type must be one of these '
                                  '(inline, github, url)]')

        entrypoint = kwargs.pop('entrypoint')

        if location_type == 'inline':
            script_entry = kwargs.pop('script')
            self.script.location = scripts.InlineLocation(
                source_code=script_entry)
        elif location_type == 'github':
            script_entry = kwargs.pop('script')
            self.script.location = scripts.GithubLocation(
                repo=script_entry, entrypoint=entrypoint)
        elif location_type == 'url':
            script_entry = kwargs.pop('script')
            self.script.location = scripts.UrlLocation(
                url=script_entry, entrypoint=entrypoint)
        else:
            raise BadRequestError("Param 'location_type' must be in "
                                  "('url', 'github', 'inline').")

        # errors = {}
        # for key in kwargs:
        #     if key not in self.script._script_specific_fields:
        #         error = "Invalid parameter %s=%r." % (key, kwargs[key])
        #         if fail_on_invalid_params:
        #             errors[key] = error
        #         else:
        #             log.warning(error)
        #             kwargs.pop(key)
        #
        # if errors:
        #     log.error("Error adding %s: %s", self.script, errors)
        #     raise BadRequestError({
        #         'msg': "Invalid parameters %s." % errors.keys(),
        #         'errors': errors,
        #     })

        for key, value in kwargs.iteritems():
            setattr(self.script, key, value)

        try:
            self.script.save()
        except me.ValidationError as exc:
            log.error("Error adding %s: %s", self.script.name, exc.to_dict())
            raise BadRequestError({'msg': exc.message,
                                   'errors': exc.to_dict()})
        except me.NotUniqueError as exc:
            log.error("Script %s not unique error: %s", self.script.name, exc)
            raise ScriptNameExistsError()
        log.info("Added script with name '%s'", self.script.name)
        trigger_session_update(self.script.owner, ['scripts'])

    def edit(self, name, description):
        """Edit name or description of an existing script"""
        log.info("Edit script '%s''.", self.script.name)

        if not name:
            raise RequiredParameterMissingError("new_name")
        if self.script.name == name:
            log.warning("Same name provided. No reason to edit this script")
            return  # fixme

        self.script.name = name
        self.script.description = description
        self.script.save()
        log.info("Edit script '%s' to '%s'.", self.script.id, name)
        trigger_session_update(self.script.owner, ['scripts'])

    def get_file(self):
        """Returns a file or archive"""
        from mist.io.scripts.models import InlineLocation, GithubLocation
        self._preparse_file()

        if isinstance(self.script.location, InlineLocation):
            return self.script.location.source_code
        else:
            # FIXME this is a duplicate part, also exists in tasks,run_script
            # maybe to create a small function for both
            url = ''
            if isinstance(self.script.location, GithubLocation):
                clean_url = self.script.location.repo.replace(
                    'https://github.com/', '')
                path = 'https://api.github.com/repos/%s/tarball' % clean_url

                token = config.GITHUB_BOT_TOKEN
                if token:
                    headers = {'Authorization': 'token %s' % token}
                else:
                    headers = {}
                resp = requests.get(path, headers=headers,
                                    allow_redirects=False)
                if resp.ok and resp.is_redirect and 'location' in resp.headers:
                    url = resp.headers['location']
                # TODO RAISE
            else:
                url = self.script.location.url
            # Download a file over HTTP
            log.debug("Downloading %s.", url)
            name, headers = urllib.urlretrieve(url)
            log.debug("Downloaded to %s.", name)
            return file

    def _preparse_file(self):
        return

    def run_script(self, machine,  env=None,
                   params=None, su=False, job_id=None):
        import mist.core.tasks
        """Calls the actual run_script"""
        job_id = job_id or uuid.uuid4().hex

        mist.core.tasks.run_script.delay(self.script.owner.id, self.script.id,
                                         machine.cloud.id, machine.machine_id,
                                         params=params, su=su, env=env,
                                         job_id=job_id)
        return job_id
