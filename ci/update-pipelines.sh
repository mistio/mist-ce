#!/bin/sh


set -e

GITLAB_URL=https://gitlab.ops.mist.io
PARENT_REPO=${CI_PROJECT_PATH:-mistio/mist.io}
CSV_FILE=related-submodules.csv
if [ -n "$CI_PROJECT_NAME" ] && [ -n "$CI_JOB_NAME" ]; then
    NAME="$CI_PROJECT_NAME:$CI_JOB_NAME"
else
    NAME="integration-tests"
fi

USAGE="Usage: $0 [-h] [-n <name>] [-i <csv-file>] <state>

Update pipelines of git submodules using Gitlab's Commit Status API.

Environmental variables:
    GITLAB_API_TOKEN    Token to authenticate to gitlab's API. Required.

Options:
    -h              Show this help message and exit.
    -n <name>       Name of external status to register, defaults to $NAME.
    -r <csv-file>   Import related submodule info from this csv file, defaults
                    to $CSV_FILE. This file can be produced by
                    ci/find-submodules.sh.

Positional arguments:
    <state>         Status of the external check, valid values are pending,
                    running, success, failed, canceled and result. State
                    'result' is special. If specified, then if the env var
                    FAILED is empty, state will be set to success, otherwise
                    it'll be set to failed and the command will exit with
                    error. This is used to save a few lines in the ci steps.
"

while getopts "hn:i:" opt; do
    case "$opt" in
        h)
            echo "$USAGE"
            exit
            ;;
        n)
            NAME="$OPTARG"
            ;;
        i)
            CSV_FILE="$OPTARG"
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            echo "$USAGE" >&2
            exit 1
    esac
done
shift $(expr $OPTIND - 1)

if [ -z "$GITLAB_API_TOKEN" ]; then
    echo "$USAGE" >&2
    echo >&2
    echo "No GITLAB_API_TOKEN env variable specified!" >&2
    exit 1
fi


STATE="$1"
if [ -z "$STATE" ]; then
    echo "$USAGE" >&2
    echo >&2
    echo "No <state> specified!" >&2
    exit 1
fi
case "$STATE" in
    result)
        if [ -n "$FAILED" ]; then
            RC=1
            STATE=failed
        else
            STATE=success
        fi
        ;;
    pending|running|success|failed|canceled)
        ;;
    *)
        echo "$USAGE" >&2
        echo >&2
        echo "Invalid state: $STATE" >&2
        exit 1
        ;;
esac

if [ ! -f "$CSV_FILE" ]; then
    echo "Couldn't find csv file $CSV_FILE!" >&2
    exit 1
fi

echo "Name:             $NAME"
echo "State:            $STATE"
echo "Gitlab url:       $GITLAB_URL"
echo "Submodules CSV:   $CSV_FILE"
echo

while read -r line; do
    repo="$(echo $line | cut -d, -f1)"
    commit="$(echo $line | cut -d, -f2)"
    branch="$(echo $line | cut -d, -f3)"
    echo "Updating repo $repo branch $branch"
    repo="$(echo $repo | sed 's/\//%2F/g' | sed 's/\./%2E/g')"

    # If we're about to set it to running/pending state, make sure it's not
    # already in such a state. If so, cancel previous run.
    if [ "$STATE" = "running" ] || [ "$STATE" = "pending" ]; then
        prev_state=$(
            curl -sf -H "PRIVATE-TOKEN: $GITLAB_API_TOKEN" \
                    "$GITLAB_URL/api/v4/projects/$repo/repository/commits/$commit/statuses?name=$NAME&ref=$branch" | \
                jq '.[].status' | sed 's/"//g'
        )
        if [ "$prev_state" = "running" ] || [ "$prev_state" = "pending" ] ; then
            curl -sf -X POST -H "PRIVATE-TOKEN: $GITLAB_API_TOKEN" \
                "$GITLAB_URL/api/v4/projects/$repo/statuses/$commit/?name=$NAME&ref=$branch&state=canceled"
        fi
    fi

    # Set state.
    target_url="$GITLAB_URL/$PARENT_REPO/builds/$CI_JOB_ID"
    query="name=$NAME&ref=$branch&state=$STATE&target_url=$target_url"
    set -x
    curl -sf -X POST -H "PRIVATE-TOKEN: $GITLAB_API_TOKEN" \
        "$GITLAB_URL/api/v4/projects/$repo/statuses/$commit/?$query"
    set +x

    echo
done < $CSV_FILE
echo "Done!"
exit $RC
