Deployment
==========

Mist.io comes with waitress as its web server. To bring it up with do::

    ./bin/pserve development.ini --reload

This way, whenever there are changes in python code and templates the server will automatically reload to show the new version. Changes in css and javascript don't need a restart to show up. To shutdown the server simply press CTRL+C.

To visit the service, launch your browser and go to http://127.0.0.1:6543
