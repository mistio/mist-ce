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
            command: null,


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
                        that.set('command', data.command);
                        $('#manual-monitoring-popup').popup('open');
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
                    .set('command', null);
            },


            getMonitoringCommand: function(machine, callback) {
                var that = this;
                this.set('gettingCommand', true);
                Mist.ajax.POST('/backends/' + machine.backend.id + '/machines/' + machine.id + '/monitoring', {
                    'action': 'enable',
                    'dns_name': machine.extra.dns_name ? machine.extra.dns_name : 'n/a',
                    'public_ips': machine.public_ips ? machine.public_ips : [],
                    'name': machine.name ? machine.name : machine.id,
                    'no_ssh': true,
                    'dry': true,
                }).success(function(data) {
                    that.set('command', data.command);
                }).error(function(message) {
                    Mist.notificationController.notify('Failed to enable monitoring: ' + message);
                }).complete(function(success, data) {
                    that.set('gettingCommand', false);
                    if (callback) callback(success, data);
                });
            },


            machineProbedObserver: function() {
                if (this.machine && this.machine.probed
                    && !this.machine.enablingMonitoring) {
                        var machine = this.machine;
                        Mist.confirmationController.set('title', 'Enable monitoring');
                        Mist.confirmationController.set('text', 'Are you sure you want to enable monitoring for this machine?');
                        Mist.confirmationController.set('callback', function () {
                            Mist.monitoringController.enableMonitoring(machine);
                        });

                        this.close();
                        Ember.run.later(function() {
                            Mist.confirmationController.show();
                        }, 300);
                }
            }.observes('machine.probed')
        });
    }
);
