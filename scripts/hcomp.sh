#########################################################################################
#	
#	Generates a script that loads and compiles all templates
#   when the application starts up (only when JS_BUILD equals to
#   false)
#
#   Then compiles the same templates so that they be used w/o
#   client compilation (when JS_BUILD equals to true)
#
#   Needs ember-precompile:
#   https://github.com/gabrielgrant/node-ember-precompile
#  
#########################################################################################

#########################################################################################
# Progress bar
##
#function progress {
    
	#value=`bc <<< "$1 / 1"`
	#half_value=`bc <<< "$value / 2"`
	#bar="|"
	#for (( int=0; int <= $half_value; ++int)); do bar="$bar="; done
	#for (( int=$half_value; int < 50; ++int)); do bar="$bar "; done
    #echo -ne "$bar| $value %\r"
#}



#########################################################################################
# Constants
##

TEMPLATES_DIR="src/mist/io/static/js/app/templates"

if [ "$1" ]
then
    TEMPLATES_DIR="$1""/$TEMPLATES_DIR"
    echo $TEMPLATES_DIR
else
    IS_CORE=`pwd | grep mist.core`
    if [ "$IS_CORE" ]
    then
        cd `pwd | sed 's%mist.core.*%mist.core%g'`
        cd "src/mist.io"
    else
        cd `pwd | sed 's%mist.io.*%mist.io%g'`
    fi
fi

BUILD_PATH="$TEMPLATES_DIR""/templates.js"
FILE_COUNT=`eval ls -l $TEMPLATES_DIR | grep .html | wc -l | tr -d ' '`





#########################################################################################
# Generate javascript for client template compilation
##

echo "Generating script..."
#progress 0

echo "define('app/templates/templates', ['ember'], function() {

if (!JS_BUILD) {
  require([" > $BUILD_PATH

i=0
for f in $TEMPLATES_DIR"/"*.html
do
    echo "    'text!app/templates/""$(basename $f)""'," >> $BUILD_PATH
    
    # Show progressbar
    i=$((i + 1))
    #progress `bc -l <<< "50 / $FILE_COUNT * $i"`
done

#progress 50

echo "    'ember'],
  function() {" >> $BUILD_PATH

i=0
for f in $TEMPLATES_DIR"/"*.html
do
	filename=$(basename "$f")
	filename="${filename%.*}"
    echo "    Ember.TEMPLATES['""$filename""/html'] = Ember.Handlebars.compile(arguments[""$i""]);" >> $BUILD_PATH
    
    # Show progressbar
    i=$((i + 1))
    #progress `bc -l <<< "(50 / $FILE_COUNT * $i) + 50 "`
done

echo "  });
  return;
}

" >> $BUILD_PATH
#progress 100



#########################################################################################
# Compile templates
##

echo -ne "\nCompiling templates...\n"
#progress 0

i=0
for f in $TEMPLATES_DIR"/"*.html
do
    ember-precompile "$f" >> $BUILD_PATH
    
    # Show progressbar
    i=$((i + 1))
    #progress `bc -l <<< "100 / $FILE_COUNT * $i"`
done


# Close wrapper
echo "});" >> $BUILD_PATH

#progress 100
echo -ne "\nDone\n"

