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
            addingBackend: false,
            machineRequest: false,
            machineResponse: false,
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
                $.getJSON('/backends', function(backends) {
                    that._setContent(backends);
                    that.checkMonitoring();
                }).error(function() {
                    that._reload();
                }).complete(function() {
                    that.set('loading', false);
                });
            }.on('init'),



            /**
             * 
             *  Observers
             * 
             */

            machineRequestObserver: function() {
                if (this.machineRequest) {
                    if (this.loadingBackends || this.loadingMachines) {
                        return;
                    }
                    this.set('machineResponse', this.getMachineByUrlId(this.machineRequest));
                    this.set('machineRequest', false);
                }
            }.observes('machineRequest', 'content.@each.loadingMachines'),


            loadingMachinesObserver: function() {
                var content = this.content;
                var contentLength = this.content.length;
                for (var b = 0; b < contentLength; ++b) {
                    if (content[b].loadingMachines) {
                        this.set('loadingMachines', true);
                        return;
                    }
                }
                this.set('loadingMachines', false);
            }.observes('loading', 'content.@each.loadingMachines'),


            loadingImagesObserver: function() {
                var content = this.content;
                var contentLength = this.content.length;
                for (var b = 0; b < contentLength; ++b) {
                    if (content[b].loadingImages) {
                        this.set('loadingImages', true);
                        return;
                    }
                }
                this.set('loadingImages', false);
            }.observes('loading', 'content.@each.loadingImages'),



            /**
             * 
             *  Methods
             * 
             */

            addBackend: function(title, provider, apiKey, apiSecret, apiUrl, tenant, callback) {
                var data = JSON.stringify({
                    'title'      : title,
                    'provider'   : provider,
                    'apikey'     : apiKey,
                    'apisecret'  : apiSecret,
                    'apiurl'     : apiUrl,
                    'tenant_name': tenant
                });
                var that = this;
                this.set('addingBackend', true);
                $.ajax({
                    url: '/backends',
                    type: 'POST',
                    data: data,
                    success: function(backend) {
                        that._addBackend(backend);
                    },
                    error: function() {
                        Mist.notificationController.notify('Failed to add backend');
                    },
                    complete: function(jqXHR) {
                        that.set('addingBackend', false);
                        if (callback) callback(jqXHR.status == 200);
                    }
                });
            },


            deleteBackend: function(backendId, callback) {
                var that = this;
                this.set('deletingBackend', true);
                $.ajax({
                    url: '/backends/' + backendId,
                    type: 'DELETE',
                    success: function() {
                        that._deleteBackend(backendId);
                    },
                    error: function() {
                        Mist.notificationController.notify('Failed to delete backend');
                    },
                    complete: function(jqXHR) {
                        that.set('deletingBackend', false);
                        if (callback) callback(jqXHR.status == 200);
                    }
                });
            },


            toggleBackend: function(backendId, newState, callback) {
                var data = JSON.stringify({
                    'new_state': newState ? '1' : '0'
                });
                var that = this;
                this.set('togglingBackend', true);
                $.ajax({
                    url: '/backends/' + backendId,
                    type: 'POST',
                    data: data,
                    success: function() {
                        that._toggleBackend(backendId, newState);
                    },
                    error: function() {
                        Mist.notificationController.notify("Failed to change backend's state");
                        that._toggleBackend(backendId, !newState);
                    },
                    complete: function(jqXHR) {
                        that.set('togglingBackend', false);
                        if (callback) callback(jqXHR.status == 200); 
                    }
                });
            },
 
 
            checkMonitoring: function() {
                if (!Mist.authenticated) return;

                var that = this;
                this.set('checkingMonitoring', true);
                $.getJSON('/monitoring', function(data) {
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
                }).error( function() {
                    Mist.notificationController.notify('Failed to get monitoring data');
                }).complete(function() {
                    that.set('checkingMonitoring', false);
                });
            },


            getBackendById: function(backendId) {
                var content = this.content;
                var contentLength = this.content.length;
                for (var b = 0; b < contentLength; ++b) {
                    if (content[b].id == backendId) {
                        return content[b];
                    }
                }
            },


            getMachineById: function(backendId, machineId) {
                var content = this.content;
                var contentLength = this.content.length;
                for (var b = 0; b < contentLength; ++b) {
                    if (content[b].id == backendId) {
                        var machines = content[b].machines.content;
                        var machinesLength = machines.length;
                        for (var m = 0; m < machinesLength; ++m) {
                            if (machines[m].id == machineId) {
                                return machines[m];
                            }
                        }
                        return;
                    }
                }
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


            getSelectedMachinesCount: function() {
                var counter = 0;
                var machines = null;
                var machinesLength = 0;
                var content = this.content;
                var contentLength = this.content.length;
                for (var b = 0; b < contentLength; ++b) {
                    machines = content[b].machines.content;
                    machinesLength = machines.length;
                    for (var m = 0; m < machinesLength; ++m) {
                        if (machines[m].selected) {
                            info('yo');
                            ++counter;
                        }
                    }
                }
                return counter;
            },


            updateSelectedMachines: function() {
                var selectedMachines = [];
                var machines = null;
                var machinesLength = 0;
                var content = this.content;
                var contentLength = this.content.length;
                for (var b = 0; b < contentLength; ++b) {
                    machines = content[b].machines.content;
                    machinesLength = machines.length;
                    for (var m = 0; m < machinesLength; ++m) {
                        if (machines[m].selected) {
                            selectedMachines.push(machines[m].id);
                        }
                    }
                }
                this.set('selectedMachines', selectedMachines);
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



            /**
             * 
             *  Psudo-Private Methods
             * 
             */

            _setContent: function(backends) {
                var newBackends = [];
                var backendsLength = backends.length;
                for (var b = 0; b < backendsLength; ++b) {
                    newBackends.push(Backend.create(backends[b]));
                }
                this.set('content', newBackends);
            },


            _reload: function() {
                Ember.run.later(this, function() {
                    this.load();
                }, 2000);
            },


            _addBackend: function(backend) {
                this.content.pushObject(Backend.create(backend));
            },


            _deleteBackend: function(id) {
                Ember.run(this, function() {
                    this.content.removeObject(this.getBackendById(id));
                });
            },


            _toggleBackend: function(id, newState) {
                this.getBackendById(id).set('enabled', newState);
            }
        });
    }
);
