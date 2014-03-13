define('app/controllers/machine_manual_monitoring', ['ember'],
    /**
     *  Machine Manual Monitoring Controller
     *
     *  @returns Class
     */
    function() {
        return Ember.Object.extend({

            /**
             *  Properties
             */

            machine: null,
            callback: null,
            commandUuid: null,
            commandPasswd: null,
            commandMonitorServer: null,


            /**
             *
             *  Methods
             *
             */

            open: function(machine, callback) {
                this._clear();
                this.set('machine', machine);
                this.set('callback', callback);

                var that = this;
                this.getMonitoringCommand(this.machine, function(success, data) {
                    if (success) {
                        $('#manual-monitoring-popup').popup('open');
                        that.set('commandUuid', data.uuid);
                        that.set('commandPasswd', data.passwd);
                        that.set('commandMonitorServer', data.monitor_server);
                    }
                });
            },


            close: function() {
                this._clear();
                $('#manual-monitoring-popup').popup('close');
            },


            _clear: function() {
                this.set('machine', null)
                    .set('callback', null)
                    .set('commandUuid', null)
                    .set('commandPasswd', null)
                    .set('commandMonitorServer', null);
            },


            getMonitoringCommand: function(machine, callback) {
                var that = this;
                machine.set('enablingMonitoring', true);
                machine.set('pendingMonitoring', true);
                Mist.ajax.POST('/backends/' + machine.backend.id + '/machines/' + machine.id + '/monitoring', {
                    'action': 'enable',
                    'dns_name': machine.extra.dns_name ? machine.extra.dns_name : 'n/a',
                    'public_ips': machine.public_ips ? machine.public_ips : [],
                    'name': machine.name ? machine.name : machine.id,
                    'no_ssh': true
                }).success(function(data) {
                    machine.set('hasMonitoring', true);
                    machine.set('enablingMonitoring', false);
                    Mist.set('authenticated', true);
                }).error(function(message, statusCode) {
                    //machine.set('enablingMonitoring', false);
                    machine.set('pendingMonitoring', false);
                    if (statusCode == 402) {
                        Mist.notificationController.timeNotify(message, 5000);
                    } else {
                        Mist.notificationController.notify('Failed to change monitoring to ' + machine.name);
                    }
                }).complete(function(success, data) {
                    if (callback) callback(success, data);
                });
            },

            /**
             *
             *  Observers
             *
             */
        });
    }
);
