.. http:get:: /backends/{backend_id}/machines

   List of all added machines for this backend

   **Example request**:

   .. sourcecode:: http

      GET /backends/2tK74h4mXbjjLlkjjO4SHn3/machines
      Host: mist.io
      Accept: application/json; charset=UTF-8

   **Example response**:

   .. sourcecode:: http

    [
       {
           "can_start": false,
           "can_reboot": true,
           "uuid": "447c23edbe944911f23145538915865ebddec230",
           "name": "i-5ebfdc59",
           "tags":
           [
               "ap-northeast-1a"
           ],
           "can_stop": true,
           "can_destroy": true,
           "extra":
           {
               "status": "running",
               "productcode":
               [
               ],
               "groups":
               [
                   null
               ],
               "tags":
               {
               },
               "instanceId": "i-5ebfdc59",
               "dns_name": "ec2-173-21-215-201.ap-northeast-1.compute.amazonaws.com",
               "launchdatetime": "2014-01-13T13:58:03.000Z",
               "iam_profile": null,
               "imageId": "ami-2f61fe2e",
               "kernelid": "aki-42992843",
               "keyname": "Mykey",
               "availability": "ap-northeast-1a",
               "clienttoken": "",
               "launchindex": "0",
               "ramdiskid": null,
               "private_dns": "ip-10-153-6-20.ap-northeast-1.compute.internal",
               "instancetype": "t1.micro"
           },
           "public_ips":
           [
               "170.21.215.111"
           ],
           "private_ips":
           [
               "10.153.6.20"
           ],
           "imageId": "ami-2f61fe2e",
           "state": "running",
           "can_tag": true,
           "id": "i-5ebfdc59",
           "size": "t1.micro"
       }
    ]

