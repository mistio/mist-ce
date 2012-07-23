"""Testing module"""
import unittest
from pyramid import testing


class ViewTests(unittest.TestCase):
    """For the moment these are very basic"""
    def setUp(self):
        self.config = testing.setUp()

    def tearDown(self):
        testing.tearDown()

    def test_home(self):
        """Testing if home has the correct project name"""
        from mist.io.views import home
        request = testing.DummyRequest()
        info = home(request)
        self.assertEqual(info['project'], 'mist.io')
