define('app/views/machine', ['app/views/mistscreen', 'text!app/templates/machine.html'],
    /**
     *  Single Machine View
     * 
     *  @returns Class
     */
    function(MistScreen, machine_html) {
        return MistScreen.extend({

            /**
             *  Properties
             */

            rules: [],
            machine: null,
            template: Ember.Handlebars.compile(machine_html),

            /**
             * 
             *  Initialization
             * 
             */

            init: function() {
                this._super();
                Mist.backendsController.on('onMachineListChange', this, 'load');
            },


            load: function() {
                Ember.run(this, function() {
                    this.updateCurrentMachine();
                    if (this.machine.id) {
                        // TODO: Render stuff
                    }
                });
            }.on('didInsertElement'),



            /**
             * 
             *  Methods
             * 
             */

            updateCurrentMachine: function() {
                Ember.run(this, function() {
                    var machine = Mist.backendsController.getRequestedMachine();
                    if (machine) this.get('controller').set('model', machine);
                    this.set('machine', this.get('controller').get('model'));
                });
            },

            renderMachine: function() {
                var machine = this.get('controller').get('model');
                if (machine.id != ' ') { // This is the dummy machine. It exists when machine hasn't loaded yet
                    this.setGraph();
                }
            },

            enableMonitoringClick: function() {
                if (Mist.authenticated) {
                    var machine = this.get('controller').get('model');
                    machine.openMonitoringDialog();
                } else {
                    $("#login-dialog").show();
                    $("#login-dialog").popup('open');
                }
            },
            
            rules: function(){
                var ret = Ember.ArrayController.create(), 
                    machine = this.get('controller').get('model');
                Mist.rulesController.forEach(function(rule){
                    if (rule.machine == machine) {
                        ret.pushObject(rule);
                    }
                });
                return ret;
            }.property('Mist.rulesController.@each', 'Mist.rulesController.@each.machine'),

            addRuleClicked: function() {
                // initialize the rule to some sensible defaults
                var machine = this.get('controller').get('model');
                var metric = 'load';
                var operator = {'title': 'gt', 'symbol': '>'};
                var value = 5;
                var actionToTake = 'alert';

                Mist.rulesController.newRule(machine, metric, operator, value, actionToTake);
            },

            stopPolling: function() {
                // if it polls for stats, stop it
                if ('context' in Mist) {
                    Mist.context.stop();
                }
            }.observes('controller.model.hasMonitoring'),

            backClicked: function() {
                this.stopPolling();
                // then get back to machines' list
                Mist.Router.router.transitionTo('machines');
            },

            /**
             * 
             *  Actions
             * 
             */
            
            actions: {
                manageKeysClicked: function() {
                    $('#manage-keys').panel('open');
                }, 
               
                addKeyClicked: function() {
                    $('#non-associated-keys').listview('refresh');
                    $('#associate-key-dialog').popup('option', 'positionTo', '#mist-manage-keys').popup('open');
                },

                powerClicked: function() {
                    Mist.machinePowerController.open(this.machine);
                },
            },

            associateClicked: function() {
                $('.key-list').listview('refresh');
                $('#associate-key').popup('option', 'positionTo', '#associate-key-button').popup('open');
            },
     
/*
            doLogin: function() {
                Mist.ajaxPOST('/auth', {
                    'email': Mist.email,
                    'password': CryptoJS.SHA256(Mist.password).toString(),
                }).success(function(data) {
                    Mist.set('authenticated', true);
                    Mist.set('current_plan', data.current_plan);
                    Mist.set('auth_key', data.auth_key);
                    Mist.set('user_details', data.user_details);
                    Mist.set('monitored_machines', []);
                }).error(function() {
                    Mist.notificationController.warn('Failed to log in');
                }).complete(function() {
                    // TODO: return a callback here or something
                });
            },
*/
 

            /**
             * 
             *  Computed Properties
             * 
             */

            upFor: function() {
                var ret = '';
                if (this.machine && this.machine.uptime) {
                    var x = Math.floor(this.machine.uptime / 1000);
                    var seconds = x % 60;
                    x = Math.floor(x / 60);
                    var minutes = x % 60;
                    x = Math.floor(x / 60);
                    var hours = x % 24;
                    x = Math.floor(x / 24);
                    var days = x;

                    if (days) ret = ret + days + ' days, ';
                    if (hours) ret = ret + hours + ' hours, ';
                    if (minutes) ret = ret + minutes + ' minutes, ';
                    if (seconds) {
                        ret = ret + seconds + ' seconds';
                    } else {
                        ret = ret + '0 seconds';
                    }
                }
                return ret;
            }.property('machine'),


            basicInfo: function() {
                if (!this.machine) return;

                var basicInfo = {};

                if (this.machine.public_ips instanceof Array) {
                    basicInfo['Public IPs'] = this.machine.public_ips.join();
                } else if (typeof this.machine.public_ips == 'string') {
                    basicInfo['Public IPs']  = this.machine.public_ips;
                }
                if (this.machine.private_ips instanceof Array) {
                    basicInfo['Private IPs']  = this.machine.private_ips.join();
                } else if (typeof this.machine.private_ips == 'string') {
                    basicInfo['Private IPs']  = this.machine.private_ips;
                }
                if (this.machine.extra) {
                    if (this.machine.extra.dns_name) {
                        basicInfo['DNS Name'] = this.machine.extra.dns_name;
                    }
                    if (this.machine.extra.launchdatetime) {
                        basicInfo['Launch Date'] = this.machine.extra.launchdatetime;
                    }
                }
                if (this.machine.image && this.machine.image.name) {
                    basicInfo.image = this.machine.image.name;
                }

                var ret = [];
                for (item in basicInfo) {
                    if (typeof basicInfo[item] == 'string') {
                        ret.push({key:item, value: basicInfo[item]});
                    }               
                }
                return ret;
            }.property('machine'),


            metadata: function() {
                if (!this.machine || !this.machine.extra) return;
                var ret = [];
                
                for (item in this.machine.extra) {
                    var value = this.machine.extra[item];
                    if (typeof value == 'string' || typeof value == 'number') {
                        ret.push({key:item, value: value});
                    }
                }
                return ret;
                
            }.property('machine'),



            /**
             * 
             *  Observers
             * 
             */

            modelObserver: function() {
                Ember.run.once(this, 'load');
            }.observes('controller.model'),     
        });
    }
);
