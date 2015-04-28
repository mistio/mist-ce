.. http:get:: /providers

   In each GET API request, you have to include the ```Api-Version``` header

   .. sourcecode:: http

       {'Api-Version':2}

   List of all supported providers

   **Example request**:

   .. sourcecode:: http

      GET /providers
      Host: mist.io
      Accept: application/json; charset=UTF-8

   **Example response**:

   .. sourcecode:: http

    {'supported_providers':
    [
      {'provider': 'bare_metal',
       'regions': [],
       'title': 'Other Server'},
      {'provider': 'azure', 'regions': [], 'title': 'Azure'},
      {'provider': 'ec2',
       'regions': [{'id': 'ec2_ap_northeast', 'location': 'Tokyo'},
        {'id': 'ec2_ap_southeast', 'location': 'Singapore'},
        {'id': 'ec2_ap_southeast_2', 'location': 'Sydney'},
        {'id': 'ec2_eu_west', 'location': 'Ireland'},
        {'id': 'ec2_sa_east', 'location': 'Sao Paulo'},
        {'id': 'ec2_us_east', 'location': 'N. Virginia'},
        {'id': 'ec2_us_west', 'location': 'N. California'},
        {'id': 'ec2_us_west_oregon', 'location': 'Oregon'}],
       'title': 'EC2'},
      {'provider': 'gce', 'regions': [], 'title': 'Google Compute Engine'},
      {'provider': 'nephoscale', 'regions': [], 'title': 'NephoScale'},
      {'provider': 'digitalocean', 'regions': [], 'title': 'DigitalOcean'},
      {'provider': 'linode', 'regions': [], 'title': 'Linode'},
      {'provider': 'openstack', 'regions': [], 'title': 'OpenStack'},
      {'provider': 'rackspace',
       'regions': [{'id': 'dfw', 'location': 'Dallas'},
        {'id': 'ord', 'location': 'Chicago'},
        {'id': 'iad', 'location': 'N. Virginia'},
        {'id': 'lon', 'location': 'London'},
        {'id': 'syd', 'location': 'Sydney'},
        {'id': 'hkg', 'location': 'Hong Kong'},
        {'id': 'rackspace_first_gen:us', 'location': 'US-First Gen'},
        {'id': 'rackspace_first_gen:uk', 'location': 'UK-First Gen'}],
       'title': 'Rackspace'},
      {'provider': 'softlayer', 'regions': [], 'title': 'SoftLayer'},
      {'provider': 'hpcloud',
       'regions': [{'id': 'region-a.geo-1', 'location': 'US West'},
        {'id': 'region-b.geo-1', 'location': 'US East'}],
       'title': 'HP Helion Cloud'},
      {'provider': 'docker', 'regions': [], 'title': 'Docker'},
      {'provider': 'vcloud', 'regions': [], 'title': 'VMware vCloud'}
      {'provider': 'indonesian_vcloud', 'regions': [],'title': 'Indonesian Cloud'},
      {'provider': 'libvirt', 'regions': [], 'title': 'KVM (via libvirt)'},
      {'provider': 'hostvirtual', 'regions': [], 'title': 'HostVirtual'}]},
      {u'provider': u'coreos', u'regions': [], u'title': u'CoreOS'},
      ]
      }
