Developer Guide
***************


Installation
============

* Clone the project from https://github.com/mistio/mist.io

Mist.io is written in Python. Currently it is tested and developed using
Python 2.7. The only system wide requirements are Python, Python header
files and some basic build tools. Git is used for revision control. Every other
dependency is build automatically via zc.buildout. Although we use zc.buildout
it is recommended to install mist.io in a virtualenv to avoid conflicts with
eggs in the system's Python.

To install the basic requirements in a Debian based distro do::

    sudo aptitude install python-dev build-essential git

If you wish to install it in a virtual environment you'll also need::

    sudo aptitude install python-virtualenv

In MacOSX you have to install Xcode and its command line tools. For virtualenv
you simply run::

    sudo easy_install virtualenv

In MacOSX there might be some problems with certificates. To solve the issue
donwload a pem from http://curl.haxx.se/docs/caextract.html rename it to
curl-ca-bundle.crt and save it to /opt/local/share/curl/ or to /usr/share/curl/ca-bundle.crt.
Check out this gist https://gist.github.com/1stvamp/2158128

Supposing you have all the above, the steps are simple. Clone the repository,
create a virtualenv and run buildout::

    git clone https://github.com/mistio/mist.io.git
    cd mist.io
    virtualenv --no-site-packages .
    mist.io$ ./bin/python bootstrap.py
    mist.io$ ./bin/buildout -v

In case you are using an older version of setuptools, bootstrap will fail. To solve this you need to::

   mist.io$ ./bin/pip install setuptools --upgrade


Deployment
==========

Mist.io comes with two sets of deployment options, one suited for production
environments and one for develompent.

To get it up and running for production::

    mist.io$ ./bin/uwsgi-start production.ini

For development mode::

    mist.io$ ./bin/uwsgi-start development.ini

Or if you prefer to use paster::

    mist.io$ ./bin/paster serve development.ini --reload

With the --reload flag, whenever there are changes in Python code and templates
the server will automatically restart to load the new version. Changes in css
and javascript don't need a restart to show up. To stop it, simply press CTRL+C.

Point your browser to http://127.0.0.1:6543 and you are ready to roll!

Testing
=======

We have only a basic set of API tests -- *will soon add more* -- based on nose package.

In order to run the tests you have to have paster or uwsgi started.

You also need to::

    mist.io$ cp src/mist/tests/tests_config.yaml.dist src/mist/tests/tests_config.yaml

The tests_config.yaml will seem like this at first::

    BACKENDS: {}
    BACKEND_KEYS:
      DigitalOcean:
        api_key:
        client_id:
      EC2:
        api_key:
        api_secret:
      Nephoscale:
        password:
        username:
      Rackspace:
        api_key:
        username:
      SoftLayer:
        api_key:
        username:
    KEYPAIRS: {}
    MIST_URI: http://127.0.0.1:6543
    SUPPORTED_PROVIDERS: []
    MACHINE_NAME: NinjaTests
    KEY_NAME: NinjaTestsKey
    COOKIE:

You then add your credentials for every cloud *(in case you don't have credentials for a cloud it will not be added)*

To actually run the tests::

    mist.io$ ./bin/nosetests -w src/mist/io/tests

Documentation
=============

To generate these docs with sphinx::

   mist.io$ ./bin/sphinx-build docs/source/ docs/build/


Inside the docs/source folder there are two more, the _static and the _template folder. Inside the _static you can add
css and js files and inside the _template you can tweak the layout.html file. Every time you change a static file and run
sphinx-build again it may not add anything (adds only if there are changes in .py or .rst files). In order to consider the
changes in static files you have to use the -a flag.::

    mist.io$ ./bin/sphinx-build -a docs/source/ docs/build/


Finally there is the -b flag which decides the builder. By default it is html, but you could easily choose between other
latex *(and later use pdflatex to convert all of our Documentation to pdf)*. For example::

    mist.io$ ./bin/sphinx-build -b latex docs/source/ docs/pdf

