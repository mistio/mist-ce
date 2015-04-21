mist.io
=======

Mist.io helps you manage and monitor your virtual machines, across different
clouds, using any device that can access the web. It is provided under the 
GNU AGPL v3.0 License. Check out the freemium service at https://mist.io

Installation
------------

Mist.io is written in Python. Currently it is tested and developed using
Python 2.7. The only system wide requirements are Python, Python header
files and some basic build tools. Git is used for revision control. Every other
dependency is build automatically via zc.buildout. Although we use zc.buildout
it is recommended to install mist.io in a virtualenv to avoid conflicts with
eggs in the system's Python.

To install the basic requirements in a Debian based distro do::

    sudo aptitude install python-dev build-essential git erlang libpcre3-dev

If you wish to install it in a virtual environment you'll also need::

    sudo aptitude install python-virtualenv

If you plan to support KVM via libvirt, you should install libvirt library::

    sudo aptitude install libvirt-bin libvirt-dev
    ./bin/pip install libvirt-python

For vSphere support, you should install pysphere library::

    ./bin/pip install pysphere

In Red Hat based systems the following packages need to be installed:
   
    sudo yum install git python-virtualenv python-dev erlang pcre python-lxml  gcc libxml2 libxml2-python libxml2-devel

For openSUSE distibution, you'll have to additionally install:

    sudo zypper in python-gevent libevent-devel


In MacOSX you have to install Xcode and its command line tools. For virtualenv
you simply run::

    sudo easy_install virtualenv

Supposing you have all the above, the steps are simple. Clone the repository,
create a virtualenv and run buildout::

    git clone https://github.com/mistio/mist.io.git
    cd mist.io
    virtualenv --no-site-packages .
    ./bin/pip install ansible
    ./bin/python bootstrap.py
    ./bin/buildout -v

In case you are using an older version of setuptools, bootstrap will fail. To 
solve this you need to::

   ./bin/pip install setuptools --upgrade

If you are using Python 2.6 you'll have to install ipython version 1, otherwise buildout will fail
   ./bin/pip install ipython==1

Deployment
----------

Mist.io comes with supervisor in order to handle all the processes.

To get it up and running::

    ./bin/supervisord

For development you can tail the logs::

    tail -f var/log/*.log

You can also monitor that all the processes are up and running::

    ./bin/supervisorctl status

Finally, you can start, stop or restart a specific process::

    ./bin/supervisorctl restart uwsgi

Point your browser to http://127.0.0.1:8000 and you are ready to roll!
