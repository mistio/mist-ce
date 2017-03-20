import json
import time
import logging
import datetime

from mist.io.helpers import es_client as es

try:
    from mist.core.rbac.methods import filter_logs
except ImportError:
    from mist.io.dummy.rbac import filter_logs

from mist.io.exceptions import NotFoundError

from mist.io.logs.helpers import get_event
from mist.io.logs.helpers import get_simple_story
from mist.io.logs.helpers import get_open_incidents
from mist.io.logs.helpers import start_machine_story

from mist.io.logs.helpers import _on_response_callback

from mist.io.logs.constants import FIELDS, CLOSES_INCIDENT


log = logging.getLogger(__name__)


# TODO
# def log_event(owner_id, event_type, action, error=None,
#               user_id=None, **kwargs):


# TODO: Make auth_context a required param?
def get_events(auth_context=None, owner_id='', user_id='',
               event_type='', action='', limit=0, start=0,
               stop=0, newest=True, error=None, **kwargs):
    """Fetch logged events.

    This generator yields a series of logs after querying Elasticsearch.

    The initial query is extended with additional terms based on the inputs
    provided. Also, extra filtering may be applied in order to perform RBAC
    on the fly given the permissions granted to the requesting User.

    All Elasticsearch indices are in the form of <app|ui>-logs-<date>.

    """
    # Restrict access to UI logs to Admins only.
    is_admin = auth_context and auth_context.user.role == 'Admin'
    owner_id = owner_id or (auth_context.owner.id if auth_context else None)

    # Construct base Elasticsearch query.
    index = "%s-logs-*" % ("*" if is_admin else "app")
    query = {
        "query": {
            "bool": {
                "filter": {
                    "bool": {
                        "must": [
                            {
                                "range": {
                                    "@timestamp": {
                                        "gte": int(start * 1000),
                                        "lte": int(stop * 1000) or "now"
                                    }
                                }
                            }
                        ],
                        "must_not": []
                    }
                }
            }
        },
        "sort": [
            {
                "@timestamp": {
                    "order": ("desc" if newest else "asc")
                }
            }
        ],
        "size": (limit or 50)
    }
    # Match action.
    if action:
        query["query"]["bool"]["filter"]["bool"]["must"].append(
            {"term": {'action': action}}
        )
    # Fetch logs corresponding to the current Organization.
    if owner_id:
        query["query"]["bool"]["filter"]["bool"]["must"].append(
            {"term": {"owner_id": owner_id}}
        )
    # Match the user's ID, if provided.
    if user_id:
        query["query"]["bool"]["filter"]["bool"]["must"].append(
            {"term": {"user_id": user_id}}
        )
    # Specify whether to fetch stories that ended with an error.
    if error:
        query["query"]["bool"]["filter"]["bool"]["must_not"].append(
            {"term": {"error": False}}
        )
    elif error is False:
        query["query"]["bool"]["filter"]["bool"]["must"].append(
            {"term": {"error": False}}
        )
    # Extend query with additional kwargs.
    for key, value in kwargs.iteritems():
        query["query"]["bool"]["filter"]["bool"]["must"].append(
            {"term": {key: value}}
        )

    # Apply RBAC for non-Owners.
    if auth_context and not auth_context.is_owner():
        filter_logs(auth_context, query)

    # Query Elasticsearch.
    result = es().search(index=index, doc_type=event_type, body=query)

    for hit in result['hits']['hits']:
        event = hit['_source']
        if not event.get('action'):
            log.error('Skipped event %s, missing action', event['log_id'])
            continue
        try:
            extra = json.loads(event.pop('extra'))
        except Exception as exc:
            log.error('Failed to parse extra of event %s [%s]: '
                      '%s', event['log_id'], event['action'], exc)
        else:
            for key, value in extra.iteritems():
                event[key] = value
        yield event


