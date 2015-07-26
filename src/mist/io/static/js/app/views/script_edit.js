define('app/views/script_edit', ['app/views/popup'],
    //
    //  Script Edit View
    //
    //  @returns Class
    //
    function (PopupView) {

        'use strict';

        return App.ScriptEditView = PopupView.extend({

            templateName: 'script_edit',
            controllerName: 'scriptEditController',


            //
            //  Actions
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
