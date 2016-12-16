import logging
import requests
import StringIO
import mongoengine as me
from mist.core import config
from pyramid.response import Response
from mist.io.exceptions import BadRequestError
from mist.io.helpers import trigger_session_update
from mist.core.exceptions import ScriptNameExistsError

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

    def add(self, fail_on_invalid_params=False, **kwargs):

        """Add an entry to the database

        This is only to be called by `Script.add` classmethod to create
        a script. Fields `owner` and `name` are already populated in
        `self.script`. The `self.script` is not yet saved.
        """

        import mist.io.scripts.models as scripts

        # set description
        self.script.description = kwargs.pop('description')

        # set location
        location_type = kwargs.pop('location_type')
        if location_type not in ['inline', 'url', 'github']:
            raise BadRequestError('location type must be one of these: '
                                  '(inline, github, url)]')

        entrypoint = kwargs.pop('entrypoint', '')

        if location_type == 'inline':
            script_entry = kwargs.pop('script') or ''
            self.script.location = scripts.InlineLocation(
                source_code=script_entry)
        elif location_type == 'github':
            script_entry = kwargs.pop('script') or ''
            self.script.location = scripts.GithubLocation(
                repo=script_entry, entrypoint=entrypoint)
        elif location_type == 'url':
            script_entry = kwargs.pop('script') or ''
            self.script.location = scripts.UrlLocation(
                url=script_entry, entrypoint=entrypoint)
        else:
            raise BadRequestError("Param 'location_type' must be in "
                                  "('url', 'github', 'inline').")

        # specific check
        self._preparse_file()

        errors = {}
        for key in kwargs.keys():
            if key not in self.script._script_specific_fields:
                error = "Invalid parameter %s=%r." % (key, kwargs[key])
                if fail_on_invalid_params:
                    errors[key] = error
                else:
                    log.warning(error)
                    kwargs.pop(key)

        if errors:
            log.error("Error adding %s: %s", self.script, errors)
            raise BadRequestError({
                'msg': "Invalid parameters %s." % errors.keys(),
                'errors': errors,
            })

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

    def edit(self, name=None, description=None):
        """Edit name or description of an existing script"""
        log.info("Edit script '%s''.", self.script.name)

        if name and name == self.script.name:
            log.warning("Same name provided. No reason to edit this script")
            return
        if name:
            self.script.name = name
        if description:
            self.script.description = description
        self.script.save()
        log.info("Edit script: '%s'.", self.script.id)
        trigger_session_update(self.script.owner, ['scripts'])

    # TODO add delete method in controller and not in model
    # def delete(self, expire=False):
    #     """ Delete a script
    #
    #     By default the corresponding mongodb document is not actually
    #     deleted, but rather marked as deleted.
    #
    #     :param expire: if True, the document is expires from the collection.
    #     """
    #
    #     self.script.update(set__deleted=datetime.datetime.utcnow())
    #     if expire:
    #         self.script.delete()
    #     trigger_session_update(self.script.owner, ['scripts'])

    def _url(self):
        url = ''
        if self.script.location.type == 'github':
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
            else:
                log.error('%d: Could not retrieve your file: %s',
                          resp.status_code, resp.content)
                raise BadRequestError('%d: Could not retrieve your file: %s'
                                      % (resp.status_code, resp.content))
        else:
            url = self.script.location.url
        return url

    def get_file(self):
        """Returns a file or archive."""

        if self.script.location.type == 'inline':
            return self.script.location.source_code
        else:
            url = self._url()
            # Download a file over HTTP
            log.debug("Downloading %s.", url)
            # name, headers = urllib.urlretrieve(url)  # TODO check if succeeds
            # # raise error
            # log.debug("Downloaded to %s.", name)     # maybe return file_type
            # return name
            try:
                r = requests.get(url)
                r.raise_for_status()
            except requests.exceptions.HTTPError as err:
                raise BadRequestError(err.msg)

            if 'gzip' in r.headers['Content-Type']:
                if r.headers.get('content-disposition', ''):
                    filename = r.headers.get(
                        'content-disposition').split("=",1)[1]
                else:
                    filename = "script.tar.gz"

                return Response(content_type=r.headers['Content-Type'],
                                content_disposition='attachment; '
                                                    'filename=%s' %
                                                    filename,
                                charset='utf8',
                                pragma='no-cache',
                                body=r.content)
            else:
                return Response(content_type=r.headers['Content-Type'],
                                content_disposition='attachment; '
                                                    'filename="script.gzip"',
                                charset='utf8',
                                pragma='no-cache',
                                body=r.content)
            # else:
            #     return Response(r.content)

    def run_script(self, shell, params=None, job_id=None):
        if self.script.location.type == 'inline':
            path = "/tmp/mist_script_%s" % job_id
            source = self.script.location.source_code
            # if isinstance(self.script, CollectdScript):
            #     # wrap collectd python plugin so that it can run as script
            #     if not source.startswith('#!'):
            #         source = '#!/usr/bin/env python\n\n' + source
            #     source += '\n\nprint read()\n'
            #     if not source.startswith('#!'):
            #         source = '#!/usr/bin/env python\n\n' + source
            #     source += '\n\nprint read()\n'
            sftp = shell.ssh.open_sftp()
            sftp.putfo(StringIO.StringIO(source), path)
        else:
            path = self._url()

        wparams = "-v"
        if params:
            wparams += " -p '%s'" % params
        if not self.script.location.type == 'inline':
            if self.script.location.entrypoint:
                wparams += " -f %s" % self.script.location.entrypoint
        wparams += " %s" % path
        return path, params, wparams

    def _preparse_file(self):
        return
