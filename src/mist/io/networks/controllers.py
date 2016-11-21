class NetworkController(object):
    def __init__(self, network):
        self.network = network

    def create_network(self, **network_args):
        return self.network.cloud.ctl.network.create_network(self.network, **network_args)

    def delete_network(self, **kwargs):
        return self.network.cloud.ctl.network.delete_network(self.network, **kwargs)

    def list_subnets(self, **kwargs):
        return self.network.cloud.ctl.network.list_subnets(for_network=self.network, **kwargs)


class SubnetController(object):
    def __init__(self, subnet):
        self.subnet = subnet

    def create_subnet(self, **subnet_args):
        return self.subnet.cloud.ctl.network.create_subnet(self.subnet, **subnet_args)

    def delete_subnet(self, **kwargs):
        return self.subnet.cloud.ctl.network.delete_subnet(self.subnet, **kwargs)
