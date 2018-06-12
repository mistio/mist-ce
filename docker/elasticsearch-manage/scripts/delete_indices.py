#!/usr/bin/env python

import os
import sys
import traceback

from elasticsearch import Elasticsearch


def es_client():
    return Elasticsearch(
        os.getenv('ELASTIC_HOST', 'elasticsearch'),
        port=os.getenv('ELASTIC_PORT', '9200'),
        http_auth=(os.getenv('ELASTIC_USER', ''),
                   os.getenv('ELASTIC_PASSWORD', '')),
        use_ssl=bool(os.getenv('ELASTIC_SSL', False)),
        verify_certs=bool(os.getenv('ELASTIC_VERIFY_CERTS', False)),
    )


def delete_indices(index):
    """DELETE Elasticsearch Indices."""

    # Initialize ES client.
    es = es_client()

    hosts = []
    for host in es.transport.hosts:
        hosts.append(host['host'])

    print
    print 'Connected to: %s' % ', '.join(hosts)
    print 'This operation will DELETE indices with index pattern: "%s"' % index

    while True:
        answer = raw_input('Continue[Y/n]:')
        if answer == 'Y':
            print 'Deleting ...',
            break
        elif answer == 'n':
            print 'Aborted!'
            sys.exit(0)
        else:
            print 'Wrong answer!'
    try:
        es.indices.delete(index=index)
    except Exception:
        print 'ERROR'
        traceback.print_exc()
    else:
        print 'OK'


if __name__ == '__main__':
    try:
        index_pattern = sys.argv[1] if len(sys.argv) > 1 else '*'
        delete_indices(index_pattern)
    except KeyboardInterrupt:
        sys.exit(1)
