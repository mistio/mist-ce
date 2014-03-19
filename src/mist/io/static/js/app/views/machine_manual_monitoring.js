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

                selectCommandText: function () {
                    Mist.selectElementContents('manual-monitoring-command');
                },

                cancelClicked: function () {
                    Mist.machineManualMonitoringController.close();
                },

                doneClicked: function () {
                    Mist.monitoringController.enableMonitoring(
                        Mist.machineManualMonitoringController.machine, null, true
                    );
                    Mist.machineManualMonitoringController.close();
                }
            }
        });
    }
);
