define('app/views/machine_image_create', ['app/views/popup'],
    //
    //  Machine's Image Create View
    //
    //  @returns Class
    //
    function (PopupComponent) {

        'use strict';

        return App.MachineImageCreateComponent = PopupComponent.extend({

            layoutName: 'machine_image_create',
            controllerName: 'machineImageCreateController',
            popupId: '#machine-image-create-popup',
            

            //
            //  Methods
            //

            updateSaveButton: function () {
                if (Mist.machineImageCreateController.formReady) {
                    $('#create-image-ok').removeClass('ui-state-disabled');
                } else {
                    $('#create-image-ok').addClass('ui-state-disabled');
                }
            },


            //
            //  Actions
            //

            actions: {

                backClicked: function () {
                    Mist.machineImageCreateController.close();
                },

                saveClicked: function () {
                    Mist.machineImageCreateController.save();
                }
            },


            //
            // Observers
            //


            updateSaveButtonObserver: function () {
                Ember.run.once(this, 'updateSaveButton');
            }.observes('Mist.machineImageCreateController.formReady')

        });
    }
);