define('app/controllers/clouds', ['app/models/cloud', 'ember'],
    //
    //  Clouds Controller
    //
    //  @returns Class
    //
    function (Cloud) {

        'use strict';

        return Ember.ArrayController.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            content: [],
            imageCount: 0,
            machineCount: 0,
            networkCount: 0,
            selectedMachines: [],
            selectedNetworks: [],
            machineRequest: false,
            networkRequest: false,

            addingCloud: false,
            deletingCloud: false,
            togglingCloud: false,
            checkedMonitoring: false,
            checkingMonitoring: false,

            loading: true,
            loadingImages: false,
            loadingMachines: false,


            hasOpenStack: function () {
                return !!this.content.filterBy('enabled', true).findBy('isOpenStack', true);
            }.property('content.@each.isOpenStack', 'content.@each.enabled'),

            hasNetworks: function () {
                return !!this.content.findBy('hasNetworks', true);
            }.property('content.@each.hasNetworks'),

            //
            //
            //  Initialization
            //
            //


            load: function (clouds) {
                this._updateContent(clouds);
                this.set('loading', false);
            },


            //
            //
            //  Methods
            //
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


            updateMachineCount: function() {
                var count = 0;
                var content = this.content;
                var contentLength = this.content.length;
                for (var b = 0; b < contentLength; ++b) {
                    count += content[b].machines.content.length;
                }
                this.set('machineCount', count);
                this.trigger('updateMachines');
            }.observes('content.length'),


            updateImageCount: function() {
                var count = 0;
                this.content.forEach(function(cloud) {
                    count += cloud.images.content.length;
                });
                this.set('imageCount', count);
            }.observes('content.length'),


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


            getCloud: function(cloudId) {
                return this.content.findBy('id', cloudId);
            },


            getMachine: function(machineId, cloudId) {

                if (cloudId) {
                    var cloud = this.getCloud(cloudId);
                    if (cloud)
                        return cloud.getMachine(machineId);
                    return null;
                }

                var machine = null;
                this.content.some(function(cloud) {
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
                this.content.some(function(cloud) {
                    return network = cloud.getNetwork(networkId);
                });
                return network;
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
            //
            //  Psudo-Private Methods
            //
            //


            _updateContent: function (clouds) {
                Ember.run(this, function() {

                    // Remove deleted clouds
                    this.content.forEach(function (cloud) {
                        if (!clouds.findBy('id', cloud.id))
                            this.content.removeObject(cloud);
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
                    this.content.addObject(cloudModel);
                    // <TODO (gtsop): move this code into cloud model
                    if (keyId)
                        cloudModel.one('onMachineListChange', function() {
                            if (cloudModel.provider == 'bare_metal') {
                                Mist.keysController._associateKey(keyId,
                                    cloudModel.machines.content[0]);
                            }
                        });
                    // />
                    this.trigger('onCloudAdd');
                });
            },


            _deleteCloud: function(cloud) {
                Ember.run(this, function() {
                    this.content.removeObject(cloud);
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
                    this.content.forEach(function(cloud) {
                        if (cloud.enabled) counter += cloud.imageCount;
                    });
                    this.set('imageCount', counter);
                    this.trigger('onImageListChange');
                });
            },


            _updateMachineCount: function() {
                Ember.run(this, function() {
                    var counter = 0;
                    this.content.forEach(function(cloud) {
                        if (cloud.enabled) counter += cloud.machineCount;
                    });
                    this.set('machineCount', counter);
                    this.trigger('onMachineListChange');
                });
            },


            _updateNetworkCount: function() {
                Ember.run(this, function() {
                    var counter = 0;
                    this.content.forEach(function (cloud) {
                        if (cloud.enabled)
                            counter += cloud.networkCount;
                    });
                    this.set('networkCount', counter);
                    this.trigger('onNetworkListChange');
                });
            },


            _updateLoadingImages: function() {
                this.set('loadingImages',
                    !!this.content.findBy('loadingImages', true));
            },


            _updateLoadingMachines: function() {
                this.set('loadingMachines',
                    !!this.content.findBy('loadingMachines', true));
            },


            _updateLoadingNetworks: function () {
                this.set('loadingNetworks',
                    !!this.content.findBy('loadingNetworks', true));
            },


            _updateSelectedMachines: function() {
                Ember.run(this, function() {
                    var newSelectedMachines = [];
                    this.content.forEach(function(cloud) {
                        newSelectedMachines = newSelectedMachines.concat(cloud.selectedMachines);
                    });
                    this.set('selectedMachines', newSelectedMachines);
                    this.trigger('onSelectedMachinesChange');
                });
            },


            _updateSelectedNetworks: function () {
                Ember.run(this, function () {
                    var newSelectedNetworks = [];
                    this.content.forEach(function (cloud) {
                        newSelectedNetworks = newSelectedNetworks.concat(cloud.selectedNetworks);
                    });
                    this.set('selectedNetworks', newSelectedNetworks);
                    this.trigger('onSelectedNetworksChange');
                });
            },


            //
            //
            //  Observers
            //
            //


            imageCountObserver: function() {
                Ember.run.once(this, '_updateImageCount');
            }.observes('content.@each.imageCount'),


            mahcineCountObserver: function() {
                Ember.run.once(this, '_updateMachineCount');
            }.observes('content.@each.machineCount'),


            networkCountObserver: function () {
                Ember.run.once(this, '_updateNetworkCount');
            }.observes('content.@each.networkCount'),


            loadingImagesObserver: function() {
                Ember.run.once(this, '_updateLoadingImages');
            }.observes('content.@each.loadingImages'),


            loadingMachinesObserver: function() {
                Ember.run.once(this, '_updateLoadingMachines');
            }.observes('content.@each.loadingMachines'),


            loadingNetworksObserver: function () {
                Ember.run.once(this, '_updateLoadingNetworks');
            }.observes('content.@each.loadingNetworks'),


            selectedMachinesObserver: function () {
                Ember.run.once(this, '_updateSelectedMachines');
            }.observes('content.@each.selectedMachines'),


            selectedNetworksObserver: function () {
                Ember.run.once(this, '_updateSelectedNetworks');
            }.observes('content.@each.selectedNetworks')
        });
    }
);
