#!/bin/bash
################################################################################
#
#	Step 1: Generate javascript to require and compile all templates.
#   This code gets executed only when JS_BUILD equals to false
#
#   Step 2: Compile the same tempaltes for faster loading times.
#   Pre-compiled templates get evaluated only when JS_BUILD equals to true
#
#   Dependencies:
#   https://github.com/npm/npm
#   https://github.com/gabrielgrant/node-ember-precompile
#
################################################################################


# Define globals
TMP_DIR=""
TMP_FILE=""
ROOT_DIR=""
OUT_PATH=""
FILE_COUNT=""
TEMPLATES_DIR="src/mist/io/static/js/app/templates"


################################################################################
#  Function: setupPaths
#  Description: Use some logic to determine the root dir of mist.io project.
#    Then get templates' directory and set the path of the output file
#  Parameters:
#    $1 -> Explicitly define the root directory of mist.io project (optional)
setupPaths(){

    if [ "$1" -a "$1" != "--script" ]
    then
        ROOT_DIR="$1"
    else
        IS_CORE=`pwd | grep mist.core`
        if [ "$IS_CORE" ]
        then
            ROOT_DIR=`eval pwd | sed 's%mist.core.*%mist.core/src/mist.io%g'`
        else
            ROOT_DIR=`eval pwd | sed 's%mist.io.*%mist.io%g'`
        fi
    fi

    TEMPLATES_DIR="$ROOT_DIR/$TEMPLATES_DIR"
    OUT_PATH="$TEMPLATES_DIR/templates.js"
    FILE_COUNT=`eval ls -l $TEMPLATES_DIR | grep .html | wc -l | tr -d ' '`
    TMP_DIR="$ROOT_DIR/.dtmp"
    TMP_FILE="$ROOT_DIR/.ftmp"
}


################################################################################
#  Function: generateScript
#  Description: Implement step 1, as described in the header of this file
#  Parameters: None
generateScript(){

    # Define templates file and require ember.js
    echo "define('app/templates/templates', ['ember'], function() {" > $OUT_PATH

    # Return a function to be called when the app needs to load the templates
    echo "  return function (callback) {" >> $OUT_PATH

    # Make sure the script doesn't run when JS_BUILD is true
    echo "    if (!JS_BUILD) {" >> $OUT_PATH

    # Require all html files
    echo "      require([" >> $OUT_PATH

    i=0
    for f in $TEMPLATES_DIR"/"*.html
    do
        i=$((i + 1))
        echo -ne "\rGenerating require parameters ($i/$FILE_COUNT)"
        echo "        'text!app/templates/""$(basename $f)""'," >> $OUT_PATH
    done

    echo -ne "\rGenerating require parameters ($FILE_COUNT/$FILE_COUNT) DONE"

    # Generate template compilation statements
    echo ""
    echo "      ], function () {" >> $OUT_PATH

    i=0
    for f in $TEMPLATES_DIR"/"*.html
    do
        i=$((i + 1))
        echo -ne "\rGenerating compilation statements ($i/$FILE_COUNT)"
        filename=$(basename "$f")
        filename="${filename%.*}"
        var="Ember.TEMPLATES['$filename/js']"
        value="Ember.Handlebars.compile(arguments[$((i-1))]);"
        echo "        $var = $value" >> $OUT_PATH
    done

    # Terminate script
    echo "        callback();
      });
      return;
    }" >> $OUT_PATH

    echo -ne "\rGenerating compilation statements ($FILE_COUNT/$FILE_COUNT) DONE"
    echo ""
}


################################################################################
#  Function: compressTemplates
#  Description: Removes useless characters from the templates
#  Parameters: None
compressTemplates(){


    # Skip this step if user only wants the script
    if [ $# -gt 0 ]
    then
        if [ "${@: -1}" == "--script" ]
        then
            echo "Compressing templates (0/$FILE_COUNT) SKIPPED"
            return -1
        fi
    fi

    # Make a temporary folder to store compressed templates
    mkdir -p $TMP_DIR
    touch $TMP_FILE

    cd $TMP_DIR

    # Compress templates
    i=0
    for f in $TEMPLATES_DIR"/"*.html
    do
        i=$((i + 1))
        echo -ne "\rCompressing templates ($i/$FILE_COUNT)"

        filename=$(basename "$f")
        filename="${filename%.*}"
        output="$TMP_DIR/$filename.js"

        # Remove new lines
        tr -d "\n" < $f > $TMP_FILE

        # 1) Remove comments
        # 2) Remove extra whitespace
        # 3) Remove whitespace bettween tags
        # 4,5,6) Remove whitespace betweeen handlebars and html tags
        # 7) Remove whitespace between handlebars
        sed -e "s/<\!--[^-->]*-->//g"\
            -e "s/  */ /g"\
            -e "s/> </></g"\
            -e "s/> {{/>{{/g"\
            -e "s/}} </}}</g"\
            -e "s/}} >/}}>/g"\
            -e "s/}} {{/}}{{/g" $TMP_FILE > $output
    done

    echo -ne "\rCompressing templates ($FILE_COUNT/$FILE_COUNT) DONE"
    echo ""
}


################################################################################
#  Function: compileTemplates
#  Description: Implements step 2, as described in the header of this file
#  Parameters: None
compileTemplates(){


    # Skip this step if user only wants the script
    if [ $# -gt 0 ]
    then
        if [ "${@: -1}" == "--script" ]
        then
            echo "Compiling templates (0/$FILE_COUNT) SKIPPED"
            return -1
        fi
    fi

    # Compile templates
    i=0
    for f in $TMP_DIR"/"*
    do
        i=$((i + 1))
        echo -ne "\rCompiling templates ($i/$FILE_COUNT)"
        ember-precompile "$f" >> $OUT_PATH
    done

    echo -ne "\rCompiling templates ($FILE_COUNT/$FILE_COUNT) DONE"
    echo ""
}


finish() {

    # Terminate file
    echo "    callback();
  }
});" >> $OUT_PATH

    # Clean up
    rm -rf $TMP_DIR
    rm -f $TMP_FILE
}


main(){
    setupPaths $@
    generateScript $@
    compressTemplates $@
    compileTemplates $@
    finish $@
}


main $@
