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

            singleMachineResponseObserver: function() {
                if (Mist.backendsController.singleMachineResponse) {
                    this.get('controller').set('model', Mist.backendsController.singleMachineResponse);
                    this.setGraph();
                }
            }.observes('Mist.backendsController.singleMachineResponse'),

            enableMonitoringClick: function() {
                if (Mist.authenticated) {
                    var machine = this.get('controller').get('model');
                    machine.openMonitoringDialog();
                } else {
                    $("#login-dialog").show();
                    $("#login-dialog").popup('open');
                }
            },

            closePlanDialog: function() {
                $("#monitoring-dialog").popup('close');
            },

            buttonBackMonitoring: function() {
                $("#monitoring-dialog").popup('close');
            },

            buttonChangeMonitoring: function() {
                var machine = this.get('controller').get('model');
                machine.changeMonitoring();
                $("#monitoring-dialog").popup('close');
            },

            openTrialDialog: function() {
                $("#monitoring-dialog").popup('close');
                $("#trial-dialog").popup('open');
            },

            clickedPurchaseDialog: function() {
                $("#monitoring-dialog").popup('close');
                window.location.href = URL_PREFIX + "/account";  
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

            disabledShellClass: function() {
                var machine = this.get('controller').get('model');
                if (machine && machine.probed && machine.state == 'running') {
                    return '';
                } else {
                    return 'ui-disabled';
                }
            }.property('controller.model.probed'),

            disabledTagClass: function() {
                var machine = this.get('controller').get('model');
                if (machine && machine.can_tag) {
                    return '';
                } else {
                    return 'ui-disabled';
                }
            }.property('controller.model.can_tag'),

            disabledPowerClass: function() {
                var machine = this.get('controller').get('model');
                if (machine && machine.state === 'terminated') {
                    return 'ui-disabled';
                } else {
                    return '';
                }
            }.property('controller.model.state'),

            keySelect: function(key) {
                //$('#associate-button').show();
                //$('#associate-key-button').addClass('ui-disabled');
                var machine = this.get('controller').get('model');
                Mist.keysController.associateKey(key.name, machine);
                //$('#associate-key').popup('close');
                return false;
            },

            name: function() {
                var machine = this.get('controller').get('model');
                if (!machine) {
                    return '';
                }
                return machine.name || machine.id;
            }.property('controller.model'),

            providerIconClass: function() {
                var machine = this.get('controller').get('model');
                if (!machine) {
                    return '';
                }
                return 'provider-' + machine.backend.provider;
            }.property('machine'),

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

            handlePendingMonitoring: function() {
                var machine = this.get('controller').get('model');
                if (machine && machine.pendingMonitoring) {
                    $('.pending-monitoring').show();
                    $('.monitoring-button').addClass('ui-disabled'); //.hide();
                } else {
                    $('.monitoring-button').removeClass('ui-disabled'); //.show();
                    $('.pending-monitoring').hide();
                }
            }.observes('controller.model.pendingMonitoring'),

            powerClicked: function() {
                Mist.machinePowerController.open(this.machine);
            },

            associateClicked: function() {
                $('.key-list').listview('refresh');
                $('#associate-key').popup('option', 'positionTo', '#associate-key-button').popup('open');
            },
     
            manageKeysClicked: function() {
                $('#manage-keys').panel('open');
            }, 
           
            addKeyClicked: function() {
                $('#non-associated-keys').listview('refresh');
                $('#associate-key-dialog').popup('option', 'positionTo', '#mist-manage-keys').popup('open');
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
             *  Properties
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

                var publicIps = null;

                if ($.isArray(machine.public_ips)) {
                    publicIps = machine.public_ips.join();
                } else if (typeof machine.public_ips == 'string') {
                    publicIps = machine.public_ips;
                }

                var privateIps = null;

                if ($.isArray(machine.private_ips)) {
                    privateIps = machine.private_ips.join();
                } else if (typeof machine.private_ips == 'string') {
                    privateIps = machine.private_ips;
                }

                try {
                    var dnsName = machine.extra.dns_name;
                    var launchDate = machine.extra.launchdatetime;
                } catch(e ){}
                
                var basicInfo = {
                        'Public IPs': publicIps,
                        'Private IPs': privateIps,
                        'DNS Name': dnsName,
                        'Launch Date': launchDate
                };

                if (machine.image && machine.image.name) {
                    basicInfo.image = machine.image.name;
                }

                var ret = [];

                basicInfo.forEach(function(key, value) {
                    if (typeof value == 'string') {
                        ret.push({key:key, value: value});
                    }
                });

                return ret;

            }.property('machine'),


            metadata: function() {
                if (!this.machine || !this.machine.extra) return;
                var ret = [];
                /*
                this.machine.extra.forEach(function(key, value) {
                    if (typeof value == 'string' || typeof value == 'number') {
                        ret.push({key:key, value: value});
                    }
                });
                return ret;
                */
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
