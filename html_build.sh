################################################################
#	
#	Compiles multiple handlebars templates into
#   a single file for optimized performacne
#
#   Needs ember-precompile:
#   https://github.com/gabrielgrant/node-ember-precompile
#  
################################################################

BUILD_PATH="src/mist/io/static/js/app/templates/build.js"
TEMPLATES_DIR="src/mist/io/static/js/app/templates"
FILE_COUNT=`eval ls -l $TEMPLATES_DIR | grep .html | wc -l | tr -d ' '`


# Wrap file into a define statement to access it in app.js
echo "define('app/templates/build', ['ember'], function() {
" > $BUILD_PATH


# Prints a progress bar with value passed as first argument
function progress {

	value=`bc <<< "$1 / 1"`
	half_value=`bc <<< "$value / 2"`
	bar="|"
	for (( i=0; i <= $half_value; ++i)); do bar="$bar="; done
	for (( i=$half_value; i < 50; ++i)); do bar="$bar "; done
    echo -ne "$bar| $value %\r"
}


echo "Compiling..."
progress 0


# Compile html files and append them to build.js
i=0
for f in $TEMPLATES_DIR"/"*.html
do
    ember-precompile "$f" >> $BUILD_PATH
    
    # Show progressbar
    i=$((i + 1))
    progress `bc -l <<< "100 / $FILE_COUNT * $i"`
done


# Close wrapper
echo "});" >> $BUILD_PATH


progress 100
echo -ne "\nDone\n"
