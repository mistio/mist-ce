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
            popupId: '#script-edit-popup',


            //
            //  Methods
            //


            updateSaveButton: function () {
                if (Mist.scriptEditController.formReady) {
                    $('#script-edit-ok').removeClass('ui-state-disabled');
                } else {
                    $('#script-edit-ok').addClass('ui-state-disabled');
                }
            },


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
            },


            //
            // Observers
            //


            updateSaveButtonObserver: function () {
                Ember.run.once(this, 'updateSaveButton');
            }.observes('Mist.scriptEditController.formReady')
        });
    }
);
