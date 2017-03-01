import json
import logging

from mist.core.helpers import es_client as es


log = logging.getLogger(__name__)


def get_event(owner_id, event_id, event_type=None, fields=None):
    """Fetch a single event.

    Returns a complete ES hit including the _source, _type, and _id.

    Arguments:
        - owner_id: The Owner, whose index to search.
        - event_id: The event's UUID.
        - event_type: The event's type.
        - fields: The fields of the matching document to be returned.

    """
    index = '%s-logs-*' % owner_id
    query = {
        'query': {
            'bool': {
                'filter': {
                    'term': {
                        'log_id': event_id
                    }
                }
            }
        },
        'size': 1
    }
    # Return only specific fields, if requested.
    if fields:
        if not isinstance(fields, list):
            fields = [fields]
        query['_source'] = {'includes': fields}

    result = es().search(index=index, doc_type=event_type, body=query)
    result = result['hits']['hits']
    return result[0] if result else None


def get_simple_story(owner_id, story_id, story_type=None, closed=None):
    """Fetch a single story.

    Returns a complete ES hit including the _source, _type, and _id.
    The simple version of the story is ALWAYS returned, meaning that
    the actual log entries are not present in the story document.

    Arguments:
        - owner_id: The Owner, whose index to search.
        - story_id: The story's UUID.
        - story_type: The story's type.
        - closed: Denotes whether to fetch open/closed stories.

    """
    index = '%s-stories-*' % owner_id
    query = {
        'query': {
            'bool': {
                'filter': {
                    'bool': {
                        'must': [
                            {
                                'term': {
                                    'story_id': story_id
                                }
                            }
                        ],
                        'must_not': []
                    }
                }
            }
        }
    }
    if closed is True:
        query['query']['bool']['filter']['bool']['must_not'].append(
            {'term': {'finished_at': 0}}
        )
    elif closed is False:
        query['query']['bool']['filter']['bool']['must'].append(
            {'term': {'finished_at': 0}}
        )

    result = es().search(index=index, doc_type=story_type, body=query)
    result = result['hits']['hits']

    if len(result) > 1:
        log.error('Found multiple stories with story_id %s', story_id)

    return result[0] if result else None


def get_open_incidents(owner_id, **kwargs):
    """Fetch open incidents.

    Incidents are stories with story_type='incident'.

    This helper method may be used to search for incidents that have not been
    closed yet.

    Arguments:
        - owner_id: The Owner, whose index to search.
        - kwargs: Extra terms to be used for filtering.

    """
    index = '%s-stories-*' % owner_id
    query = {
        'query': {
            'bool': {
                'filter': {
                    'bool': {
                        'must': [
                            {
                                'term': {
                                    'finished_at': 0
                                }
                            }
                        ]
                    }
                }
            }
        }
    }
    for key in ('rule_id', 'cloud_id', 'machine_id'):
        if key in kwargs:
            query['query']['bool']['filter']['bool']['must'].append(
                    {'term': {key: kwargs[key]}}
            )

    result = es().search(index=index, doc_type='incident', body=query)
    return result['hits']['hits']


def start_machine_story(story, event):
    """Populate a new machine story.

    Injects a `summary` into a new machine story, which describes the status
    of all corresponding tasks.

    Arguments:
        - story: The new machine story.
        - event: The log that started the machine story.

    """
    try:
        extra = json.loads(event['extra'])
        params = extra['request_params']
    except Exception as exc:
        params = {}
        log.error('Failed to extract request_params of event %s for '
                  'create_machine story: %s', event['log_id'], exc)

    quantity = params.get('quantity', 1)  # Number of VMs to provision.

    status = {'pending': quantity, 'success': 0, 'skipped': 0, 'error': 0}
    summary = {'create': status.copy(), 'probe': status.copy()}

    # If a synchronous request, provisioning already succeeded.
    if not params.get('async'):
        summary['create']['pending'] = 0
        summary['create']['success'] = quantity
    # Set monitoring status, if applicable.
    if params.get('monitoring'):
        summary['monitoring'] = status.copy()
    # Set script execution status, if applicable.
    if params.get('script') or params.get('script_id'):
        summary['script'] = status.copy()
    # TODO: Add schedule entry, create DNS Record.
    # Add entire summary to the story.
    story['summary'] = summary
