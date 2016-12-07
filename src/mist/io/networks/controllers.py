class NetworkController(object):
    def __init__(self, network):
        self.network = network

    def create_network(self, **network_args):
        return self.network.cloud.ctl.network.create_network(self.network, **network_args)

    def delete_network(self):
        return self.network.cloud.ctl.network.delete_network(self.network)

    def list_subnets(self):
        return self.network.cloud.ctl.network.list_subnets(self.network)


class SubnetController(object):
    def __init__(self, subnet):
        self.subnet = subnet

    def create_subnet(self, **subnet_args):
        return self.subnet.network.cloud.ctl.network.create_subnet(self.subnet, **subnet_args)

    def delete_subnet(self):
        return self.subnet.network.cloud.ctl.network.delete_subnet(self.subnet)
