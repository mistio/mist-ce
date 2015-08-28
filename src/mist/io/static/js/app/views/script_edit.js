define('app/views/script_edit', ['app/views/popup'],
    //
    //  Script Edit View
    //
    //  @returns Class
    //
    function (PopupComponent) {

        'use strict';

        return App.ScriptEditComponent = PopupComponent.extend({

            layoutName: 'script_edit',
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