# TODO: Rethink this!
def log_story(event, tornado_async=False):
    """Log a story.

    Log a new story or update an existing one given the event provided.

    A story is a collection of logs, arranged in a meaningful sequence,
    which pertain to a certain outcome. For instance, a 'session' is a
    2-event story that consists of a 'connect' and 'disconnect' action,
    and describes a specific User session, its duration, and more. Other
    stories, such as machine creation, may consist of more than 2 events.

    All stories must contain one of:
        - job_id
        - shell_id
        - session_id
        - incident_id

    The above fields are also stored as the story's unique ID.

    All stories contain a `log_ids` list field, which points to all relevant
    logs, as well as `started_at` and `finished_at` timestamps. In order for
    additional key-value pairs to be explicitly present in a story, one must
    append them to `FIELDS`.

    All Elasticsearch indices are in the form of stories-<date>.

    Arguments:
        - event: The event that triggers the creation/update of a story.
        - tornado_async: Denotes where to execute Tornado-safe HTTP requests.

    """
    # Ensure `owner_id` is present, since ES indices are based on it.
    assert event.get('owner_id'), 'OwnerID'

    eaction = event['action']
    event_id = event['log_id']

    # Discover related stories for the given event based on the keys below.
    # If none exists, a new story is started.
    for key in ('job_id', 'shell_id', 'session_id', 'incident_id'):
        if event.get(key):
            story_id = event[key]
            story_type = key.split('_')[0]

            def _on_simple_story_callback(response):
                result = _on_response_callback(response, tornado_async)
                if result:
                    _on_old_story_callback(event, result[0], tornado_async)
                    log.warn('Found old_story of type "%s" with story_id %s'
                             ' for event %s', story_type, story_id, event_id)
                else:
                    story = {
                        'type': story_type,
                        'error': event['error'],
                        'log_ids': [event_id],
                        'story_id': story_id,
                        'started_at': event['time'], 'finished_at': 0
                    }
                    story.update({
                        key: event[key] for key in event if key in FIELDS
                    })
                    _on_new_story_callback(event, story, tornado_async)
                    log.warn('Created new_story of type "%s" with story_id %s'
                             ' for event %s', story_type, story_id, event_id)

            # Search for existing story.
            get_simple_story(owner_id=event['owner_id'],
                             story_id=story_id, story_type=story_type,
                             callback=_on_simple_story_callback,
                             tornado_async=tornado_async)
            break

    # Discover relevant stories in order to close any related, open incidents.
    if eaction in CLOSES_INCIDENT:

        def _on_open_incidents_callback(response):
            incidents = _on_response_callback(response)
            log.warn('Event %s [%s] will close %s open incident(s)',
                     event_id, eaction, len(incidents))
            for inc in incidents:
                _on_old_story_callback(event, inc, tornado_async)

        get_open_incidents(callback=_on_open_incidents_callback,
                           tornado_async=tornado_async, **event)


def _on_new_story_callback(event, story, tornado_async=False):
    """Process new stories.

    This method is invoked by a new story in order to be further processed
    and pushed to Elasticsearch.

    Arguments:
        - event: The event that initiated the story.
        - story: The newly created story.
        - tornado_async: Denotes where to execute a Tornado-safe HTTP request.

    """
    etype, eaction = event['type'], event['action']

    if story['error']:  # If an error occurred, close the story.
        story['finished_at'] = event['time']
    elif etype == 'request' and eaction == 'create_machine':
        try:
            start_machine_story(story, event)
        except Exception as exc:
            log.error('Error whle creating machine story '
                      '%s: %s', story['story_id'], exc)

    # Save to Elasticsearch. Refresh the index immediately.
    index = 'stories-%s' % datetime.datetime.utcnow().strftime('%Y.%m')
    if not tornado_async:
        es().index(
            index=index, doc_type=story['type'], body=story, refresh='true'
        )
    else:
        es(tornado_async).index_doc(index=index, doc_type=story['type'],
                                    body=json.dumps(story),
                                    params={'refresh': 'true'})


