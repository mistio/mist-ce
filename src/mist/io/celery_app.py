from __future__ import absolute_import

import logging

from celery import Celery

# Parse user defined settings from settings.py in the top level project dir
log = logging.getLogger(__name__)
settings = {}
try:
    execfile("settings.py", settings)
except IOError:
    log.warning("No settings.py file found.")
except Exception as exc:
    log.error("Error parsing settings py: %r", exc)


app = Celery('tasks',
             backend=settings.get('CELERY_BACKEND', 'amqp://guest:guest@127.0.0.1//'),
             broker=settings.get('CELERY_BROKER', 'amqp://guest:guest@127.0.0.1//'),
             include=['mist.io.tasks'],
            )

app.conf.update(
    CELERY_TASK_RESULT_EXPIRES=3600,
    CELERYD_CONCURRENCY=16,
)

if __name__ == '__main__':
    app.start()
