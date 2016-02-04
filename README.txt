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

To install the basic requirements in a **Debian** based distro do::

    sudo aptitude install gcc python-dev build-essential git erlang libpcre3-dev python-lxml python-virtualenv

In **Red Hat** based systems the following packages need to be installed::

    sudo yum install git python-virtualenv python-dev erlang pcre python-lxml gcc libxml2 libxml2-python libxml2-devel python-zc-buildout

If you run the command erl after that and it is not found, then package erlang might be missing from the official repos so it needs to be installed manually::

    sudo yum install wget -y
    wget http://rpms.famillecollet.com/enterprise/remi-release-7.rpm
    wget http://dl.fedoraproject.org/pub/epel/7/x86_64/e/epel-release-7-5.noarch.rpm
    sudo rpm -Uvh remi-release-7.rpm  epel-release-7-5.noarch.rpm
    sudo yum install erlang -y


For **openSUSE** distibution, you'll have to additionally install::

    sudo zypper in python-gevent libevent-devel

In **MacOSX** you have to install Xcode and its command line tools. For virtualenv
you simply run::

    sudo easy_install virtualenv


Supposing you have all the above, the steps are simple. Login as user, clone the repository,
create a virtualenv and run buildout. This will fail if you run it as root or with sudo, so make sure you run it as user ::

    git clone https://github.com/mistio/mist.io.git
    cd mist.io
    virtualenv --no-site-packages .
    ./bin/python bootstrap.py
    ./bin/buildout -v

If you plan to support **KVM** you should install libvirt library::

For Debian systems::

    sudo aptitude install libvirt-bin libvirt-dev
    ./bin/pip install libvirt-python

While for Redhat based::

    yum install libvirt-devel -y
    ./bin/pip install libvirt-python


For **vSphere** support, you should install pyvmomi library::

    ./bin/pip install pyvmomi


In case you are using an older version of setuptools, bootstrap will fail. To
solve this you need to::

   ./bin/pip install setuptools --upgrade

If you are using Python 2.6 you'll have to install ipython version 1, otherwise buildout will fail::

   ./bin/pip install ipython==1

In MacOSX in case you are using Xcode 7 buildout will fail. To solve this you need to::

    CFLAGS='-std=c99' ./bin/buildout -v

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


FAQ
---

I install mist.io and visit http://localhost:8000 but I don't see anything
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

make sure all services are running::

    user@user:~/mist.io$ ./bin/supervisorctl status
    celery                           RUNNING   pid 15169, uptime 0:00:02
    haproxy                          RUNNING   pid 15165, uptime 0:00:02
    hub-shell                        RUNNING   pid 15172, uptime 0:00:02
    memcache                         RUNNING   pid 15170, uptime 0:00:02
    rabbitmq                         RUNNING   pid 15168, uptime 0:00:02
    sockjs                           RUNNING   pid 15166, uptime 0:00:02
    uwsgi                            RUNNING   pid 15167, uptime 0:00:02

if you don't see a service as RUNNING then mist.io won't be able to start properly. Make sure that all dependencies have been added to the system before running the buildout, if not install them and re-run the buildout. Also have a look on the logs that are on var/log dir::

    user@user:~/mist.io$ tail -f var/log/*.log


How to change mist.io listen address
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

By default mist.io binds on the localhost interface, if you want to change this behavior edit haproxy.conf and change the line::

    frontend www localhost:8000

to::

    frontend www 0.0.0.0:8000

then restart haproxy::

    user@user:~/mist.io$ ./bin/supervisorctl restart haproxy

Make sure that no other service has already binded on port 8000. It should now load on http://your_ip:8000

If this does not load check if a local firewall policy denies incoming access to port 8000, or if your provider denies incoming access to port 8000 (eg the default ec2 policy for some regions)


Process rabbitmq is not running
~~~~~~~~~~~~~~~~~~~~~~

First make sure that erlang is installed, otherwise it won't be able to start (on RedHat based OS you might have to install it manually, see the install section). On some Ubuntu systems there's an error that prevents rabbitmq from starting correctly, if that's the case for you try to start epmd manually and then restart rabbitmq::



    user@user:~/mist.io$ ./bin/supervisorctl status rabbitmq
    rabbitmq                         STARTING
    user@user:~/mist.io$ epmd -daemon && ./bin/supervisorctl restart rabbitmq
    user@user:~/mist.io$ ./bin/supervisorctl status rabbitmq
    rabbitmq                         RUNNING   pid 18808, uptime 0:00:06