def _on_old_story_callback(event, story, tornado_async=False):
    """Process old stories.

    This method is invoked when an old story should be updated. An existing
    story is updated given the event that triggered the update, as well as the
    initial event that created the story.

    Arguments:
        - event: The event that triggered the story's update.
        - story: The story to be updated.
        - tornado_async: Denotes where to execute a Tornado-safe HTTP request.

    """
    stype = story['_type']
    etype, eaction = event['type'], event['action']

    def _on_update_callback(response):
        result = _on_response_callback(response, tornado_async)
        started = result[0]['_source']

        # Incrementally extend the update script.
        # Start by adding the event's log_id to the story's `log_ids`.
        inline = 'ctx._source.log_ids.add(params.event_id)'

        # If an error occured, update the story.
        if event['error']:
            inline += '; ctx._source.error = "%s"' % event['error']

        # Close shell/session/incident stories, if applicable.
        if (stype == 'shell' and eaction == 'close') or \
           (stype == 'session' and eaction == 'disconnect') or \
           (stype == 'incident' and eaction in CLOSES_INCIDENT):
            inline += '; ctx._source.finished_at = %f' % event['time']

        elif stype == 'job' and etype == 'job':
            # Script execution.
            if started['action'] == 'run_script':
                if eaction == 'script_finished':
                    inline += '; ctx._source.finished_at = %f' % event['time']
            # Orchestration workflow.
            elif started['action'] in ('create_stack', 'workflow_started',
                                                       'execute_workflow'):
                if eaction == 'workflow_finished':
                    inline += '; ctx._source.finished_at = %f' % event['time']
            # Collectd deployment.
            elif started['action'] == 'deploy_collectd_started':
                if eaction == 'deploy_collectd_finished':
                    inline += '; ctx._source.finished_at = %f' % event['time']
            # Collectd undeployment.
            elif started['action'] == 'undeploy_collectd_started':
                if eaction == 'undeploy_collectd_finished':
                    inline += '; ctx._source.finished_at = %f' % event['time']
            # Machine creation.
            elif started['action'] == 'create_machine':
                assert 'summary' in story['_source']
                ctask, ntasks = None, ()

                # Get the current task and potential, next tasks.
                if eaction == 'machine_creation_finished':
                    ctask, ntasks = 'create', ('probe', 'script', 'monitoring')
                elif eaction == 'probe':
                    ctask, ntasks = 'probe', ('script', 'monitoring')
                elif eaction in ('deploy_collectd_finished',
                                 'enable_monitoring_failed'):
                    assert 'monitoring' in story['_source']['summary']
                    ctask = 'monitoring'
                elif eaction in ('script_finished',
                                 'deployment_script_finished'):
                    assert 'script' in story['_source']['summary']
                    ctask = 'script'

                # Update the story's summary. If the current task failed,
                # all remaining tasks are marked as skipped.
                if ctask:
                    inline += '; ctx._source.summary.%s.pending -= 1' % ctask
                    if event['error']:
                        inline += '; ctx._source.summary.%s.error += 1' % ctask
                        for task in ntasks:
                            if task not in story['_source']['summary']:
                                continue
                            inline += (
                                '; ctx._source.summary.{0}.skipped += 1'
                                '; ctx._source.summary.{0}.pending -= 1'
                            ).format(task)
                    else:
                        inline += '; ctx._source.summary.%s.success += 1' % ctask  # NOQA

                # If no pending jobs, close the story.
                inline += """;
                    int pending = 0;
                    for ( String i : ctx._source.summary.keySet() ) {
                        pending += ctx._source.summary[i].pending;
                    }
                    if ( pending == 0 ) {
                        ctx._source.finished_at = %(time)f;
                    }
                """ % {'time': event['time']}

        script = {
            'script': {
                'lang': 'painless',
                'inline': inline,
                'params': {
                    'event_id': event['log_id']
                }
            }
        }

        # Perform an atomic update to the story document.
        if not tornado_async:
            es().update(
                index=story['_index'], doc_type=stype, id=story['_id'],
                body=script
            )
        else:
            es(tornado_async).update_doc(
                index=story['_index'], doc_type=stype, doc_id=story['_id'],
                body=json.dumps(script)
            )

    # Fetch the event that started the story. Invoke the update callback.
    get_event(owner_id=event['owner_id'],
              event_id=story['_source']['log_ids'][0], fields='action',
              callback=_on_update_callback, tornado_async=tornado_async)


