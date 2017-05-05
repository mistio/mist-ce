#!/bin/sh
# [w]ait [u]ntil [p]ort [i]s [a]ctually [o]pen
until curl -o /dev/null -sIf -m 5 ${1}; do
    sleep 1 && echo '.'
done
