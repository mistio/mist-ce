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
            imageId: null,
            name: null,
            backend: null,
            selected: false,
            probed: false,
            probing: false,
            hasMonitoring: false,
            probeInterval: 30000,
            pendingMonitoring: false,
            pendingShell: false,
            pendingAddTag: false,
            pendingDeleteTag: false,
            pendingStats: false,
            pendingCreation: false,
            keysCount: 0,
            state: 'stopped',
            stats: {'cpu': [], 'load': [], 'disk': []},
            graphdata: {},
            
            commandHistory: [],
            
            loadavg: null,
            loadavg1: null,
            loadavg5: null,
            loadavg15: null,
            
            latency: null,
            loss: null,
            
            netled1: function() {
                    if (this.latency < 1000) return 'on'; 
            }.property('latency'),
            
            netled2: function() {
                    if (this.latency < 500) return 'on'; 
            }.property('latency'),
            
            netled3: function() {
                    if (this.latency < 250) return 'on'; 
            }.property('latency'),

            netled4: function() {
                    if (this.latency < 100) return 'on'; 
            }.property('latency'),
                        
            netled4: function() {
                    if (this.latency < 40) return 'on'; 
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

            shutdown: function() {
                Mist.backendsController.shutdownMachine(this.id);
            },


            destroy: function() {
                Mist.backendsController.destroyMachine(this.id);
            },


            reboot: function() {
                Mist.backendsController.rebootMachine(this.id);
            },


            start: function() {
                Mist.backendsController.startMachine(this.id);
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

            probe: function(keyId) {
                var that = this;
                // If there are many pending requests, reschedule for a bit later
                if ($.active > 4) {
                    Ember.run.later(function() {
                        that.probe(keyId);
                    }, 1000);
                    return;
                }
                Mist.backendsController.probeMachine(that, keyId, function(success) {
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
                });
            },
            
            changeMonitoring: function() {
                warn("Setting monitoring to:  " + !this.hasMonitoring);

                this.set('pendingMonitoring', true);
                //$('.monitoring-button').show();
                var payload = {
                   'action': this.hasMonitoring ? 'disable' : 'enable',
                   'dns_name': this.extra.dns_name? this.extra.dns_name : "n/a",
                   'public_ips': this.public_ips ? this.public_ips : [],
                   'name': this.name ? this.name : "n/a"
                };
                
                if (!Mist.authenticated){
                    if (!Mist.email || !Mist.password){
                        warn('no auth credentials!');
                        return false;
                    }
                    var d = new Date();
                    var nowUTC = String(d.getTime() + d.getTimezoneOffset()*60*1000);
                    payload['email'] = Mist.email;
                    payload['timestamp'] = nowUTC;
                    payload['pass'] = CryptoJS.SHA256(Mist.password).toString();
                    payload['hash'] = CryptoJS.SHA256(Mist.email + ':' + nowUTC + ':' + CryptoJS.SHA256(Mist.password).toString()).toString();
                }

                var that = this;
                warn('sending request');
                $.ajax({
                    url: '/backends/' + this.backend.id + '/machines/' + this.id + '/monitoring',
                    type: 'POST',
                    headers: { "cache-control": "no-cache" },
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    dataType: 'json',
                    timeout : 600000,
                    success: function(data) {
                        if (!that.hasMonitoring) {
                            $('.pending-monitoring h1').text('Installing collectd');
                            var prefix = URL_PREFIX || document.location.href.split('#')[0];
                            if (prefix.slice(-1) == '/') {
                                prefix = prefix.substring(0, prefix.length - 1);
                            }
                            var cmd = 'wget --no-check-certificate ' + prefix + '/core/scripts/deploy_collectd.sh -O - > /tmp/deploy_collectd.sh && $(command -v sudo) chmod +x /tmp/deploy_collectd.sh && $(command -v sudo) /tmp/deploy_collectd.sh ' + data['monitor_server'] + ' ' + data['uuid'] + ' ' + data['passwd'];
                            //cmd = "sudo su -c '" + cmd + "' || " + cmd;
                            collectd_install_target = that;
                            warn(cmd);
                            that.shell(cmd, function(){}, timeout=300);
                        } else {
                            $('.pending-monitoring h1').text('Disabling collectd');
                            var cmd = '$(command -v sudo) chmod -x /etc/init.d/collectd && $(command -v sudo) killall -9 collectd';
                            //cmd = "sudo su -c '" + cmd + "' || " + cmd;
                            collectd_uninstall_target = that;
                            that.shell(cmd, function(){});
                            //remove machine from monitored_machines array
                            var new_monitored_machines = jQuery.grep(Mist.monitored_machines, function(value) {
                                var machine_arr = [that.backend.id, that.id];
                                return (!($(value).not(machine_arr).length == 0 && $(machine_arr).not(value).length == 0));
                            });
                            Mist.set('monitored_machines', new_monitored_machines);
                        }
                        Mist.set('authenticated', true);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        that.set('pendingMonitoring', false);
                        if (jqXHR.status == 402){
                            Mist.notificationController.warn(jqXHR.responseText);    
                        } else {
                            Mist.notificationController.notify('Error when changing monitoring to ' + that.name);
                        }
                        error(textstate, errorThrown, 'when changing monitoring to machine',
                            that.name);
                    }
                });
            }
        });
    }
);
