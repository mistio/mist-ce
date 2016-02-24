define('app/controllers/clouds', ['app/models/cloud', 'ember'],
    //
    //  Clouds Controller
    //
    //  @returns Class
    //
    function (Cloud) {

        'use strict';

        return Ember.Controller.extend(Ember.Evented, {

            //
            //  Properties
            //

            model: [],
            imageCount: 0,
            machineCount: 0,
            networkCount: 0,
            machines: [],
            sortBy: 'state',
            displayCount: 30,
            selectedMachines: [],
            selectedNetworks: [],
            machineRequest: false,
            networkRequest: false,
            imageRequest: false,

            addingCloud: false,
            deletingCloud: false,
            togglingCloud: false,
            checkedMonitoring: false,
            checkingMonitoring: false,

            loading: true,
            loadingImages: false,
            loadingMachines: false,

            canHaveNetworks: Ember.computed('model.@each.canHaveNetworks', 'model.@each.enabled', function() {
                return !!this.model.filterBy('enabled', true).findBy('canHaveNetworks', true);
            }),

            hasOpenStack: function () {
                return !!this.model.filterBy('enabled', true).findBy('isOpenStack', true);
            }.property('model.[].isOpenStack', 'model.[].enabled'),

            hasNetworks: function () {
                return !!this.model.findBy('hasNetworks', true);
            }.property('model.[].hasNetworks'),

            filteredMachines: Ember.computed('machines', 'searchMachinesTerm', function() {
                var filteredMachines = [],
                machines = this.get('machines'),
                searchMachinesTerm = this.get('searchMachinesTerm');

                if (searchMachinesTerm) {
                    var that = this;
                    machines.forEach(function(machine) {
                        var regex = new RegExp(searchMachinesTerm, 'i');

                        if (regex.test(machine.name)) {
                            filteredMachines.push(machine);
                        } else {
                            if (machine.selected) {
                                machine.set('selected', false);
                            }
                        }
                    });
                } else {
                    filteredMachines = machines;
                }

                return filteredMachines;
            }),

            sortedMachines: Ember.computed('filteredMachines', 'filteredMachines.@each.stateWeight', 'filteredMachines.@each.name', 'filteredMachines.@each.cloud.title', 'sortBy', function() {
                var filteredMachines = this.get('filteredMachines'),
                sortBy = this.get('sortBy');

                if(filteredMachines)
                {
                    if (sortBy == 'state')
                    {
                        return filteredMachines.sortBy('stateWeight').reverse();
                    }

                    if (sortBy == 'name')
                    {
                        return filteredMachines.sortBy('name');
                    }

                    if (sortBy == 'cloud')
                    {
                        return filteredMachines.sortBy('cloud.title', 'name');
                    }
                }
            }),


            //
            //  Initialization
            //

            load: function (clouds) {
                this._updateModel(clouds);
                this.set('loading', false);
            },


            //
            //  Methods
            //

            addCloud: function (args) {
                var key = Mist.keysController.keyExists(args.payload.key) ? args.payload.key : null;
                var that = this;
                this.set('addingCloud', true);
                Mist.ajax.POST('/clouds', args.payload)
                .success(function (cloud) {
                    that._addCloud(cloud, key);
                }).error(function (message) {
                    Mist.notificationController.notify(
                        'Failed to add cloud: ' + message);
                }).complete(function (success, cloud) {
                    that.set('addingCloud', false);
                    if (args.callback) args.callback(success, cloud);
                });
            },

            renameCloud: function (args) {
                var that = this;
                this.set('renamingCloud', true);
                Mist.ajax.PUT('/clouds/' + args.cloud.id, {
                    'new_name': args.newTitle
                }).success(function () {
                    that._renameCloud(args.cloud, args.newTitle);
                }).error(function () {
                    Mist.notificationController.notify(
                        'Failed to rename cloud');
                }).complete(function (success) {
                    that.set('renamingCloud', false);
                    Mist.cloudEditController.set('editingCloud', false);
                    if (args.callback) args.callback(success);
                });
            },

            deleteCloud: function(args) {
                var that = this;
                this.set('deletingCloud', true);
                Mist.ajax.DELETE('/clouds/' + args.cloud.id, {
                }).success(function() {
                    that._deleteCloud(args.cloud);
                }).error(function() {
                    Mist.notificationController.notify(
                        'Failed to delete cloud');
                }).complete(function(success) {
                    that.set('deletingCloud', false);
                    if (args.callback) args.callback(success);
                });
            },

            toggleCloud: function(args) {
                var that = this;
                this.set('togglingCloud', true);
                Mist.ajax.POST('/clouds/' + args.cloud.id, {
                    'new_state': args.newState.toString()
                }).success(function () {
                    that._toggleCloud(args.cloud, args.newState);
                }).error(function () {
                    Mist.notificationController.notify(
                        "Failed to change cloud's state");
                }).complete(function (success) {
                    that.set('togglingCloud', false);
                    if (args.callback) args.callback(success);
                });
            },

            probeMachine: function(machine, keyId, callback) {
                // TODO: This should be moved inside machines controller

                if (!machine.id || machine.id == -1) return;
                if (!machine.state == 'running') return;

                var host = machine.getHost();
                if (!host) return;

                var key = Mist.keysController.getKey(keyId);
                if (key) {
                    machine.set('probing', keyId);
                    key.set('probing', machine);
                } else {
                    machine.set('probing', true);
                }
                var that = this;
                var uptime = null;
                Mist.ajax.POST('/clouds/' + machine.cloud.id + '/machines/' + machine.id + '/probe', {
                    'host': host,
                    'key': keyId
                }).success(function (data) {
                    machine.probeSuccess(data);
                }).error(function(message) {
                    if (!machine.cloud || !machine.cloud.enabled) return;
                    if (key) Mist.notificationController.notify(message);
                }).complete(function(success, data) {
                    if (!machine.cloud || !machine.cloud.enabled) return;
                    if (key)
                        key.set('probing', false);
                    machine.set('probing', false);
                    that.trigger('onMachineProbe');
                    if (callback) callback(!!data.uptime, data);
                });
            },

            providerList: function() {
                return SUPPORTED_PROVIDERS.map(function (provider) {
                    provider.className = 'provider-';
                    if (provider.provider == 'bare_metal')
                        provider.className += 'baremetal';
                    else if (provider.provider == 'indonesian_vcloud')
                        provider.className += 'indonesian';
                    else
                        provider.className += provider.provider;
                    return provider;
                }).sort(function (a, b) {
                    if (a.provider == 'bare_metal')
                        return 1;
                    if (b.provider == 'bare_metal')
                        return -1;
                    if (a.title > b.title)
                        return 1;
                    if (a.title < b.title)
                        return -1
                    return 0;
                });
            }.property('providerList'),

            getRequestedMachine: function() {
                if (this.machineRequest) {
                    return this.getMachine(this.machineRequest);
                }
            },

            getRequestedNetwork: function () {
                if (this.networkRequest) {
                    return this.getNetwork(this.networkRequest);
                }
            },

            getRequestedImage: function () {
                if (this.imageRequest) {
                    return this.getImage(this.imageRequest);
                }
            },

            getCloud: function(cloudId) {
                return this.model.findBy('id', cloudId);
            },

            getMachine: function(machineId, cloudId) {
                if (cloudId) {
                    var cloud = this.getCloud(cloudId);
                    if (cloud)
                        return cloud.getMachine(machineId);
                    return null;
                }

                var machine = null;
                this.model.some(function(cloud) {
                    return machine = cloud.getMachine(machineId);
                });
                return machine;
            },

            getNetwork: function (networkId, cloudId) {
                if (cloudId) {
                    var cloud = this.getCloud(cloudId);
                    if (cloud)
                        return cloud.getNetwork(networkId);
                    return null;
                }

                var network = null;
                this.model.some(function(cloud) {
                    return network = cloud.getNetwork(networkId);
                });
                return network;
            },

            getImage: function(imageId, cloudId) {
                if (cloudId) {
                    var cloud = this.getCloud(cloudId);
                    if (cloud)
                        return cloud.getImage(imageId);
                    return null;
                }

                var image = null;
                this.model.some(function(cloud) {
                    return image = cloud.getImage(imageId);
                });
                return image;
            },

            machineExists: function(machineId, cloudId) {
                return !!this.getMachine(machineId, cloudId);
            },

            cloudExists: function(cloudId) {
                return !!this.getCloud(cloudId);
            },

            networkExists: function (networkId, cloudId) {
                return !!this.getNetwork(networkId, cloudId);
            },


            //
            //  Psudo-Private Methods
            //

            _updateModel: function (clouds) {
                Ember.run(this, function() {
                    // Remove deleted clouds
                    this.model.forEach(function (cloud) {
                        if (!clouds.findBy('id', cloud.id))
                            this.model.removeObject(cloud);
                    }, this);

                    clouds.forEach(function (cloud) {

                        var oldCloud = this.getCloud(cloud.id);

                        if (oldCloud)
                            // Update existing clouds
                            forIn(cloud, function (value, property) {
                                oldCloud.set(property, value);
                            });
                        else
                            // Add new clouds
                            this._addCloud(cloud);
                    }, this);

                    this.trigger('onCloudListChange');
                });
            },

            _addCloud: function(cloud, keyId) {
                Ember.run(this, function() {
                    if (this.cloudExists(cloud.id)) return;
                    var cloudModel = Cloud.create(cloud);
                    this.model.addObject(cloudModel);
                    // <TODO (gtsop): move this code into cloud model
                    if (keyId)
                        cloudModel.one('onMachineListChange', function() {
                            if (cloudModel.provider == 'bare_metal') {
                                Mist.keysController._associateKey(keyId,
                                    cloudModel.machines.model[0]);
                            }
                        });
                    // />
                    this.trigger('onCloudAdd');
                });
            },

            _deleteCloud: function(cloud) {
                Ember.run(this, function() {
                    this.model.removeObject(cloud);
                    this.trigger('onCloudDelete');
                });
            },

            _renameCloud: function(cloud, newTitle) {
                Ember.run(this, function() {
                    cloud.set('title', newTitle);
                    this.trigger('onCloudRename');
                });
            },

            _toggleCloud: function(cloud, newState) {
                Ember.run(this, function() {
                    cloud.set('enabled', newState);
                    this.trigger('onCloudToggle');
                });
            },

            _updateImageCount: function() {
                Ember.run(this, function() {
                    var counter = 0;
                    this.model.forEach(function(cloud) {
                        if (cloud.enabled)
                            counter += cloud.images.model.length;
                    });
                    if (counter != this.get('imageCount')){
                        this.set('imageCount', counter);
                        this.trigger('onImagesChange');
                    }
                });
            },

            _updateMachineCount: function() {
                Ember.run(this, function() {
                    var counter = 0;
                    this.model.forEach(function(cloud) {
                        if (cloud.enabled) counter += cloud.machineCount;
                    });
                    this.set('machineCount', counter);
                    this.trigger('onMachineListChange');
                });
            },

            _updateNetworkCount: function() {
                Ember.run(this, function() {
                    var counter = 0;
                    this.model.forEach(function (cloud) {
                        if (cloud.enabled)
                            counter += cloud.networkCount;
                    });
                    this.set('networkCount', counter);
                    this.trigger('onNetworkListChange');
                });
            },

            _updateLoadingImages: function() {
                this.set('loadingImages',
                    !!this.model.findBy('loadingImages', true));
            },

            _updateLoadingMachines: function() {
                this.set('loadingMachines',
                    !!this.model.findBy('loadingMachines', true));
            },

            _updateLoadingNetworks: function () {
                this.set('loadingNetworks',
                    !!this.model.findBy('loadingNetworks', true));
            },

            _updateSelectedMachines: function() {
                Ember.run(this, function() {
                    var newSelectedMachines = [];
                    this.model.forEach(function(cloud) {
                        newSelectedMachines = newSelectedMachines.concat(cloud.selectedMachines);
                    });
                    this.set('selectedMachines', newSelectedMachines);
                    this.trigger('onSelectedMachinesChange');
                });
            },

            _updateSelectedNetworks: function () {
                Ember.run(this, function () {
                    var newSelectedNetworks = [];
                    this.model.forEach(function (cloud) {
                        newSelectedNetworks = newSelectedNetworks.concat(cloud.selectedNetworks);
                    });
                    this.set('selectedNetworks', newSelectedNetworks);
                    this.trigger('onSelectedNetworksChange');
                });
            },

            _updateMachines: function () {
                var clouds = Mist.cloudsController.model;
                var machineList = [];
                clouds.forEach(function (cloud) {
                    machineList.pushObjects(cloud.machines.model);
                });
                this.set('machines', machineList);
            },


            //
            //  Observers
            //

            machineObserver: function () {
                Ember.run.next(this, '_updateMachines');
            }.observes('model.@each.machines'),

            imageCountObserver: function() {
                Ember.run.once(this, '_updateImageCount');
            }.observes('model.@each.imageCount'),

            machineCountObserver: function() {
                Ember.run.once(this, '_updateMachineCount');
            }.observes('model.@each.machineCount'),

            networkCountObserver: function () {
                Ember.run.once(this, '_updateNetworkCount');
            }.observes('model.@each.networkCount'),

            loadingImagesObserver: function() {
                Ember.run.once(this, '_updateLoadingImages');
            }.observes('model.@each.loadingImages'),

            loadingMachinesObserver: function() {
                Ember.run.once(this, '_updateLoadingMachines');
            }.observes('model.@each.loadingMachines'),

            loadingNetworksObserver: function () {
                Ember.run.once(this, '_updateLoadingNetworks');
            }.observes('model.@each.loadingNetworks'),

            selectedMachinesObserver: function () {
                Ember.run.once(this, '_updateSelectedMachines');
            }.observes('model.@each.selectedMachines'),

            selectedNetworksObserver: function () {
                Ember.run.once(this, '_updateSelectedNetworks');
            }.observes('model.@each.selectedNetworks')
        });
    }
);
