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
            
            // TODO make this property dynamic according to all backends states
            state: "waiting",
            ok: false,
            
            loadingMachines: function() {
                for (var i = 0; i < this.content.length; i++) {
                    if (this.content[i].loadingMachines) {
                        return true;
                    }
                }
                return false;
            }.property('@each.loadingMachines'),
            
            loadingImages: function() {
                for (var i = 0; i < this.content.length; i++) {
                    if (this.content[i].loadingImages) {
                        return true;
                    }
                }
                return false;
            }.property('@each.loadingImages'),
            
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
                            var b,m;
                            var backend_id = machine_tuple[0];
                            var machine_id = machine_tuple[1];

                            for (b=0; b < Mist.backendsController.content.length; b++) {
                                if (Mist.backendsController.content[b]['id'] == backend_id) {
                                    break;
                                }
                            }

                            if (b != Mist.backendsController.content.length) {
                                for (m=0; m < Mist.backendsController.content[b].machines.content.length; m++) {
                                    if (Mist.backendsController.content[b]['machines'].content[m]['id'] == machine_id) {
                                        Mist.backendsController.content[b].machines.content[m].set('hasMonitoring', true);
                                        break;
                                    }
                                }
                            }
                        });

                        var rules = data.rules;

                        for (ruleId in rules){
                            var isInController = false;
                            for (r=0; r < Mist.rulesController.content.length; r++) {
                                if (Mist.rulesController.content[r]['id'] == ruleId) {
                                    isInController = true;
                                    break;
                                }
                            }
                            if (!(isInController)) {
                                var rule = {};
                                rule['id'] = ruleId;
                                rule['machine'] = that.getMachineById(rules[ruleId]['backend'], rules[ruleId]['machine']);
                                rule['metric'] = rules[ruleId]['metric'];
                                rule['operator'] = Mist.rulesController.getOperatorByTitle(rules[ruleId]['operator']);
                                rule['value'] = rules[ruleId]['value'];
                                rule['actionToTake'] = rules[ruleId]['action'];
                                rule['command'] = rules[ruleId]['command'];
                                rule['maxValue'] = rules[ruleId]['max_value'];
                                if (rule['maxValue'] > 100) {
                                    rule['unit'] = 'KB/s';
                                } else if (rule['metric'] == 'cpu' || rule['metric'] == 'ram') {
                                        rule['unit'] = '%';
                                } else {
                                        rule['unit'] = '';
                                }

                                Mist.rulesController.pushObject(Rule.create(rule));
                            }
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

                that.addObserver('length', function() {
                    that.getMachineCount();
                    that.getSelectedMachineCount();
                    that.getImageCount();
                });
                
                $(document).bind('ready', function() {
                    Ember.run.next(function() {
                        $.getJSON('/backends', function(data) {
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
