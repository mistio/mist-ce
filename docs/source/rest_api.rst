REST API DOCUMENTATION
**********************

This is a detailed documentation of our API

.. http:get:: /providers

   List of all supported providers.

   **Example request**:

   .. sourcecode:: http

      GET /providers
      Host: mist.io
      Accept: application/json; charset=UTF-8

   **Example response**:

   .. sourcecode:: http

        {
          "supported_providers": [
            {
              "provider": "bare_metal",
              "title": "Bare Metal Server"
            },
            {
              "provider": "ec2_ap_northeast",
              "title": "EC2 AP NORTHEAST"
            },
            {
              "provider": "ec2_ap_southeast",
              "title": "EC2 AP SOUTHEAST"
            },
            {
              "provider": "ec2_ap_southeast_2",
              "title": "EC2 AP Sydney"
            },
            {
              "provider": "ec2_eu_west",
              "title": "EC2 EU Ireland"
            },
            {
              "provider": "ec2_sa_east",
              "title": "EC2 SA EAST"
            },
            {
              "provider": "ec2_us_east",
              "title": "EC2 US EAST"
            },
            {
              "provider": "ec2_us_west",
              "title": "EC2 US WEST"
            },
            {
              "provider": "ec2_us_west_oregon",
              "title": "EC2 US WEST OREGON"
            },
            {
              "provider": "nephoscale",
              "title": "NephoScale"
            },
            {
              "provider": "digitalocean",
              "title": "DigitalOcean"
            },
            {
              "provider": "linode",
              "title": "Linode"
            },
            {
              "provider": "openstack",
              "title": "OpenStack"
            },
            {
              "provider": "rackspace:dfw",
              "title": "Rackspace DFW"
            },
            {
              "provider": "rackspace:ord",
              "title": "Rackspace ORD"
            },
            {
              "provider": "rackspace:iad",
              "title": "Rackspace IAD"
            },
            {
              "provider": "rackspace:lon",
              "title": "Rackspace LON"
            },
            {
              "provider": "rackspace:syd",
              "title": "Rackspace AU"
            },
            {
              "provider": "rackspace_first_gen:us",
              "title": "Rackspace US (OLD)"
            },
            {
              "provider": "rackspace_first_gen:uk",
              "title": "Rackspace UK (OLD)"
            },
            {
              "provider": "softlayer",
              "title": "SoftLayer"
            },
            {
              "provider": "openstack:az-1.region-a.geo-1",
              "title": "HP Cloud US West AZ 1"
            },
            {
              "provider": "openstack:az-2.region-a.geo-1",
              "title": "HP Cloud US West AZ 2"
            },
            {
              "provider": "openstack:az-3.region-a.geo-1",
              "title": "HP Cloud US West AZ 3"
            },
            {
              "provider": "openstack:region-b.geo-1",
              "title": "HP Cloud US East"
            }
          ]
        }

   :query sort: one of ``hit``, ``created-at``
   :query offset: offset number. default is 0
   :query limit: limit number. default is 30
   :reqheader Accept: the response content type depends on
                      :mailheader:`Accept` header
   :reqheader Authorization: optional OAuth token to authenticate
   :resheader Content-Type: this depends on :mailheader:`Accept`
                            header of request
   :statuscode 200: no error
   :statuscode 404: there's no user

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

.. http:get:: /keys

   List added keys.

   **Example request**:

   .. sourcecode:: http

      GET /keys
      Host: mist.io
      Accept: application/json; charset=UTF-8

   **Example response**:

   .. sourcecode:: http

    [
       {
           "default_key": true,
           "id": "passwordless",
           "machines":
           [
               [
                   "2tK74h4mXbjqXfKQxESgzqc4SHn3",
                   "i-c0ca59c5",
                   1389715866.596957,
                   "ec2-user",
                   "true"
               ]
           ],
           "name": "passwordless"
       },
       {
           "default_key": false,
           "id": "Key2",
           "machines":
           [
           ],
           "name": "Key 2"
       }
    ]

   *For each Key a list of associated machines is returned with backend_id, machine_id, username_of_machine, if_sudo*

.. http:put:: /keys

   Add Key.

   **Example request**:

   .. sourcecode:: http

      PUT /keys
      Host: mist.io
      Accept: application/json; charset=UTF-8

      {
        "name":"MyKey",
        "priv":"-----BEGIN RSA PRIVATE KEY-----OoiknlOnNJNKCAQEAtbBji1OMHW2bS2Va..."
      }

   :jsonparam string name:  *required* Name of new key
   :jsonparam string priv:  *required* Private ssh key

.. http:post:: /keys

   Ask mist to generate a new private key.

   **Example request**:

   .. sourcecode:: http

      GET /keys
      Host: mist.io
      Accept: application/json; charset=UTF-8

   **Example response**:

   .. sourcecode:: http

      {
        "priv":"-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCA..."
      }

.. http:delete:: /keys/{key_id}

   Delete key

   **Example request**:

   .. sourcecode:: http

      DELETE /keys/{key_id}
      Host: mist.io
      Accept: application/json; charset=UTF-8

.. http:put:: /keys/{key_id}

   Rename key.

   **Example request**:

   .. sourcecode:: http

      PUT /keys/{key_id}
      Host: mist.io
      Accept: application/json; charset=UTF-8

      {
        "newName":"New Key Name"
      }

   :jsonparam string newName:  *required* New name for key

.. http:post:: /keys/{key_id}

   Set default key

   **Example request**:

   .. sourcecode:: http

      POST /keys/{key_id}
      Host: mist.io
      Accept: application/json; charset=UTF-8

.. http:get:: /keys/{key_id}?action=private

   Get private key.

   **Example request**:

   .. sourcecode:: http

      GET /keys/{key_id}?action=private
      Host: mist.io
      Accept: application/json; charset=UTF-8

   **Example response**:

   .. sourcecode:: http

    "-----BEGIN RSA PRIVATE KEY-----\nMIIE..."

.. http:get:: /keys/{key_id}?action=public

   Get public key.

   **Example request**:

   .. sourcecode:: http

      GET /keys/{key_id}?action=public
      Host: mist.io
      Accept: application/json; charset=UTF-8

   **Example response**:

   .. sourcecode:: http

    "ssh-rsa AAAAB3NzaC1yc2EAAAADAQA..."
