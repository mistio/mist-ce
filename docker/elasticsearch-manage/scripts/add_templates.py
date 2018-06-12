#!/usr/bin/env python

import os
import sys
import time
import json
import argparse
import traceback

from elasticsearch import Elasticsearch


EXCLUDED = ('heapster', 'audit', )  # Templates to be excluded.


def es_client():
    es = Elasticsearch(
        os.getenv('ELASTIC_HOST', 'elasticsearch'),
        port=os.getenv('ELASTIC_PORT', '9200'),
        http_auth=(os.getenv('ELASTIC_USER', ''),
                   os.getenv('ELASTIC_PASSWORD', '')),
        use_ssl=bool(os.getenv('ELASTIC_SSL', False)),
        verify_certs=bool(os.getenv('ELASTIC_VERIFY_CERTS', False)),
    )
    for i in range(20):
        if es.ping():
            return es
        print "Elasticsearch not up yet"
        time.sleep(1)
    print "Elasticsearch doesn't respond to ping"
    raise Exception()


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
    err = False
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
            except Exception:
                print 'ERROR'
                traceback.print_exc()
                err = True
            else:
                print 'OK'
    if err:
        raise Exception("Completed with errors")


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
