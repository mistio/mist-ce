import os
import sys
import json
import logging
import argparse
import traceback

from mist.api.helpers import es_client


logging.getLogger('elasticsearch').setLevel(logging.WARNING)

EXCLUDED = ('heapster', )  # Templates to be excluded.


def add_templates(force=False):
    """PUT Elasticsearch Templates."""

    # Initialize ES client.
    es = es_client()

    hosts = []
    for host in es.transport.hosts:
        hosts.append(host['host'])

    print 'Connected to: %s' % ', '.join(hosts)

    # Script path.
    spath = os.path.dirname(__file__)

    # Templates path.
    tpath = os.path.abspath(os.path.join(spath, '../templates/'))

    # Load templates from path.
    for tfile in os.listdir(tpath):
        tfile = '%s/%s' % (tpath, tfile)

        with open(tfile, 'r') as tf:
            template = json.loads(tf.read())
            tname = template['template'].strip('*').strip('-')
            if tname in EXCLUDED:
                continue
            try:
                print 'Applying "%s" template...' % tname,
                if not es.indices.exists_template(tname) or force:
                    es.indices.put_template(name=tname, body=template)
            except Exception as exc:
                print 'ERROR'
                traceback.print_exc()
            else:
                print 'OK'


if __name__ == '__main__':

    argparser = argparse.ArgumentParser(
        description='Apply Elasticsearch Templates idempotently'
    )
    argparser.add_argument(
        '-f', '--force',
        action='store_true', default=False,
        help='force-update existing templates'
    )
    args = argparser.parse_args()
    try:
        add_templates(args.force)
    except KeyboardInterrupt:
        sys.exit(1)

