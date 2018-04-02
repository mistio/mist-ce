#!/usr/bin/env python


import os
import re
import sys
import json
import argparse
import datetime
import tempfile
import subprocess
import dateutil.parser

import requests


GITLAB_URL = os.getenv('GITLAB_URL', 'https://gitlab.ops.mist.io')
GITLAB_REPO = os.getenv('GITLAB_REPO', 'mistio/mist.io')

MONTHS = ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec')


class InputError(Exception):
    pass


def prompt_string(msg, default=None, match='', required=True,
                  retry=True, confirm=False):
    """Display a CLI prompt so that the user can provide a value

    Params:
    msg         Prompt message to display, colon and space are automatically
                added.
    default     Default value to display.
    match       If provided, user input must match this regex string.
    required    If True, user input must not be empty.
    retry       If True and invalid value, prompt again.
    confirm     If True, user is asked to confirm input value.
    """

    if default is not None and (default or not required):
        prompt = "%s (default is '%s'): " % (msg, default)
    else:
        prompt = "%s: " % msg
    while True:
        value = raw_input(prompt).strip() or default or ''
        try:
            if required and not value:
                raise InputError("Required value can't be empty.")
            if match and not re.match(match, value):
                raise InputError("Input value must match '%s'." % match)
        except InputError as exc:
            if retry:
                print >> sys.stderr, "WARNING: %s" % exc
                continue
            raise
        if confirm:
            if not prompt_boolean(
                "Input value is '%s'. Please confirm." % value,
                default=True, retry=True
            ):
                continue
        break
    return value


def prompt_boolean(msg, default=None, retry=True):
    """Display a CLI prompt so that the user can provide a yes/no value

    Params:
    msg         Prompt message to display, colon, space and [y/n] are
                automatically added.
    default     Default value to display.
    retry       If True and invalid value, prompt again.
    """
    assert default in (True, False, None)
    if default is True:
        opts = '[Y/n]'
    elif default is False:
        opts = '[y/N]'
    else:
        opts = '[y/n]'
    prompt = '%s %s' % (msg, opts)
    value = prompt_string(prompt, match=r'^[yYnN]?$',
                          required=default is None, retry=retry).lower()
    if value == 'y':
        return True
    elif value == 'n':
        return False
    else:
        assert not value, value
        assert default is not None
        return default


def editor(text, tmp_suffix='.tmp'):
    """Spawn $EDITOR (defaults to vim) for user to edit given text"""
    if isinstance(text, unicode):
        text = text.encode('utf8')
    command = os.getenv('EDITOR', 'vi')
    with tempfile.NamedTemporaryFile(suffix=tmp_suffix) as tf:
        tf.write(text)
        tf.flush()
        print >> sys.stderr, "INFO: Starting editor '%s'" % command
        subprocess.check_call([command, tf.name])
        print >> sys.stderr, "INFO: Exiting editor '%s'" % command
        tf.seek(0)
        return tf.read()


def crop_line_padding(lines):
    """Removes padding white space from lines list.

    1. Remove all trailing whitespace from start and end of all lines.
    2. Remove empty lines in start and end of list
    """
    if isinstance(lines, basestring):
        lines = lines.splitlines()
    lines = [line.strip() for line in lines]
    for i, line in enumerate(lines):
        if line:
            lines = lines[i:]
            break
    for i, line in enumerate(reversed(lines)):
        if line:
            lines = lines[:-i or len(lines)]
            break
    return lines


