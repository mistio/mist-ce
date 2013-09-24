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
            probed: false,
            probing: false,
            hasMonitoring: false,
            pendingMonitoring: false,
            pendingShell: false,
            pendingAddTag: false,
            pendingDeleteTag: false,
            pendingStats: false,
            keysCount: 0,
            state: 'stopped',
            stats:{'cpu': [], 'load': [], 'disk': []},
            graphdata: {},
            
            probedObserver: function() {
                Ember.run.next(function() {
                    try {
                        $('#mist-manage-keys').button();
                    } catch (e) {
                        $('#mist-manage-keys').button('refresh');
                    }
                });
            }.observes('probed', 'probing'),
            
            image: function() {
                return this.backend.images.getImage(this.imageId);
            }.property('imageId'),
            
            isNotGhost: function() {                
                return ! this.isGhost;
            }.property('isGhost'),

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
                var that = this;
                $.ajax({
                    url: '/backends/' + this.backend.id + '/machines/' + this.id,
                    type: 'POST',
                    headers: { "cache-control": "no-cache" },
                    data: 'action=destroy',
                    success: function(data) {
                        that.set('state', 'pending');
                        that.set('hasMonitoring', false);
                        info('Successfully sent destroy to machine', that.name);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error when sending destroy to machine ' + that.name);
                        error(textstate, errorThrown, 'when sending destroy to machine', that.name);
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

            shell: function(shell_command, callback, timeout) {
                log('Sending', shell_command, 'to machine', this.name);

                var url = '/backends/' + this.backend.id + '/machines/' + this.id + '/shell';
                var host = this.getHost();
                var that = this;
                var params =  {'host': host,
                               'command': shell_command};
                if (timeout != undefined) {
                    params['timeout'] = timeout;
                }
                
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
                
                this.set('probeInterval', 10000);
            },

            probe: function(keyName) {
                var that = this;
                if (that.get)
                
                function sendProbe() {
                    if (!that.backend) {
                        return false;
                    }
                    
                    if (that.backend.create_pending) {
                        return false;
                    }

                    if (that.state == 'running') {
                        var host = that.getHost();
                        if (host) {
                            var key = Mist.keysController.getKeyByName(keyName);
                            if (keyName != undefined){
                                that.set('probing', keyName);
                                key.set('probing', that.id);   
                            } else {
                                that.set('probing', true);
                            }
                            
                            $.ajax({
                                url: '/backends/' + that.backend.id + '/machines/' + that.id + '/probe',
                                type: 'POST',
                                headers: { "cache-control": "no-cache" },
                                data: {'host': host,
                                       'key': keyName},
                                success: function(data, textStatus, jqXHR) {
                                       // got it fine, also means it has a key
                                    if (jqXHR.status === 200) {
                                        if(key) {
                                            key.updateProbeState(that, Date.now());
                                        } else {
                                            that.set('probed', true);
                                        }
                                        var uptime = parseFloat(data['uptime'].split(' ')[0]) * 1000;
                                        that.set('uptimeChecked', Date.now());
                                        that.set('uptimeFromServer', uptime);
                                        info('Successfully got uptime', uptime, 'from machine', that.name);
                                        /*
                                        data.updated_keys.forEach(function(updatedKey) {
                                            for (var i=0; i < Mist.keysController.keys.length; ++i) {
                                                existingKey = Mist.keysController.keys[i];
                                                if (existingKey.name == updatedKey.name) {
                                                    warn('existing name');
                                                    warn(existingKey.name);
                                                    Mist.keysController.associateKey(existingKey.name, that);
                                                    return;
                                                }
                                                else if (existingKey.pub.split(' ').slice(0, 2).join(' ') == updatedKey.pub.split(' ').slice(0, 2).join(' ')) {
                                                    warn('existing public');
                                                    Mist.keysController.associateKey(existingKey.name, that);
                                                    return;
                                                }
                                            }
                                            warn('create new');
                                            Mist.keysController.newKey(updatedKey.name, updatedKey.publicKey, null, null, that);
                                        });
                                        if (data.updated_keys.length){
                                            warn('Added ' + data.updated_keys.length + ' new keys from machine ' + that.name);
                                        }
                                        */
                                    } else {
                                        // in every other case there is a problem
                                        if(key) {
                                            key.updateProbeState(that, -Date.now());
                                        } else {
                                            that.set('probed', false);
                                        }
                                        info('Got response other than 200 while probing machine', that.name);
                                        if (!that.backend.create_pending){
                                             retry(that);
                                        }
                                    }
                                    that.set('probing', false);
                                },
                                error: function(jqXHR, textstate, errorThrown) {
                                    if(key) {
                                        key.updateProbeState(that, -Date.now());
                                    } else {
                                        that.set('probed', false);
                                    }
                                    //Mist.notificationController.notify('Error getting uptime from machine ' +
                                    //    that.name);
                                    //error(textstate, errorThrown, 'when probing machine',
                                    //    that.name);
                                    that.set('probeInterval', 2*that.get('probeInterval'));
                                    if (!that.backend.create_pending){
                                         retryProbe(that.get('probeInterval'));
                                    }
                                    that.set('probing', false);
                                }
                            });
                        }
                    }
                };
                
                function retryProbe(interval) {
                    
                    if (interval == undefined) {
                        interval = 10000;
                    }
                    // retry only if the machine is still here and it's running
                    if (that.backend.getMachineById(that.id) && that.state == 'running'){
                        if (!that.backend.create_pending){
                             setTimeout(sendProbe, interval);
                        }
                    }
                }
                if (!that.backend.create_pending){
                     setTimeout(sendProbe, 2000);
                }               
            },

            reProbe: function() {
                if (this.get('state') == 'running') {
                    this.startUptimeTimer();
                    this.probe();
                } else {
                    this.set('uptime', 0);
                    this.uptimeTimer = false;
                }
            }.observes('state'),
            
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
                        if (!that.hasMonitoring){
                            $('.pending-monitoring h1').text('Installing collectd');
                            var prefix = URL_PREFIX || document.location.href.split('#')[0];
                            if (prefix.slice(-1) == '/') {
                                prefix = prefix.substring(0, prefix.length - 1);
                            }
                            var cmd = 'wget --no-check-certificate ' + prefix + '/core/scripts/deploy_collectd.sh -O - > /tmp/deploy_collectd.sh && sudo chmod +x /tmp/deploy_collectd.sh && sudo /tmp/deploy_collectd.sh ' + data['monitor_server'] + ' ' + data['uuid'] + ' ' + data['passwd'];
                            cmd = "sudo su -c '" + cmd + "' || " + cmd;
                            collectd_install_target = that;
                            warn(cmd);
                            that.shell(cmd, function(){}, timeout=300);
                        } else {
                            $('.pending-monitoring h1').text('Disabling collectd');
                            var cmd = 'chmod -x /etc/init.d/collectd && killall -9 collectd';
                            cmd = "sudo su -c '" + cmd + "' || " + cmd;
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
            },

           openMonitoringDialog: function() {
                var machine = this;
                if (Mist.authenticated) {
                    if (machine.hasMonitoring) {
                        $('#monitoring-dialog div h1').text('Disable monitoring');
                        $('#monitoring-enabled').show();
                        $('#monitoring-disabled').hide();
                    } else {
                        $('#monitoring-dialog div h1').text('Enable monitoring');
                        $('#monitoring-disabled').show();
                        $('#monitoring-enabled').hide();

                        if ((Mist.current_plan) && (Mist.current_plan['title'])) {
                            if (Mist.current_plan['has_expired']) {
                                //Trial or Plan expired, hide monitoring-dialog, hide free-trial
                                $('#enable-monitoring-dialog').hide();
                                $('#plan-text span').text('You have to purchase a plan in order to enable monitoring.');
                                $('#button-enable-trial').closest('.ui-btn').hide();
                            } else {
                                //Trial or Plan enabled. Check for quota 
                                if (Mist.current_plan['machine_limit'] <= Mist.monitored_machines.length) {
                                    //Quota exceeded, show buy option
                                    $('#enable-monitoring-dialog').hide();  
                                    $('#plan-text span').text('You have reached the limits for your plan. Please upgrade plan in order to continue.');
                                    $('#button-enable-trial').closest('.ui-btn').hide();
                                    $('#button-purchase').closest('.ui-btn').show();
                                } else {
                                    //Everything ok, show monitoring-dialog, hide plan-dialog
                                    $('#enable-monitoring-dialog').show();
                                    $('#plan-dialog').hide();
                                }
                            }
                        } else {
                            //no plans, show plan-dialog, hide monitoring-dialog
                            if ((Mist.user_details) && (Mist.user_details.name)) {
                                $('#trial-user-name').val(Mist.user_details.name);
                            }
                            if ((Mist.user_details) && (Mist.user_details.company_name)) {
                                $('#trial-company-name').val(Mist.user_details.company_name);
                            }
                            if ((Mist.user_details) && (Mist.user_details.country)) {
                                $('#trial-user-country').val(Mist.user_details.country);
                            }
                            if ((Mist.user_details) && (Mist.user_details.number_of_servers)) {
                                $('#trial-user-servers').val(Mist.user_details.number_of_servers);
                            }
                            if ((Mist.user_details) && (Mist.user_details.number_of_people)) {
                                $('#trial-user-people').val(Mist.user_details.number_of_people);
                            }
                            $('#enable-monitoring-dialog').hide();
                            $('#monitoring-enabled').hide();
                            $('#plan-dialog').show();
                            $('#plan-text span').text('Monitoring is a premium service. You can try it for free for one month, or purchase a plan.');
                            $('#button-enable-trial').parent().addClass('ui-last-child');
                            $('#button-enable-trial').closest('.ui-btn').show();
                            $('#button-purchase').closest('.ui-btn').hide();
                        }
                    }
                }
                $("#monitoring-dialog").popup('open');
            },

            init: function() {
                this._super();

                this.tags = Ember.ArrayController.create();
                this.keys = Ember.ArrayController.create();
                
                var that = this;
                Mist.keysController.content.forEach(function(key){
                    if (key.machines && key.machines.length > 0){
                        key.machines.forEach(function(item){
                            if (item[1] == that.id && item[0] == that.backend.id) {
                                that.keys.addObject(key);
                            }
                        });
                    }
                });

                this.startUptimeTimer();
                this.probe();
            }
        });
    }
);
