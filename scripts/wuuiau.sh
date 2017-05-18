#!/bin/sh
# [w]ait [u]ntil [u]wsgi [i]s [a]ctually [u]p
set -e
if [ -z "$CI_COMMIT_REF_NAME" ]; then
    echo "No CI_COMMIT_REF_NAME specified." >&2
    exit 1
fi
while true; do
    version=$(curl -sf -m 5 $1/version | sed -r 's/\{"version": "([^"]*)"\}$/\1/')
    if [ "$version" = "$CI_COMMIT_REF_NAME" ]; then
        echo "Found expected version '$version'!"
        exit
    fi
    echo "Found version '$version', expected '$CI_COMMIT_REF_NAME'."
    sleep 1
done
