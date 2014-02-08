#####################################################
#	
#	Compiles multiple handlebars templates into
#   a single file for optimized performacne
#
####################################################

TEMPLATES_DIR="src/mist/io/static/js/app/templates"
BUILD_PATH="src/mist/io/static/js/app/templates/build.js"

# Wrap file into a define statement to access it in app.js
echo "define('app/templates/build', ['ember'], function() {
" > $BUILD_PATH

# Compile html files and append them to build.js
for f in $TEMPLATES_DIR"/"*.html
do
    echo "Compiling: $f"
    ember-precompile "$f" >> $BUILD_PATH

done

# Close wrapper
echo "});" >> $BUILD_PATH

