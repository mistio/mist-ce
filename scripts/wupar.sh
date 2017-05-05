#!/bin/sh
# [w]ait [u]ntil [p]ods [a]re [r]unning

NAMESPACE="${1:-default}"
echo $NAMESPACE
until !( kubectl --namespace $NAMESPACE get pods | grep -v NAME | grep -v Running ); do
    sleep 5 && echo '.'
done
