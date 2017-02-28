import json
import time
import logging
import datetime

from mist.core.helpers import es_client as es
from mist.core.rbac.methods import filter_logs

from mist.io.exceptions import NotFoundError

from mist.io.events.helpers import get_event
from mist.io.events.helpers import get_simple_story
from mist.io.events.helpers import get_open_incidents
from mist.io.events.helpers import start_machine_story

from mist.io.events.constants import FIELDS, CLOSES_INCIDENT


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

    All Elasticsearch indices are in the form of <owner_id>-logs-<date>.

    """
    index = "%s-logs-*" % (owner_id or "*")
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
    # Match the user's ID, if provided.
    if user_id:
        query["query"]["bool"]["filter"]["bool"]["must"].append(
            {"term": {'user_id': user_id}}
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

    # Do not propagate UI logs for non-Admins.
    if not auth_context or not auth_context.user.role == 'Admin':
        if not event_type:
            query["query"]["bool"]["filter"]["bool"]["must_not"].append(
                {"term": {"type": "ui"}}
            )
        elif event_type == 'ui':
            raise NotFoundError('Unknown event type: "ui"')

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
def log_story(event):
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

    All Elasticsearch indices are in the form of <owner_id>-stories-<date>.

    """
    # Ensure `owner_id` is present, since ES indices are based on it.
    assert event.get('owner_id') and event.get('owner_id') != 'None', 'OwnerID'

    etype = event['type']
    eaction = event['action']
    event_id = event['log_id']

    # Populate lists with related/existing stories or create new ones.
    # NOTE: Since old stories are fetched from Elasticsearch, `old_stories`
    # contains complete ES hits, including `_index`, `_type`, and `_source`.
    old_stories, new_stories = [], []

    # Discover related stories for the given event based on the keys below.
    # If none exists, a new story is started.
    for key in ('job_id', 'shell_id', 'session_id', 'incident_id'):
        if event.get(key):
            story_id = event[key]
            story_type = key.split('_')[0]

            # Wait for 1 second to ensure the index has been refreshed.
            time.sleep(1)

            # Search for existing story.
            story = get_simple_story(owner_id=event['owner_id'],
                                     story_id=story_id, story_type=story_type)

            if story:
                old_stories.append(story)
                log.warn('Found old_story of type "%s" with story_id %s '
                         'for event %s', story_type, story_id, event_id)
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
                new_stories.append(story)
                log.warn('Created new_story of type "%s" with story_id %s '
                         'for event %s', story_type, story_id, event_id)
            break

    # Discover relevant stories in order to close any corresponding
    # incidents, if appropriate.
    if eaction in CLOSES_INCIDENT:
        incidents = get_open_incidents(**event)
        old_stories.extend(incidents)
        log.warn('Event %s [%s] will close %s open incident(s)',
                 event_id, eaction, len(incidents))

    # Process new stories.
    for story in new_stories:
        if story['error']:  # If an error occurred, close the story.
            story['finished_at'] = event['time']
        elif etype == 'request' and eaction == 'create_machine':
            # Start `create_machine` story.
            try:
                start_machine_story(story, event)
            except Exception as exc:
                log.error('Error whle creating machine story '
                          'for event %s: %s', event_id, exc)

        # TODO: Start incident and stack stories.

        # Save to Elasticsearch.
        index = '%s-stories-%s' % (
                event['owner_id'],
                datetime.datetime.utcnow().strftime('%Y.%m.%d'))
        es().index(index=index, doc_type=story['type'], body=story)

        # Append corresponding stories to the logged event.
        event['_stories'].append((story['story_id'], story['type']))

    # Update old stories.
    for story in old_stories:
        stype = story['_type']
        sid = story['_source']['story_id']

        # Fetch the event that started the story.
        started = get_event(
            owner_id=event['owner_id'],
            event_id=story['_source']['log_ids'][0], fields='action'
        )['_source']

        # Incrementally extend the update script. Start by adding the event's
        # log_id to the story's `log_ids`.
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

                # Get the currently executed task and potential, next tasks.
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

                # Update the story's summary. If the current task failed, all
                # remaining tasks are marked as skipped.
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
                    'event_id': event_id
                }
            }
        }

        # Perform an atomic update to the story document.
        es().update(
            index=story['_index'], doc_type=stype, id=story['_id'], body=script
        )
        # Associate story with the event.
        event['_stories'].append((sid, stype))


def get_stories(story_type='', owner_id='', user_id='',
                sort='started_at', sort_order=-1, limit=0,
                error=None, range=None, pending=None, expand=False, **kwargs):
    """Fetch stories.

    Query Elasticsearch for story documents based on the provided arguments.
    By default, the story documents are not processed and they are returned
    in their regular format.

    If `expand=True`, the `log_ids` are replaced with the actual log entries
    creating fully detailed stories.

    """
    # Prepare query to fetch stories.
    index = '%s-stories-*' % (owner_id or '*')
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
        ]
    }
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
    # Limit the document count returned.
    if limit:
        query["size"] = limit
    # Extend query based on additional terms.
    for key, value in kwargs.iteritems():
        if value in (None, ''):
            log.debug('Got key "%s" with empty value', key)
            continue
        query["query"]["bool"]["filter"]["bool"]["must"].append(
            {"term": {key: value}}
        )

    # Fetch stories.
    results = es().search(index=index, doc_type=story_type, body=query)
    stories = [result['_source'] for result in results['hits']['hits']]

    # Return stories without replacing the `logs_ids` with the actual logs.
    if not expand:
        return stories

    # Prepare query to fetch relevant logs.
    index = '%s-logs-*' % (owner_id or '*')
    query = {
        "query": {
            "bool": {
                "filter": {
                    "terms": {
                        "log_id": [
                            log_id for story in stories for
                            log_id in story['log_ids']
                        ]
                    }
                }
            }
        }
    }

    # Fetch corresponding events.
    # NOTE: Avoid specifying the `doc_type`, since log and story types do not
    # always match.
    results = es().search(index=index, body=query)
    results = [result['_source'] for result in results['hits']['hits']]

    events = {r.pop('log_id'): r for r in results}

    # Create full stories by replacing the list of log_ids with the actual log.
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
                    log.error('Error parsing extra of log %s: %s', log_id, exc)
            story['logs'].append(event)

    return stories


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
    """Delete a story."""
    story = get_simple_story(owner_id='*', story_id=story_id)  # TODO: owner_id
    if story:
        es().delete(
            index=story['_index'], doc_type=story['_type'], id=story['_id']
        )
        return
    log.error('Failed to find story %s', story_id)