.. http:post:: /backends/{backend_id}/machines

   Create machine

   **Example request**:

   .. sourcecode:: http

    POST /backends/2tK74h4mXbjjLlkjjO4SHn3/machines
    Host: mist.io
    Accept: application/json; charset=UTF-8

    {
        "name":"WebServer 3",
        "key":"MyKey2",
        "image":"ami-2f61fe2e",
        "location":"0",
        "size":"t1.micro",
        "script":"echo `uptime` > new_file.txt",
        "image_extra":"",
        "disk":""
    }

   **Example response**:

   .. sourcecode:: http

    {
       "public_ips":
       [
           "50.253.51.216"
       ],
       "extra":
       {
           "status": "running",
           "productcode":
           [
           ],
           "groups":
           [
               null
           ],
           "tags":
           {
               "Name": "WebServer 3"
           },
           "instanceId": "i-50dd7257",
           "dns_name": "ec2-50-253-51-216.ap-northeast-1.compute.amazonaws.com",
           "launchdatetime": "2014-01-15T05:37:50.000Z",
           "iam_profile": null,
           "imageId": "ami-2f61fe2e",
           "kernelid": "aki-42992843",
           "keyname": "MyKey2",
           "availability": "ap-northeast-1a",
           "clienttoken": "",
           "launchindex": "0",
           "ramdiskid": null,
           "private_dns": "ip-10-160-226-156.ap-northeast-1.compute.internal",
           "instancetype": "t1.micro"
       },
       "id": "i-50dd7257",
       "private_ips":
       [
           "10.160.226.156"
       ],
       "name": "WebServer 3"
    }


   **Create Machine on EC2**:

   .. sourcecode:: http

        {
            "name":"devserver",
            "key":"mysshkey",
            "size":"t1.micro",
            "script":"echo 1 > /root/config",
            "image":"ami-7c356d2e",
            "location":"0",
            "monitoring": true,
        }

   :jsonparam string name:  *required* Name of the machine
   :jsonparam string key:  *required* The id of the key to be associated with the machine
   :jsonparam string image:  *required* Id of image to be used
   :jsonparam string location:  *required* Id of the location to be used
   :jsonparam string size:  *required* Id of size to be used
   :jsonparam string script: *optional* Script to run after the machine is provisioned
   :jsonparam boolean monitoring: *optional* If true, Mist will enable monitoring for this machine

   **Create Machine on Azure**:

   .. sourcecode:: http

        {
            "name":"devserver",
            "key":"mysshkey",
            "size":"ExtraSmall",
            "script":"echo 1 > /root/config",
            "image":"2b171e93f07c4903bcad35bda10acf22__CoreOS-Stable-633.1.0",
            "location":"West US",
            "monitoring": true,
        }

   :jsonparam string name:  *required* Name of the machine
   :jsonparam string key:  *required* The id of the key to be associated with the machine
   :jsonparam string image:  *required* Id of image to be used
   :jsonparam string location:  *required* Id of the location to be used
   :jsonparam string size:  *required* Id of size to be used
   :jsonparam string script: *optional* Script to run after the machine is provisioned
   :jsonparam boolean monitoring: *optional* If true, Mist will enable monitoring for this machine

   **Create Machine on DigitalOcean**:

   .. sourcecode:: http

        {
            "name":"devserver",
            "key":"mysshkey",
            "size":"512mb",
            "script":"echo 1 > /root/config",
            "image":"7572830",
            "location":"sfo1",
            "monitoring": true,
        }

   :jsonparam string name:  *required* Name of the machine
   :jsonparam string key:  *required* The id of the key to be associated with the machine
   :jsonparam string image:  *required* Id of image to be used
   :jsonparam string location:  *required* Id of the location to be used
   :jsonparam string size:  *required* Id of size to be used
   :jsonparam string script: *optional* Script to run after the machine is provisioned
   :jsonparam boolean monitoring: *optional* If true, Mist will enable monitoring for this machine

   **Create Container on Docker**:

   .. sourcecode:: http

        {
            "name":"UbuntuContainer",
            "key":"mysshkey",
            "size":"default",
            "image":"d0955f21bf24f5bfffd32d2d0bb669d0564701c271bc3dfc64cfc5adfdec2d07",
            "docker_env":
            {
                "SOMEVAR": "True",
                "SOMEOTHERVAR": "False"
            },
            "docker_command": "/bin/bash",
            "docker_exposed_ports":
            {
                "8888/tcp": {},
                "4977/tcp": {}
            },
              "docker_port_bindings":
              {
                    "8888/tcp":
                    [
                      {
                        "HostPort": "88888"
                      }
                    ],
                    "4977/tcp":
                    [
                      {
                        "HostPort": "4977"
                      }
                    ]
              }
        }

   :jsonparam string name:  *required* Name of the machine
   :jsonparam string key:  *optional* The id of the key to be associated with the machine
   :jsonparam string image:  *required* Id of image to be used
   :jsonparam string location:  *required* Id of the location to be used
   :jsonparam string size:  *required* Id of size to be used
   :jsonparam dict docker_env: *optional* Here you specify Environmental Variables for your docker container
   :jsonparam dict docker_exposed_ports: *optional* If you want to expose some ports, specify them here, with this format
   :jsonparam dict docker_port_bindings: *optional* Specify the port bindings for your exposed ports
   :jsonparam string docker_command: *required* Here you specify the command to run

   **Create Machine on GCE (Google Compute Engine)**:

   .. sourcecode:: http

        {
            "name":"devserver",
            "key":"mysshkey",
            "size":"1000",
            "script":"echo 1 > /root/config",
            "image":"5298942163210525420",
            "location":"2221",
            "monitoring": true,
        }

   :jsonparam string name:  *required* Name of the machine
   :jsonparam string key:  *required* The id of the key to be associated with the machine
   :jsonparam string image:  *required* Id of image to be used
   :jsonparam string location:  *required* Id of the location to be used
   :jsonparam string size:  *required* Id of size to be used
   :jsonparam string script: *optional* Script to run after the machine is provisioned
   :jsonparam boolean monitoring: *optional* If true, Mist will enable monitoring for this machine


.. http:post:: /backends/{backend_id}/machines/{machine_id}

   Machine actions like reboot, destroy, shutdown and start

   **Example request**:

   .. sourcecode:: http

      POST /backends/2tK74h4mXbjjLlkjjO4SHn3/machines/i-50aa7257
      Host: mist.io
      Accept: application/json; charset=UTF-8

    {
        "action":"reboot"
    }


   :jsonparam string action: *required* Can be reboot, shutdown, start or destroy depending on the available actions for each machine

.. http:post:: /backends/{backend_id}/machines/{machine_id}/metadata

   Add tags/metadata for machine

   **Example request**:

   .. sourcecode:: http

      POST /backends/2tK74h4mXbjjLlkjjO4SHn3/machines/i-50aa7257/metadata
      Host: mist.io
      Accept: application/json; charset=UTF-8

      {
          "tag":"Backup Machine"
      }

   :jsonparam string tag:  *required* Tags are used as metadata for each machine and can be handy to group machines with same tags
