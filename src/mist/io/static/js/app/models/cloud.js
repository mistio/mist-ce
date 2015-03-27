define('app/models/cloud', ['app/controllers/machines', 'app/controllers/images', 'app/controllers/sizes',
                              'app/controllers/locations','app/controllers/networks', 'ember'],
    /**
     *  Cloud Model
     *
     *  @returns Class
     */
    function (MachinesController, ImagesController, SizesController,
        LocationsController, NetworksController) {
        return Ember.Object.extend(Ember.Evented, {

            /**
             *  Properties
             */

            id: null,
            host: null,
            state: null,
            title: null,
            apikey: null,
            enabled: null,
            provider: null,
            poll_interval: null,
            create_pending: null,
            selectedMachines: [],
            selectedNetworks: [],

            sizes: null,
            images: null,
            machines: null,
            locations: null,
            networks: null,

            sizeCount: 0,
            imageCount: 0,
            machineCount: 0,
            networkCount: 0,
            locationCoount: 0,

            loadingSizes: null,
            loadingImages: null,
            loadingMachines: null,
            loadingLocations: null,
            loadingNetworks: null,

            isOpenStack: function () {
                return this.provider == 'openstack';
            }.property('provider'),

            isNephoscale: function () {
                return this.provider == 'nephoscale';
            }.property('provider'),

            hasNetworks: function () {
                return  ['openstack', 'nephoscale', 'azure', 'vcloud', 'ec2', 'gce', 'indonesian_vcloud']
                    .indexOf(this.provider) > -1;
            }.property('provider'),

            requiresNetworkOnCreation: function () {
                return  ['openstack', 'vcloud', 'indonesian_vcloud']
                    .indexOf(this.provider) > -1;
            }.property('provider'),

            isLibvirt: function () {
                return this.get('provider') == 'libvirt';
            }.property('provider'),

            isDocker: function () {
                return this.provider == 'docker';
            }.property('provider'),

            isBareMetal: function () {
                return this.provider == 'bare_metal';
            }.property('provider'),

            canCreateMachine: function () {
                return this.enabled && 
                    ['indonesian_vcloud', 'bare_metal', 'libvirt'].indexOf(this.provider) == -1;
            }.property('provider', 'enabled'),

            className: function () {
                return 'provider-' + this.getSimpleProvider();
            }.property('provider'),


            /**
             *
             *  Initialization
             *
             */

            load: function () {

                Ember.run(this, function () {

                    // Add controllers
                    this.sizes = SizesController.create({cloud: this, content: []});
                    this.images = ImagesController.create({cloud: this, content: []});
                    this.machines = MachinesController.create({cloud: this, content: []});
                    this.locations = LocationsController.create({cloud: this, content: []});
                    this.networks = NetworksController.create({cloud: this, content: []});

                    // Add events
                    this.sizes.on('onSizeListChange', this, '_updateSizeCount');
                    this.images.on('onImageListChange', this, '_updateImageCount');
                    this.machines.on('onMachineListChange', this, '_updateMachineCount');
                    this.locations.on('onLocationListChange', this, '_updateLocationCount');
                    this.networks.on('onChange', this, '_updateNetworkCount');
                    this.machines.on('onSelectedMachinesChange', this, '_updateSelectedMachines');
                    this.networks.on('onSelectedChange', this, '_updateSelectedNetworks');

                    // Add observers
                    this.sizes.addObserver('loading', this, function () {
                        Ember.run.once(this, 'loadingSizesObserver');
                    });
                    this.images.addObserver('loading', this, function () {
                        Ember.run.once(this, 'loadingImagesObserver');
                    });
                    this.machines.addObserver('loading', this, function () {
                        Ember.run.once(this, 'loadingMachinesObserver');
                    });
                    this.locations.addObserver('loading', this, function () {
                        Ember.run.once(this, 'loadingLocationsObserver');
                    });
                    this.networks.addObserver('loading', this, function () {
                        Ember.run.once(this, 'loadingNetowrksObserver');
                    });
                });
            }.on('init'),


            /**
             *
             *  Methods
             *
             */

            getSize: function (sizeId) {
                return this.sizes.getSize(sizeId);
            },


            getImage: function (imageId) {
                return this.images.getImage(imageId);
            },


            getMachine: function (machineId) {
                return this.machines.getMachine(machineId);
            },


            getLocation: function (locationId) {
                return this.locations.getLocation(locationId);
            },


            getNetwork: function (networkId) {
                return this.networks.getObject(networkId);
            },


            getMonitoredMachines: function () {
                return this.machines.getMonitoredMachines();
            },


            shutdownMachine: function (machineId, callback) {
                this.machines.shutdownMachine(machineId, callback);
            },


            destroyMachine: function (machineId, callback) {
                this.machines.destroyMachine(machineId, callback);
            },


            rebootMachine: function (machineId, callback) {
                this.machines.rebootMachine(machineId, callback);
            },


            startMachine: function (machineId, callback) {
                this.machines.startMachine(machineId, callback);
            },


            searchImages: function (filter, callback) {
                this.images.searchImages(filter, callback);
            },


            toggleImageStar: function (imageId, callback) {
                this.images.toggleImageStar(imageId, callback);
            },


            getSimpleProvider: function () {
                if (this.provider.indexOf('ec2') == 0) return 'ec2';
                if (this.provider.indexOf('hpcloud') == 0) return 'hpcloud';
                if (this.provider.indexOf('openstack') == 0) return 'openstack';
                if (this.provider.indexOf('rackspace') == 0) return 'rackspace';
                if (this.provider.indexOf('bare_metal') == 0) return 'baremetal';
                if (this.provider.indexOf('indonesian_vcloud') == 0) return 'indonesian';
                return this.provider;
            },

            /**
             *
             *  Pseudo-Private Methods
             *
             */

            _toggle: function() {
                if (this.enabled) {
                    /*
                    this.sizes.load();
                    this.images.load();
                    this.machines.load();
                    this.locations.load();
                    */
                } else {
                    /*
                    this.sizes.clear();
                    this.images.clear();
                    this.machines.clear();
                    this.locations.clear();
                    */
                }
            },

            _updateSizeCount: function () {
                Ember.run(this, function () {
                    this.set('sizeCount', this.sizes.content.length);
                    this.trigger('onSizeListChange');
                });
            },


            _updateImageCount: function () {
                Ember.run(this, function () {
                    this.set('imageCount', this.images.content.length);
                    this.trigger('onImageListChange');
                });
            },


            _updateMachineCount: function () {
                Ember.run(this, function () {
                    this.set('machineCount', this.machines.content.length);
                    this.trigger('onMachineListChange');
                });
            },


            _updateLocationCount: function () {
                Ember.run(this, function () {
                    this.set('locationCount', this.locations.content.length);
                    this.trigger('onLocationListChange');
                });
            },


            _updateNetworkCount: function () {
                Ember.run(this, function () {
                    this.set('networkCount', this.networks.content.length);
                    this.trigger('onNetworkListChange');
                });
            },

            _updateSelectedMachines: function () {
                Ember.run(this, function () {
                    this.set('selectedMachines', this.machines.selectedMachines);
                    this.trigger('onSelectedMachinesChange');
                });
            },


            _updateSelectedNetworks: function () {
                Ember.run(this, function () {
                    this.set('selectedNetworks', this.networks.get('selectedObjects'));
                    this.trigger('onSelectedNetworksChange');
                });
            },


            _updateState: function () {
                if (this.enabled) {
                    if (this.loadingMachines || this.loadingImages || this.loadingSizes || this.loadingLocations) {
                        this.set('state', 'waiting');
                    } else {
                        this.set('state', 'online');
                    }
                } else {
                    this.set('state', 'offline');
                }
            },


            /**
             *
             *  Observers
             *
             */

            enabledObserver: function () {
                Ember.run.once(this, '_toggle');
            }.observes('enabled'),


            /**
             *
             *  Dynamic Observers
             *
             */

            loadingSizesObserver: function () {
                this.set('loadingSizes', this.sizes.loading);
            },


            loadingImagesObserver: function () {
                this.set('loadingImages', this.images.loading);
            },


            loadingMachinesObserver: function () {
                this.set('loadingMachines', this.machines.loading);
            },


            loadingLocationsObserver: function () {
                this.set('loadingLocations', this.locations.loading);
            },


            loadingNetworksObserver: function () {
                this.set('loadingNeworks', this.networks.loading);
            },


            stateObserver: function () {
                Ember.run.once(this, '_updateState');
            }.observes('loadingMachines', 'loadingImages', 'loadingSizes', 'loadingLocations', 'enabled'),
        });
    }
);
