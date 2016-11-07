from collections import namedtuple
from mist.io.clouds.controllers.network.models import Network, Subnet

MockNetwork = namedtuple('MockNetwork', ['name', 'id'])


def test_0_create_simple_network(cloud):
    print 'Testing Simple Network creation (no subnets) for provider: {}'.format(cloud.ctl.provider)
    if cloud.ctl.provider == 'gce':
        network_input = {'name': 'testnet', 'mode': 'auto'}
    else:
        network_input = {'name': 'testnet', 'cidr_block': '10.1.0.0/16'}
    new_network = cloud.ctl.network.create_network(network=network_input, subnet={}, router={})
    db_network = None
    try:
        assert isinstance(new_network, dict)
        assert new_network['network']['name'] == 'testnet'

        # Test if a Mongo document has been created for the new Network
        db_network = Network.objects.get(libcloud_id=new_network['network']['id'], title='testnet')
        assert isinstance(db_network, Network)
        assert db_network.title == new_network['network']['name']
        assert db_network.libcloud_id == new_network['network']['id']
        assert db_network.cloud == cloud
        assert db_network.subnets == []
        assert db_network.machines == []
        assert isinstance(db_network.extra, dict)

    except AssertionError as e:
        print 'Network creation test failed'
        raise e
    else:
        print 'Network creation test succeeded'
    finally:
        # Cleanup the network that was just created
        if db_network:
            cloud.ctl.network.delete_network(db_network.id)


def test_1_create_network_with_subnet(cloud):
    print 'Testing Network creation (including a subnet) for provider: {}'.format(cloud.ctl.provider)
    if cloud.ctl.provider == 'gce':
        network_input = {'name': 'testnet', 'mode': 'custom'}
        subnet_input = {'cidr': '10.1.1.0/24', 'availability_zone': '', 'name': 'testsubnet',
                        'region': 'us-west1'}
    else:
        network_input = {'name': 'testnet', 'cidr_block': '10.1.0.0/16'}
        subnet_input = {'cidr': '10.1.1.0/24', 'availability_zone': '', 'name': 'testsubnet'}
    new_network = cloud.ctl.network.create_network(network=network_input, subnet=subnet_input, router={})
    db_network = None
    try:
        assert isinstance(new_network, dict)
        assert new_network['network']['name'] == 'testnet'
        assert new_network['network']['subnets'][0]['name'] == 'testsubnet'

        # Test if a Mongo document has been created for the new Network
        db_network = Network.objects.get(libcloud_id=new_network['network']['id'], title='testnet')
        assert isinstance(db_network, Network)
        assert db_network.title == new_network['network']['name']
        assert db_network.libcloud_id == new_network['network']['id']
        assert db_network.cloud == cloud
        assert db_network.machines == []
        assert isinstance(db_network.extra, dict)

        # Test if a Mongo document has been created for the new Subnet
        db_subnet = Subnet.objects.get(libcloud_id=new_network['network']['subnets'][0]['id'], title='testsubnet')
        assert isinstance(db_subnet, Subnet)
        assert db_subnet.title == new_network['network']['subnets'][0]['name']
        assert db_subnet.libcloud_id == new_network['network']['subnets'][0]['id']
        assert db_subnet.cloud == cloud
        assert db_subnet.base_network == db_network
        assert isinstance(db_subnet.extra, dict)

        assert db_network.subnets == [db_subnet]

    except AssertionError as e:
        print 'Network creation test failed'
        raise e
    else:
        print 'Network creation test succeeded'
    finally:
        if db_network:
            cloud.ctl.network.delete_network(db_network.id)


def test_2_list_networks(cloud, load_reference_networks):
    network_return_format = {'public': [], 'private': [], 'routers': []}
    print 'Testing Network listing for provider: {}'.format(cloud.ctl.provider)
    networks = cloud.ctl.network.list_networks(network_return_format)
    reference_networks = load_reference_networks[cloud.ctl.provider]
    for network in networks:
        assert network in reference_networks


def test_3_delete_network(cloud):
    print 'Testing Network deletion for provider: {}'.format(cloud.ctl.provider)
    if cloud.ctl.provider == 'gce':
        network_input = {'name': 'testnettodelete', 'mode': 'custom'}
        subnet_input = {'cidr': '10.1.1.0/24', 'availability_zone': '', 'name': 'testsubnettodelete',
                        'region': 'us-west1'}
    else:
        network_input = {'name': 'testnettodelete', 'cidr_block': '10.1.0.0/16'}
        subnet_input = {'cidr': '10.1.1.0/24', 'availability_zone': '', 'name': 'testsubnettodelete'}
    new_network = cloud.ctl.network.create_network(network=network_input, subnet=subnet_input, router={})

    db_network = Network.objects.get(libcloud_id=new_network['network']['id'], title='testnettodelete')
    db_subnet = Subnet.objects.get(libcloud_id=new_network['network']['subnets'][0]['id'], title='testsubnettodelete')

    assert cloud.ctl.network.delete_network(db_network.id) is True

    try:
        db_network = Network.objects.get(libcloud_id=new_network['network']['id'], title='testnettodelete')
    except Network.DoesNotExist:
        pass
    else:
        print 'Failed to delete the Network from the DB'
        raise AssertionError

    try:
        db_subnet = Subnet.objects.get(libcloud_id=new_network['network']['subnets'][0]['id'], title='testnettodelete')
    except Subnet.DoesNotExist:
        pass
    else:
        print 'Failed to delete the Subnet from the DB'
        raise AssertionError
