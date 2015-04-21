define('app/views/machine_edit', ['app/views/popup'],
    //
    //  Machine Edit View
    //
    //  @returns Class
    //
    function (PopupView) {

        'use strict';

        return App.MachineEditView = PopupView.extend({


            //
            //
            //  Actions
            //
            //


            actions: {

                backClicked: function () {
                    Mist.machineEditController.close();
                },

                saveClicked: function () {
                    Mist.machineEditController.save();
                }
            }
        });
    }
);
