#!python

#
#   Sprite Generator
#       This is a script that we have been using internally to support the asset
#       to web production flow inside our company. It lets designers focus on
#       generating icon assets without worrying about how they will be used and
#       automates the sprite and CSS file generation process.
#
#       It's best called from a hook to automatically generate the production
#       sprite when the source assets are updated.
#
#       (c) 2013 - frog design - dennis.schaaf@frogdesign.com
#
#       Released under the MIT License
#


import os,shutil, ConfigParser

from PIL import Image
import time
#import Image # used for PIP, now we use Pillow

#print "Sprite Generator"

# Iniitalized Variables
imageWidth = 0
imageHeight = 0
padding = 0
rootObjects = {}
backgroundObjects = []
spriteName="icon-sprite-%d.png" % time.time()

# find the root path by looking for the .sprite_generator file.
def getRootPath(path):
    path = os.path.abspath(path)
    # contains file
    if (os.path.exists( os.path.join(path, '.sprite_generator') )):
        return path
    # is at root
    elif (os.path.abspath(os.path.join(path, '..')) == path):
        return None
    # search in parent
    else:
        return getRootPath(os.path.join(path, '..'))

rootPath = getRootPath('.')

# load settings
if(rootPath):
    config = ConfigParser.ConfigParser()
    config.add_section('generator')
    config.set('generator','findCommonRoot', 'no')
    config.set('generator','backgroundPrefix', 'bg-')
    config.add_section('path')
    config.set('path','recursiveDiscovery', 'True')
    config.readfp(open(os.path.join(rootPath, '.sprite_generator')))

    inputPathAr = config.get('path', 'inputpath').split('/')
    outputPathAr = config.get('path', 'outputpath').split('/')
    recursiveDiscovery = config.getboolean('path', 'recursiveDiscovery')

    backgroundPrefix = config.get('generator', 'backgroundPrefix')
    findCommonRoot = config.getboolean('generator','findCommonRoot')

    inputPath = os.path.join(rootPath, *inputPathAr)
    outputPath = os.path.join(rootPath, *outputPathAr)

    outputImage = os.path.join(outputPath, spriteName)
    outputStyle = os.path.join(outputPath, "sprites.css")



    print 'input: ', inputPath
    print 'output: ', outputPath

else:
    print ""
    print " *** ERROR ***"
    print ""
    print "Sprite Generator needs a configuration file to run. Place a"
    print "configuration file named '.sprite_generator' in the root of your  "
    print "project directory and run this command again."
    print ""
    print "Example .sprite_generator file : "
    print ">"
    print "> [path]"
    print "> inputPath=util/assets"
    print "> outputPath=css/sprite"
    print "> "
    print ""
    print "exiting ... "
    exit()


def getDimensions(path):
    im = Image.open(path)
    return im.size


def getImage(fileSelector, filePath) :
    fileSelector = fileSelector.replace('_', ':').strip();

    lastSpace = fileSelector.rfind(' ')
    prefix = ""
    suffix = fileSelector;

    # This Logic tries to find the root of the element
    # this is not quite Css query normed yet.

    # find the last rule
    if(lastSpace > -1):
        prefix = fileSelector[:lastSpace]
        suffix = fileSelector[lastSpace:]

    root = prefix + suffix;

    lastDot = suffix.rfind('.')
    lastColon = suffix.rfind(':')

    # check if root checking is disabled, also
    # a selector with a '^' at the end does not get a root
    # eg. .attachment_bar:after^
    if findCommonRoot==False:
        root = prefix + suffix
        lastDot = 0
        lastColon = 0

    if suffix[-1] == "^" :
        suffix = suffix[:-1]
        root = prefix + suffix
        lastDot = 0
        lastColon = 0



    if lastColon > 1 :
        root = prefix + suffix[:lastColon]
    elif lastDot > 1:
        root = prefix + suffix[:lastDot]

    return {'root': root.strip(), 'selector' : prefix + suffix, 'file' : filePath, 'size': getDimensions(filePath) }



