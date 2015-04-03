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

            df: null,

            installationStatus: Ember.Object.create({
                activated_at: null,
                error_msg: null,
                finished_at: null,
                manual: null,
                started_at: null,
                state: null,
                stdout: null,
            }),


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
                return this.get('backend').get('images').getObject(this.imageId);
            }.property('imageId'),


            hasKeys: function () {
                return !!Mist.keysController.getMachineKeysCount(this)
            }.property('Mist.keysController.content.@each.machines'),


            hasOpenIncident: function () {
                var incident = Mist.openIncidents.findBy('machineId', this.get('id'));
                if (!incident)
                    return false;
                return !incident.get('isClosed');
            }.property('Mist.openIncidents.@each.machine'),


            /**
             *
             *  Initialization
             *
             */

            load: function() {
                this.set('commandHistory', []);
                //this.probe();
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


            equals: function (machine) {
                if (typeof machine == 'string')
                    return machine == this.id;
                if (machine instanceof Array)
                    if (machine[1] == this.id &&
                        machine[0] == this.backend.id)
                            return true;
                if (machine instanceof Object)
                    if (machine.id == this.id &&
                        machine.backend.id == this.backend.id)
                            return true;
                return false;
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
                var that = this;
                Mist.backendsController.probeMachine(that, keyId, function(success) {
                    if (callback) {
                        callback(success);
                    }
                });
            },

            probeSuccess: function(data) {

                function loadToColor(load, cores) {
                    var weightedLoad = load / cores;
                    if (weightedLoad > 1.2) {
                        return 'hot';
                    } else if (weightedLoad > 0.8) {
                        return 'warm';
                    } else if (weightedLoad > 0.4) {
                        return 'eco';
                    } else if (weightedLoad > 0.1) {
                        return 'cool';
                    } else {
                        return 'cold';
                    }
                }
                if (!this.backend || !this.backend.enabled) return;
                if (data.uptime) {
                    uptime = parseFloat(data.uptime.split(' ')[0]) * 1000;
                    this.set('uptimeChecked', new Date(data.timestamp * 1000));
                    this.set('uptimeFromServer', uptime);
                    this.set('probed', true);
                }
                this.set('cores', data.cores || this.cores);
                this.set('users', data.users || this.users);
                if (data.pub_ips) {
                    data.pub_ips.forEach(function (ip) {
                        if (this.public_ips instanceof Array)
                            this.public_ips.addObject(ip);
                    });
                    this.notifyPropertyChange('public_ips');
                }
                if (data.priv_ips) {
                    data.priv_ips.forEach(function (ip) {
                        if (this.private_ips instanceof Array)
                            this.private_ips.addObject(ip);
                    });
                    this.notifyPropertyChange('private_ips');
                }
                if (data.loadavg) {
                    this.set('loadavg', data.loadavg);
                    this.set('loadavg1', loadToColor(data.loadavg[0], data.cores));
                    this.set('loadavg5', loadToColor(data.loadavg[1], data.cores));
                    this.set('loadavg15', loadToColor(data.loadavg[2], data.cores));
                }
                this.set('loss', data.packets_loss || this.loss);
                this.set('latency', data.rtt_avg ? Math.floor(data.rtt_avg) : this.latency);
                this.set('df', data.df || this.df);
                Mist.backendsController.trigger('onMachineProbe', this);
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
                    }
                }
            }.observes('state')
        });
    }
);
