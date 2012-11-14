define('app/models/machine', [
    'ember'
    ],
    /**
     * Machine model
     *
     * Also check state mapping in config.py
     * @returns Class
     */
    function() {
        return Ember.Object.extend({
            id: null,
            imageId: null,
            name: null,
            backend: null,
            selected: false,
            hasKey: false,
            hasMonitoring: null,
            pendingMonitoring: false,
            state: 'stopped',
            stats:{ 'cpu': [], 'load': [], 'disk': []},
            graphdata: {},

            image: function() {
                return this.backend.images.getImage(this.imageId);
            }.property('image'),

            reboot: function() {
                log('Rebooting machine', this.name);

                var that = this;
                $.ajax({
                    url: '/backends/' + this.backend.index + '/machines/' + this.id,
                    type: 'POST',
                    data: 'action=reboot',
                    success: function(data) {
                        that.set('state', 'rebooting');
                        info('Succesfully sent reboot to machine', that.name);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error when sending reboot to machine ' +
                                that.name);
                        error(textstate, errorThrown, 'when sending reboot to machine',
                                that.name);
                    }
                });
            },

            destroy: function() {
                log('Destroying machine', this.name);

                var that = this
                $.ajax({
                    url: '/backends/' + this.backend.index + '/machines/' + this.id,
                    type: 'POST',
                    data: 'action=destroy',
                    success: function(data) {
                        that.set('state', 'pending');
                        info('Successfully sent destroy to machine', that.name);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error when sending destroy to machine ' +
                                that.name);
                        error(textstate, errorThrown, 'when sending destroy to machine',
                                that.name);
                    }
                });
            },

            start: function() {
                log('Starting machine', this.name);

                var that = this;
                $.ajax({
                    url: 'backends/' + this.backend.index + '/machines/' + this.id,
                    type: 'POST',
                    data: 'action=start',
                    success: function(data) {
                        that.set('state', 'pending');
                        info('Successfully sent start to machine', that.name);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error when sending start to machine ' +
                                that.name);
                        error(textstate, errorThrown, 'when sending start to machine',
                                that.name);
                    }
                });
            },

            shutdown: function() {
                log('Stopping machine', this.name);

                var that = this;
                $.ajax({
                    url: 'backends/' + this.backend.index + '/machines/' + this.id,
                    type: 'POST',
                    data: 'action=stop',
                    success: function(data) {
                        that.set('state', 'stopped');
                        info('Successfully sent stop to machine', that.name);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error when sending stop to machine ' +
                                that.name);
                        error(textstate, errorThrown, 'when sending stop to machine',
                                that.name);
                    }
                });
            },

            shell: function(shell_command, callback) {
                log('Sending', shell_command, 'to machine', this.name);

                var host;
                if (this.extra.dns_name) {
                    // it is an ec2 machine so it has dns_name
                    host = this.extra.dns_name;
                } else {
                    // if not ec2 it should have a public ip
                    try {
                        host = this.public_ips[0];
                    } catch (error) {
                        // no ip or dns_name so nowhere to check, can't test the key
                        this.set('hasKey', false);
                    }
                }

                // In case of ec2, mist.io could have set this. Server can handle empty string.
                var ssh_user;
                try {
                    ssh_user = this.extra.tags.ssh_user;
                } catch (error) {
                    ssh_user = 'root';
                }

                var that = this;
                $.ajax({
                    url: '/backends/' + this.backend.index + '/machines/' + this.id + '/shell',
                    type: 'POST',
                    data: {'host': host,
                           'ssh_user': ssh_user,
                           'command': shell_command},
                    success: function(data) {
                        if (data){
                            callback(data);
                        }
                        info('Successfully sent shell command', shell_command, 'to machine',
                                that.name, 'with result:\n', data);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error sending shell command ' +
                                shell_command + ' to machine ' + that.name);
                        error(textstate, errorThrown, 'when sending shell command',
                                shell_command, 'to machine', that.name);
                    }
                });

            },

            hasAlert : function() {
                //TODO when we have alerts
                return false;
            }.property('hasAlert'),

            startUptimeTimer: function() {
                var that = this;

                setInterval(function() {
                    if (that.get('state') == 'running' && that.get('uptimeFromServer') &&
                        that.get('uptimeChecked')) {

                        that.set('uptime', that.get('uptimeFromServer') + (Date.now()
                                           - that.get('uptimeChecked')));
                    } else {
                        return;
                    }
                }, 1000);
            },

            checkUptime: function() {
                if (this.state == 'running') {
                    var host;
                    if (this.extra && this.extra.dns_name) {
                        // it is ec2 machine
                        host = this.extra.dns_name;
                    } else {
                        // if not ec2 it should have a public ip
                        try {
                            host = this.public_ips[0];
                        } catch (error) {
                            // no ip or dns_name so nowhere to check, can't test the key
                            this.set('hasKey', false);
                        }
                    }

                    // In case of ec2, mist.io could have set this. Server can handle empty string.
                    var ssh_user;
                    try {
                        ssh_user = this.extra.tags.ssh_user;
                    } catch (error) {
                        ssh_user = 'root';
                    }

                    var that = this;
                    $.ajax({
                        url: '/backends/' + this.backend.index + '/machines/' + this.id + '/shell',
                        type: 'POST',
                        data: {'host': host,
                               'ssh_user': ssh_user,
                               'command': 'cat /proc/uptime'},
                        success: function(data, textStatus, jqXHR) {
                            // got it fine, also means it has a key
                            if (jqXHR.status === 200) {
                                that.set('hasKey', true);
                                var resp = data.split(' ');
                                if (resp.length == 2) {
                                    var uptime = parseFloat(resp[0]) * 1000;
                                    that.set('uptimeChecked', Date.now());
                                    that.set('uptimeFromServer', uptime);
                                }
                                info('Successfully got uptime', data, 'from machine', that.name);
                            } else {
                                // in every other case there is a problem
                                that.set('hasKey', false);
                                info('Got response other than 200 while getting uptime from machine', that.name);
                            }
                        },
                        error: function(jqXHR, textstate, errorThrown) {
                            that.set('hasKey', false);
                            error(textstate);
                            Mist.notificationController.notify('Error getting uptime from machine ' +
                                    that.name);
                            error(textstate, errorThrown, 'when getting uptime from machine',
                                    that.name);
                        }
                    });
                }
            },

            checkHasMonitoring: function() {
                var that = this;
                $.ajax({
                    url: URL_PREFIX + '/backends/' + this.backend.index + '/machines/' + this.id + '/monitoring',
                    dataType: 'jsonp',
                    success: function(data) {
                        log("machine has monitoring");
                        log(data);
                        if('monitoring' in data){
                            that.set('hasMonitoring', data.monitoring);
                        }
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                            Mist.notificationController.notify('Error checking monitoring of machine ' +
                                    that.name);
                            error(textstate, errorThrown, 'while checking monitoring of machine',
                                    that.name);
                    }
                });
            },

            resetUptime: function() {
                if (this.get('state') == 'running') {
                    this.startUptimeTimer();
                    this.checkUptime();
                } else {
                    this.set('uptime', 0);
                    this.uptimeTimer = false;
                }
            }.observes('state'),

            changeMonitoring: function() {
                warn("Setting monitoring to:  " + !this.hasMonitoring);

                var that = this;

                var host;
                if (this.extra.dns_name) {
                    // it is ec2 machine
                    host = this.extra.dns_name;
                } else {
                    // if not ec2 it should have a public ip
                    try {
                        host = this.public_ips[0];
                    } catch (error) {
                        // no ip or dns_name so nowhere to check, can't test the key
                        this.set('hasKey', false);
                    }
                }

                var payload = {
                   'monitoring': !this.hasMonitoring,
                   'host': host,
                   'provider': this.backend.provider
                };

                this.set('pendingMonitoring', true);

                if(this.hasMonitoring){
                    this.set('hasMonitoring', false);
                }

                $.ajax({
                    url: URL_PREFIX + '/backends/' + this.backend.index + '/machines/' + this.id + '/monitoring',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    dataType: 'jsonp',
                    success: function(data) {
                        if (data.deployed_collectd) {
                            that.set('hasMonitoring', true);
                            that.set('pendingMonitoring', false);
                        } else {
                            that.set('hasMonitoring', false);
                            that.set('pendingMonitoring', false);
                        }
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        that.set('pendingMonitoring', false);
                    }
                });
            },

            init: function() {
                this._super();

                this.tags = Ember.ArrayController.create();

                this.startUptimeTimer();
                this.checkUptime();
                this.checkHasMonitoring();
            }
        });
    }
);
