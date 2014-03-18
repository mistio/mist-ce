define('app/views/machine_manual_monitoring', ['app/views/templated', 'ember'],
    /**
     *  Machine Manual Monitoring View
     *
     *  @returns Class
     */
    function (TemplatedView) {
        return TemplatedView.extend({


            /**
             *
             *  Actions
             *
             */


            actions: {

                cancelClicked: function () {

                    var machine = Mist.machineManualMonitoringController.machine;

                    Mist.monitoringController.disableMonitoring(machine, function(success) {
                        if (success)
                            machine.set('pendingMonitoring', false);
                    });
                    machine.set('hasMonitoring', false);
                    machine.set('disablingMonitoring', false);
                    Mist.machineManualMonitoringController.close();
                },

                doneClicked: function () {
                    Mist.machineManualMonitoringController.machine.set('pendingMonitoring', false);
                    Mist.machineManualMonitoringController.machine.set('pendingFirstData', true);
                    Mist.machineManualMonitoringController.close();
                },
            }
        });
    }
);
