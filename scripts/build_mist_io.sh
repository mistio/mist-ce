#!/bin/bash -x

# GLOBALS
WORKSPACE=$WORKSPACE

PUSH="false"
TIME_NOW=`date +"%s"`
STATIC_FILES_CHANGED="false"

MIST_JS="src/mist/io/static/build/mist.js"
MIST_CSS="src/mist/io/static/mist.css"

css_build="src/mist/io/static/mist-$TIME_NOW.css"
js_build="src/mist/io/static/build/mist-$TIME_NOW.js"


function parseArgs {

    while [ $# -gt 0 ]
    do
        # Check for explicit workspace dir
        if [ -d $1 ]
        then
            WORKSPACE=$1
        # Check for push argument
        elif [ "$1" == "--push" ]
        then
            PUSH="true"
        else
            echo "Invalid parameter: $1"
            exit -1
        fi
        shift
    done
}


function updateRepo {

    cd $WORKSPACE

    # When not using the --push parameter,
    # the user wants to locally build mist.io
    # Running git pull will ruin local changes
    if [ "$PUSH" == "true" ]
    then
        git pull
    fi
}


function prepareRJS {

    cd $WORKSPACE

    # Make a folder to build r.js
    mkdir -p r
    cd r

    # Clone r.js repo if it doesn't exist
    if [ -d r.js ]
    then
        echo "r.js already cloned"
    else
        git clone https://github.com/jrburke/r.js
    fi

    # Build r.js file
    cd r.js
    node dist.js
}


function buildHTML {

    cd $WORKSPACE
    ./scripts/hcomp.sh $(pwd)
}


function buildJS {

    cd $WORKSPACE

    # Build mist.js
    config_file="src/mist/io/static/app.build.js"
    node r/r.js/r.js -o $config_file out=$js_build

    # Check if it changed
    diff $js_build $MIST_JS
    if [ $? == 0 ]
    then
        # It didn't change
        rm $js_build
    else
        # It changed
        mv $js_build $MIST_JS
        STATIC_FILES_CHANGED="true"
    fi
}


function buildCSS {

    cd $WORKSPACE

    # Build mist.css
    config_file="src/mist/io/static/css.build.js"
    node r/r.js/r.js -o $config_file out=$css_build

    # Check if it changed
    diff $css_build $MIST_CSS
    if [ $? == 0 ]
    then
        # It didn't change
        rm $css_build
    else
        # It changed
        mv $css_build $MIST_CSS
        STATIC_FILES_CHANGED="true"
    fi
}


function exitIfNothingChanged {
    if [ "$STATIC_FILES_CHANGED" == "false" ]
    then
        exit 0
    fi
}


function commitChanges {

    if [ "$PUSH" == "true" ]
    then
        cd $WORKSPACE

        # Remove changed js files from git
        js_files=`ls -1tr src/mist/io/static/build/mist-*`
        for x in $js_files
        do
          git rm -f $x
        done

        # Remove changed css files from git
        css_files=`ls -1tr src/mist/io/static/mist-*.css`
        for x in $css_files
        do
          git rm -f $x
        done

        # Make a timestamped links to build files
        cd src/mist/io/static
        ln -sf mist.css mist-${TIME_NOW}.css
        cd -

        cd src/mist/io/static/build
        ln -sf mist.js mist-${TIME_NOW}.js
        cd -

        git add $js_build $css_build

        # Check if there is anything to commit
        git status | grep mist\.
        ret=$?
        echo "ret = $ret"
        if [ x$ret = x'0' ]
        then

            home_pt="src/mist/io/templates/home.pt"

            # Replace html references of mist.js and mist.css
            sed -i -e s%\.\./build/mist.*%\.\./build/mist-$TIME_NOW\"%g $home_pt
            sed -i -e  s%resources/mist.*%resources/mist-$TIME_NOW\.css\"%g $home_pt

            git commit -a -m "Automated build of mist.js & mist.css "
            BRANCH=`git branch | awk '/\*/ { print $2; }'`
            git push -u origin ${BRANCH}
        else
            echo "Already committed"
            git stash
        fi
    fi
}


function checkDependencies {
    command -v node
    if [ $? == 1 ]; then
        echo "Node is required! Cannot find node package"
        exit 1
    fi

    command -v ember-precompile
    if [ $? == 1 ]; then
        echo "ember-precompile is required!"
        echo ">>> npm install -g ember-precompile"
        exit 1
    fi

}


function main {
    checkDependencies
    parseArgs $@
    if [ ! -d "$WORKSPACE" ]; then
        WORKSPACE=`pwd`
    fi
    updateRepo
    prepareRJS
    buildHTML
    buildJS
    buildCSS
    exitIfNothingChanged
    commitChanges
}

main $@
