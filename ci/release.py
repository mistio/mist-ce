#!/usr/bin/env python

import os
import sys
import hashlib
import argparse

import magic
import requests


def main():
    args = parse_args()
    request = Client(args.owner, args.repo, args.token)
    update_release(
        request, args.tag, msg=args.msg, files=args.files,
        prerelease=args.prerelease, draft=args.draft,
        remove_undefined_files=args.remove_undefined_files,
    )


def parse_args():
    argparser = argparse.ArgumentParser(
        description=("Create/Update Github release based on git tag. When "
                     "creating a release that doesn't exist, it'll be marked "
                     "as stable (not prerelease) and public (not draft), "
                     "unless otherwise specified. When updating a release, "
                     "only fields specified by corresponding options will be "
                     "modified."))

    argparser.add_argument('owner', help="The github repo's owner")
    argparser.add_argument('repo', help="The github repo's name")
    argparser.add_argument('tag', help="Tag name for which to make release")

    argparser.add_argument(
        '-m', '--msg', default=None,
        help=("Message for the release. Either the message as a string, or "
              "the filename of a text file preceded by '@'. Use an empty "
              "string '' to set an empty message."))
    argparser.add_argument(
        '-f', '--files', nargs='+', metavar='FILE',
        help="Files to upload as release assets.")

    argparser.add_argument(
        '--remove-undefined-files', action='store_true',
        help=("If specified, remove any preexisting files from the release "
              "that aren't currently specified with the `--files` option."))

    argparser.add_argument(
        '--prerelease', dest='prerelease', default=None, action='store_true',
        help="Mark release as prerelease.")
    argparser.add_argument(
        '--no-prerelease', dest='prerelease', default=None,
        action='store_false',
        help="Mark release as regular release, no prerelease.")
    argparser.add_argument(
        '--draft', dest='draft', default=None, action='store_true',
        help="Mark release as draft.")
    argparser.add_argument(
        '--no-draft', dest='draft', default=None, action='store_false',
        help="Publish release, unmark as draft.")

    argparser.add_argument(
        '--token', default=os.getenv('GITHUB_API_TOKEN'),
        help=("Github API token to use. Can also be specified as env var "
              "GITHUB_API_TOKEN."))

    args = argparser.parse_args()
    if args.msg and args.msg.startswith('@'):
        with open(args.msg[1:], 'r') as fobj:
            args.msg = fobj.read()
    return args


class Client(object):

    def __init__(self, owner, repo, token):
        self.owner = owner
        self.repo = repo
        self.token = token

    def __call__(self, url, method='GET', parse_json_resp=True,
                 api='https://api.github.com', **kwargs):
        url = '%s/repos/%s/%s%s' % (api, self.owner, self.repo, url)
        headers = kwargs.pop('headers', {})
        headers.update({'Authorization': 'token %s' % self.token})
        print "Will make %s request to %s: %s" % (method, url, kwargs)
        resp = requests.request(method, url, headers=headers, **kwargs)
        if not resp.ok:
            print resp.status_code
            print resp.text
            raise Exception(resp.status_code)
        if parse_json_resp:
            try:
                return resp.json()
            except Exception:
                print "Error decoding json response"
                print resp.text
                raise
        else:
            return resp


def print_release(release):
    print '-' * 60
    for name, key in [('id', 'id'), ('name', 'name'),
                      ('tag', 'tag_name'), ('ref', 'target_commitish'),
                      ('draft', 'draft'), ('prerelease', 'prerelease')]:
        print '%s: %s' % (name, release[key])
    print 'assets:'
    for asset in release['assets']:
        print ' - %s' % asset['name']
    if release['body']:
        print 'msg: |'
        for line in release['body'].splitlines():
            print '  %s' % line
    print '-' * 60


def update_release(request, tag, msg=None, files=None,
                   draft=None, prerelease=None,
                   remove_undefined_files=False):

    # Check that the repo exists.
    resp = request('')

    # Find git tag corresponding to release.
    resp = request('/tags')
    for item in resp:
        if item['name'] == tag:
            sha = item['commit']['sha']
            print "Tag %s points to %s" % (tag, sha)
            break
    else:
        print "Tag %s doesn't exist" % tag
        sys.exit(1)

    # Create or update github release.
    data = {
        'tag_name': tag,
        'target_commitish': sha,
        'name': tag,
        'body': msg,
        'draft': draft,
        'prerelease': prerelease,
    }
    for key, val in data.items():
        if val is None:
            data.pop(key)
    for release in request('/releases'):
        if release['tag_name'] == tag:
            print "Found preexisting release."
            print_release(release)
            for key in data.keys():
                if data[key] == release[key]:
                    data.pop(key)
            if data:
                print "Release already exists, updating."
                release = request('/releases/%s' % release['id'], 'PATCH',
                                  json=data)
                print_release(release)
            else:
                print "No need to modify release's metadata."
            break
    else:
        print "Creating a new release."
        release = request('/releases', 'POST', json=data)
        print_release(release)

    # Add or update assets.
    assets = list(release['assets'])
    for path in files or []:
        name = os.path.basename(path)
        uploaded = False
        for i, asset in enumerate(list(assets)):
            if asset['name'] != name:
                continue
            assets.pop(i)
            print "Found already uploaded file '%s'" % path
            md5 = hashlib.md5()
            resp = request('/releases/assets/%s' % asset['id'],
                           headers={'Accept': 'application/octet-stream'},
                           parse_json_resp=False, stream=True)
            for chunk in resp.iter_content(chunk_size=1024):
                if chunk:
                    md5.update(chunk)
            md5sum_remote = md5.hexdigest()
            md5 = hashlib.md5()
            with open(path, 'rb') as fobj:
                while True:
                    chunk = fobj.read(1024)
                    if not chunk:
                        break
                    md5.update(chunk)
            md5sum_local = md5.hexdigest()
            if md5sum_local == md5sum_remote:
                print "Preexisting file matches local file"
                uploaded = True
                break
            print "Deleting preexisting different asset."
            request('/releases/assets/%s' % asset['id'], 'DELETE',
                    parse_json_resp=False)
        if not uploaded:
            with open(path, 'rb') as fobj:
                ctype = magic.Magic(mime=True).from_file(path)
                request('/releases/%s/assets' % release['id'], 'POST',
                        api='https://uploads.github.com',
                        headers={'Content-Type': ctype},
                        params={'name': name}, data=fobj)
    if remove_undefined_files:
        for asset in assets:
            print "Deleting preexisting undefined asset %s." % asset['name']
            request('/releases/assets/%s' % asset['id'], 'DELETE',
                    parse_json_resp=False)


if __name__ == "__main__":
    main()
