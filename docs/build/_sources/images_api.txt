.. http:get:: /clouds/{cloud_id}/images

   List available images for this cloud

   **Example request**:

   .. sourcecode:: http

      GET /clouds/2tK74h4mXbjjLlkjjO4SHn3/images
      Host: mist.io
      Accept: application/json; charset=UTF-8

      {
        "search_term":"Gentoo"
      }

   :jsonparam string search_term:  *not required*
   If search_term is given, mist will return only images that include the search term, otherwise
   mist will return all available images for the given cloud. If the given cloud is an EC2 Cloud, mist will
   search through all EC2 images including community and custom images.

   **Example response**:

   .. sourcecode:: http

    [
        {
           "star": false,
           "id": "73764eb8-3c1c-42a9-8fff-71f6beefc6a7",
           "name": "Gentoo 13.3",
           "extra":
           {
               "status": "ACTIVE",
               "updated": "2013-11-21T19:12:29Z",
               "created": "2013-10-15T20:02:10Z",
               "minDisk": 0,
               "progress": 100,
               "minRam": 512,
               "serverId": null,
               "metadata":
               {
                   "os_distro": "gentoo",
                   "com.rackspace__1__visible_core": "1",
                   "com.rackspace__1__build_rackconnect": "0",
                   "com.rackspace__1__release_id": "600",
                   "image_type": "base",
                   "com.rackspace__1__release_build_date": "2013-10-15_11-22-13",
                   "com.rackspace__1__source": "kickstart",
                   "org.openstack__1__os_distro": "org.gentoo",
                   "cache_in_nova": "True",
                   "com.rackspace__1__visible_rackconnect": "1",
                   "com.rackspace__1__release_version": "6",
                   "com.rackspace__1__platform_target": "PublicCloud",
                   "org.openstack__1__os_version": "13.3",
                   "auto_disk_config": "True",
                   "com.rackspace__1__options": "0",
                   "os_type": "linux",
                   "com.rackspace__1__build_core": "1",
                   "com.rackspace__1__visible_managed": "0",
                   "org.openstack__1__architecture": "x64",
                   "com.rackspace__1__build_managed": "0"
               }
           }
        }
    ]

