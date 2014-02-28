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

                }
            }
        });
    }
);
