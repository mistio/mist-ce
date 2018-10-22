#!/bin/sh
echo "Restarting all containers that import mist.api code"
echo "---------------------------------------------------"
if [ $# -eq 0 ]; then
    echo docker-compose restart api celery-prefork celery-gevent sockjs poller cilia hubshell beat scheduler
else
    echo docker-compose restart $@
fi