def ProcessFile(dirname, filename, selector):
    filePath = os.path.join(dirname, filename)
    fileSelector = selector + ' .' + filename[:-4]
    if filename[0] == '&':
        fileSelector =  selector + filename[1:-4]
    elif filename[0] == "_":
        fileSelector = selector + ' .' + filename[1:-4]

    if filename.endswith('.png') and filename != outputImage:
        obj = getImage(fileSelector, filePath)

        if(filename.startswith(backgroundPrefix)):
            backgroundObjects.append(obj)
        else:
            if rootObjects.has_key(obj['root']):
                rootObjects[obj['root']].append(obj)
                w = obj['size'][0]
                h = obj['size'][1]
                for ro in rootObjects[obj['root']]:
                    if(ro['size'][0] != w or ro['size'][1] != h):
                        raise "SIZES DON'T MATCH: ", fislePath


                global imageWidth
                imageWidth = max(imageWidth, (w + padding) * len(rootObjects[obj['root']]))
            else :
                print 'add root object (', obj['root'], ') path: ', obj['file']
                rootObjects[obj['root']] = [obj]
                h = obj['size'][1] + padding
                w = obj['size'][0] + padding
                global imageHeight
                imageHeight = imageHeight + h
                imageWidth = max(imageWidth, w)
                #print "incremented height: ", imageHeight, ' by ', h
                #print 'root ' , obj['root'], ' size ', obj['size'], ' selector ', obj['selector'] ;
    else :
        print "Skipping: ", filePath


def ProcessFolder(dirname, selector):
    global outputImage

    # find directories and files
    entries = os.listdir(dirname)
    dirnames = []
    filenames = []
    for entry in entries:
        if os.path.isdir(os.path.join(dirname, entry)):
            dirnames.append(entry)

        elif os.path.isfile(os.path.join(dirname, entry)):
            filenames.append(entry)

    if recursiveDiscovery:
        for subdirname in dirnames:
            subdirSelector =  selector + " ." + subdirname
            subdirPath = os.path.join(dirname, subdirname)

            if subdirname[0] == '&':
                subdirSelector =  selector + subdirname[1:]


            ProcessFolder(subdirPath, subdirSelector)

    for filename in filenames:
        ProcessFile(dirname, filename, selector)



# Start processing the folder
ProcessFolder(inputPath, '')
print 'Sprite Size: ' , imageWidth, ',', imageHeight

# ensure output path exists
if os.path.exists(outputPath):
    shutil.rmtree(outputPath)
os.makedirs(outputPath)

# Now that the folder has been processed, genereate a png and css files.
print "Drawing ... "
image = Image.new('RGBA', (imageWidth, imageHeight))
css = "ilb { display: inline-block; }  "

# helper function for adding to the css
def Css(s):
    global css
    css = css + s

# The Sprite Stuff
# TODO Instead of making the height linear, add real packing logic here.
top = padding
for root in rootObjects:
    print "Root Object:", root
    index = 0
    size = rootObjects[root][0]['size']
    Css("%s { background-image: url('%s') !important; width: %spx; height: %spx; } " % (root, spriteName, size[0], size[1]))

    for obj in rootObjects[root]:
        left = index*size[0]
        Css("%s { background-position: -%spx -%spx; } \n" % (obj['selector'], left, top)  )

        newImage = Image.open(obj['file']);
        image.paste(newImage, (left, top))

        index = index + 1

    top = top + size[1]

# The Background objects
for obj in backgroundObjects:
    basename = os.path.basename(obj['file'])
    # copy file
    shutil.copy(obj['file'], os.path.join(outputPath, basename))
    # add to css
    Css("%s { background-image: url('%s');} " % (obj['selector'], basename))



print "   Saving"




f = open(outputStyle, 'w');
f.write(css)
f.close()

image.save(outputImage)
print "Done."
