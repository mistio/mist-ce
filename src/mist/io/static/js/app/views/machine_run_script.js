define('app/views/machine_run_script', ['app/views/popup'],
    //
    //  Machine Run Script View
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
                scriptClicked: function (script) {
                    Mist.machineRunScriptController.get('scriptToRun').set('script', script);
                    $('#machine-run-script-script').collapsible('collapse');
                },
                backClicked: function() {
                    Mist.machineRunScriptController.close();
                },
                runScript: function() {
                    Mist.machineRunScriptController.runScript();
                }
            }
        });
    }
);
