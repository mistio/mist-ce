import logging
import datetime

from mist.io.helpers import amqp_publish
from mist.io.helpers import amqp_publish_user
from mist.io.helpers import amqp_owner_listening

from mist.io.clouds.models import Cloud

from mist.core.tasks import app


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

    # Perform list machines. Cloud controller stores results in mongodb.
    cloud = Cloud.objects.get(id=cloud_id)
    machines = cloud.ctl.compute.list_machines()

    # Publish results to rabbitmq (for backwards compatibility).
    if amqp_owner_listening(cloud.owner.id):
        amqp_publish_user(cloud.owner.id, routing_key='list_machines',
                          data={'cloud_id': cloud.id,
                                'machines': [machine.as_dict_old()
                                             for machine in machines]})

    # Push historic information for inventory and cost reporting.
    for machine in machines:
        amqp_publish(exchange='machines_inventory', routing_key='',
                     auto_delete=False,
                     data={'owner_id': machine.cloud.owner.id,
                           'machine_id': machine.id,
                           'cost_per_month': machine.cost.monthly})
