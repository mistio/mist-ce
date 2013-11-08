import os
import unittest
import TestsApi.backends as backends
import TestsApi.keypairs as keypairs
import TestsApi.machines as machines
import yaml
from Crypto.PublicKey import RSA

class TestClass(unittest.TestCase):
    """
    A basic TestClass for nose to find
    """


    def setUp(self):
        self.path = os.getcwd() + "/TestsApi/tests_config.yaml"
        config_file = open(self.path, 'r')
        self.test_config = yaml.load(config_file) or {}
        config_file.close()

        self.uri = self.test_config['MIST_URI']
        self.credentials = self.test_config['BACKEND_KEYS']

        try:
            self.supported_providers = self.test_config['SUPPORTED_PROVIDERS']
        except:
            self.supported_providers = []

    def tearDown(self):
        class folded_unicode(unicode): pass
        class literal_unicode(unicode): pass

        def literal_unicode_representer(dumper, data):
            return dumper.represent_scalar(u'tag:yaml.org,2002:str', data, style='|')

        def folded_unicode_representer(dumper, data):
            return dumper.represent_scalar(u'tag:yaml.org,2002:str', data, style='>')

        def unicode_representer(dumper, uni):
            node = yaml.ScalarNode(tag=u'tag:yaml.org,2002:str', value=uni)
            return node

        yaml.add_representer(unicode, unicode_representer)
        yaml.add_representer(literal_unicode, literal_unicode_representer)

        config_file = open(self.path, 'w')
        yaml.dump(self.test_config, config_file, default_flow_style=False, )
        config_file.close()

###########GETTING SUPPORTED PROVIDERS#####################

    def test_00_supported_providers(self):
        print ">>>Getting supported providers:"
        self.test_config['SUPPORTED_PROVIDERS'] = backends.supported_providers(self.uri)
        for provider in self.test_config['SUPPORTED_PROVIDERS']:
            print "Provider: %s --> Title: %s " % (provider['provider'], provider['title'])

###########BACKENDS ACTIONS ###############################

    def test_01_list_backends(self):
        print "\n>>>List of Backends:"
        self.test_config['BACKENDS'] = backends.list_backends(self.uri) or {}
        for back in self.test_config['BACKENDS']:
            print back['title']


    def test_020_add_EC2_backend(self):
        providers = self.test_config['SUPPORTED_PROVIDERS']
        creds = self.credentials['EC2']
        apikey = creds['api_key']
        apisecret = creds['api_secret']

        for prov in providers:
            if "EC2" in prov['title']:
                title = prov['title']
                provider = prov['provider']
                print "\n>>>Adding %s backend" % title
                backend = backends.add_backend(self.uri, title, provider,apikey,apisecret)
                self.test_config['BACKENDS'][backend['id']] = backend
                #TODO erase the break
                break

        print"\nList all backends:"
        for back in backends.list_backends(self.uri):
            print back['title']

    def test_021_add_Rackspace_backend(self):
        providers = self.test_config['SUPPORTED_PROVIDERS']
        creds = self.credentials['Rackspace']
        apikey = creds['username']
        apisecret = creds['api_key']

        for prov in providers:
            if "Rack" in prov['title']:
                title = prov['title']
                provider = prov['provider']
                print "\n>>>Adding %s backend" % title
                backend = backends.add_backend(self.uri, title, provider, apikey, apisecret)
                self.test_config['BACKENDS'][backend['id']] = backend
                #TODO erase the break
                break

        print"\nList all backends:"
        for back in backends.list_backends(self.uri):
            print back['title']

    def test_022_add_Nephoscale_backend(self):
        providers = self.test_config['SUPPORTED_PROVIDERS']
        creds = self.credentials['Nephoscale']
        apikey = creds['username']
        apisecret = creds['password']

        for prov in providers:
            if "Nepho" in prov['title']:
                title = prov['title']
                provider = prov['provider']
                print "\n>>>Addind %s backend" % title
                backend = backends.add_backend(self.uri, title, provider, apikey, apisecret)
                self.test_config['BACKENDS'][backend['id']] = backend

        print"\nList all backends:"
        for back in backends.list_backends(self.uri):
            print back['title']

    def test_023_add_DigitalOcean_backend(self):
        providers = self.test_config['SUPPORTED_PROVIDERS']
        creds = self.credentials['DigitalOcean']
        apikey = creds['client_id']
        apisecret = creds['api_key']

        for prov in providers:
            if "Digital" in prov['title']:
                title = prov['title']
                provider = prov['provider']
                print "\n>>>Addind %s backend" % title
                backend = backends.add_backend(self.uri, title, provider, apikey, apisecret)
                self.test_config['BACKENDS'][backend['id']] = backend

        print"\nList all backends:"
        for back in backends.list_backends(self.uri):
            print back['title']

    def test_024_add_SoftLayer_backend(self):
        providers = self.test_config['SUPPORTED_PROVIDERS']
        creds = self.credentials['SoftLayer']
        apikey = creds['username']
        apisecret = creds['api_key']

        for prov in providers:
            if "Soft" in prov['title']:
                title = prov['title']
                provider = prov['provider']
                print "\n>>>Addind %s backend" % title
                backend = backends.add_backend(self.uri, title, provider, apikey, apisecret)
                self.test_config['BACKENDS'][backend['id']] = backend

        print"\nList all backends:"
        for back in backends.list_backends(self.uri):
            print back['title']

