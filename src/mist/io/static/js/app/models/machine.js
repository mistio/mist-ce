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
            pendingShell: false,
            pendingAddTag: false,
            pendingDeleteTag: false,
            pendingStats: false,
            state: 'stopped',
            stats:{'cpu': [], 'load': [], 'disk': []},
            graphdata: {},

            image: function() {
                return this.backend.images.getImage(this.imageId);
            }.property('image'),

            reboot: function() {
                log('Rebooting machine', this.name);

                var that = this;
                $.ajax({
                    url: '/backends/' + this.backend.id + '/machines/' + this.id,
                    type: 'POST',
                    headers: { "cache-control": "no-cache" },
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
                    url: '/backends/' + this.backend.id + '/machines/' + this.id,
                    type: 'POST',
                    headers: { "cache-control": "no-cache" },
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
                    url: 'backends/' + this.backend.id + '/machines/' + this.id,
                    type: 'POST',
                    headers: { "cache-control": "no-cache" },
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
                    url: 'backends/' + this.backend.id + '/machines/' + this.id,
                    type: 'POST',
                    headers: { "cache-control": "no-cache" },
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

            getHost: function() {
                if (this.extra.dns_name) {
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
                        Mist.notificationController.notify('No host available for machine ' + this.name);
                        error('No host available for machine ' + this.name);
                        return false;
                    }
                }
            },

            getUser: function() {
                // In case of ec2, mist.io could have set this. Server can handle empty string.
                try {
                    return this.extra.tags.ssh_user;
                } catch (error) {
                    return 'root';
                }
            },

            shell: function(shell_command, callback) {
                log('Sending', shell_command, 'to machine', this.name);

                var url = '/backends/' + this.backend.id + '/machines/' + this.id + '/shell';
                var ssh_user = this.getUser();
                var host = this.getHost();
                var that = this;
                var params =  {'host': host,
                               'ssh_user': ssh_user,
                               'command': shell_command}
                function EncodeQueryData(data)
                {
                   var ret = [];
                   for (var d in data)
                      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
                   return ret.join("&");
                }
                url = url + '?' + EncodeQueryData(params);
                this.set('pendingShell', true);
                
                $('#hidden-shell-iframe').attr('src', url);
                callback('');
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
                var that = this;

                function uptimeTimeout() {
                    if (!that.backend) {
                        return false;
                    }

                    if (that.state == 'running') {
                        var host = that.getHost();
                        if (host) {
                            var ssh_user = that.getUser();

                            $.ajax({
                                url: '/backends/' + that.backend.id + '/machines/' + that.id + '/shell',
                                type: 'POST',
                                headers: { "cache-control": "no-cache" },
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
                                        setTimeout(uptimeTimeout, 10000);
                                    }
                                },
                                error: function(jqXHR, textstate, errorThrown) {
                                    that.set('hasKey', false);
                                    //Mist.notificationController.notify('Error getting uptime from machine ' +
                                    //    that.name);
                                    error(textstate, errorThrown, 'when getting uptime from machine',
                                        that.name);
                                    setTimeout(uptimeTimeout, 10000);
                                }
                            });
                        }
                    }
                };
                setTimeout(uptimeTimeout, 10000);
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

                this.set('pendingMonitoring', true);
                                
                var payload = {
                   'monitoring': !this.hasMonitoring
                };
                
                if (!Mist.authenticated){
                    if (!Mist.email || !Mist.password){
                        warn('no auth credentials!');
                        return false;
                    }
                    var d = new Date();
                    var nowUTC = d.getTime() + d.getTimezoneOffset()*60*1000;
                    payload['email'] = Mist.email;
                    payload['timestamp'] = nowUTC;
                    payload['hash'] = sha256(email + ':' + nowUTC + ':' + Mist.password);
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
                    timeout : 10000,
                    success: function(data) {
                        var user = that.getUser();
                        if (!that.hasMonitoring){
                            $('.pending-monitoring h1').text('Installing collectd');
                            var prefix = URL_PREFIX || document.location.href.split('#')[0];
                            var cmd = 'wget ' + prefix + '/core/scripts/deploy_collectd.sh -O - > /tmp/deploy_collectd.sh && chmod o+x /tmp/deploy_collectd.sh && /tmp/deploy_collectd.sh ' + that.getHost() + ' ' + data['uuid'] + ' ' + data['passwd'];
                            if (user != 'root'){
                                cmd = "sudo su -c '" + cmd + "'";
                            }
                            collectd_install_target = that;
                            warn(cmd);
                            that.shell(cmd, function(){});
                        } else {
                            $('.pending-monitoring h1').text('Disabling collectd');
                            var cmd = 'chmod -x /etc/init.d/collectd && killall -9 collectd';
                            if (user != 'root'){
                                cmd = "sudo su -c '" + cmd + "'";
                            }
                            collectd_install_target = that;                        
                        }
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        that.set('pendingMonitoring', false);
                        Mist.notificationController.notify('Error when changing monitoring to ' +
                            that.name);
                        error(textstate, errorThrown, 'when changing monitoring to machine',
                            that.name);
                    }
                });

            },

            init: function() {
                this._super();

                this.tags = Ember.ArrayController.create();

                this.startUptimeTimer();
                this.checkUptime();
            }
        });
    }
);
