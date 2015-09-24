define('app/views/machine_edit', ['app/views/popup'],
    //
    //  Machine Edit View
    //
    //  @returns Class
    //
    function (PopupComponent) {

        'use strict';

        return App.MachineEditComponent = PopupComponent.extend({

            //
            // Properties
            //

            layoutName: 'machine_edit',
            controllerName: 'machineEditController',
            popupId: '#machine-edit',


            //
            //  Methods
            //

            updateRenameButton: function () {
                if (Mist.machineEditController.formReady) {
                    $('#rename-machine-option').removeClass('ui-state-disabled');
                    $('#machine-edit-ok').removeClass('ui-state-disabled');                    
                } else {
                    $('#rename-machine-option').addClass('ui-state-disabled');
                    $('#machine-edit-ok').addClass('ui-state-disabled');
                }
            },


            //
            //  Actions
            //

            actions: {
                backClicked: function () {
                    Mist.machineEditController.close();
                },

                saveClicked: function () {
                    Mist.machineEditController.save();
                }
            },


            //
            //  Observers
            //

            updateRenameButtonObserver: function () {
                Ember.run.once(this, 'updateRenameButton');
            }.observes('Mist.machineEditController.formReady')
        });
    }
);
