define('app/controllers/backends', [
    'app/models/backend',
    'app/models/rule',
    'ember'
    ],
    /**
     * Backends Controller
     *
     * @returns Class
     */
    function(Backend, Rule) {
        return Ember.ArrayController.extend({

            content: [],
            imageCount: 0,
            machineCount: 0,
            loadingImages: null,
            loadingMachines: null,
            singleMachineRequest: null,
            singleMachineResponse: null,

            init: function() {
                this._super();
                var that = this;
                $(document).bind('ready', function() {
                    Ember.run.next(function() {
                        $.getJSON('/backends', function(data) {
                            data.forEach(function(item) {
                                that.pushObject(Backend.create(item));
                            });
                        }).error(function() {
                            Mist.notificationController.notify("Error loading backends");
                        });
                        Ember.run.later(that, function() {
                            this.checkMonitoring();
                        }, 5000);
                    });
                });
            },

            singleMachineRequestObserver: function() {
                if (this.singleMachineRequest) {
                    if (this.loadingMachines) {
                        Ember.run.later(this, function() {
                            this.singleMachineRequestObserver();
                        }, 1000);
                        return;
                    }
                    this.set('singleMachineResponse', this.getMachineById(this.singleMachineRequest));
                    this.set('singleMachineRequest', false);
                }
            }.observes('singleMachineRequest'),

            loadingMachinesObserver: function() {
                var loadingMachines = false;
                this.content.some(function(backend) {
                    if (backend.loadingMachines) {
                        loadingMachines = true;
                        return true;
                    }
                });
                this.set('loadingMachines', loadingMachines);
            }.observes('@each.loadingMachines'),

            loadingImagesObserver: function() {
                var loadingImages = false;
                this.content.some(function(backend) {
                    if (backend.loadingImages) {
                        loadingImages = true;
                        return true;
                    }
                });
                this.set('loadingImages', loadingImages);
            }.observes('@each.loadingImages'),

            updateMachineCount: function() {
                var count = 0;
                this.content.forEach(function(backend) {
                    count += backend.machines.content.length;
                });
                this.set('machineCount', count);
            }.observes('content.length'),

            updateImageCount: function() {
                var count = 0;
                this.content.forEach(function(backend){
                    count += backend.images.content.length;
                });
                this.set('imageCount', count);
            }.observes('content.length'),

            getBackendById: function(backendId) {
                var backendToFind = null;
                this.content.some(function(backend) {
                    if (backend.id == backendId) {
                        backendToFind = backend;
                        return true;
                    }
                });
                return backendToFind;
            },

            getMachineById: function(backendId, machineId) {
                var machineToFind = null;
                this.content.some(function(backend) {
                    if (backend.id == backendId) {
                        backend.machines.content.some(function(machine) {
                            if (machine.id == machineId) {
                                machineToFind = machine;
                                return true;
                            }
                        });
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
                    
                    data.machines.forEach(function(machine_tuple){
                        var machine = that.getMachineById(machine_tuple[0], machine_tuple[1]);
                        if (machine) {
                            machine.set('hasMonitoring', true);
                        }
                    });
                    
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
                    Mist.notificationController.notify('Error while checking monitoring');
                });
            },

            providerList: function() {
                return SUPPORTED_PROVIDERS;
            }.property('providerList')

           /* Caclculates controller state based
            * on all backends. Currently commented
            * out as it is not clear weather it will 
            * be used or not.
            * 
            backendsStateObserver: function() {
                var state = 'ok';
                var waiting = false;
                this.content.some(function(backend) {
                    if (backend.error) {
                        state = 'error';
                        return true;
                    } else if(backend.state == 'waiting') {
                        return true;
                        waiting = true;
                    } else if(backend.state == 'offline') {
                        return true;
                        state = 'down';
                    }
                });
                if (waiting) {
                    state = 'state-wait-' + state;
                } else {
                    state = 'state-' + state;
                }
                this.set('state', state);
            }.observes('@each.state'),
            */
        });
    }
);
