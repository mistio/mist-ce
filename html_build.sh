#
# Constants
#

COMPILED_DIR="src/mist/io/static/js/app/templates/compiled"
TEMPLATES_DIR="src/mist/io/static/js/app/templates"


#
# Create directory for compiled files
#

rm -rf "$COMPILED_DIR"
mkdir "$COMPILED_DIR"


#
# Compile html files
#

echo ""
echo "Step 1/3 : Compilation"
echo ""

for f in $TEMPLATES_DIR"/"*.html
do
    echo "Compiling: $f"
    FILE_NAME=$(basename "$f")
    FILE_NAME="${FILE_NAME%.*}"
    ember-precompile "$f" -f "$COMPILED_DIR""/""$FILE_NAME"".js"

done


#
# Add define headers in compiled files
#

echo ""
echo "Step 2/3 : Modification"
echo ""

for f in $COMPILED_DIR"/"*.js
do
    FILE_NAME=$(basename "$f")
    FILE_NAME="${FILE_NAME%.*}"
    HEADER="define('app/templates/compiled/$FILE_NAME', ['ember'], function() {
    "
    echo "Mofifying: $f"
    echo "$HEADER" | cat - "$f" > temp && mv temp "$f"
    echo "});" >> "$f"


done


#
# Inject file definitions in app.js
#

echo ""
echo "Step 3/3"
echo ""

PATHS=""
DEFINITIONS=""

# construct path/definition array

for f in $COMPILED_DIR"/"*.js
do
    FILE_NAME=$(basename "$f")
    FILE_NAME="${FILE_NAME%.*}"
    PATHS="$PATHS""'app/templates/compiled/""$FILE_NAME""', "
    DEFINITIONS="$DEFINITIONS""$FILE_NAME""PrecompiledTemplate, "
   
done

# replace comments in app.js

PATH_COMMENT="// @precompile-templates-path"
sed -i ".pback" "s%${PATH_COMMENT}%${PATHS}%g" src/mist/io/static/js/app.js

DEFINITION_COMMENT="// @precompile-templates-definition"
sed -i ".dback" "s%${DEFINITION_COMMENT}%${DEFINITIONS}%g" src/mist/io/static/js/app.js


