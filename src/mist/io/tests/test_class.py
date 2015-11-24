import os
import unittest
import random

import clouds as clouds
import keypairs as keypairs
import machines as machines

import yaml
from Crypto.PublicKey import RSA

class TestClass(unittest.TestCase):
    """
    A basic TestClass for nose to find. The way that it works is like this:
    Test scenarios are methods of the class beginning with 'test'. They are run
    in alphabetical order, that's why we have to name them accordingly if we
    want them to run in a particular order.

    Special methods are the setUp(self) and tearDown(self).
    setUp() initializes a state for the class test and is run before every test.
    tearDown() is run every time a test is finished.

    Comment: The reason we have ---> in the first line of every docstring is because
    nosetests show the first line of the docstring for every test that has failed.
    This makes it easier to understand where something has gone wrong.
    """


    def setUp(self):
        """
        setUp() initializes the class's attributes before each test.

        What it does actually is that it uses a yaml file to load all
        the variables/information that is stored there.

        All vars is stored in the self.test_config dict. Every time
        a test is run the self.test_config dict is a replica of the
        yaml file.
        """
        self.path = os.getcwd() + "/tests_config.yaml"
        config_file = open(self.path, 'r')
        self.test_config = yaml.load(config_file) or {}
        config_file.close()

        self.uri = self.test_config['MIST_URI']
        self.credentials = self.test_config['CLOUD_KEYS']
        self.machine_name = self.test_config['MACHINE_NAME']
        self.cookie = self.test_config['COOKIE']

        try:
            self.supported_providers = self.test_config['SUPPORTED_PROVIDERS']
        except:
            self.supported_providers = []

    def tearDown(self):
        """
        This method is run every time a test is finished.

        It is kind of a save_settings(method) and what it actually
        does is take the changes made to the self.test_cofig dict and
        save them to the yaml file.

        """
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
        """
        This is the first thing that is run, cause a client would have to know
        the supported providers, the 'provider' and 'title' attributes.

        We had no view in our API that would return all the supported providers,
        so a view '/providers' was made in views.py
        """
        print ">>>Getting supported providers:"
        self.test_config['SUPPORTED_PROVIDERS'] = clouds.supported_providers(self.uri, cookie=self.cookie)
        for provider in self.test_config['SUPPORTED_PROVIDERS']:
            print "Provider: %s --> Title: %s " % (provider['provider'], provider['title'])

    ###########CLOUDS ACTIONS ###############################

    def test_01_list_clouds(self):
        """
        --> List Clouds
        This one lists all of our clouds and it is used every time
        we add or delete a cloud in order to confirm our action and see
        if our information agrees with the information sent from the API
        """
        print "\n>>>List of Clouds:"
        self.test_config['CLOUDS'] = clouds.list_clouds(self.uri, cookie=self.cookie) or {}
        for back in self.test_config['CLOUDS']:
            print back['title']

    def test_020_add_EC2_cloud(self):
        """
        -->Add EC2 Clouds
        Adds all EC2 Clouds, if no EC2 creds are given in the yaml file it will
        print a Message and return True
        """
        providers = self.test_config['SUPPORTED_PROVIDERS']
        creds = self.credentials['EC2']
        apikey = creds['api_key']
        apisecret = creds['api_secret']

        if not apikey or not apisecret:
            print "\n>>>Could not find credentials for EC2, will not add cloud"
            return

        for prov in providers:
            if "EC2 AP SOUTHEAST" in prov['title']:
                title = prov['title']
                provider = prov['provider']
                print "\n>>>Adding %s cloud" % title
                cloud = clouds.add_cloud(self.uri, title, provider, apikey, apisecret, cookie=self.cookie)
                self.test_config['CLOUDS'][cloud['id']] = cloud
                #TODO erase the break
                break

        print"\nList all clouds:"
        for back in clouds.list_clouds(self.uri, cookie=self.cookie):
            print back['title']

    def test_021_add_Rackspace_cloud(self):
        """
        --->Add Rackspace Clouds
        """
        providers = self.test_config['SUPPORTED_PROVIDERS']
        creds = self.credentials['Rackspace']
        apikey = creds['username']
        apisecret = creds['api_key']

        if not apikey or not apisecret:
            print "\n>>>Could not find credentials for Rackspace, will not add cloud"
            return

        for prov in providers:
            if "Rack" in prov['title']:
                title = prov['title']
                provider = prov['provider']
                print "\n>>>Adding %s cloud" % title
                cloud = clouds.add_cloud(self.uri, title, provider, apikey, apisecret, cookie=self.cookie)
                self.test_config['CLOUDS'][cloud['id']] = cloud
                #TODO erase the break
                break

        print"\nList all clouds:"
        for back in clouds.list_clouds(self.uri, cookie=self.cookie):
            print back['title']

    def test_022_add_Nephoscale_cloud(self):
        """
        --->Add Nephoscale Cloud
        """
        providers = self.test_config['SUPPORTED_PROVIDERS']
        creds = self.credentials['Nephoscale']
        apikey = creds['username']
        apisecret = creds['password']

        if not apikey or not apisecret:
            print "\n>>>Could not find credentials for Nephoscale, will not add cloud"
            return

        for prov in providers:
            if "Nepho" in prov['title']:
                title = prov['title']
                provider = prov['provider']
                print "\n>>>Addind %s cloud" % title
                cloud = clouds.add_cloud(self.uri, title, provider, apikey, apisecret, cookie=self.cookie)
                self.test_config['CLOUDS'][cloud['id']] = cloud

        print"\nList all clouds:"
        for back in clouds.list_clouds(self.uri, cookie=self.cookie):
            print back['title']

    def test_023_add_DigitalOcean_cloud(self):
        """
        --->Add DigitalOcean Cloud
        """
        providers = self.test_config['SUPPORTED_PROVIDERS']
        creds = self.credentials['DigitalOcean']
        apikey = creds['client_id']
        apisecret = creds['api_key']

        if not apikey or not apisecret:
            print "\n>>>Could not find credentials for DigitalOcean, will not add cloud"
            return

        for prov in providers:
            if "Digital" in prov['title']:
                title = prov['title']
                provider = prov['provider']
                print "\n>>>Addind %s cloud" % title
                cloud = clouds.add_cloud(self.uri, title, provider, apikey, apisecret, cookie=self.cookie)
                self.test_config['CLOUDS'][cloud['id']] = cloud

        print"\nList all clouds:"
        for back in clouds.list_clouds(self.uri, cookie=self.cookie):
            print back['title']

    def test_024_add_SoftLayer_cloud(self):
        """
        --->Add SoftLayer Cloud
        """
        providers = self.test_config['SUPPORTED_PROVIDERS']
        creds = self.credentials['SoftLayer']
        apikey = creds['username']
        apisecret = creds['api_key']

        if not apikey or not apisecret:
            print "\n>>>Could not find credentials for SoftLayer, will not add cloud"
            return

        for prov in providers:
            if "Soft" in prov['title']:
                title = prov['title']
                provider = prov['provider']
                print "\n>>>Addind %s cloud" % title
                cloud = clouds.add_cloud(self.uri, title, provider, apikey, apisecret, cookie=self.cookie)
                self.test_config['CLOUDS'][cloud['id']] = cloud

        print"\nList all clouds:"
        for back in clouds.list_clouds(self.uri, cookie=self.cookie):
            print back['title']


    ###########KEYS ACTIONS#####################################

    def test_030_list_keys(self):
        """
        -->List Keys
        Sends a request to our API to return all our added keys
        """
        print "\n>>>List of Keys:"
        keys = keypairs.list_keys(self.uri, cookie=self.cookie) or {}
        if keys == {}:
            self.test_config['KEYPAIRS'] = {}
        else:
            for key in keys:
                print key['id']
                self.test_config['KEYPAIRS'][key['id']] = key

    def test_031_add_key(self):
        """
        --> Add Key
        Send a request to our API to add a new Key. The keys name
        is the one found in the yaml file in the KEY_NAME:
        """
        print "\n>>>Asking mist.io to generate private key"
        priv_key = keypairs.generate_keypair(self.uri, cookie=self.cookie)
        private = priv_key['priv']
        seq = range(300)
        name = self.test_config['KEY_NAME'] + str(random.choice(seq))
        print "\n>>>Creating Key with name: %s" % name
        keypair = keypairs.add_key(self.uri, name, private.strip('\n'), cookie=self.cookie)
        self.test_config['KEYPAIRS'][keypair['id']] = keypair

    def test_032_get_private_key(self):
        """
        --> Get Private Key
        """

        for key_id in self.test_config['KEYPAIRS']:
            if self.test_config['KEY_NAME'] in key_id:
                break
        print "\n>>>Asking for private key for Key: %s" % key_id
        key = keypairs.get_private_key(self.uri, key_id, cookie=self.cookie)
        print "Got: %s" % key
        self.test_config['KEYPAIRS'][key_id]['private'] = key

    def test_033_get_public_key(self):
        """
        --> Get Public Key
        """

        for key_id in self.test_config['KEYPAIRS']:
            if self.test_config['KEY_NAME'] in key_id:
                break
        print "\n>>>Asking for public key for Key: %s" % key_id
        key = keypairs.get_public_key(self.uri, key_id, cookie=self.cookie)
        print "Got: %s" % key
        self.test_config['KEYPAIRS'][key_id]['public'] = key

    def test_034_edit_key(self):
        """--->Edit Key"""
        for key_id in self.test_config['KEYPAIRS']:
            if self.test_config['KEY_NAME'] in key_id:
                break
        #key_id = self.test_config['KEY_NAME']
        seq = range(300)
        new_name = self.test_config['KEY_NAME'] + str(random.choice(seq))
        print"\n>>>Renaming '%s' Key to '%s'" % (key_id, new_name)
        keypairs.edit_key(self.uri, key_id, new_name, cookie=self.cookie)
        self.test_config['KEYPAIRS'][new_name] = self.test_config['KEYPAIRS'][key_id]
        self.test_config['KEYPAIRS'][new_name]['id'] = self.test_config['KEYPAIRS'][key_id]['id']
        del self.test_config['KEYPAIRS'][key_id]

    def test_035_add_second_key(self):
        """--->Add second Key"""
        print "\n>>>Asking mist.io to generate private key"
        priv_key = keypairs.generate_keypair(self.uri)
        private = priv_key['priv']

        #If the randomly generated key name already exists, generate another one
        while True:
            seq = range(300)
            name = self.test_config['KEY_NAME'] + str(random.choice(seq))
            if name not in self.test_config['KEYPAIRS']:
                break

        print "\n>>>Creating Second Key with name: %s" % name
        keypair = keypairs.add_key(self.uri, name, private, cookie=self.cookie)
        self.test_config['KEYPAIRS'][keypair['id']] = keypair

    def test_036_delete_key(self):
        """Delete Key"""
        key_id = self.test_config['KEYPAIRS'].keys()[0]
        print "\n>>>Deleting Key %s" % key_id
        keypairs.delete_key(self.uri, key_id, cookie=self.cookie)
        del self.test_config['KEYPAIRS'][key_id]

    ##########IMAGES LOCATIONS SIZES ACTIONS##################
    def test_040_list_images(self):
        """
        --->List Images
        Lists all available images for every added Cloud
        """
        for cloud_id in self.test_config['CLOUDS']:
            #cloud_id = self.test_config['CLOUDS'].keys()[0]
            print "\n>>>List of images for Cloud %s" % \
                  self.test_config['CLOUDS'][cloud_id]['title']
            images = clouds.list_images(self.uri, cloud_id, cookie=self.cookie)
            self.test_config['CLOUDS'][cloud_id]['images'] = images
            for image in images:
                print image['name']

    # def test_041_search_image(self):
    #     """
    #     --->Search for an image
    #     In our API we provide the choice to pass a search _term and
    #     return a list of images with that name. This is the equivalent
    #     with our 'Continue Search on server...' buttom...
    #
    #     Our API is lightyears ahead :-)
    #     """
    #     cloud_id = self.test_config['CLOUDS'].keys()[0]
    #     search_term = "Ubuntu"
    #     print "\n>>>Searching for %s image " % search_term
    #
    #     images = clouds.list_images(self.uri, cloud_id, search_term=search_term, cookie=self.cookie)
    #     for image in images:
    #         print image['name']

    def test_041_list_sizes(self):
        """
        --->List Sizes
        Lists all sizes for every added Cloud
        """
        for cloud_id in self.test_config['CLOUDS']:
            print "\n>>>List of sizes for Cloud %s" % \
                  self.test_config['CLOUDS'][cloud_id]['title']

            sizes = clouds.list_sizes(self.uri, cloud_id, cookie=self.cookie)
            self.test_config['CLOUDS'][cloud_id]['sizes'] = sizes
            for size in sizes:
                print size['name']

    def test_042_list_locations(self):
        """
        --->List Locations
        Lists all locations for every cloud
        """
        for cloud_id in self.test_config['CLOUDS']:
            print "\n>>>List of locations for Cloud %s" % \
                  self.test_config['CLOUDS'][cloud_id]['title']

            locations = clouds.list_locations(self.uri, cloud_id, cookie=self.cookie)
            self.test_config['CLOUDS'][cloud_id]['locations'] = locations
            for location in locations:
                print location['name']

    ###########MACHINES ACTIONS################################
    def test_050_list_machines(self):
        """
        --->List Machines
        Lists all our machine for every added Cloud

        Important: this method will be used in after each machine
        action (e.g. reboot, start etc) cause it returns along with
        the machines their state. So if we stop a machine, the
        'can_start' will become True and 'can_stop' False.

        That's why we call this one before each of our machine
        actions....
        """
        for cloud_id in self.test_config['CLOUDS']:
            print "\n>>>List of machines for Cloud %s" % \
                  self.test_config['CLOUDS'][cloud_id]['title']

            mach = machines.list_machines(self.uri, cloud_id, cookie=self.cookie)
            if mach == {} or mach == []:
                self.test_config['CLOUDS'][cloud_id]['machines'] = {}
            else:
                try:
                    for machine in mach:
                        self.test_config['CLOUDS'][cloud_id]['machines'][machine['name']] = machine
                        print machine['name'], machine['state']
                except KeyError:
                    self.test_config['CLOUDS'][cloud_id]['machines'] = {}
                    for machine in mach:
                        self.test_config['CLOUDS'][cloud_id]['machines'][machine['name']] = machine
                        print machine['name'], machine['state']

    def test_051_create_machine_on_EC2_NorthEast(self):
        """
        --->Create Machine
        This is the ONE!

        Creates a machine!

        Params needed are the cloud_id, the image_id, the size, the location.
        We have some optional params as well:
        Script: If we want a script to be run
        Key_id: Yes, key_id is optional, our view handles that. So we pass no key_id
        to test the ingenuity of our API.

        We chose to create a Machine in EC2 NorthEast for many reasons:
        We do not want start creatong Machines in every Cloud and EC2 is rather
        quick in creating machines.

        For the machine name:
        In order not to create machines with the same name, we take the machine name
        provided in the yaml file (MACHINE_NAME) and add a random number next to it.

        """
        #Find the cloud_ip of a EC2 Cloud
        cloud_id = None
        image_id = None
        size = None
        location = None
        script = 'touch me'


        for b_id in self.test_config['CLOUDS']:
            if "EC2 AP SOUTHEAST" in self.test_config['CLOUDS'][b_id]['title']:
                cloud_id = b_id
                break

        for key_id in self.test_config['KEYPAIRS']:
            if self.test_config['KEY_NAME'] in key_id:
                break
        #key_id = self.test_config['KEYPAIRS'].keys()[0]
        #key_id = "Universal"
        #key_id = None

        #If the randomly generated name already exists, generate another one
        while True:
            seq = range(300)
            name = self.test_config['MACHINE_NAME'] + str(random.choice(seq))
            if name not in self.test_config['CLOUDS'][cloud_id]['machines']:
                break

        image_id = self.test_config['CLOUDS'][cloud_id]['images'][0]['id']
        size = self.test_config['CLOUDS'][cloud_id]['sizes'][0]['id']
        location = self.test_config['CLOUDS'][cloud_id]['locations'][0]['id']


        print "\n>>>Will now Create Machine:"
        print ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
        print "Name: %s" % name
        print "Cloud: %s" % self.test_config['CLOUDS'][cloud_id]['title']
        print "With Key: %s" % key_id
        print "Image Id: %s" % image_id
        print "Size Id: %s" % size
        print "Location Id: %s" % location
        print ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>"

        machine = machines.create_machine(self.uri, cloud_id, key_id, name, location, image_id, size, cookie=self.cookie)
        print "Created Machine %s" % machine['name']
        self.test_050_list_machines()

    def test_052_reboot_machine(self):
        """--->Reboot machine"""
        self.test_050_list_machines()
        print "\n>>>Reboot Machine:"
        for cloud_id in self.test_config['CLOUDS']:
            for machine in self.test_config['CLOUDS'][cloud_id]['machines']:
                if self.test_config['MACHINE_NAME'] in machine and \
                        self.test_config['CLOUDS'][cloud_id]['machines'][machine]['can_reboot']:
                    machine_id = self.test_config['CLOUDS'][cloud_id]['machines'][machine]['id']
                    machines.reboot_machine(self.uri, cloud_id, machine_id, cookie=self.cookie)
                    return True

    def test_053_stop_machine(self):
        """--->Stop machine"""
        self.test_050_list_machines()
        print "\n>>>Stop Machine:"
        for cloud_id in self.test_config['CLOUDS']:
            for machine in self.test_config['CLOUDS'][cloud_id]['machines']:
                if self.test_config['MACHINE_NAME'] in machine and \
                        self.test_config['CLOUDS'][cloud_id]['machines'][machine]['can_reboot']:
                    machine_id = self.test_config['CLOUDS'][cloud_id]['machines'][machine]['id']
                    machines.stop_machine(self.uri, cloud_id, machine_id, cookie=self.cookie)
                    return True

    def test_054_start_machine(self):
        """--->Start machine"""
        self.test_050_list_machines()
        print "\n>>>Start Machine:"
        for cloud_id in self.test_config['CLOUDS']:
            for machine in self.test_config['CLOUDS'][cloud_id]['machines']:
                if self.test_config['MACHINE_NAME'] in machine and \
                        self.test_config['CLOUDS'][cloud_id]['machines'][machine]['can_start']:
                    machine_id = self.test_config['CLOUDS'][cloud_id]['machines'][machine]['id']
                    machines.start_machine(self.uri, cloud_id, machine_id, cookie=self.cookie)
                    return True

    ###########CLEANING UP#####################################

    def test_055_destroy_machines(self):
        """--->Destroy Machines"""
        print "\n>>>Destroy machines:"
        for cloud_id in self.test_config['CLOUDS']:
            for machine in self.test_config['CLOUDS'][cloud_id]['machines']:
                if self.test_config['MACHINE_NAME'] in machine and self.test_config['CLOUDS'][cloud_id]['machines'][machine]['can_destroy']:
                    machine_id = self.test_config['CLOUDS'][cloud_id]['machines'][machine]['id']
                    machines.destroy_machine(self.uri, cloud_id, machine_id, cookie=self.cookie)
                    return True

    def test_935_delete_all_keys(self):
        """--->Delete All keys"""
        print "\n>>>Deleting all Keys"
        for key in keypairs.list_keys(self.uri):
            if self.test_config['KEY_NAME'] in key['id']:
                keypairs.delete_key(self.uri, key['id'])
                del self.test_config['KEYPAIRS'][key['id']]

    def test_94_delete_all_clouds(self):
        """--->Delete All Clouds"""
        print "\n>>>Deleting all clouds:"
        for back in clouds.list_clouds(self.uri):
            clouds.delete_cloud(self.uri, back['id'])
            del self.test_config['CLOUDS'][back['id']]

    def test_99_clean_up(self):
        """--->Cleaning up"""
        print "\n>>>Cleaning up..."
        self.test_config['CLOUDS'] = {}
        self.test_config['KEYPAIRS'] = {}
        self.test_config['SUPPORTED_PROVIDERS'] = []