class Changelog(object):
    """Holds state of entire changelog"""

    def __init__(self):
        self.versions = []

    @classmethod
    def from_string(cls, string):
        lines = crop_line_padding(string)
        changelog = cls()
        if not lines:
            print >> sys.stderr, "WARNING: Changelog is emtpy"
            return changelog
        assert re.match('^#\s*changelog\s*$',
                        lines[0].lower()), "Changelog missing top header."
        lines = crop_line_padding(lines[1:])
        sections = []
        for line in lines:
            if re.match('^##[^#]', line):
                sections.append([])
            else:
                assert sections, ("Changelog body doesn't start "
                                  "with level two header.")
            sections[-1].append(line)
        for section in sections:
            changelog.versions.append(
                Version.from_string('\n'.join(section))
            )
        return changelog

    @classmethod
    def from_file(cls, path):
        try:
            with open(path, 'r') as fobj:
                return cls.from_string(fobj.read())
        except IOError as exc:
            print >> sys.stderr, "WARNING: Couldn't load file %r" % exc
            return cls()

    def to_string(self):
        return '# Changelog\n\n\n' + '\n\n'.join(map(Version.to_string,
                                                     self.versions))

    def __str__(self):
        return self.to_string()

    def to_file(self, path):
        print >> sys.stderr, "INFO: Writing changelog to '%s'." % path
        with open(path, 'w') as fobj:
            fobj.write(self.to_string())

    def to_dict(self):
        return {
            'versions': [version.to_dict() for version in self.versions],
        }

    def show(self, as_json=False):
        print >> sys.stderr, '----CHANGELOG-START----'
        if as_json:
            try:
                import pprint
            except ImportError:
                raise
                print json.dumps(self.to_dict())
            else:
                pprint.pprint(self.to_dict())
        else:
            print self.to_string()
        print >> sys.stderr, '----CHANGELOG-END----'


class Version(object):
    """Holds changelog information for a particular version"""

    def __init__(self, name, day, month, year, notes=''):

        match = re.match(r'^v\d+\.\d+\.\d+(-.+)?$', name)
        assert match, "Invalid version name '%s'" % name
        self.name = name
        self.prerelease = bool(match.groups()[0])

        assert isinstance(day, int) and 0 < day < 32, "Invalid day '%s'" % day
        self.day = day
        month = month.capitalize()
        assert month in MONTHS, month
        self.month = month
        assert isinstance(year, int) and 2017 <= year < 2030, year
        self.year = year

        self.notes = notes

        self.changes = []

    @classmethod
    def from_string(cls, string):
        lines = crop_line_padding(string)

        months = '|'.join(MONTHS)
        match = re.match(
            r'^##\s*(v\d+\.\d+\.\d+(?:-[a-z0-9\.-]+)?)\s*'
            r'\(\s*(\d+)\s*(%s)\s*(\d+)\s*\)\s*$' % months,
            lines[0], re.IGNORECASE
        )
        assert match, "Invalid version header '%s'" % lines[0]
        name, day, month, year = match.groups()

        lines = crop_line_padding(lines[1:])
        notes = []
        for i, line in enumerate(lines):
            if not re.match(r'^###\s*changes\s*$', line, re.IGNORECASE):
                notes.append(line)
            else:
                break
        notes = '\n'.join(notes)
        lines = filter(None, crop_line_padding(lines[i + 1:]))

        version = cls(name, int(day), month, int(year), notes)
        for line in lines:
            version.changes.append(Change.from_string(line))
        return version

    def to_string(self):
        msg = '## %s (%s %s %s)\n\n' % (self.name, self.day, self.month,
                                        self.year)
        if self.notes:
            msg += '%s\n\n' % self.notes
        msg += '### Changes\n\n'
        msg += self._get_changes_string()
        return msg

    def get_release_notes(self):
        msg = ''
        if self.notes:
            msg += '%s\n\n' % self.notes
        msg += '## Changes\n\n'
        msg += self._get_changes_string()
        return msg

    def _get_changes_string(self):
        msg = ''
        for change in self.changes:
            msg += '%s\n' % change.to_string()
        return msg

    def __str__(self):
        return self.to_string()

    def to_dict(self):
        return {
            'name': self.name,
            'prerelease': self.prerelease,
            'date': {
                'day': self.day,
                'month': self.month,
                'year': self.year,
            },
            'notes': self.notes,
            'changes': [change.to_dict() for change in self.changes],
        }


class Change(object):
    """Holds information about a particular change"""

    KINDS = ('Change', 'Bugfix', 'Feature', 'Optimization')

    def __init__(self, title, kind='Change', mr=0):

        assert title
        self.title = title

        assert kind in self.KINDS, "Invalid change type '%s'" % kind
        self.kind = kind

        assert not mr or isinstance(mr, int), "Invalid MR number '%s'" % mr
        self.mr = mr

    @classmethod
    def from_string(cls, string):
        kinds = '|'.join(cls.KINDS)
        regex = r'^\s*[\*-]?\s*(%s)\s*:\s*(.*?)\s*(?:\(!([0-9]+)\))?\s*$' % (
            kinds)
        match = re.match(regex, string, re.IGNORECASE)
        assert match, "Couldn't parse change information from string '%s'." % (
            string)
        kind, title, mr = match.groups()
        return cls(title, kind.capitalize(), int(mr or 0))

    def to_string(self):
        msg = "* %s: %s" % (self.kind, self.title)
        if self.mr:
            msg = "%s (!%d)" % (msg, self.mr)
        return msg

    def __str__(self):
        return self.to_string()

    def to_dict(self):
        return {
            'title': self.title,
            'kind': self.kind,
            'mr': self.mr or None,
        }


