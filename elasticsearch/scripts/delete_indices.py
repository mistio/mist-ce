import sys
import logging
import traceback

from mist.api.helpers import es_client


logging.getLogger('elasticsearch').setLevel(logging.ERROR)


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
    except Exception as exc:
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
