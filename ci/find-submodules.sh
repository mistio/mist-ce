#!/bin/sh

set -e

RELATED_CSV_FILE=related-submodules.csv
ALL_CSV_FILE=all-submodules.csv

USAGE="Usage: $0 [-h] [-n]

Find status of all submodules and discover which submodule branches should be
updated with the status of a pipeline running on current branch of current git
parent repo.

Options:
    -h              Show this help message and exit.
    -n              Only update submodule branches of same name.
    -r <csv-file>   Export related submodule information to csv file in
                    specified location. This can be used by
                    ci/update-pipelines.sh to update the status of the
                    gitlab CI pipelines of related children submodules.
                    Defaults to $RELATED_CSV_FILE.
    -a <csf-file>   Export all submodule commit information to csv file in
                    specified location. This can be used to get the sha1 of
                    each submodule, in order for example to be able to pull
                    their commit-sha tagged docker images.  Defaults to
                    $ALL_CSV_FILE.
"

while getopts "hnr:a:" opt; do
    case "$opt" in
        h)
            echo "$USAGE"
            exit
            ;;
        n)
            SAME_NAME=1
            ;;
        r)
            RELATED_CSV_FILE="$OPTARG"
            ;;
        a)
            ALL_CSV_FILE="$OPTARG"
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            echo "$USAGE" >&2
            exit 1
    esac
done


inspect_repo() {
    # Find all branches of origin that point to the checked out commit
    # Returns: git-host git-repo commit-sha [branch1 [branch2 ....]]

    # Find checked out commit.
    commit=$(git rev-parse HEAD)

    # Discover git host & repo.
    parts=$(git config remote.origin.url |
            sed 's/\.git$//' |
            sed -r 's|^https?://(.+:.+@)?([^/]+)/|\2 |' |
            sed -r -e 's|^(ssh://)?(.+@)([^/]+):|\3 |')
    host=$(echo $parts | cut -d' ' -f1)
    repo=$(echo $parts | cut -d' ' -f2)
    if [ -z "$host" ] || [ -z "$repo" ]; then
        echo "Couldn't determine host/repo for $(pwd)" >&2
        return 1
    fi

    # Find all branches with heads pointing to checked out commit.
    branches=""
    for branch in $(git for-each-ref --format '%(refname)' \
                        'refs/remotes/origin/*' --points-at HEAD | \
                    cut -d/ -f4 | grep -v HEAD); do
        if [ -n "$branches" ]; then
            branches="$branches,$branch"
        else
            branches="$branch"
        fi
    done
    echo "$(pwd) $host $repo $commit $branches"
}


inspect_parent() {
    inspect="$(inspect_repo)"
    start="$(echo "$inspect" | cut -d' ' -f1,2,3,4)"
    # If running in Gitlab CI, taken parent branch/tag from env var.
    if [ -n "$CI_COMMIT_REF_NAME" ]; then
        branches="$CI_COMMIT_REF_NAME"
    else
        # If checked out branch, use that as parent branch.
        # Otherwise fallback to all branches that point to HEAD.
        current="$(git rev-parse --abbrev-ref @)"
        if [ "$current" != "HEAD" ]; then
            branches="$current"
        else
            branches="$(echo $inspect | cut -d' ' -f5)"
        fi
    fi
    echo "$start $branches"
}


inspect_submodules() {
    # Returns: submodule-path git-host git-repo commit [branch1 [branch2 ...]]
    basedir=$(pwd)
    for submodule in $(git submodule foreach -q --recursive pwd); do
        cd $submodule
        inspect_repo
        cd $basedir
    done
}


inspect() {
    inspect_parent
    inspect_submodules
}


