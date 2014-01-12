define('app/controllers/backends', ['app/models/backend', 'app/models/rule', 'ember'],
    /**
     *  Backends Controller
     *
     *  @returns Class
     */
    function(Backend, Rule) {
        return Ember.ArrayController.extend(Ember.Evented, {

            /**
             * 
             *  Properties
             * 
             */

            content: [],
            imageCount: 0,
            machineCount: 0,
            selectedMachines: [],
            machineRequest: false,
            
            addingBackend: false,
            deletingBackend: false,
            togglingBackend: false,
            checkingMonitoring: false,

            loading: false,
            loadingImages: false,
            loadingMachines: false,

            /**
             * 
             *  Initialization
             * 
             */

            load: function() {
                var that = this;
                this.set('loading', true);
                Mist.ajax.GET('/backends', {
                }).success(function(backends) {
                    that._setContent(backends);
                    that.checkMonitoring();
                }).error(function() {
                    that._reload();
                }).complete(function() {
                    that.set('loading', false);
                    that.trigger('onLoad');
                });
            }.on('init'),



            /**
             * 
             *  Methods
             * 
             */

            addBackend: function(title, provider, apiKey, apiSecret, apiUrl, tenant, callback) {
                var that = this;
                this.set('addingBackend', true);
                Mist.ajax.POST('/backends', {
                    'title'      : title,
                    'provider'   : provider,
                    'apikey'     : apiKey,
                    'apisecret'  : apiSecret,
                    'apiurl'     : apiUrl,
                    'tenant_name': tenant
                }).success(function(backend) {
                    that._addBackend(backend);
                }).error(function() {
                    Mist.notificationController.notify('Failed to add backend');
                }).complete(function(success) {
                    that.set('addingBackend', false);
                    if (callback) callback(success);
                });
            },


            deleteBackend: function(backendId, callback) {
                var that = this;
                this.set('deletingBackend', true);
                Mist.ajax.DELETE('/backends/' + backendId, {
                }).success(function() {
                    that._deleteBackend(backendId);
                }).error(function() {
                    Mist.notificationController.notify('Failed to delete backend');
                }).complete(function(success) {
                    that.set('deletingBackend', false);
                    if (callback) callback(success);
                });
            },


            toggleBackend: function(backendId, newState, callback) {
                var that = this;
                this.set('togglingBackend', true);
                Mist.ajax.POST('/backends/' + backendId, {
                    'new_state': newState ? '1' : '0'
                }).success(function() {
                    that._toggleBackend(backendId, newState);
                }).error(function() {
                    Mist.notificationController.notify("Failed to change backend's state");
                    that._toggleBackend(backendId, !newState);
                }).complete(function(success) {
                    that.set('togglingBackend', false);
                    if (callback) callback(success);
                });
            },
 
 
            checkMonitoring: function() {
                if (!Mist.authenticated) return;

                var that = this;
                this.set('checkingMonitoring', true);
                Mist.ajax.GET('/monitoring', {
                }).success(function(data) {
                    Mist.set('monitored_machines', data.machines);
                    Mist.set('current_plan', data.current_plan);
                    Mist.set('user_details', data.user_details);

                    data.machines.forEach(function(machine_tuple) {
                        var machine = that.getMachineById(machine_tuple[0], machine_tuple[1]);
                        if (machine) {
                            machine.set('hasMonitoring', true);
                        }
                    });

                   /* TODO: These rules should be returned properly from
                    *       the server, so that we can use a forEach loop
                    *       to make this world a better place.
                    */
                    var rules = data.rules;
                    for (ruleId in rules) {
                        var rule = {};
                        rule.id = ruleId;
                        rule.value = rules[ruleId].value;
                        rule.metric = rules[ruleId].metric;
                        rule.command = rules[ruleId].command;
                        rule.maxValue = rules[ruleId].max_value;
                        rule.actionToTake = rules[ruleId].action;
                        rule.operator = Mist.rulesController.getOperatorByTitle(rules[ruleId].operator);
                        rule.machine = that.getMachineById(rules[ruleId].backend, rules[ruleId].machine);
                        if (!rule.machine) {
                            rule.backend_id = rules[ruleId].backend;
                            rule.machine_id = rules[ruleId].machine;
                        }
                        Mist.rulesController.pushObject(Rule.create(rule));
                    }
                    Mist.rulesController.redrawRules();
                }).error(function() {
                    Mist.notificationController.notify('Failed to get monitoring data');
                }).complete(function() {
                    that.set('checkingMonitoring', false);
                });
            },


            probeMachine: function(machine, keyId, callback) {

                // TODO: This should be moved inside machines controller

                if (!machine.id) return;
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

                Mist.ajax.POST('/backends/' + machine.backend.id + '/machines/' + machine.id + '/probe', {
                    'host': host,
                    'key': keyId
                }).success(function(data) {
                    var uptime = parseFloat(data.uptime.split(' ')[0]) * 1000;
                    machine.set('uptimeChecked', Date.now());
                    machine.set('uptimeFromServer', uptime);
                    machine.set('probed', true);
                }).error(function(message) {
                    if (key) Mist.notificationController.notify(message);
                }).complete(function(success) {
                    if (key) {
                        key.updateMachineUptimeChecked(machine, (success ? 1 : -1 ) * Date.now());
                        key.set('probing', false);
                    }
                    machine.set('probing', false);
                    if (callback) callback(success);
                });
            },


            getMachineByUrlId: function(machineId) {
                var machines = null;
                var machinesLength = 0;
                var content = this.content;
                var contentLength = this.content.length;
                for (var b = 0; b < contentLength; ++b) {
                    machines = content[b].machines.content;
                    machinesLength = machines.length;
                    for (var m = 0; m < machinesLength; ++m) {
                        if (machines[m].id == machineId) {
                            return machines[m];
                        }
                    }
                }
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
                this.content.forEach(function(backend) {
                    count += backend.images.content.length;
                });
                this.set('imageCount', count);
            }.observes('content.length'),


            providerList: function() {
                return SUPPORTED_PROVIDERS;
            }.property('providerList'),


            getRequestedMachine: function() {
                if (this.machineRequest) {
                    return this.getMachine(this.machineRequest);
                }
            },


            getBackend: function(backendId) {
                return this.content.findBy('id', backendId);
            },


            getMachine: function(machineId, backendId) {

                // If backendId is provided, get machine
                // directly from that backend
                if (backendId) {
                    var backend = this.getBackend(backendId);
                    if (backend) 
                        return backend.getMachine(machineId);
                    return null;
                }

                // When backendId is not provided, search
                // through all backends to find machineId
                var machine = null;
                this.content.some(function(backend) {
                    return machine = backend.getMachine(machineId);
                });
                return machine;
            },


            machineExists: function(machineId) {
                return !!this.getMachine(machineId);
            },


            backendExists: function(backendId) {
                return !!this.getBackend(backendId);
            },

            shutdownMachine: function(machineId) {
                this.content.some(function(backend) {
                    if (backend.getMachine(machineId)) {
                        backend.shutdownMachine(machineId);
                        return true;
                    }
                });
            },

            destroyMachine: function(machineId) {
               this.content.some(function(backend) {
                    if (backend.getMachine(machineId)) {
                        backend.destroyMachine(machineId);
                        return true;
                    }
                });
            },

            rebootMachine: function(machineId) {
               this.content.some(function(backend) {
                    if (backend.getMachine(machineId)) {
                        backend.rebootMachine(machineId);
                        return true;
                    }
                });
            },

            startMachine: function(machineId) {
               this.content.some(function(backend) {
                    if (backend.getMachine(machineId)) {
                        backend.startMachine(machineId);
                        return true;
                    }
                });
            },


            /**
             * 
             *  Psudo-Private Methods
             * 
             */

            _reload: function() {
                Ember.run.later(this, function() {
                    this.load();
                }, 2000);
            },


            _setContent: function(backends) {
                var that = this;
                Ember.run(function() {
                    that.set('content', []);
                    backends.forEach(function(backend) {
                        that.content.pushObject(Backend.create(backend));
                    });
                    that.trigger('onBackendListChange');
                });
            },


            _addBackend: function(backend) {
                Ember.run(this, function() {
                    this.content.pushObject(Backend.create(backend));
                    this.trigger('onBackendListChange');
                    this.trigger('onBackendAdd');
                });
            },


            _deleteBackend: function(id) {
                Ember.run(this, function() {
                    this.content.removeObject(this.getBackend(id));
                    this.trigger('onBackendListChange');
                    this.trigger('onBackendDelete');
                });
            },


            _toggleBackend: function(id, newState) {
                Ember.run(this, function() {
                    this.getBackend(id).set('enabled', newState);
                    this.trigger('onBackendToggle');
                });
            },


            _updateImageCount: function() {
                Ember.run(this, function() {
                    var counter = 0;
                    this.content.forEach(function(backend) {
                        if (backend.enabled) counter += backend.imageCount;
                    });
                    this.set('imageCount', counter);
                    this.trigger('onImageListChange');
                });
            },


            _updateMachineCount: function() {
                Ember.run(this, function() {
                    var counter = 0;
                    this.content.forEach(function(backend) {
                        if (backend.enabled) counter += backend.machineCount;
                    });
                    this.set('machineCount', counter);
                    this.trigger('onMachineListChange');
                });
            },            


            _updateLoadingImages: function() {
                Ember.run(this, function() {
                    var loadingImages = false;
                    this.content.some(function(backend) {
                        if (backend.loadingImages) return loadingImages = true;
                    });
                    this.set('loadingImages', loadingImages);
                });
            },


            _updateLoadingMachines: function() {
                Ember.run(this, function() {
                    var loadingMachines = false;
                    this.content.some(function(backend) {
                        if (backend.loadingMachines) return loadingMachines = true;
                    });
                    this.set('loadingMachines', loadingMachines);
                });
            },


            _updateSelectedMachines: function() {
                Ember.run(this, function() {
                    var newSelectedMachines = [];
                    this.content.forEach(function(backend) {
                        newSelectedMachines = newSelectedMachines.concat(backend.selectedMachines);
                    });
                    this.set('selectedMachines', newSelectedMachines);
                    this.trigger('onSelectedMachinesChange');
                });
            },



            /**
             * 
             *  Observers
             * 
             */

            imageCountObserver: function() {
                Ember.run.once(this, '_updateImageCount');
            }.observes('content.@each.imageCount'),
 
 
            mahcineCountObserver: function() {
                Ember.run.once(this, '_updateMachineCount');
            }.observes('content.@each.machineCount'),
 

            loadingImagesObserver: function() {
                Ember.run.once(this, '_updateLoadingImages');
            }.observes('content.@each.loadingImages'),


            loadingMachinesObserver: function() {
                Ember.run.once(this, '_updateLoadingMachines');
            }.observes('content.@each.loadingMachines'),


            selectedMachinesObserver: function() {
                Ember.run.once(this, '_updateSelectedMachines');
            }.observes('content.@each.selectedMachines')
        });
    }
);
