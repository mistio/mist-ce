.. http:get:: /providers

   List of all supported providers

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
