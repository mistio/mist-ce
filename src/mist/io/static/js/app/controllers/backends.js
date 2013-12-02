define('app/controllers/backends', [
    'app/models/backend',
    'app/models/rule',
    'ember'
    ],
    /**
     * Backends controller
     *
     * @returns Class
     */
    function(Backend, Rule) {
        return Ember.ArrayController.extend({

            content: [],
            machineCount: 0,
            imageCount: 0,
            loadingImages: false,
            loadingMachines: null,
            singleMachineRequest: null,
            singleMachineResponse: null,

            singleMachineRequestObserver: function() {
                if (this.singleMachineRequest) {
                    if (this.loadingMachines) {
                        Ember.run.later(this, function() {
                            this.singleMachineRequestObserver();
                        }, 1000);
                        return;
                    }
                    this.set('singleMachineResponse', this.getMachineByUrlId(this.singleMachineRequest));
                    this.set('singleMachineRequest', false);
                }
            }.observes('singleMachineRequest'),
            
            // TODO make this property dynamic according to all backends states
            state: "waiting",
            ok: false,
            
            loadingMachinesObserver: function() {
                for (var i = 0; i < this.content.length; i++) {
                    if (this.content[i].loadingMachines) {
                        this.set('loadingMachines', true);
                        return;
                    }
                }
                this.set('loadingMachines', false);
            }.observes('@each.loadingMachines'),
            
            loadingImagesObserver: function() {
                for (var i = 0; i < this.content.length; i++) {
                    if (this.content[i].loadingImages) {
                        this.set('loadingImages', true);
                        return;
                    }
                }
                this.set('loadingImages', false);
            }.observes('content.@each.loadingImages'),
            
            isOK: function() {
                if(this.state == 'state-ok') {
                    this.set('ok', true);
                } else {
                    this.set('ok', false);
                }
            }.observes('state'),
            
            getBackendById: function(backendId) {
                for (var i = 0; i < this.content.length; i++) {
                    if (this.content[i].id == backendId) {
                        return this.content[i];
                    }
                }
                return null;
            },
            
            getMachineById: function(backendId, machineId) {
                for (var i = 0; i < this.content.length; i++) {
                    if (this.content[i].id == backendId) {
                        for (var j=0; j < this.content[i].machines.content.length; j++) {
                            if (this.content[i].machines.content[j].id == machineId) {
                                return this.content[i].machines.content[j];
                            }
                        }
                    }
                }
                return null;
            },

            getMachineByUrlId: function(urlId) {
                var machineToFind = null;
                this.content.some(function(backend) {
                    backend.machines.content.some(function(machine) {
                        if (machine.id == urlId) {
                            machineToFind = machine;
                        }
                        if (machineToFind) {
                            return true;
                        }
                    });
                    if (machineToFind) {
                        return true;
                    }
                });
                return machineToFind;
            },

            getMachineCount: function() {
                var count = 0;
                this.content.forEach(function(item) {
                    count += item.machines.get('length', 0);
                });
                this.set('machineCount', count);
            },

            getSelectedMachineCount: function() {
                var count = 0;
                this.content.forEach(function(item) {
                    count += item.machines.filterProperty('selected', true).get('length');
                });
                this.set('selectedMachineCount', count);
            },

            getImageCount: function() {
                var count = 0;
                this.content.forEach(function(item){
                    count += item.images.get('length', 0);
                });
                this.set('imageCount', count);
            },
            
            getSelectedMachine: function() {
            	if(this.selectedMachineCount == 1) {
                    var that = this;
                    this.content.forEach(function(item) {
                        var machines = item.machines.filterProperty('selected', true);
                        if(machines.get('length') == 1) {
                	       that.set('selectedMachine', machines[0]);
                	       return;
                        }
                    });
            	} else {
            	    this.set('selectedMachine', null);
            	}
            },

            checkMonitoring: function() {
                if (!Mist.authenticated) {
                    return;
                }
                
                var that = this;
                        
                $.ajax({
                    url: '/monitoring',
                    type: 'GET',
                    dataType: 'json',
                    headers: { "cache-control": "no-cache" },
                    success: function(data) {
                        machines = data.machines;
                        Mist.set('auth_key', data.auth_key);
                        Mist.set('monitored_machines', data.machines);
                        Mist.set('current_plan', data.current_plan);
                        Mist.set('user_details', data.user_details);
                        //now loop on backend_id, machine_id  list of lists and check if pair found
                        machines.forEach(function(machine_tuple){
                            var machine = Mist.backendsController.getMachineById(machine_tuple[0], machine_tuple[1]);
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
                            
                            var metric = rule.metric;
                            if (metric == 'network-tx' || metric == 'disk-write') {
                                rule.unit = 'KB/s';
                            } else if (metric == 'cpu' || metric == 'ram') {
                                rule.unit = '%';
                            } else {
                                rule.unit = '';
                            }
                            
                            Mist.rulesController.pushObject(Rule.create(rule));
                        }
                        Mist.rulesController.redrawRules();
                    },
                    error: function(){
                        Mist.notificationController.notify('Error checking monitoring');
                    }
                });

            },

            init: function() {
                this._super();

                var that = this;
                this.set('loadingMachines', true);
                that.addObserver('length', function() {
                    that.getMachineCount();
                    that.getSelectedMachineCount();
                    that.getImageCount();
                });
                
                $(document).bind('ready', function() {
                    Ember.run.next(function() {
                        $.getJSON('/backends', function(data) {
                            if (!data.length) {
                                that.set('loadingMachines', false);
                            }
                            data.forEach(function(item){
                                that.pushObject(Backend.create(item));
                            });
                            that.content.forEach(function(item) {
                                item.machines.addObserver('length', function() {
                                    that.getMachineCount();
                                });
    
                                item.machines.addObserver('@each.selected', function() {
                                    that.getSelectedMachineCount();
                                    that.getSelectedMachine();
                                });
    
                                item.images.addObserver('length', function() {
                                    that.getImageCount();
                                });
    
                                item.addObserver('state', function() {
                                    
                                    var waiting = false;
                                    var state = "ok";
    
                                    that.content.forEach(function(backend) {
                                        if (backend.error) {
                                            state = 'error';
                                        } else if(backend.state == 'waiting') {
                                            waiting = true;
                                        } else if(backend.state == 'offline') {
                                            state = 'down';
                                        }
                                    });
    
                                    if (waiting) {
                                        state = 'state-wait-' + state;
                                    } else {
                                        state = 'state-' + state;
                                    }
                                    that.set('state', state);
                                });
                            });
                        }).error(function() {
                            Mist.notificationController.notify("Error loading backends");
                        });
    
                        setTimeout(function() {
                            Mist.backendsController.checkMonitoring();
                        }, 5000);
                    });
                });
            }
        });
    }
);
