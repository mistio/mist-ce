#!/bin/sh
if [ $# -eq 0 ]; then
    echo "Restarting all containers that import mist.api code"
    echo "---------------------------------------------------"
    docker-compose restart api celery-prefork celery-gevent sockjs poller cilia hubshell beat scheduler
    echo "Done."
elif [ $# -eq 1 ] && [ "$@" = "api" ]; then
    echo "Sending HUP signal to uwsgi"
    echo "---------------------------------------------------"
    docker-compose exec api pkill -HUP uwsgi
    echo "Done."
else
    echo "Restarting $@"
    echo "---------------------------------------------------"
    docker-compose restart $@
    echo "Done."
fi;
