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

    {u'supported_providers':
    [
      {u'provider': u'bare_metal',
       u'regions': [],
       u'title': u'Other Server'},
      {u'provider': u'azure', u'regions': [], u'title': u'Azure'},
      {u'provider': u'ec2',
       u'regions': [{u'id': u'ec2_ap_northeast', u'location': u'Tokyo'},
        {u'id': u'ec2_ap_southeast', u'location': u'Singapore'},
        {u'id': u'ec2_ap_southeast_2', u'location': u'Sydney'},
        {u'id': u'ec2_eu_west', u'location': u'Ireland'},
        {u'id': u'ec2_sa_east', u'location': u'Sao Paulo'},
        {u'id': u'ec2_us_east', u'location': u'N. Virginia'},
        {u'id': u'ec2_us_west', u'location': u'N. California'},
        {u'id': u'ec2_us_west_oregon', u'location': u'Oregon'}],
       u'title': u'EC2'},
      {u'provider': u'gce', u'regions': [], u'title': u'Google Compute Engine'},
      {u'provider': u'nephoscale', u'regions': [], u'title': u'NephoScale'},
      {u'provider': u'digitalocean', u'regions': [], u'title': u'DigitalOcean'},
      {u'provider': u'linode', u'regions': [], u'title': u'Linode'},
      {u'provider': u'openstack', u'regions': [], u'title': u'OpenStack'},
      {u'provider': u'rackspace',
       u'regions': [{u'id': u'dfw', u'location': u'Dallas'},
        {u'id': u'ord', u'location': u'Chicago'},
        {u'id': u'iad', u'location': u'N. Virginia'},
        {u'id': u'lon', u'location': u'London'},
        {u'id': u'syd', u'location': u'Sydney'},
        {u'id': u'hkg', u'location': u'Hong Kong'},
        {u'id': u'rackspace_first_gen:us', u'location': u'US-First Gen'},
        {u'id': u'rackspace_first_gen:uk', u'location': u'UK-First Gen'}],
       u'title': u'Rackspace'},
      {u'provider': u'softlayer', u'regions': [], u'title': u'SoftLayer'},
      {u'provider': u'hpcloud',
       u'regions': [{u'id': u'region-a.geo-1', u'location': u'US West'},
        {u'id': u'region-b.geo-1', u'location': u'US East'}],
       u'title': u'HP Helion Cloud'},
      {u'provider': u'docker', u'regions': [], u'title': u'Docker'},
      {u'provider': u'vcloud', u'regions': [], u'title': u'VMware vCloud'}
      ]
      }
