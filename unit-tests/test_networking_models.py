import mist.io.networks.models
import mist.io.clouds.models
from mist.io.clouds.controllers.main.base import BaseMainController
from mist.io.clouds.controllers.compute.base import BaseComputeController
from mist.io.clouds.controllers.network.base import BaseNetworkController
from mongoengine import ValidationError


class MockComputeController(BaseComputeController):
    pass


class MockNetworkController(BaseNetworkController):
    pass


class MockCloudController(BaseMainController):
    provider = 'mock'
    ComputeController = MockComputeController
    NetworkController = MockNetworkController


class MockCloud(mist.io.clouds.models.Cloud):
    _controller_cls = MockCloudController


class TestNetworkModels(object):
    dummy_cloud = MockCloud()

    @staticmethod
    def validates(model):
        try:
            model.validate(clean=True)
        except ValidationError:
            return False
        return True

    def test_ec2_cidr_validation(self):
        network = mist.io.networks.models.AmazonNetwork(cloud=self.dummy_cloud)
        network.cidr = '10.1.1.0/24'
        assert self.validates(network), 'Valid CIDR failed validate()'

        network.cidr = '999.1.1.0/24'
        assert not self.validates(network), 'Invalid CIDR passed validation'

        network.cidr = 1
        assert not self.validates(network), 'Invalid CIDR passed validation'

        network.cidr = None
        assert not self.validates(network), 'Invalid CIDR passed validation'

    def test_ec2_tenancy_validation(self):
        network = mist.io.networks.models.AmazonNetwork(cloud=self.dummy_cloud)
        network.cidr = '10.1.1.0/24'
        network.instance_tenancy = 'default'
        assert self.validates(network), 'Valid tenancy failed validate()'

        network.instance_tenancy = 'private'
        assert self.validates(network), 'Valid tenancy failed validate()'

        network.instance_tenancy = 'public'
        assert not self.validates(network), 'Invalid tenancy passed validation'

    def test_gce_mode_validation(self):
        network = mist.io.networks.models.GoogleNetwork(cloud=self.dummy_cloud)
        network.title = 'test'
        network.mode = 'legacy'
        network.cidr = '10.1.1.0/24'
        assert self.validates(network), 'Legacy: Valid CIDR failed validate()'

        network.cidr = '999.1.1.0/24'
        assert not self.validates(network), \
            'Legacy: Invalid CIDR passed validation'

        network.cidr = 1
        assert not self.validates(network), \
            'Legacy: Invalid CIDR passed validation'

        network.cidr = None
        assert not self.validates(network), \
            'Legacy: Invalid CIDR passed validation'

        network.mode = 'auto'

        assert self.validates(network), \
            'Auto: None CIDR failed validate()'

        network.cidr = '10.1.1.0/24'

        assert not self.validates(network), \
            'Auto: Passed validate() with CIDR'

        network.mode = 'custom'
        network.cidr = None

        assert self.validates(network), \
            'Custom: None CIDR failed validate()'

        network.cidr = '10.1.1.0/24'

        assert not self.validates(network), \
            'Custom: Passed validate() with CIDR'

        network.mode = 'other'

        assert not self.validates(network), \
            'Invalid mode passed validate() '

    def test_gce_name_validation(self):
        network = mist.io.networks.models.GoogleNetwork(cloud=self.dummy_cloud)
        network.title = 'test'
        network.mode = 'auto'
        assert self.validates(network), 'GCE: valid name failed validate()'

        network.title = 'Test'
        assert not self.validates(network), 'GCE: invalid name passed ' \
                                            'validate()'
        network.title = 'tesT'
        assert not self.validates(network), 'GCE: invalid name passed ' \
                                            'validate()'
        network.title = '1test'
        assert not self.validates(network), 'GCE: invalid name passed ' \
                                            'validate()'
        network.title = '-test-'
        assert not self.validates(network), 'GCE: invalid name passed ' \
                                            'validate()'

    def test_openstack_validation(self):

        network = \
            mist.io.networks.models.OpenStackNetwork(cloud=self.dummy_cloud)
        network.title = 'test'
        assert self.validates(network), 'Valid model failed validate()'

        network.shared = False
        network.admin_state_up = False

        assert self.validates(network), 'Valid model failed validate()'


class TestSubnetModels(object):
    dummy_network = mist.io.networks.models.Network(cloud=MockCloud())

    @staticmethod
    def validates(model):
        try:
            model.validate(clean=True)
        except ValidationError:
            return False
        return True

    def test_cidr_validation(self):
        # Subnet CIDR validation is common to all Subnet subclasses
        subnet = mist.io.networks.models.Subnet(network=self.dummy_network)
        subnet.title = 'test'

        assert not self.validates(subnet), 'Subnet with no CIDR passed ' \
                                           'validation'

        subnet.cidr = '10.1.1.0/24'
        assert self.validates(subnet), 'Valid CIDR failed validate()'

        subnet.cidr = '999.1.1.0/24'
        assert not self.validates(subnet), 'Invalid CIDR passed validation'

        subnet.cidr = 1
        assert not self.validates(subnet), 'Invalid CIDR passed validation'

        subnet.cidr = None
        assert not self.validates(subnet), 'Invalid CIDR passed validation'

    def test_ec2_availability_zone(self):
        subnet = mist.io.networks.models.AmazonSubnet(
            network=self.dummy_network)
        subnet.cidr = '10.1.1.0/24'

        assert not self.validates(subnet), 'EC2 Subnet without a zone ' \
                                            'passed validation'

        subnet.availability_zone = 'us-west-1a'
        assert self.validates(subnet), 'Valid EC2 Subnet failed validation'

    def test_gce_name_validation(self):
        subnet = mist.io.networks.models.GoogleSubnet(
            network=self.dummy_network)
        subnet.title = 'test'
        subnet.cidr = '10.1.1.0/24'

        assert not self.validates(subnet), 'GCE: subnet with no region ' \
                                           'passed validate()'

        subnet.region = 'us-west-1'

        assert self.validates(subnet), 'GCE: valid name failed validate()'

        subnet.title = 'Test'
        assert not self.validates(subnet), 'GCE: invalid name passed ' \
                                            'validate()'
        subnet.title = 'tesT'
        assert not self.validates(subnet), 'GCE: invalid name passed ' \
                                            'validate()'
        subnet.title = '1test'
        assert not self.validates(subnet), 'GCE: invalid name passed ' \
                                            'validate()'
        subnet.title = '-test-'
        assert not self.validates(subnet), 'GCE: invalid name passed ' \
                                            'validate()'





