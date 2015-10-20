define('app/controllers/backends', ['app/models/backend', 'ember'],
    //
    //  Backends Controller
    //
    //  @returns Class
    //
    function (Backend) {

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

            addingBackend: false,
            deletingBackend: false,
            togglingBackend: false,
            checkedMonitoring: false,
            checkingMonitoring: false,

            loading: true,
            loadingImages: false,
            loadingMachines: false,

            hasOpenStack: function () {
                return !!this.model.filterBy('enabled', true).findBy('isOpenStack', true);
            }.property('model.[].isOpenStack', 'model.[].enabled'),

            hasNetworks: function () {
                return !!this.model.findBy('hasNetworks', true);
            }.property('model.[].hasNetworks'),

            sortedMachines: Ember.computed.sort('machines', function(a, b){
                if (Mist.backendsController.sortBy == 'name')
                    return a.name.localeCompare(b.name);
                else
                    return b.get('stateWeight') - a.get('stateWeight');
            }).property('machines', 'sortBy', 'machines.@each.stateWeight', 'machines.@each.name'),


            //
            //  Initialization
            //

            load: function (backends) {
                this._updateModel(backends);
                this.set('loading', false);
            },


            //
            //  Methods
            //

            addBackend: function (args) {
                var key = Mist.keysController.keyExists(args.payload.key) ? args.payload.key : null;
                var that = this;
                this.set('addingBackend', true);
                Mist.ajax.POST('/backends', args.payload)
                .success(function (backend) {
                    that._addBackend(backend, key);
                }).error(function (message) {
                    Mist.notificationController.notify(
                        'Failed to add backend: ' + message);
                }).complete(function (success, backend) {
                    that.set('addingBackend', false);
                    if (args.callback) args.callback(success, backend);
                });
            },

            renameBackend: function (args) {
                var that = this;
                this.set('renamingBackend', true);
                Mist.ajax.PUT('/backends/' + args.backend.id, {
                    'new_name': args.newTitle
                }).success(function () {
                    that._renameBackend(args.backend, args.newTitle);
                }).error(function () {
                    Mist.notificationController.notify(
                        'Failed to rename backend');
                }).complete(function (success) {
                    that.set('renamingBackend', false);
                    Mist.backendEditController.set('editingBackend', false);
                    if (args.callback) args.callback(success);
                });
            },

            deleteBackend: function(args) {
                var that = this;
                this.set('deletingBackend', true);
                Mist.ajax.DELETE('/backends/' + args.backend.id, {
                }).success(function() {
                    that._deleteBackend(args.backend);
                }).error(function() {
                    Mist.notificationController.notify(
                        'Failed to delete backend');
                }).complete(function(success) {
                    that.set('deletingBackend', false);
                    if (args.callback) args.callback(success);
                });
            },

            toggleBackend: function(args) {
                var that = this;
                this.set('togglingBackend', true);
                Mist.ajax.POST('/backends/' + args.backend.id, {
                    'new_state': args.newState.toString()
                }).success(function () {
                    that._toggleBackend(args.backend, args.newState);
                }).error(function () {
                    Mist.notificationController.notify(
                        "Failed to change backend's state");
                }).complete(function (success) {
                    that.set('togglingBackend', false);
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
                Mist.ajax.POST('/backends/' + machine.backend.id + '/machines/' + machine.id + '/probe', {
                    'host': host,
                    'key': keyId
                }).success(function (data) {
                    machine.probeSuccess(data);
                }).error(function(message) {
                    console.log(message);
                    if (!machine.backend || !machine.backend.enabled) return;
                    if (key) Mist.notificationController.notify(message);
                }).complete(function(success, data) {
                    if (!machine.backend || !machine.backend.enabled) return;
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

            getBackend: function(backendId) {
                return this.model.findBy('id', backendId);
            },

            getMachine: function(machineId, backendId) {
                if (backendId) {
                    var backend = this.getBackend(backendId);
                    if (backend)
                        return backend.getMachine(machineId);
                    return null;
                }

                var machine = null;
                this.model.some(function(backend) {
                    return machine = backend.getMachine(machineId);
                });
                return machine;
            },

            getNetwork: function (networkId, backendId) {
                if (backendId) {
                    var backend = this.getBackend(backendId);
                    if (backend)
                        return backend.getNetwork(networkId);
                    return null;
                }

                var network = null;
                this.model.some(function(backend) {
                    return network = backend.getNetwork(networkId);
                });
                return network;
            },

            getImage: function(imageId, backendId) {
                if (backendId) {
                    var backend = this.getBackend(backendId);
                    if (backend)
                        return backend.getImage(imageId);
                    return null;
                }

                var image = null;
                this.model.some(function(backend) {
                    return image = backend.getImage(imageId);
                });
                return image;
            },

            machineExists: function(machineId, backendId) {
                return !!this.getMachine(machineId, backendId);
            },

            backendExists: function(backendId) {
                return !!this.getBackend(backendId);
            },

            networkExists: function (networkId, backendId) {
                return !!this.getNetwork(networkId, backendId);
            },


            //
            //  Psudo-Private Methods
            //

            _updateModel: function (backends) {
                Ember.run(this, function() {
                    // Remove deleted backends
                    this.model.forEach(function (backend) {
                        if (!backends.findBy('id', backend.id))
                            this.model.removeObject(backend);
                    }, this);

                    backends.forEach(function (backend) {

                        var oldBackend = this.getBackend(backend.id);

                        if (oldBackend)
                            // Update existing backends
                            forIn(backend, function (value, property) {
                                oldBackend.set(property, value);
                            });
                        else
                            // Add new backends
                            this._addBackend(backend);
                    }, this);

                    this.trigger('onBackendListChange');
                });
            },

            _addBackend: function(backend, keyId) {
                Ember.run(this, function() {
                    if (this.backendExists(backend.id)) return;
                    var backendModel = Backend.create(backend);
                    this.model.addObject(backendModel);
                    // <TODO (gtsop): move this code into backend model
                    if (keyId)
                        backendModel.one('onMachineListChange', function() {
                            if (backendModel.provider == 'bare_metal') {
                                Mist.keysController._associateKey(keyId,
                                    backendModel.machines.model[0]);
                            }
                        });
                    // />
                    this.trigger('onBackendAdd');
                });
            },

            _deleteBackend: function(backend) {
                Ember.run(this, function() {
                    this.model.removeObject(backend);
                    this.trigger('onBackendDelete');
                });
            },

            _renameBackend: function(backend, newTitle) {
                Ember.run(this, function() {
                    backend.set('title', newTitle);
                    this.trigger('onBackendRename');
                });
            },

            _toggleBackend: function(backend, newState) {
                Ember.run(this, function() {
                    backend.set('enabled', newState);
                    this.trigger('onBackendToggle');
                });
            },

            _updateImageCount: function() {
                Ember.run(this, function() {
                    var counter = 0;
                    this.model.forEach(function(backend) {
                        if (backend.enabled)
                            counter += backend.images.model.length;
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
                    this.model.forEach(function(backend) {
                        if (backend.enabled) counter += backend.machineCount;
                    });
                    this.set('machineCount', counter);
                    this.trigger('onMachineListChange');
                });
            },

            _updateNetworkCount: function() {
                Ember.run(this, function() {
                    var counter = 0;
                    this.model.forEach(function (backend) {
                        if (backend.enabled)
                            counter += backend.networkCount;
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
                    this.model.forEach(function(backend) {
                        newSelectedMachines = newSelectedMachines.concat(backend.selectedMachines);
                    });
                    this.set('selectedMachines', newSelectedMachines);
                    this.trigger('onSelectedMachinesChange');
                });
            },

            _updateSelectedNetworks: function () {
                Ember.run(this, function () {
                    var newSelectedNetworks = [];
                    this.model.forEach(function (backend) {
                        newSelectedNetworks = newSelectedNetworks.concat(backend.selectedNetworks);
                    });
                    this.set('selectedNetworks', newSelectedNetworks);
                    this.trigger('onSelectedNetworksChange');
                });
            },

            _updateMachines: function () {
                var backends = Mist.backendsController.model;
                var machineList = [];
                backends.forEach(function (backend) {
                    machineList.pushObjects(backend.machines.model);
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
