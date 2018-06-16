#!/bin/sh

set -e

MAX_AGE_MINUTES=120
PREFIX=test-
USAGE="$0 [-h] [-y] [-m MAX_AGE_MINUTES] [-p prefix RELEASE_PREFIX]

Purge old helm releases.

Options:
    -h                  Display this help message and exit.
    -n                  Dry run, just print releases that would get deleted.
    -y                  Don't prompt for interactive confirmation before
                        deleting the releases.
    -m MAX_AGE_MINUTES  Cleanup releases who haven't been modified for more
                        than that many minutes. Default is $MAX_AGE_MINUTES minutes.
    -p RELEASE_PREFIX   Only consider helm releases starting with the provided
                        prefix. Default prefix is '$PREFIX'.
"

while getopts "hnym:p:" opt; do
    case "$opt" in
        h)
            echo "$USAGE"
            exit
            ;;
        n)
            DRY_RUN=1
            ;;
        y)
            NO_PROMPT=1
            ;;
        m)
            MAX_AGE_MINUTES=$OPTARG
            ;;
        p)
            PREFIX=$OPTARG
            ;;
        \?)
            echo "$USAGE"
            echo
            echo "ERROR: Invalid option: -$OPTARG" >&2
            exit 1
    esac
done
shift $((OPTIND-1))

echo "Listing helm releases..."
echo
releases="$(helm list -d -r $PREFIX)"
echo "$releases"
releases=$(echo "$releases" | tail -n +2)
if [ -z "$releases" ]; then
    echo "No releases found, exiting."
    exit 0
fi
echo
echo "Filtering old releases..."
echo
old_releases=
while read -r line; do
    name=$(echo "$line" | cut -f1 | tr -d ' \t')
    updated=$(echo "$line" | cut -f3)
    updated_ts=$(date -d "$updated" +%s)
    age=$(expr \( $(date +%s) - $updated_ts \) / 60)
    #echo "- $name: $age minutes old"
    if [ "$age" -gt "$MAX_AGE_MINUTES" ]; then
        echo "Will delete release $name ($age minutes old)."
        old_releases="$old_releases $name"
    else
        echo "Will keep release $name ($age minutes old)."
    fi
done <<EOF
$releases
EOF
echo

if [ -z "$old_releases" ]; then
    echo "No old releases found to be deleted, exiting."
    exit 0
fi

echo "Will delete the following releases:"
for release in $old_releases; do
    echo "- $release"
done
echo

if [ -n "$DRY_RUN" ]; then
    echo "This is a dry run, exiting before deleting."
    exit 0
fi

if [ -z "$NO_PROMPT" ]; then
    while read -p "Are you sure you want to delete these helm releases? [y/n] " response; do
        case "$response" in
            y|Y)
                break
                ;;
            n|N)
                echo "Aborting."
                exit 1
                ;;
            *)
                echo "Wrong response: y/n"
                ;;
        esac
    done
    echo
fi

echo "Deleting releases..."
echo
for release in $old_releases; do
    helm delete --purge $release &
done
wait
echo
echo "Completed successfully."
