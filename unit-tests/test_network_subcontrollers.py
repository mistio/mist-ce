from collections import namedtuple
from mist.io.clouds.controllers.network.models import Network, Subnet

MockNetwork = namedtuple('MockNetwork', ['name', 'id'])


def test_0_list_networks(cloud, load_reference_networks):
    network_return_format = {'public': [], 'private': [], 'routers': []}
    print 'Testing Network listing for provider: {}'.format(cloud.ctl.provider)
    networks = cloud.ctl.network.list_networks(network_return_format)
    assert networks == load_reference_networks[cloud.ctl.provider]


def test_1_create_simple_network(cloud):
    print 'Testing Simple Network creation (no subnets) for provider: {}'.format(cloud.ctl.provider)
    network_input = {'name': 'TestNet', 'cidr_block': '10.1.0.0/16'}
    new_network = cloud.ctl.network.create_network(network=network_input, subnet={}, router={})
    try:
        assert isinstance(new_network, dict)
        assert new_network['network']['name'] == 'TestNet'
        # TODO: Test other attributes and check DB objects
    except AssertionError as e:
        print 'Network creation test failed'
        raise e
    else:
        # Cleanup the network that was just created
        cloud.ctl.network.connection.ex_delete_network(MockNetwork(id=new_network['network']['id'],
                                                                   name=new_network['network']['name']))
        # TODO: Test controller deletion and DB object removal


def test_2_create_network_with_subnet(cloud):
    print 'Testing Network creation (including a subnet) for provider: {}'.format(cloud.ctl.provider)
    network_input = {'name': 'TestNet', 'cidr_block': '10.1.0.0/16'}
    subnet_input = {'cidr': '10.1.1.0/24', 'availability_zone': '', 'name': 'TestSubnet'}
    new_network = cloud.ctl.network.create_network(network=network_input, subnet=subnet_input, router={})
    try:
        assert isinstance(new_network, dict)
        assert new_network['network']['name'] == 'TestNet'
        assert new_network['network']['subnets'][0]['name'] == 'TestSubnet'
        # TODO: Test other attributes and check DB objects
    except AssertionError as e:
        print 'Network creation test failed'
        raise e
    else:
        # Cleanup the subnet that was just created
        cloud.ctl.network.connection.ex_delete_subnet(MockNetwork(id=new_network['network']['subnets'][0]['id'],
                                                                  name=new_network['network']['subnets'][0]['name']))

        # Cleanup the network that was just created
        cloud.ctl.network.connection.ex_delete_network(MockNetwork(id=new_network['network']['id'],
                                                                   name=new_network['network']['name']))

        # TODO: Test controller deletion and DB object removal