pretty_print() {
    table=$(
        if [ "$#" -gt 0 ]; then
            echo "$@"
            for i in $(seq 1 $#); do echo -n "---- "; done
            echo
        fi
        cat -
    )
    if command -v column > /dev/null; then
        echo "$table" | column -t
    else
        echo "$table"
    fi
}


filter_submodules() {

    parent=$(inspect_parent)
    parent_path=$(echo $parent | cut -d' ' -f1)
    parent_host=$(echo $parent | cut -d' ' -f2)
    parent_repo=$(echo $parent | cut -d' ' -f3)
    parent_commit=$(echo $parent | cut -d' ' -f4)
    parent_branches=$(echo $parent | cut -d' ' -f5)

    for branch in $(echo $parent_branches | tr ',' ' '); do
        if [ "$branch" = "master" ] || [ "$branch" = "staging" ]; then
            master=1
        fi
    done

    echo "Filtering submodules..." >&2
    echo >&2
    inspect_submodules | while read -r submodule; do

        path=$(echo $submodule | cut -d' ' -f1)
        host=$(echo $submodule | cut -d' ' -f2)
        repo=$(echo $submodule | cut -d' ' -f3)
        commit=$(echo $submodule | cut -d' ' -f4)
        branches=$(echo $submodule | cut -d' ' -f5)

        if [ "$host" != "$parent_host" ]; then
            echo "Skipping $repo due to different git host." >&2
            continue
        fi

        if [ -z "$branches" ]; then
            echo "Skipping $repo due to no matching refs." >&2
            continue
        fi

        if [ -n "$master" ]; then
            filtered_branches="$branches"
        else
            filtered_branches=""

            if [ -n "$SAME_NAME" ]; then
                # Select only submodule branches with same name
                for parent_branch in $(echo $parent_branches | tr ',' ' '); do
                    for branch in $(echo $branches | tr ',' ' '); do
                        if [ "$parent_branch" != "$branch" ]; then
                            echo -n "Skipping repo $repo branch $branch " >&2
                            echo "due to different branch name." >&2
                            continue
                        fi
                        if [ -n "$filtered_branches" ]; then
                            filtered_branches="$filtered_branches,$branch"
                        else
                            filtered_branches="$branch"
                        fi
                    done
                done
            else
                # Select only submodule branches that aren't master/staging
                for branch in $(echo $branches | tr ',' ' '); do
                    if [ "$branch" = "master" ] || [ "$branch" = "staging" ]; then
                        echo -n "Skipping repo $repo branch $branch " >&2
                        echo "due to it being master/staging." >&2
                        continue
                    fi
                    if [ -n "$filtered_branches" ]; then
                        filtered_branches="$filtered_branches,$branch"
                    else
                        filtered_branches="$branch"
                    fi
                done
            fi

        fi
        if [ -z "$filtered_branches" ]; then
            echo "Skipping repo $repo, no branches match after filtering." >&2
            continue
        fi

        echo $path $host $repo $commit $filtered_branches

    done
}


to_csv() {
    while read -r submodule; do
        repo=$(echo $submodule | cut -d' ' -f3)
        commit=$(echo $submodule | cut -d' ' -f4)
        branches=$(echo $submodule | cut -d' ' -f5)
        for branch in $(echo $branches | tr ',' ' '); do
            echo "$repo,$commit,$branch"
        done
    done
}


echo "Overall Tree Status" >&2
echo >&2
all_submodules="$(inspect)"
echo "$all_submodules" | cut -d' ' -f2,3,4,5 | \
    pretty_print host repo commit branches >&2
echo >&2
echo >&2
echo "Exporting all submodules info to CSV file in $ALL_CSV_FILE..." >&2
echo "$all_submodules" | cut -d' ' -f3,4 | tr ' ' ',' > $ALL_CSV_FILE
echo >&2
echo >&2
related_submodules="$(filter_submodules)"
if [ -z "$related_submodules" ]; then
    echo >&2
    echo "No related references, exiting!" >&2
    echo -n > $RELATED_CSV_FILE
    exit 0
fi
echo >&2
echo >&2
echo "Directly related submodule refs" >&2
echo >&2
echo "$related_submodules" | cut -d' ' -f3,5 | pretty_print repo branches
echo >&2
echo >&2
echo "Exporting related submodules info to CSV file in $RELATED_CSV_FILE.." >&2
echo "$related_submodules" | to_csv > $RELATED_CSV_FILE
