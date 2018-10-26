#!/bin/bash
MIST_URI=${MIST_URI:-$(echo $"$(cat settings/settings.py)" $'\nprint(globals().get("CORE_URI"))'|python)}
CID=$(docker ps |grep api_|cut -d " " -f1)
DOCKER_NETWORK=$(docker ps --format "{{.ID}} {{.Networks}}"|grep $CID|cut -d ' ' -f2)
docker run -p 5900:5900 -p 8222:8222 --rm -it \
      -v `pwd`:/mist -v `pwd`/tests:/mist.tests \
      --shm-size=1g \
      --network=$DOCKER_NETWORK \
      -e VNC=$VNC \
      -e MIST_URL=$MIST_URI -- gcr.io/mist-ops/tests_base /mist.tests/container/trigger_tests.sh $@
