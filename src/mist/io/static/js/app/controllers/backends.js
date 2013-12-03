define('app/controllers/backends', ['app/models/backend','app/models/rule','ember'],
    /**
     *  Backends Controller
     *
     *  @returns Class
     */
    function(Backend, Rule) {
        return Ember.ArrayController.extend({

            content: [],
            imageCount: 0,
            machineCount: 0,
            loadingImages: true,
            loadingMachines: true,
            loadingBackends: true,
            selectedMachine: null,
            selectedMachineCount: 0,
            singleMachineRequest: null,
            singleMachineResponse: null,

            init: function() {
                this._super();
                var that = this;
                //$(document).bind('ready', function() {
                    //Ember.run.next(function() {
                        that.loadBackends();
                        Ember.run.later(function() {
                            that.checkMonitoring();
                        }, 5000);
                    //});
                //});
            },

            loadBackends: function() {
                var that = this;
                this.set('loadingBackends', true);
                $.getJSON('/backends', function(data) {
                    data.forEach(function(backend) {
                        that.pushObject(Backend.create(backend));
                    });
                    that.set('loadingBackends', false);
                }).error(function() {
                    Mist.notificationController.notify('Failed to load backends');
                    that.set('loadingBackends', false);
                    Ember.run.later(function() {
                        that.loadBackends();
                    }, 5000);
                });
            },

            addBackend: function(title, provider, apiKey, apiSecret, apiUrl, tenant, callback) {
                this.set('addingBackend', true);
                var that = this;
                $.ajax({
                    url: '/backends',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        'title'      : title,
                        'provider'   : provider,
                        'apikey'     : apiKey,
                        'apisecret'  : apiSecret,
                        'apiurl'     : apiUrl,
                        'tenant_name': tenant
                    }),
                    success: function(backend) {
                        Mist.backendsController.pushObject(Backend.create(backend));
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

            singleMachineRequestObserver: function() {
                if (this.singleMachineRequest) {
                    if (this.loadingBackends || this.loadingMachines) {
                        Ember.run.later(this, function() {
                            this.singleMachineRequestObserver();
                        }, 1000);
                        return;
                    }
                    this.set('singleMachineResponse', this.getMachineByUrlId(this.singleMachineRequest));
                    this.set('singleMachineRequest', false);
                }
            }.observes('singleMachineRequest'),

            loadingMachinesObserver: function() {
                var loadingMachines = false;
                this.some(function(backend) {
                    if (backend.loadingMachines) {
                        return loadingMachines = true;
                    }
                });
                this.set('loadingMachines', loadingMachines);
            }.observes('@each.loadingMachines', 'loadingBackends'),

            loadingImagesObserver: function() {
                var loadingImages = false;
                this.some(function(backend) {
                    if (backend.loadingImages) {
                        return loadingImages = true;
                    }
                });
                this.set('loadingImages', loadingImages);
            }.observes('@each.loadingImages', 'loadingBackends'),

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

            updateSelectedMachineCount: function() {
                var that = this;
                var selectedMachineCount = 0;
                Mist.backendsController.forEach(function(backend) {
                    backend.machines.forEach(function(machine) {
                        if (machine.selected) {
                            if (++selectedMachineCount == 1) {
                                that.set('selectedMachine', machine);
                            } else {
                                that.set('selectedMachine', null);
                            }
                        }
                    });
                });
                
                if (selectedMachineCount == 0) {
                    $('#machines-footer').fadeOut(200);
                } else if (selectedMachineCount == 1) {
                    $('#machines-footer').fadeIn(200);
                    $('#machines-button-power').removeClass('ui-disabled');
                    // Enable shell
                    if (this.selectedMachine && this.selectedMachine.probed && this.selectedMachine.state == 'running') {
                        $('#machines-button-shell').removeClass('ui-disabled');
                    } else {
                        $('#machines-button-shell').addClass('ui-disabled');
                    }
                    // Enable tags
                    if (this.selectedMachine && this.selectedMachine.can_tag) {
                        $('#machines-button-tags').removeClass('ui-disabled');
                    } else {
                        $('#machines-button-tags').addClass('ui-disabled');
                    }
                } else {
                    $('#machines-footer').fadeIn(200);
                    $('#machines-button-shell').addClass('ui-disabled');
                    $('#machines-button-tags').addClass('ui-disabled');
                }
                
                // Enable power
                Mist.backendsController.forEach(function(backend) {
                    backend.machines.forEach(function(machine) {
                        if (machine.selected && machine.state == 'terminated') {
                            $('#machines-button-power').addClass('ui-disabled');
                        }
                    });
                });

                this.set('selectedMachineCount', selectedMachineCount);
            },

            getBackendById: function(backendId) {
                var backendToFind = null;
                this.some(function(backend) {
                    if (backend.id == backendId) {
                        return backendToFind = backend;
                    }
                });
                return backendToFind;
            },

            getMachineById: function(backendId, machineId) {
                var machineToFind = null;
                this.some(function(backend) {
                    if (backend.id == backendId) {
                        backend.machines.some(function(machine) {
                            if (machine.id == machineId) {
                                return machineToFind = machine;
                            }
                        });
                        return true;
                    }
                });
                return machineToFind;
            },

            getMachineByUrlId: function(machineId) {
                var machineToFind = null;
                this.some(function(backend) {
                    backend.machines.some(function(machine) {
                        if (machine.id == machineId) {
                            return machineToFind = machine;
                        }
                    });
                    if(machineToFind) {
                        return true;
                    }
                });
                return machineToFind;
            },

            checkMonitoring: function() {
                if (!Mist.authenticated) {
                    return;
                }
                var that = this;
                $.getJSON('/monitoring', function(data) {
                    Mist.set('auth_key', data.auth_key);
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
                    Mist.notificationController.notify('Error checking monitoring');
                });
            },

            providerList: function() {
                return SUPPORTED_PROVIDERS;
            }.property('providerList')
        });
    }
);
