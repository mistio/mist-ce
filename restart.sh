#!/bin/sh
if [ $# -eq 0 ]; then
    echo "Restarting all containers that import mist.api code"
    echo "---------------------------------------------------"
    docker-compose restart api api-v2 dramatiq sockjs scheduler
    echo "Done."
elif [ $# -eq 1 ] && [ "$@" = "api" ]; then
    echo "Sending HUP signal to uwsgi"
    echo "---------------------------------------------------"
    docker-compose exec api sh -c "kill -HUP 1"
    echo "api-v1 \tDone"
    docker-compose exec api-v2 sh -c "kill -HUP 1"
    echo "api-v2 \tDone"
    echo "---------------------------------------------------"
elif [ $# -eq 1 ] && [ "$@" = "dramatiq" ]; then
    echo "Sending HUP signal to dramatiq"
    echo "---------------------------------------------------"
    docker-compose exec dramatiq sh -c "pkill -HUP python"
    echo "Done"
else
    echo "Restarting $@"
    echo "---------------------------------------------------"
    docker-compose restart $@
    echo "Done"
fi;
