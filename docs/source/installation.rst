Installation
============

Installation is done via buildout and it is recommended to install in a virtual python environement.

Mist.io is written in python, so you must have python >2.6 before installing. Currently it is tested and developed using python vs2.6. For versions control mist.core uses git, so you'll need to install git before proceeding.

There are also some minor dependencies. To install the dependencies in ubuntu do the following::

    sudo aptitude install ......

In MacOS ........

Installation is done in the following steps::

    git clone ....
    cd mist.io
    virtualenv --no-site-packages --python=python2.6
    ./bin/python bootstrap.py
    ./bin/buildout -v
