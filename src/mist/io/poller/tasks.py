import logging
import datetime

from mist.io.helpers import amqp_publish
from mist.io.helpers import amqp_publish_user
from mist.io.helpers import amqp_owner_listening

from mist.core.tasks import app

from mist.io.poller.models import ListMachinesPollingSchedule


log = logging.getLogger(__name__)


@app.task
def debug(schedule_id):
    # FIXME: Resolve circular imports
    from mist.io.poller.models import DebugPollingSchedule
    sched = DebugPollingSchedule.objects.get(schedule_id)
    path = '/tmp/poller-debug.txt'
    msg = '%s - %s' % (datetime.datetime.now(), sched.value)
    print msg
    with open(path, 'a') as fobj:
        fobj.write(msg)


@app.task
def list_machines(schedule_id):
    """Perform list machines. Cloud controller stores results in mongodb."""

    # Fetch schedule and cloud from database.
    sched = ListMachinesPollingSchedule.objects.get(id=schedule_id)
    cloud = sched.cloud
    now = datetime.datetime.now()

    # Find last run. If too recent, abort.
    if sched.last_success and sched.last_failure:
        last_run = max(sched.last_success, sched.last_failure)
    else:
        last_run = sched.last_success or sched.last_failure
    if last_run:
        if now - last_run < sched.interval.timedelta:
            log.warning("Running too soon for cloud %s, aborting!", cloud)
            return

    # Is another same task running?
    if sched.last_attempt_started:
        # Other same task started recently, abort.
        if now - sched.last_attempt_started < datetime.timedelta(seconds=60):
            log.warning("Other same tasks started recently, aborting.")
            return
        # Has been running for too long or has died. Ignore.
        log.warning("Other same task seems to have started, but it's been "
                    "quite a while, will ignore and run normally.")
    sched.last_attempt_started = now
    cloud.save()

    try:
        # Run list_machines.
        machines = cloud.ctl.compute.list_machines()
    except Exception as exc:
        # Store failure.
        log.warning("Failed to list_machines for cloud %s: %r", cloud, exc)
        sched.last_failure = datetime.datetime.now()
        sched.failure_count += 1
        sched.last_attempt_started = None
        cloud.save()
        raise
    else:
        # Store success.
        log.info("Succeeded to list_machines for cloud %s", cloud)
        sched.last_success = datetime.datetime.now()
        sched.failure_count = 0
        sched.last_attempt_started = None
        cloud.save()

    # Publish results to rabbitmq (for backwards compatibility).
    if amqp_owner_listening(cloud.owner.id):
        amqp_publish_user(cloud.owner.id, routing_key='list_machines',
                          data={'cloud_id': cloud.id,
                                'machines': [machine.as_dict_old()
                                             for machine in machines]})

    # Push historic information for inventory and cost reporting.
    for machine in machines:
        data = {'owner_id': machine.cloud.owner.id,
                'machine_id': machine.id,
                'cost_per_month': machine.cost.monthly}
        log.info("Will push to elastic: %s", data)
        amqp_publish(exchange='machines_inventory', routing_key='',
                     auto_delete=False, data=data)
