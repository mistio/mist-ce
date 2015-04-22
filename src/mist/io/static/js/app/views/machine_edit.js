define('app/views/machine_edit', ['app/views/popup'],
    //
    //  Machine Edit View
    //
    //  @returns Class
    //
    function (PopupView) {

        'use strict';

        return App.MachineEditView = PopupView.extend({


            /**
             *
             *  Methods
             *
             */

            updateRenameButton: function () {
                if (Mist.machineEditController.renamingMachine) {
                    $('#rename-machine-option').addClass('ui-state-disabled');
                    $('#machine-edit-ok').addClass('ui-state-disabled');
                } else {
                    $('#rename-machine-option').removeClass('ui-state-disabled');
                    $('#machine-edit-ok').removeClass('ui-state-disabled');
                }
            },

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
            },

            /**
             *
             *  Observers
             *
             */

            updateRenameButtonObserver: function () {
                Ember.run.once(this, 'updateRenameButton');
            }.observes('Mist.machineEditController.renamingMachine')
        });
    }
);
