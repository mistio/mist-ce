mist.io
=======

Mist.io helps you manage and monitor your virtual machines, across different
clouds, using any device that can access the web. It is provided under the 
GNU AGPL v3.0 License. Check out the freemium service at **https://mist.io**


Installation
------------

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

In MacOSX there might be some problems with certificates resulting to mist.io
getting 404 errors from server side. To solve the issue donwlad a pem from
http://curl.haxx.se/docs/caextract.html rename it to curl-ca-bundle.crt and save
it to /opt/local/share/curl/

Supposing you have all the above, the steps are simple. Clone the repository,
create a virtualenv and run buildout::

    git clone https://github.com/unweb/mist.io.git
    cd mist.io
    virtualenv --no-site-packages .
    ./bin/python bootstrap.py
    ./bin/buildout -v

Configuration
-------------

First copy settings.py.dist in the same path and name it settings.py In settings.py
you can configure the cloud backends and your keys using Python syntax. 
The BACKENDS global is an array of dictionaries, each dictionary describing a 
backend. For example to configure a single EC2 backend you would have::

    BACKENDS = [
        {'title': 'EC2',
         'provider': Provider.EC2,
         'id': 'AKIAIHIF64EDA6VJDISQ',
         'secret': 'mIAa25lukad1SqQvScX+spm4knQfmXbcKyoPi/hC',
         'poll_interval': 10000,
         },
    ]

The 'title' field is used to name your backend anyway you like.

The KEYPAIRS global is a single dictionary with an key Id and a tuple containing
the public and private key as strings. e.g.::

    KEYPAIRS = {
                'default':(  """ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEA7qhW...""",
                             """-----BEGIN RSA PRIVATE KEY-----
                                MIIEowIBAAKCAQEA7qHnqOLy9hWcP5W+iADJmkIK9n5veATDf1hU2TEHyr5/gRP2
                                Ykto7Am7iHJdtf0ym+Y5q5fzzOdQS9AJ8mTPouHM8dXWhIkZxfrK4Ylawr/P3jBX
                                ...
                                0pROU5zeZkNATRwXyD0F3NnxW8TJcvW0xtaaqiHpSWiItqqIDY6ySb2aC4k43Dyy
                                0HfyGamX7rJIdcyxEzXChiG7nypZAgr6qFpsilcuChMj3kIov6c0
                                -----END RSA PRIVATE KEY-----""") 
                }


Deployment
----------

Mist.io comes with two sets of deployment options, one suited for production
environments and one for develompent.

To get it up and running for production::

    ./bin/paster serve production.ini

For development mode::

    ./bin/paster serve development.ini --reload

With the --reload flag, whenever there are changes in Python code and templates
the server will automatically restart to load the new version. Changes in css
and javascript don't need a restart to show up. To stop it, simply press CTRL+C.  

Point your browser to http://127.0.0.1:6543 and you are ready to roll!
