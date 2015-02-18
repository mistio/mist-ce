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

        });
    }
);
