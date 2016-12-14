class NetworkController(object):
    def __init__(self, network):
        """Initialize the network controller given a network.

            Most times one is expected to access a controller from inside the
            network object, like this:

            network = mist.io.networks.models.Network.objects.get(
            id=network_id) network.ctl.list_subnets()
        """
        self.network = network

    def create_network(self, **network_args):
        """ Used by Network.add to trigger network creation using the
        cloud's Network controller. """
        return self.network.cloud.ctl.network.create_network(self.network,
                                                             **network_args)

    def delete_network(self):
        """ Deletes the network."""
        return self.network.cloud.ctl.network.delete_network(self.network)

    def list_subnets(self):
        """ Returns the DB objects for all subnets attached to this network,
        if any. """
        return self.network.cloud.ctl.network.list_subnets(self.network)


class SubnetController(object):
    def __init__(self, subnet):
        """Initialize the subnet controller given a subnet.

            Most times one is expected to access a controller from inside the
            subnet object, like this:

            subnet = mist.io.networks.models.Subnet.objects.get(id=subnet_id)
            subnet.ctl.delete_subnet()
        """
        self.subnet = subnet

    def create_subnet(self, **subnet_args):
        """ Used by Subnet.add to trigger subnet creation using the cloud's
        Network controller. """
        network = self.subnet.network
        return network.cloud.ctl.network.create_subnet(self.subnet,
                                                       **subnet_args)

    def delete_subnet(self):
        """ Deletes the subnet."""
        network = self.subnet.network
        return network.cloud.ctl.network.delete_subnet(self.subnet)