def get_stories(story_type='', owner_id='', user_id='',
                sort='started_at', sort_order=-1, limit=0,
                error=None, range=None, pending=None, expand=False,
                tornado_callback=None, tornado_async=False, **kwargs):
    """Fetch stories.

    Query Elasticsearch for story documents based on the provided arguments.
    By default, the story documents are not processed and they are returned
    in their regular format.

    If `expand=True`, the `log_ids` are replaced with the actual log entries
    creating fully detailed stories.

    """
    # Prepare query to fetch stories.
    index = 'stories-*'
    query = {
        "query": {
            "bool": {
                "filter": {
                    "bool": {
                        "must": [],
                        "must_not": []
                    }
                }
            }
        },
        "sort": [
            {
                sort: {
                    "order": ("desc" if sort_order == -1 else "asc")
                }
            }
        ],
        "size": (limit or 20)
    }
    # Fetch logs corresponding to the current Organization.
    if owner_id:
        query["query"]["bool"]["filter"]["bool"]["must"].append(
            {"term": {"owner_id": owner_id}}
        )
    # Fetch documents corresponding to the current user, if provided.
    if user_id:
        query["query"]["bool"]["filter"]["bool"]["must"].append(
            {"term": {"user_id": user_id}}
        )
    # Specify whether to fetch stories with an error.
    if error:
        query["query"]["bool"]["filter"]["bool"]["must_not"].append(
            {"term": {"error": False}}
        )
    elif error is False:
        query["query"]["bool"]["filter"]["bool"]["must"].append(
            {"term": {"error": False}}
        )
    # Specify the time range of the stories.
    if range:
        query["query"]["bool"]["filter"]["bool"]["must"].append(
            {"range": range}
        )
    # Denote whether to fetch pending or closed stories.
    elif pending is True:
        query["query"]["bool"]["filter"]["bool"]["must"].append(
            {"term": {"finished_at": 0}}
        )
    elif pending is False:
        query["query"]["bool"]["filter"]["bool"]["must_not"].append(
            {"term": {"finished_at": 0}}
        )
    # Extend query based on additional terms.
    for key, value in kwargs.iteritems():
        if value in (None, ''):
            log.debug('Got key "%s" with empty value', key)
            continue
        query["query"]["bool"]["filter"]["bool"]["must"].append(
            {"term": {key: value}}
        )

    def _on_stories_callback(response):
        results = _on_response_callback(response, tornado_async)
        stories = [result['_source'] for result in results]

        # Return stories without replacing the `logs_ids` with the actual logs.
        if not expand:
            if tornado_callback is not None:
                return tornado_callback(stories, pending)
            return stories

        # Ensure that stories are not expanded in Tornado-context.
        assert not tornado_async

        # Prepare query to fetch relevant logs.
        index = "app-logs-*"
        query = {
            "query": {
                "bool": {
                    "filter": {
                        "bool": {
                            "must": [
                                {
                                    "terms": {
                                        "log_id": [
                                            log_id for story in stories for
                                            log_id in story['log_ids']
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            "size": 20
        }
        # Fetch logs of the current Organization, if provided.
        if owner_id:
            query["query"]["bool"]["filter"]["bool"]["must"].append(
                {"term": {"owner_id": owner_id}}
            )

        # Fetch corresponding events.
        # NOTE: Avoid specifying the `doc_type`, since log and story types
        # do not always match.
        results = es().search(index=index, body=query)
        results = [result['_source'] for result in results['hits']['hits']]

        events = {r.pop('log_id'): r for r in results}

        # Create full stories by replacing the list of log_ids with the
        # actual log.
        for story in stories:
            story['logs'] = []
            for log_id in story.pop('log_ids'):
                event = events.get(log_id)
                if not event:
                    log.error('Failed to find log %s while assembling '
                              'story %s', log_id, story['story_id'])
                    continue
                if 'extra' in event:
                    try:
                        extra = json.loads(event.pop('extra'))
                        for key, value in extra.iteritems():
                            event[key] = value
                    except Exception as exc:
                        log.error('Error parsing log %s: %s', log_id, exc)
                story['logs'].append(event)
        return stories

    # Fetch stories. Invoke callback to process and return results.
    if not tornado_async:
        result = es().search(index=index, doc_type=story_type, body=query)
        return _on_stories_callback(result)
    else:
        es(tornado_async).search(index=index,
                                 doc_type=story_type,
                                 body=json.dumps(query),
                                 callback=_on_stories_callback)


def get_story(owner_id, story_id, story_type=None, expand=True):
    """Fetch a single story given its story_id."""
    story = get_stories(owner_id=owner_id, story_id=story_id,
                        story_type=story_type, expand=expand)
    if not story:
        msg = 'Story %s' % story_id
        if story_type:
            msg += ' [%s]' % story_type
        raise NotFoundError(msg)
    if len(story) > 1:
        log.error('Found multiple stories with story_id %s', story_id)
    return story[0]


def close_story(story_id):
    """Close an open story."""
    story = get_simple_story(owner_id='', story_id=story_id)  # TODO: owner_id
    if not story:
        log.error('Failed to find story %s', story_id)
    elif story['_source']['finished_at']:
        log.error('Story %s already closed', story_id)
    else:
        doc = story['_source']
        doc['finished_at'] = time.time()
        es().index(index=story['_index'], doc_type=story['_type'],
                   id=story['_id'], body=doc)


def delete_story(story_id):
    """Delete a story."""
    story = get_simple_story(owner_id='', story_id=story_id)  # TODO: owner_id
    if story:
        es().delete(
            index=story['_index'], doc_type=story['_type'], id=story['_id']
        )
        return
    log.error('Failed to find story %s', story_id)
