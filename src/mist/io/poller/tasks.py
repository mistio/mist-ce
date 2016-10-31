import datetime

from mist.io.clouds.models import Cloud

from mist.core.tasks import app


@app.task
def list_machines(cloud_id):
    Cloud.objects.get(id=cloud_id).ctl.list_machines()


@app.task
def debug(value=42):
    path = '/tmp/poller-debug.txt'
    msg = '%s - %s' % (datetime.datetime.now(), value)
    print msg
    with open(path, 'a') as fobj:
        fobj.write(msg)
