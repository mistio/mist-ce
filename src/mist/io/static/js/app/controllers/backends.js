define('app/controllers/backends', ['app/models/backend','app/models/rule','ember'],
    /**
     *  Backends Controller
     *
     *  @returns Class
     */
    function(Backend, Rule) {
        return Ember.ArrayController.extend({

            /**
             * 
             *  Properties
             * 
             */

            content: [],
            imageCount: 0,
            machineCount: 0,
            machineRequest: false,
            machineResponse: false,
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
                        Ember.run.later(this, function() {
                            this.machineRequestObserver();
                        }, 1500);
                        return;
                    }
                    this.set('machineResponse', this.getMachineByUrlId(this.machineRequest));
                    this.set('machineRequest', false);
                }
            }.observes('machineRequest'),


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
                var payload = JSON.stringify({
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
                    data: payload,
                    contentType: 'application/json',
                    success: function(backend) {
                        that._addBackend(backend);
                        if (callback) callback();
                    },
                    error: function() {
                        Mist.notificationController.notify('Failed to add backend');
                    },
                    complete: function() {
                        that.set('addingBackend', false);
                    }
                });
            },


            updateMachineCount: function() {
                var count = 0;
                this.forEach(function(backend) {
                    count += backend.machines.content.length;
                });
                this.set('machineCount', count);
            }.observes('content.length'),


            updateImageCount: function() {
                var count = 0;
                this.forEach(function(backend) {
                    count += backend.images.content.length;
                });
                this.set('imageCount', count);
            }.observes('content.length'),


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
            }
        });
    }
);
