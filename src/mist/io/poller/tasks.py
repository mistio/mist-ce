import logging
import datetime

from mist.io.helpers import amqp_publish
from mist.io.helpers import amqp_publish_user
from mist.io.helpers import amqp_owner_listening

from mist.io.clouds.models import Cloud

from mist.core.tasks import app

from mist.io.poller.models import ListMachinesPollingSchedule


log = logging.getLogger(__name__)


@app.task
def debug(value=42):
    path = '/tmp/poller-debug.txt'
    msg = '%s - %s' % (datetime.datetime.now(), value)
    print msg
    with open(path, 'a') as fobj:
        fobj.write(msg)


@app.task
def list_machines(cloud_id):
    """Perform list machines. Cloud controller stores results in mongodb."""

    cloud = Cloud.objects.get(id=cloud_id)

    # Find last run. If too recent, abort.
    if cloud.last_success and cloud.last_failure:
        last_run = max(cloud.last_success, cloud.last_failure)
    else:
        last_run = cloud.last_success or cloud.last_failure
    if last_run:
        try:
            schedule = ListMachinesPollingSchedule.objects.get(cloud=cloud)
        except ListMachinesPollingSchedule.DoesNotExist:
            schedule = ListMachinesPollingSchedule.add(cloud)
        if datetime.datetime.now() - last_run < schedule.interval.timedelta:
            log.warning("Running too soon for cloud %s, aborting!", cloud)

    # Is another same task running?
    now = datetime.datetime.now()
    if cloud.last_attempt_started:
        # Other same task started recently, abort.
        if now - cloud.last_attemp_started < datetime.timedelta(seconds=60):
            log.warning("Other same tasks started recently, aborting.")
        # Has been running for too long or has died. Ignore.
        log.warning("Other same task seems to have started, but it's been "
                    "quite a while, will ignore and run normally.")
    cloud.last_attempt_started = now
    cloud.save()

    try:
        # Run list_machines.
        machines = cloud.ctl.compute.list_machines()
    except Exception as exc:
        # Store failure.
        log.warning("Failed to list_machines for cloud %s: %r", cloud, exc)
        cloud.last_failure = datetime.datetime.now()
        cloud.failure_count += 1
        cloud.last_attempt_started = None
        cloud.save()
        raise
    else:
        # Store success.
        log.info("Succeeded to list_machines for cloud %s", cloud)
        cloud.last_success = datetime.datetime.now()
        cloud.failure_count = 0
        cloud.last_attempt_started = None
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
