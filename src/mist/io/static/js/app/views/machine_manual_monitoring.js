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
                    Mist.monitoringController.changeMonitoring(
                        Mist.machineManualMonitoringController.machine
                    );
                    Mist.machineManualMonitoringController.close();
                },

                doneClicked: function () {
                    Mist.machineManualMonitoringController.close();
                },
            }
        });
    }
);
