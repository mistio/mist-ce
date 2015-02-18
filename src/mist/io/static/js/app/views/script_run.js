define('app/views/script_run', ['app/views/panel'],
    //
    //  Script Run View
    //
    //  @returns Class
    function (PanelView) {

        'use strict';

        return PanelView.extend({

            isReady: function () {
                return Mist.scriptRunController.scriptToRun.machine.id;
            }.property('Mist.scriptRunController.scriptToRun.machine'),

            actions: {
                machineClicked: function (machine) {
                    Mist.scriptRunController.get('scriptToRun').set('machine', machine);
                    this.$('#script-run-machine').collapsible('collapse');
                },
                backClicked: function () {
                    Mist.scriptRunController.close();
                },
                runClicked: function () {
                    Mist.scriptRunController.run();
                }
            }
        });
    }
);
