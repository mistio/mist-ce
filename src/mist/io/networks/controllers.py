class NetworkController(object):
    def __init__(self, network):
        """Initialize the `NetworkController` given a network.

        Most times one is expected to access a controller from inside the
        network object, like this:

          network = mist.io.networks.models.Network.objects.get(id=network_id)
          network.ctl.list_subnets()

        """
        self.network = network
        self.cloud = network.cloud

    def create(self, **kwargs):
        """Create `self.network`."""
        return self.cloud.ctl.network.create_network(self.network, **kwargs)

    def delete(self):
        """Delete `self.network`."""
        return self.cloud.ctl.network.delete_network(self.network)

    def list_subnets(self):
        """Returns a list of subnets in the current network."""
        return self.cloud.ctl.network.list_subnets(self.network)


class SubnetController(object):
    def __init__(self, subnet):
        """Initialize the `SubnetController` given a subnet.

        Most times one is expected to access a controller from inside the
        subnet object, like this:

          subnet = mist.io.networks.models.Subnet.objects.get(id=subnet_id)
          subnet.ctl.delete()

        """
        self.subnet = subnet
        self.cloud = subnet.network.cloud

    def create(self, **kwargs):
        """Create `self.subnet`."""
        return self.cloud.ctl.network.create_subnet(self.subnet, **kwargs)

    def delete(self):
        """Delete `self.subnet`."""
        return self.cloud.ctl.network.delete_subnet(self.subnet)
