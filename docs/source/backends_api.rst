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

   In each POST API request, you have to include the ```Api-Version``` header

   .. sourcecode:: http

       {'Api-Version':2}


   **Add EC2 Backend**:

   .. sourcecode:: http

        {
            "title":"EC2 Ireland",
            "provider":"ec2",
            "region":"ec2_eu_west"
            "api_key":"POIHJOINPOIMIQCIHA",
            "api_secret":"09jLlilkjIU087JKHgjhguy90ur"
        }

   :jsonparam string title:  *(required)* Title of the backend
   :jsonparam string provider: *(required)* Provider as found in supported providers list
   :jsonparam string region: *(required)* Region Id, as found in the supported providers list
   :jsonparam string api_key: *(required)* EC2 API Key
   :jsonparam string api_secret: *(required)* EC2 API Secret

   **Add Openstack Backend**:

   .. sourcecode:: http

        {
            "title":"OpenStack",
            "provider":"openstack",
            "username":"myuser",
            "password":"superstronpassword",
            "auth_url":"http://31.53.71.90:5000/v2.0",
            "tenant_name":"mist"
        }

   :jsonparam string title:  *(required)* Title of the backend
   :jsonparam string provider: *(required)* Provider as found in supported providers list
   :jsonparam string username: *(required)* Username for Openstack
   :jsonparam string password: *(required)* Password for Openstack
   :jsonparam string auth_url: *(required)* Openstack Auth URL
   :jsonparam string tenant_name: *(required)* Tenant name
   :jsonparam string compute_endpoint: *(optional)* In case you have a custom endpoint for your Openstack installation
   :jsonparam string region: *(optional)* Specify a region of your Openstack installation

   **Add Rackspace backend**:

   .. sourcecode:: http

        {
            "title":"Rackspace Chicago",
            "provider":"rackspace",
            "region":"ord",
            "username":"myuser",
            "api_key":"oinoh*jhbJHVJHV77t8"
        }

   :jsonparam string title:  *(required)* Title of the backend
   :jsonparam string provider: *(required)* Provider as found in supported providers list
   :jsonparam string region: *(required)* Region Id as found in supported providers list
   :jsonparam string username: *(required)* Rackspace username
   :jsonparam string api_key: *(required)* Rackspace API Key

   **Add Nephoscale backend**:

   .. sourcecode:: http

        {
            "title":"MyNephoBackend",
            "provider":"nephoscale",
            "username":"myuser",
            "password":"nephopass"
        }

   :jsonparam string title:  *(required)* Title of the backend
   :jsonparam string provider: *(required)* Provider as found in supported providers list
   :jsonparam string username: *(required)* Nephoscale username
   :jsonparam string password: *(required)* Nephoscale password

   **Add Softlayer backend**:

   .. sourcecode:: http

        {
            "title":"MySoftLayerBackend",
            "provider":"softlayer",
            "username":"myuser",
            "api_key":"oinoh*jhbJHVJHV77t8"
        }

   :jsonparam string title:  *(required)* Title of the backend
   :jsonparam string provider: *(required)* Provider as found in supported providers list
   :jsonparam string username: *(required)* Softlayer username
   :jsonparam string api_key: *(required)* Softlayer API Key

   **Add Digital Ocean backend**:

   .. sourcecode:: http

        {
            "title":"DigiBackend",
            "provider":"digitalocean",
            "token":"dodjhLKJHiuyghv98756fugjhg7687uygjhgjgj",
        }

   :jsonparam string title:  *(required)* Title of the backend
   :jsonparam string provider: *(required)* Provider as found in supported providers list
   :jsonparam string token: *(required)* Generated Token from Digital Ocean


   **Add Google Compute Engine backend**:

   .. sourcecode:: http

        {
            "title":"MyGCE",
            "provider":"gce",
            "email":"0728979879798-908uioiui098098um0h75hb3l7lpj49r2q@developer.gserviceaccount.com",
            "project_id":"gifted-electron-100",
            "private_key":"-----BEGIN RSA PRIVATE KEY-----MIICXQIBAAKBgQDhU3C5COPsJ2XQadX6g1xAt6JCxW5CNkTnN81Z6RwBf6HeMUah..."
        }

   :jsonparam string title:  *(required)* Title of the backend
   :jsonparam string provider: *(required)* Provider as found in supported providers list
   :jsonparam string email: *(required)* Email Address generated by your GCE account
   :jsonparam string project_id: *(required)* You GCE Project's ID
   :jsonparam string private_key: *(required)* The Private Key you have generated for your GCE account

   **Add Azure backend**:

   .. sourcecode:: http

        {
            "title":"MyAzure",
            "provider":"azure",
            "subscription_id":"9087dsfhkjhakjfh-0987098hhjk-ohafkjhkjhkjah",
            "certificate":"-----BEGIN......."
        }

   :jsonparam string title:  *(required)* Title of the backend
   :jsonparam string provider: *(required)* Provider as found in supported providers list
   :jsonparam string subscription_id: *(required)* Subscription ID for your Azure account
   :jsonparam string certificate: *(required)* The Certificate you have generated for your Azure account

   **Add Linode backend**:

   .. sourcecode:: http

        {
            "title":"Linode",
            "provider":"linode",
            "api_key":"dodjhLKJHiuyghv98756fugjhg7687uygjhgjgj",
        }

   :jsonparam string title:  *(required)* Title of the backend
   :jsonparam string provider: *(required)* Provider as found in supported providers list
   :jsonparam string api_key: *(required)* The API Key for your Linode account

   **Add Docker backend**:

   .. sourcecode:: http

        {
            "title":"MyDocher",
            "provider":"docker",
            "docker_host":"http://10.0.0.1",
            "docker_port":"2375",
            "key_file":"-----BEGIN RSA PRIVATE KEY-----...",
            "cert_file":"-----BEGIN CERTIFICATE-----...."
        }

   :jsonparam string title:  *(required)* Title of the backend
   :jsonparam string provider: *(required)* Provider as found in supported providers list
   :jsonparam string docker_host: *(required)* The host of your Docker
   :jsonparam string docker_port: *(optional)* The port on which your Docker API is exposed to. By default will be ```4243```
   :jsonparam string key_file: *(optional)* For TLS connections, this is the content of your corresponding key.pem file
   :jsonparam string cert_file: *(optional)* For TLS connections, this is the content of your corresponding cert.pem file
   :jsonparam string auth_user: *(optional)* In case you have set up a basic auth in front of Docker, this will be the Auth User
   :jsonparam string auth_password: *(optional)* In case you have set up a basic auth in front of Docker, this will be the Auth Password

   **Add CoreOS backend**:

   .. sourcecode:: http

        {
            "title":"Core OS",
            "provider":"coreos",
            "machine_ip":"10.0.0.1",
            "machine_user":"root",
            "machine_key":"mySSHKey",
            "machine_port":"22"
        }

   :jsonparam string title:  *(required)* Title of the backend
   :jsonparam string provider: *(required)* Provider as found in supported providers list
   :jsonparam string machine_ip: *(required)* IP of your server
   :jsonparam string machine_user: *(optional)* User to connect with your server
   :jsonparam string machine_key: *(optional)* The SSH Key to connect with. This is the name of the Key you have previously added to mist.io.
   :jsonparam string machine_port: *(optional)* By default it will be ```22```, but you can alter this if your ssh-server listen to another port

   **Add HP Cloud backend**:

   .. sourcecode:: http

        {
            "title":"HP",
            "provider":"hpcloud:region-a.geo-1",
            "username":"myuser",
            "password":"hppass",
            "tenant_name":"mytenant"
        }

   :jsonparam string title:  *(required)* Title of the backend
   :jsonparam string provider: *(required)* Provider as found in supported providers list
   :jsonparam string username: *(required)* Username for your HP Cloud Account
   :jsonparam string password: *(required)* Password for your HP Cloud Account
   :jsonparam string tenant_name: *(required)* Tenant name for your HP Cloud Account

   **Add Single Server/Bare Metal Unix backend**:

   .. sourcecode:: http

        {
            "title":"MyServer",
            "provider":"bare_metal",
            "machine_ip":"10.0.0.1",
            "machine_user":"root",
            "machine_key":"mySSHKey",
            "machine_port":"22"
        }

   :jsonparam string title:  *(required)* Title of the backend
   :jsonparam string provider: *(required)* Provider as found in supported providers list
   :jsonparam string machine_ip: *(required)* IP of your server
   :jsonparam string machine_user: *(required)* User to connect with your server
   :jsonparam string machine_key: *(required)* The SSH Key to connect with. This is the name of the Key you have previously added to mist.io.
   :jsonparam string machine_port: *(optional)* By default it will be ```22```, but you can alter this if your ssh-server listen to another port

   **Add Windows Server backend**:

   .. sourcecode:: http

        {
            "title":"MyWindows",
            "provider":"bare_metal",
            "machine_ip":"10.0.0.1",
            "windows":true,
            "remote_desktop_port":"3389"
        }

   :jsonparam string title:  *(required)* Title of the backend
   :jsonparam string provider: *(required)* Provider as found in supported providers list
   :jsonparam string machine_ip: *(required)* IP of your server
   :jsonparam boolean windows: *(required)*  This boolean informs mist.io that this Bare Metal server is a Windows Server
   :jsonparam string remote_desktop_port: *(required)* The Remote Desktop Port of your Windows Server

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

