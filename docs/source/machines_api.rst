.. http:get:: /clouds/{cloud_id}/machines

   List of all added machines for this cloud

   **Example request**:

   .. sourcecode:: http

      GET /clouds/2tK74h4mXbjjLlkjjO4SHn3/machines
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

.. http:post:: /clouds/{cloud_id}/machines

   Create machine

   **Example request**:

   .. sourcecode:: http

    POST /clouds/2tK74h4mXbjjLlkjjO4SHn3/machines
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

   :jsonparam string name:  *required* Name of the machine
   :jsonparam string key:  *required* The id of the key to be associated with the machine
   :jsonparam string image:  *required* Id of image to be used
   :jsonparam string location:  *required* Id of the location to be used
   :jsonparam string size:  *required* Id of size to be used
   :jsonparam string name:  *required* Bash command to be run when machine is initiated, given as a string
   :jsonparam string image_extra:  *required* Needed only by Linode cloud, otherwise empty string
   :jsonparam string disk:  *required* Needed only by Linode cloud, otherwise empty string

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

.. http:post:: /clouds/{cloud_id}/machines/{machine_id}

   Machine actions like reboot, destroy, shutdown and start

   **Example request**:

   .. sourcecode:: http

      POST /clouds/2tK74h4mXbjjLlkjjO4SHn3/machines/i-50aa7257
      Host: mist.io
      Accept: application/json; charset=UTF-8

    {
        "action":"reboot"
    }


   :jsonparam string action: *required* Can be reboot, shutdown, start or destroy depending on the available actions for each machine

.. http:post:: /clouds/{cloud_id}/machines/{machine_id}/metadata

   Add tags/metadata for machine

   **Example request**:

   .. sourcecode:: http

      POST /clouds/2tK74h4mXbjjLlkjjO4SHn3/machines/i-50aa7257/metadata
      Host: mist.io
      Accept: application/json; charset=UTF-8

      {
          "tag":"Backup Machine"
      }

   :jsonparam string tag:  *required* Tags are used as metadata for each machine and can be handy to group machines with same tags
