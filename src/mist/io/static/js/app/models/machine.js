define('app/models/machine', ['ember'],
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

            image: null,
            name: null,
            backend: null,
            selected: false,
            hasKey: false,
            hasMonitoring: false,
            state: 'stopped',

            reboot: function(){
                console.log('Rebooting machine', this.name);

                var that = this;
                $.ajax({
                    url: '/backends/' + this.backend.index + '/machines/' + this.id,
                    type: 'POST',
                    data: 'action=reboot',
                    success: function(data) {
                        that.set('state', 'rebooting');
                        console.info('Succesfully sent reboot to machine', that.name);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error when sending reboot to machine ' +
                                that.name);
                        console.error(textstate, errorThrown, 'when sending reboot to machine',
                                that.name);
                    }
                });
            },

            destroy: function(){
                console.log('Destroying machine', this.name);

                var that = this
                $.ajax({
                    url: '/backends/' + this.backend.index + '/machines/' + this.id,
                    type: 'POST',
                    data: 'action=destroy',
                    success: function(data) {
                        that.set('state', 'pending');
                        console.info('Successfully sent destroy to machine', that.name);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error when sending destroy to machine ' +
                                that.name);
                        console.error(textstate, errorThrown, 'when sending destroy to machine',
                                that.name);
                    }
                });
            },

            start: function(){
                console.log('Starting machine', this.name);

                var that = this;
                $.ajax({
                    url: 'backends/' + this.backend.index + '/machines/' + this.id,
                    type: 'POST',
                    data: 'action=start',
                    success: function(data) {
                        that.set('state', 'pending');
                        console.info('Successfully sent start to machine', that.name);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error when sending start to machine ' +
                                that.name);
                        console.error(textstate, errorThrown, 'when sending start to machine',
                                that.name);
                    }
                });
            },

            shutdown: function(){
                console.log('Stopping machine', this.name);

                var that = this;
                $.ajax({
                    url: 'backends/' + this.backend.index + '/machines/' + this.id,
                    type: 'POST',
                    data: 'action=stop',
                    success: function(data) {
                        that.set('state', 'stopped');
                        console.info('Successfully sent stop to machine', that.name);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error when sending stop to machine ' +
                                that.name);
                        console.error(textstate, errorThrown, 'when sending stop to machine',
                                that.name);
                    }
                });
            },

            shell: function(shell_command, callback){
                console.log('Sending', shell_command, 'to machine', this.name);

                var host;
                if (this.extra.dns_name) {
                    // it is an ec2 machine so it has dns_name
                    host = this.extra.dns_name;
                } else {
                    // if not in ec2, it should have a public ip
                    host = this.public_ips[0];
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
                        console.info('Successfully sent shell command', shell_command, 'to machine',
                                that.name, 'with result:\n', data);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error sending shell command ' +
                                shell_command + ' to machine ' + that.name);
                        console.error(textstate, errorThrown, 'when sending shell command',
                                shell_command, 'to machine', that.name);
                    }
                });

            },

            hasAlert : function(){
                //TODO when we have alerts
                return false;
            }.property('hasAlert'),

            startUptimeTimer: function() {
                var that = this;

                setInterval(function() {
                    if (that.get('state' != 'stopped') || !that.get('uptimeFromServer') ||
                        !that.get('uptimeChecked')) {

                        return;

                    } else {
                        that.set('uptime', that.get('uptimeFromServer') + (Date.now()
                                           - that.get('uptimeChecked')));
                    }
                }, 1000);
            },

            checkUptime: function(){
                if (this.hasKey) {
                    var host;
                    if (this.extra.dns_name) {
                        // it is ec2 machine
                        host = this.extra.dns_name;
                    } else {
                        // if not ec2 it should have a public ip
                        host = this.public_ips[0];
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
                        success: function(data) {
                            var resp = data.split(' ');
                            if (resp.length == 2) {
                                var uptime = parseFloat(resp[0]) * 1000;
                                that.set('uptimeChecked', Date.now());
                                that.set('uptimeFromServer', uptime);
                            }
                            console.info('Successfully got uptime', data, 'from machine', that.name);
                        },
                        error: function(jqXHR, textstate, errorThrown) {
                            Mist.notificationController.notify('Error getting uptime from machine ' +
                                    that.name);
                            console.error(textstate, errorThrown, 'when getting uptime from machine',
                                    that.name);
                        }
                    });
                }
            },

            checkHasMonitoring: function(){
                var that = this;
                $.ajax({
                    url: 'backends/' + this.backend.index + '/machines/' + this.id + '/monitoring',
                    success: function(data) {
                        console.log("machine has monitoring");
                        console.log(data);
                        if('monitoring' in data){
                            that.set('hasMonitoring', data.monitoring);
                        }
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                            Mist.notificationController.notify('Error checking monitoring of machine ' +
                                    that.name);
                            console.error(textstate, errorThrown, 'while checking monitoring of machine',
                                    that.name);
                    }
                });
            },

            checkHasKey: function(){
                var host;
                if (this.extra.dns_name) {
                    // it is ec2 machine
                    host = this.extra.dns_name;
                } else {
                    // if not ec2 it should have a public ip
                    host = this.public_ips[0];
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
                    success: function(data) {
                        that.set('hasKey', true);
                        // TODO: since we got it let's use it, checkUptime does the same.
                        var resp = data.split(' ');
                        if (resp.length == 2) {
                            var uptime = parseFloat(resp[0]) * 1000;
                            that.set('uptimeChecked', Date.now());
                            that.set('uptimeFromServer', uptime);
                        }
                        console.info('We have key for machine', that.name);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        that.set('hasKey', false);
                        Mist.notificationController.notify('Error while checking key of machine ' +
                                that.name);
                        console.error(textstate, errorThrown, 'while checking key of machine', that.name);
                    }
                });
            },

            resetUptime: function(){
                if (this.state != 'stopped') {
                    this.set('uptime', 0);
                    this.uptimeTimer = false;
                } else {
                    if (this.get('uptime') == 0) {
                        // TODO: This is used only here, can we skip checkUptime?
                        this.checkUptime();
                    }
                }
            }.observes('state'),

            monitoringChanged: function(){
                var oldValue = !this.hasMonitoring;
                console.log("monitoring:  " + oldValue);

                var that = this;

                var host;
                if (this.extra.dns_name) {
                    // it is ec2 machine
                    host = this.extra.dns_name;
                } else {
                    // if not ec2 it should have a public ip
                    host = this.public_ips[0];
                }

                var payload = {
                   'monitoring': this.hasMonitoring,
                   'host': host,
                   'provider': this.backend.provider
                };

                $.ajax({
                    // TODO: this should point to https://mist.io/....
                    url: 'backends/' + this.backend.index + '/machines/' + this.id + '/monitoring',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    dataType: 'json',
                    success: function(data) {

                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        that.set('hasMonitoring', oldValue);
                    }
                });
            }.observes('hasMonitoring'),

            init: function() {
                this._super();
                var that = this;
                this.backend.images.getImage(this.imageId, function(image) {
                    that.set('image', image);
                });
                this.startUptimeTimer();
                this.checkHasKey();
                this.checkHasMonitoring();
            }

        });
    }
);
