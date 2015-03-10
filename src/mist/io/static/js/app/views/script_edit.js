define('app/views/script_edit', ['app/views/popup'],
    //
    //  Script Edit View
    //
    //  @returns Class
    //
    function (PopupView) {

        'use strict';

        return App.ScriptEditView = PopupView.extend({


            //
            //
            //  Actions
            //
            //


            actions: {

                backClicked: function () {
                    Mist.scriptEditController.close();
                },

                saveClicked: function () {
                    Mist.scriptEditController.save();
                }
            }
        });
    }
);
