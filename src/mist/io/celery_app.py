from __future__ import absolute_import


from celery import Celery

# Parse user defined settings from settings.py in the top level project dir
settings = {}
try:
    execfile("settings.py", settings)
except IOError:
    log.warning("No settings.py file found.")
except Exception as exc:
    log.error("Error parsing settings py: %r", exc)

try:
    from mist.core import config
except ImportError:
    from mist.io import config

import logging
logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)


app = Celery(
    'tasks',
    # backend=settings.get('CELERY_BACKEND', 'amqp://guest:guest@127.0.0.1//'),
    broker=settings.get('CELERY_BROKER', 'amqp://guest:guest@127.0.0.1//'),
    include=['mist.io.tasks'],
)

app.conf.update(
    CELERY_TASK_SERIALIZER = "json",
    CELERYD_MAX_TASKS_PER_CHILD = 128,
    CELERYD_LOG_FORMAT = "%(asctime)s %(levelname)s %(threadName)s %(module)s - %(funcName)s: %(message)s",
    CELERYD_TASK_LOG_FORMAT = "%(asctime)s %(levelname)s %(threadName)s %(module)s - %(funcName)s: %(message)s",
    ## CELERY_TASK_RESULT_EXPIRES=3600,
    ## CELERYD_CONCURRENCY=16,
)

if __name__ == '__main__':
    app.start()
