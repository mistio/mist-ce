.. http:get:: /backends

   List of all added backends

   **Example request**:

   .. sourcecode:: http

      GET /backends
      Host: mist.io
      Accept: application/json; charset=UTF-8

   **Example response**:

   .. sourcecode:: http

        [
           {
               "state": "wait",
               "apikey": "A09009NUMIQCIHA",
               "title": "EC2 AP NORTHEAST",
               "enabled": true,
               "region": "",
               "provider": "ec2_ap_northeast",
               "poll_interval": 10000,
               "id": "2tK74h4mXbj8nNohljLIzqc4SHn3"
           },
           {
               "state": "wait",
               "apikey": "myapikey",
               "title": "Rackspace DFW",
               "enabled": true,
               "region": "dfw",
               "provider": "rackspace",
               "poll_interval": 10000,
               "id": "3po809NuIjqiNgqqmDJAKSLWp6"
           }
        ]

.. http:post:: /backends

   Add Backend

   **Example request**:

   Add EC2 Backend

   .. sourcecode:: http

        {
            "title":"EC2 AP Sydney",
            "provider":"ec2_ap_southeast_2",
            "apikey":"OLNPOIJBIUMIQCIHA",
            "apisecret":"1R6vxKnub0087JKHgjhguy90ur"
        }

   Add Openstack Backend

   .. sourcecode:: http

        {
            "title":"OpenStack",
            "provider":"openstack",
            "apikey":"admin",
            "apisecret":"mist",
            "apiurl":"http://37.58.77.91:5000/v2.0",
            "tenant_name":"admin"
        }

   :jsonparam string title:  *required* Title of the backend
   :jsonparam string provider: *required* Provider as found in supported providers list
   :jsonparam string apikey: APIKEY or username (depending on the provider)
   :jsonparam string apisecret: APISECRET or password (depending on the provider)
   :jsonparam string apiurl: APIURL needed by Openstack and HP Cloud
   :jsonparam string tenant_name: Tenant needed by Openstack and HP Cloud
   :jsonparam string machine_ip: Ip address needed when adding Bare Metal Server
   :jsonparam string machine_key: Id of ssh key needed when adding Bare Metal Server
   :jsonparam string machine_user: User for Bare Metal Server

   **Example response**:

   .. sourcecode:: http

    {
       "status": "off",
       "tenant_name": "",
       "id": "48emAUzL9teVYhkyJc9koRaPXEDp",
       "index": 2,
       "apikey": "OLNPOIJBIUMIQCIHA",
       "title": "EC2 AP Sydney",
       "region": "",
       "poll_interval": 10000,
       "apiurl": "",
       "provider": "ec2_ap_southeast_2",
       "enabled": true
    }

.. http:delete:: /backends/{backend_id}

   Delete backend

   **Example request**:

   .. sourcecode:: http

      DELETE /backends/{backend_id}
      Host: mist.io
      Accept: application/json; charset=UTF-8

.. http:put:: /backends/{backend_id}

   Rename backend

   **Example request**:

   .. sourcecode:: http

      PUT /backends
      Host: mist.io
      Accept: application/json; charset=UTF-8

      {
        "new_name":"Renamed Backed"
      }

   :jsonparam string new_name:  *required* New name for backend

.. http:post:: /backends/{backend_id}

   Toggle state of backend between enabled and disabled

   **Example request**:

   .. sourcecode:: http

      POST /backends
      Host: mist.io
      Accept: application/json; charset=UTF-8

      {
        "newState":"False"
      }

   :jsonparam string newState:  *required* True to enable, False to disable backend