class GitlabRequest(object):
    """Wrapper around `requests` to help querying Gitlab's API"""

    def __init__(self, url=GITLAB_URL, repo=GITLAB_REPO, token=''):
        if url.endswith('/'):
            url = url[:-1]
        self.url = url
        self.repo = repo
        self.token = token
        self.repo_id = ''
        print >> sys.stderr, "INFO: Searching for id of project %s" % self.repo
        self.repo_id = str(self.get('')['id'])
        print >> sys.stderr, "INFO: Project id is %s" % self.repo_id

    def get(self, url, params=None, **kwargs):
        if url.startswith('/'):
            url = url[1:]
        quoted_repo = (self.repo_id or self.repo).replace('/', '%2F')
        url = '%s/api/v4/projects/%s/%s' % (self.url, quoted_repo, url)
        if self.token:
            kwargs.setdefault('headers', {})['PRIVATE-TOKEN'] = self.token

        resp = requests.get(url, params=params, **kwargs)

        if not resp.ok:
            print >> sys.stderr, "ERROR: Response failed (%s)" % (
                resp.status_code)
            print >> sys.stderr, resp.text
            raise Exception(resp)
        try:
            return resp.json()
        except Exception:
            print >> sys.stderr, "ERROR: Error decoding json response"
            print >> sys.stderr, resp.text
            raise

    def paginated_get(self, url, params=None, per_page=20, **kwargs):
        if params is None:
            params = {}
        log_prefix = "DEBUG: Fetching %s with params %s (%d per call)... " % (
            url, params, per_page)
        params['per_page'] = per_page
        total = 0
        page = 1
        sys.stderr.write('%s   %d fetched' % (log_prefix, total))
        sys.stderr.flush()
        while True:
            params['page'] = page
            batch = self.get(url, params, **kwargs)
            total += len(batch)
            sys.stderr.write('\r%s   %d fetched' % (log_prefix, total))
            sys.stderr.flush()
            for item in batch:
                yield item
            if len(batch) < per_page:
                break
            page += 1


def get_mrs(gitlab, branches=('master', 'staging'), since=None):
    """Find MR's from gitlab

    Params:

        gitlab              GitlabRequest instance.
        since               Only return MR's merged since given datetime obj.
        branches            Only return MR's merged to given branches.
    """

    assert since is None or isinstance(since, datetime.datetime)
    print >> sys.stderr, "INFO: Searching for MR's..."

    # Find all MR's, sorted by updated_at, optionally limit updated_at with
    # since param.
    mrs = []
    params = {'state': 'merged', 'order_by': 'updated_at', 'sort': 'desc'}
    for mr in gitlab.paginated_get('merge_requests', params):
        updated_at = dateutil.parser.parse(mr['updated_at'])
        if since and updated_at < since:
            break
        if branches and mr['target_branch'] not in branches:
            continue
        mrs.append(mr)
    print >> sys.stderr, ("\nINFO: MR's filtered by 'updated_at' and "
                          "'target_branch'   %d" % (len(mrs)))

    if since:
        sys.stderr.write("INFO: Fetching MR merge commits... 0/%d" % len(mrs))
        sys.stderr.flush()
        for i, mr in enumerate(list(mrs)):
            sys.stderr.write(
                "\rINFO: Fetching MR merge commits...  %d/%d" % (i + 1,
                                                                 len(mrs)))
            sys.stderr.flush()
            sha = mr['merge_commit_sha']
            assert sha
            commit = gitlab.get('repository/commits/%s' % sha)
            created_at = dateutil.parser.parse(commit['created_at'])
            if created_at < since:
                mrs.pop(i)
        print >> sys.stderr, ("\nINFO: MR's filtered by merge_commit "
                              "'created_at'   %d" % len(mrs))

    print >> sys.stderr, "INFO: Returning %d mrs" % len(mrs)

    return mrs


