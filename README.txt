About
=====

Mist.io is a mobile friendly web app that helps you manage and monitor your
virtual machines, across a multitude of public and private computing cloud
providers.


Installation
============

Mist.io is written in Python. Currently it is tested and developed using
Python 2.6 and 2.7. The only system wide requirements are Python, Python header
files and some basic build tools. Git is used for revision control. Every other
dependency is build automatically via zc.buildout. Although we use zc.buildout
it is recommended to install mist.io in a virtualenv to avoid conflicts with
eggs in the system's Python.

The steps are simple. Clone the repository, create a virtualenv and run
buildout:

	git clone gitosis@git.unweb.me:mist.io.git
	cd mist.io
	virtualenv --no-site-packages .
	./bin bootstrap.py
	./bin/buildout -v


Deployment
==========

Mist.io comes with two sets of deployment options, one suited for production
environments and one for develompent.

To get it up and running for production:

	./bin/paster serve production.ini

For development mode:

	./bin/paster serve development.ini --reload

With the --reload flag, whenever there are changes in Python code and templates
the server will automatically restart to load the new version. Changes in css
and javascript don't need a restart to show up. To stop it, simply press CTRL+C.  

Point your browser to http://127.0.0.1:6543 and you are ready to roll!