###########KEYS ACTIONS#####################################

    def test_030_list_keys(self):
        print "\n>>>List of Keys:"
        keys = keypairs.list_keys(self.uri) or {}
        if keys == {}:
            self.test_config['KEYPAIRS'] = {}
        else:
            for key in keys:
                print key['name']
                self.test_config['KEYPAIRS'][key['name']] = key

    def test_031_add_key(self):
        print "\n>>>Asking mist.io to generate private key"
        priv_key = keypairs.generate_keypair(self.uri)
        private = priv_key['priv']
        name = "API TESTS KEY"

        print "\n>>>Creating Key with name: %s" % name
        keypair = keypairs.add_key(self.uri, name, private)
        self.test_config['KEYPAIRS'][keypair['id']] = keypair

    #def test_032_edit_key(self):
    #    key_id = self.test_config['KEYPAIRS'].keys()[0]
    #    new_name = "EDITED API TESTS KEY"
    #    print"\n>>>Renaming '%s' Key to '%s'" % (key_id, new_name)
    #    keypairs.edit_key(self.uri, key_id, new_name)
    #    self.test_config['KEYPAIRS'][new_name] = self.test_config['KEYPAIRS'][key_id]
    #    del self.test_config['KEYPAIRS'][key_id]
    #
    #def test_033_add_second_key(self):
    #    print "\n>>>Asking mist.io to generate private key"
    #    priv_key = keypairs.generate_keypair(self.uri)
    #    private = priv_key['priv']
    #    name = "SECOND API TESTS KEY"
    #
    #    print "\n>>>Creating Second Key with name: %s" % name
    #    keypair = keypairs.add_key(self.uri, name, private)
    #    self.test_config['KEYPAIRS'][keypair['id']] = keypair
    #
    #def test_034_delete_key(self):
    #    key_id = self.test_config['KEYPAIRS'].keys()[0]
    #    print "\n>>>Deleting Key %s" % key_id
    #    keypairs.delete_key(self.uri, key_id)
    #    del self.test_config['KEYPAIRS'][key_id]
    #
    #def test_035_add_third_key(self):
    #    print "\n>>>Asking mist.io to generate private key"
    #    priv_key = keypairs.generate_keypair(self.uri)
    #    private = priv_key['priv']
    #    name = "Universal"
    #
    #    print "\n>>>Creating Third Key with name: %s" % name
    #    keypair = keypairs.add_key(self.uri, name, private)
    #    self.test_config['KEYPAIRS'][keypair['id']] = keypair