def parse_args():
    """Initialize argparse and parse args"""

    argparser = argparse.ArgumentParser(
        description="Add version info to changelog"
    )

    # Create subparsers for different actions.
    subparsers = argparser.add_subparsers(help="Action to perform.",
                                          dest="action")

    show_parser = subparsers.add_parser('show', help="Display changelog.")
    show_parser.add_argument(
        '-j', '--json', action='store_true',
        help="Display as json dict, not markdown text.")

    rewrite_parser = subparsers.add_parser(
        'rewrite',
        help="Read and write changelog to fix minor formatting issues.")

    extract_parser = subparsers.add_parser(
        'extract',
        help="Extract content of given version, to include in release notes.")
    extract_parser.add_argument('version', help="Target version.")

    add_parser = subparsers.add_parser('add',
                                       help="Add new version to changelog.")
    add_parser.add_argument(
        '-t', '--token', default=os.getenv('GITLAB_TOKEN', ''),
        help="Token to authenticate to Gitlab's API. Taken by GITLAB_TOKEN "
             "env variable by default.")
    add_parser.add_argument('-b', '--branch', dest='branches', action='append',
                            help="Only include MR's merged into this branch. "
                                 "Can be specified multiple times. "
                                 "Default includes MR's to master & staging.")

    # Common args
    for parser in (argparser, show_parser, add_parser, rewrite_parser, ):
        parser.add_argument('-f', '--file', default='CHANGELOG.md',
                            help="Changelog file to read/write info.")

    for parser in (add_parser, ):
        parser.add_argument('version', help="Target version.")
        parser.add_argument(
            '-u', '--gitlab-url', default=GITLAB_URL,
            help="URL of Gitlab installation. Default is '%s'." % GITLAB_URL)
        parser.add_argument(
            '-r', '--repo', default=GITLAB_REPO,
            help="Git repo. Default is '%s'." % GITLAB_REPO)

    args = argparser.parse_args()

    if hasattr(args, 'branches') and not args.branches:
        args.branches = ['master', 'staging']
    return args


def main():
    args = parse_args()

    changelog = Changelog.from_file(args.file)

    if args.action == 'show':
        changelog.show(as_json=args.json)
    elif args.action == 'rewrite':
        changelog.to_file(args.file)
    elif args.action == 'extract':
        for version in changelog.versions:
            if version.name == args.version:
                print version.get_release_notes()
                break
        else:
            print >> sys.stderr, "ERROR: Couldn't find version '%s'." % (
                args.version)
            sys.exit(1)
    elif args.action == 'add':
        gitlab = GitlabRequest(url=args.gitlab_url, repo=args.repo,
                               token=args.token)
        now = datetime.datetime.now()
        version = Version(args.version,
                          int(now.day), MONTHS[now.month - 1], int(now.year))
        last_version = None
        since = None
        if changelog.versions:
            last_version = changelog.versions[0]
            print >> sys.stderr, "INFO: Last version is '%s'." % (
                last_version.name)
            try:
                last_tag = gitlab.get(
                    'repository/tags/%s' % last_version.name
                )
            except:
                print >> sys.stderr, ("ERROR: Can't find previous release "
                                      "'%s' on Gitlab." % last_version.name)
                raise
            since = dateutil.parser.parse(last_tag['commit']['committed_date'])
        mrs = get_mrs(gitlab, branches=args.branches, since=since)
        for mr in mrs:
            version.changes.append(Change(mr['title'], mr=mr['iid']))
        text = version.to_string()
        if last_version is not None and last_version.prerelease:
            for change in last_version.changes:
                text += '%s\n' % change.to_string()
            changelog.versions.pop(0)
        while True:
            text = editor(text, tmp_suffix='.md')
            try:
                version = Version.from_string(text)
            except Exception as exc:
                print >> sys.stderr, "WARNING: Error parsing change: %r" % exc
                if not prompt_boolean("Re-edit changelog", default=True):
                    print >> sys.stderr, "ERROR: Exiting."
                    sys.exit(1)
            else:
                break
        changelog.versions.insert(0, version)
        changelog.show()
        if prompt_boolean("Do you wish to update %s?" % args.file):
            changelog.to_file(args.file)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print >> sys.stderr, "\n\nReceived SIGTERM, exiting"
