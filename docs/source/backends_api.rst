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
            "apikey":"POIHJOINPOIMIQCIHA",
            "apisecret":"09jLlilkjIU087JKHgjhguy90ur"
        }

   Add Openstack Backend

   .. sourcecode:: http

        {
            "title":"OpenStack",
            "provider":"openstack",
            "apikey":"myuser",
            "apisecret":"superstronpassword",
            "apiurl":"http://31.53.71.90:5000/v2.0",
            "tenant_name":"mist"
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
       "apikey": "POIHJOINPOIMIQCIHA",
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

      DELETE /backends/2tK74h4mXbjjLlkjjO4SHn3
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
        "new_name":"Renamed Backend"
      }

   :jsonparam string new_name:  *required* New name for backend

.. http:post:: /backends/{backend_id}

   Toggle state of backend between enabled and disabled

   **Example request**:

   .. sourcecode:: http

      POST /backends/2tK74h4mXbjjLlkjjO4SHn3
      Host: mist.io
      Accept: application/json; charset=UTF-8

      {
        "newState":"False"
      }

   :jsonparam string newState:  *required* True to enable, False to disable backend

.. http:get:: /backends/{backend_id}/sizes

   List of all sizes provided by backend

   **Example request**:

   .. sourcecode:: http

      GET /backends/2tK74h4mXbjjLlkjjO4SHn3/sizes
      Host: mist.io
      Accept: application/json; charset=UTF-8

   **Example response**:

   .. sourcecode:: http

    [
       {
           "name": "Micro Instance",
           "price":
           {
               "mswin": "$0.035/hour",
               "sles": "$0.037/hour",
               "mswinSQLWeb": "$0.081/hour",
               "rhel": "$0.087/hour",
               "linux": "$0.027/hour"
           },
           "ram": 613,
           "driver": "Amazon EC2 (ap-northeast-1)",
           "bandwidth": null,
           "disk": 15,
           "id": "t1.micro"
       },
       {
           "name": "Small Instance",
           "price":
           {
               "mswinSQL": "$0.706/hour",
               "mswinSQLWeb": "$0.161/hour",
               "mswin": "$0.115/hour",
               "rhel": "$0.155/hour",
               "linux": "$0.088/hour",
               "sles": "$0.122/hour"
           },
           "ram": 1740,
           "driver": "Amazon EC2 (ap-northeast-1)",
           "bandwidth": null,
           "disk": 160,
           "id": "m1.small"
       },
       {
           "name": "Medium Instance",
           "price":
           {
               "mswinSQL": "$0.821/hour",
               "mswinSQLWeb": "$0.276/hour",
               "mswin": "$0.23/hour",
               "rhel": "$0.22/hour",
               "linux": "$0.175/hour",
               "sles": "$0.234/hour"
           },
           "ram": 3700,
           "driver": "Amazon EC2 (ap-northeast-1)",
           "bandwidth": null,
           "disk": 410,
           "id": "m1.medium"
       },
       {
           "name": "Large Instance",
           "price":
           {
               "mswinSQL": "$1.051/hour",
               "mswinSQLWeb": "$0.506/hour",
               "mswin": "$0.46/hour",
               "rhel": "$0.419/hour",
               "linux": "$0.35/hour",
               "sles": "$0.465/hour"
           },
           "ram": 7680,
           "driver": "Amazon EC2 (ap-northeast-1)",
           "bandwidth": null,
           "disk": 850,
           "id": "m1.large"
       },
       {
           "name": "Extra Large Instance",
           "price":
           {
               "mswinSQL": "$1.511/hour",
               "mswinSQLWeb": "$0.966/hour",
               "mswin": "$0.92/hour",
               "rhel": "$0.769/hour",
               "linux": "$0.7/hour",
               "sles": "$0.815/hour"
           },
           "ram": 15360,
           "driver": "Amazon EC2 (ap-northeast-1)",
           "bandwidth": null,
           "disk": 1690,
           "id": "m1.xlarge"
       },
       {
           "name": "High-Memory Extra Large Instance",
           "price":
           {
               "mswinSQL": "$1.161/hour",
               "mswinSQLWeb": "$0.616/hour",
               "mswin": "$0.57/hour",
               "rhel": "$0.574/hour",
               "linux": "$0.505/hour",
               "sles": "$0.62/hour"
           },
           "ram": 17510,
           "driver": "Amazon EC2 (ap-northeast-1)",
           "bandwidth": null,
           "disk": 420,
           "id": "m2.xlarge"
       },
       {
           "name": "High-Memory Double Extra Large Instance",
           "price":
           {
               "mswinSQL": "$1.731/hour",
               "mswinSQLWeb": "$1.186/hour",
               "mswin": "$1.14/hour",
               "rhel": "$1.079/hour",
               "linux": "$1.01/hour",
               "sles": "$1.125/hour"
           },
           "ram": 35021,
           "driver": "Amazon EC2 (ap-northeast-1)",
           "bandwidth": null,
           "disk": 850,
           "id": "m2.2xlarge"
       }
    ]

.. http:get:: /backends/{backend_id}/locations

   List locations provided by backend

   **Example request**:

   .. sourcecode:: http

      GET /backends/2tK74h4mXbjjLlkjjO4SHn3/locations
      Host: mist.io
      Accept: application/json; charset=UTF-8

   **Example response**:

   .. sourcecode:: http

    [
       {
           "country": "Japan",
           "id": "0",
           "name": "ap-northeast-1a"
       },
       {
           "country": "Japan",
           "id": "1",
           "name": "ap-northeast-1b"
       },
       {
           "country": "Japan",
           "id": "2",
           "name": "ap-northeast-1c"
       }
    ]

