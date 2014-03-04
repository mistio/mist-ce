define('app/views/machine_manual_monitoring', ['app/views/templated', 'ember'],
    /**
     *  Machine Manual Monitoring View
     *
     *  @returns Class
     */
    function (TemplatedView) {
        return TemplatedView.extend({

            /**
             *  Properties
             */


            /**
             *
             *  Methods
             *
             */

            reEnableMonitoring: function() {


            },


            /**
             *
             *  Actions
             *
             */


            actions: {


                associateClicked: function() {

                    var that = this;
                    var machine = this._parentView._parentView.machine;
                    Mist.machineKeysController.openKeyList(this._parentView._parentView.machine, function(success) {
                        if (success) {
                            Mist.machineKeysController.close();
                            $('#machine-manual-monitoring').slideUp();
                            Mist.confirmationController.set('title', 'Enable monitoring');
                            Mist.confirmationController.set('text', 'Are you sure you want to enable monitoring for this machine?');
                            Mist.confirmationController.set('callback', function () {
                                Mist.monitoringController.changeMonitoring(machine);
                            });
                            Mist.confirmationController.show();
                        }
                    });
                },


                manualInstallationClicked: function() {

                    var that = this;
                    var machine = this._parentView._parentView.machine;
                    Mist.monitoringController.getMonitoringCommand(machine, function(success, data) {

                        if (success) {

                            that.set('passwd', data.passwd);
                            that.set('monitor_server', data.monitor_server);
                            that.set('uuid', data.uuid);

                            $('#machine-manual-monitoring-message').slideUp();
                            $('#machine-manual-monitoring-btns').slideUp();
                            $('#machine-manual-monitoring-commands').slideDown();
                        }
                    });
                },

                backClicked: function () {

                    // Hide the whole view
                    $('#machine-manual-monitoring').slideUp();

                    // Bring everything back to the initial state
                    $('#machine-manual-monitoring-message').slideDown();
                    $('#machine-manual-monitoring-btns').slideDown();
                    $('#machine-manual-monitoring-commands').slideUp();

                    // Show enable button
                    $('#enable-monitoring-bundle').slideDown();
                }
            }
        });
    }
);