###########IMAGES LOCATIONS SIZES ACTIONS##################
    def test_040_list_images(self):
        for backend_id in self.test_config['BACKENDS']:
            #backend_id = self.test_config['BACKENDS'].keys()[0]
            print "\n>>>List of images for Backend %s" % \
                  self.test_config['BACKENDS'][backend_id]['title']
            images = backends.list_images(self.uri, backend_id)
            self.test_config['BACKENDS'][backend_id]['images'] = images
            for image in images:
                print image['name']

    def test_041_search_image(self):
        backend_id = self.test_config['BACKENDS'].keys()[0]
        search_term = "Ubuntu"
        print "\n>>>Searching for %s image " % search_term

        images = backends.list_images(self.uri, backend_id, search_term=search_term)
        for image in images:
            print image['name']

    def test_041_list_sizes(self):
        for backend_id in self.test_config['BACKENDS']:
            print "\n>>>List of sizes for Backend %s" % \
                  self.test_config['BACKENDS'][backend_id]['title']

            sizes = backends.list_sizes(self.uri, backend_id)
            self.test_config['BACKENDS'][backend_id]['sizes'] = sizes
            for size in sizes:
                print size['name']

    def test_042_list_locations(self):
        for backend_id in self.test_config['BACKENDS']:
            print "\n>>>List of locations for Backend %s" % \
                  self.test_config['BACKENDS'][backend_id]['title']

            locations = backends.list_locations(self.uri, backend_id)
            self.test_config['BACKENDS'][backend_id]['locations'] = locations
            for location in locations:
                print location['name']

###########MACHINES ACTIONS################################
    def test_050_list_machines(self):
        for backend_id in self.test_config['BACKENDS']:
            print "\n>>>List of machines for Backend %s" % \
                  self.test_config['BACKENDS'][backend_id]['title']

            mach = machines.list_machines(self.uri, backend_id)
            if mach == {} or mach == []:
                self.test_config['BACKENDS'][backend_id]['machines'] = {}
            else:
                try:
                    for machine in mach:
                        self.test_config['BACKENDS'][backend_id]['machines'][machine['name']] = machine
                        print machine['name']
                except KeyError:
                    self.test_config['BACKENDS'][backend_id]['machines'] = {}
                    for machine in mach:
                        self.test_config['BACKENDS'][backend_id]['machines'][machine['name']] = machine
                        print machine['name']

    def test_051_create_machine_on_EC2_NorthEast(self):
        #Find the backend_ip of a EC2 Backend
        backend_id = None
        image_id = None
        size = None
        location = None
        script = 'touch me'

        for b_id in self.test_config['BACKENDS']:
            if "EC2" in self.test_config['BACKENDS'][b_id]['title']:
                backend_id = b_id
                break

        #key_id = self.test_config['KEYPAIRS'].keys()[0]
        #key_id = "Universal"
        key_id = None

        name = "Ninja"

        image_id = self.test_config['BACKENDS'][backend_id]['images'][0]['id']
        size = self.test_config['BACKENDS'][backend_id]['sizes'][0]['id']
        location = self.test_config['BACKENDS'][backend_id]['locations'][0]['id']


        print "\n>>>Will now Create Machine:"
        print ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
        print "Name: %s" % name
        print "Backend: %s" % self.test_config['BACKENDS'][backend_id]['title']
        print "With Key: Ask mist to find our default"
        print "Image Id: %s" % image_id
        print "Size Id: %s" % size
        print "Location Id: %s" % location
        print ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>"

        machine = machines.create_machine(self.uri, backend_id, key_id, name, location, image_id, size)
        print "Created Machine %s" % machine['name']
        self.test_050_list_machines()



###########CLEANING UP#####################################

    def test_055_destroy_machines(self):
        print "\n>>>Destroy machines:"
        for backend_id in self.test_config['BACKENDS']:
            for machine in self.test_config['BACKENDS'][backend_id]['machines']:
                if "Ninja" in machine: #and self.test_config['BACKENDS'][backend_id]['machines'][machine]['state'] == 'running':
                    machine_id = self.test_config['BACKENDS'][backend_id]['machines'][machine]['id']
                    machines.destroy_machine(self.uri, backend_id, machine_id)

    def test_935_delete_all_keys(self):
        print "\n>>>Deleting all Keys"
        for key in keypairs.list_keys(self.uri):
            keypairs.delete_key(self.uri, key['name'])
            del self.test_config['KEYPAIRS'][key['name']]

    def test_94_delete_all_backends(self):
        print "\n>>>Deleting all backends:"
        for back in backends.list_backends(self.uri):
            backends.delete_backend(self.uri, back['id'])
            del self.test_config['BACKENDS'][back['id']]
