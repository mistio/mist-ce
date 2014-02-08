#
# Create a temporary directory to store compiled templates
#

COMPILED_DIR="./compiled_tmp"
rm -rf "$COMPILED_DIR"
mkdir "$COMPILED_DIR"


#
# Compile templates
#

TEMPLATES_DIR="src/mist/io/static/js/app/templates"

for f in $TEMPLATES_DIR"/"*.html
do
    echo "Compiling: $f"
    FILE_NAME=$(basename "$f")
    FILE_NAME="${FILE_NAME%.*}"
    ember-precompile "$f" -f "$COMPILED_DIR""/""$FILE_NAME"".js"

done


#
# Concatinate files
#

echo""
echo "Concatinating files..."
HTML_BUILD="src/mist/io/static/js/app/templates/build.js"

if [ -f $HTML_BUILD ]
then 
    rm $HTML_BUILD
fi
touch $HTML_BUILD

for f in $COMPILED_DIR"/"*.js
do
    cat "$f" >> $HTML_BUILD
done


#
# Add define header in build.js
#

echo "Adding define wrapper on: $HTML_BUILD"
HEADER="define('app/templates/build', ['ember'], function() {
"
echo "$HEADER" | cat - "$HTML_BUILD" > temp && mv temp "$HTML_BUILD"
echo "});" >> "$HTML_BUILD"

#clean up
echo "Cleaning up"
rm -rf $COMPILED_DIR
echo "Done"
