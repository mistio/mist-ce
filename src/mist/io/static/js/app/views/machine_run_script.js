define('app/views/machine_run_script', ['app/views/popup'],
    //
    //  Machine Edit View
    //
    //  @returns Class
    //
    function(PopupComponent) {

        'use strict';

        return App.MachineRunScriptComponent = PopupComponent.extend({

            //
            // Properties
            //

            layoutName: 'machine_run_script',
            controllerName: 'machineRunScriptController',
            popupId: '#machine-run-script',


            //
            //  Actions
            //

            actions: {
                backClicked: function() {
                    Mist.machineRunScriptController.close();
                },
                runScript: function() {
                    var that = this;
                    Mist.scriptsController.runScript({
                        script: Mist.machineRunScriptController.get('scriptToRun'),
                        callback: function(success) {
                            if (success) {
                                that.close();
                                Mist.machineRunScriptController.get('scriptToRun').set('script', {})
                                Mist.machineRunScriptController.get('scriptToRun').set('parameters', '')
                            }
                        }
                    });
                }
            }



        });
    }
);
