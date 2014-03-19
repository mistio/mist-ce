define('app/models/machine', ['ember'],
    /**
     *  Machine Model
     *
     *  Also check state mapping in config.py
     *  @returns Class
     */
    function() {
        return Ember.Object.extend({

            /**
             *  Properties
             */

            id: null,
            name: null,
            probed: null,
            keysCount: 0,
            probing: null,
            backend: null,
            selected: null,
            hasMonitoring: null,
            probeInterval: 30000,
            pendingCreation: null,
            isDestroying : false,
            
            state: 'stopped',
            prevState: null,
            waitState: null,
            lockState: null,
            
            stats: {'cpu': [], 'load': [], 'disk': []},
            graphdata: {},
            
            commandHistory: null,
            
            loss: null,
            latency: null,
            loadavg: null,
            loadavg1: null,
            loadavg5: null,
            loadavg15: null,
            
            
            /**
             *  Computed Properties
             */
            
            netled1: function() {
                if (this.latency > 0 &&  this.latency < 1000) return 'on'; 
            }.property('latency'),
            
            netled2: function() {
                if (this.latency > 0 &&  this.latency < 500) return 'on'; 
            }.property('latency'),
            
            netled3: function() {
                if (this.latency > 0 &&  this.latency < 250) return 'on'; 
            }.property('latency'),

            netled4: function() {
                if (this.latency > 0 &&  this.latency < 100) return 'on'; 
            }.property('latency'),
                        
            netled4: function() {
                if (this.latency > 0 &&  this.latency < 40) return 'on'; 
            }.property('latency'),  

            lossled: function() {
                if (this.loss > 0.5) {
                    return 'high-loss';
                } else if (this.loss > 15 ){
                    return 'low-loss';
                }
            },
                              
            image: function() {
                return this.backend.images.getImage(this.imageId);
            }.property('imageId'),
            
            
            /**
             * 
             *  Initialization
             * 
             */

            load: function() {
                this.set('commandHistory', []);
                this.probe();
            }.on('init'),


            /**
             * 
             *  Methods
             * 
             */

            shutdown: function(callback) {
                this.backend.shutdownMachine(this.id, callback);
            },


            destroy: function(callback) {
                this.backend.destroyMachine(this.id, callback);
            },


            reboot: function(callback) {
                this.backend.rebootMachine(this.id, callback);
            },


            start: function(callback) {
                this.backend.startMachine(this.id, callback);
            },


            waitFor: function(state) {
                this.set('waitState', state);
            },


            lockOn: function(state) {
                this.set('prevState', this.state);
                this.set('lockState', state);
                this.set('state', state);
            },


            restoreState: function() {
                this.set('waitState', null);
                this.set('state', this.prevState);
            },


            getHost: function() {
               
                if (this.extra && this.extra.dns_name) {
                    // it is an ec2 machine so it has dns_name
                    return this.extra.dns_name;
                } else {
                    // if not ec2 it should have a public ip
                    try {
                        var ips_v4 = [];
                        this.public_ips.forEach(function(ip) {
                            if (ip.search(':') == -1) {
                                // this is not an IPv6, so it is supported
                                ips_v4.push(ip);
                            }
                        });
                        return ips_v4[0];
                    } catch (error) {
                        //Mist.notificationController.notify('No host available for machine ' + this.name);
                        //error('No host available for machine ' + this.name);
                        return null;
                    }
                }
            },

            probe: function(keyId, callback) {

                if (!this.backend.enabled) return;
                if (this.state != 'running') return;
                
                // If there are many pending requests, reschedule for a bit later
                if ($.active > 4) {
                    Ember.run.later(this, function() {
                        this.probe(keyId, callback);
                    }, 1000);
                    return;
                }

                var that = this;
                Mist.backendsController.probeMachine(that, keyId, function(success) {
                    

                    // If the function was not called by the scheduled probing
                    // procedure, then only call the callback function
                    if (callback) {

                        callback(success);

                    } else {

                        if (success) { // Reprobe in 100 seconds on success
                            Ember.run.later(function() {
                                that.probe(keyId);
                            }, 100000);
                        } else {  // Reprobe with double interval on failure
                            Ember.run.later(function() {
                                that.probe(keyId);
                                that.set('probeInterval', that.probeInterval * 2);
                            }, that.probeInterval);
                        }
                    }

                });
            },


            /**
             * 
             *  Observers
             * 
             */

            stateObserver: function() {
                if (this.waitState) {
                    if (this.waitState != this.state) {
                        this.set('state', this.lockState);
                    } else { // Machine action completed
                        this.set('waitState', null);
                        if (this.state == 'running') {
                            Mist.backendsController.probeMachine(this);
                        }
                    }
                }
            }.observes('state')
        });
    }
);
