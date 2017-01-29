define('app/views/team_edit', ['app/views/popup'],
    //
    //  Team Edit View
    //
    //  @returns Class
    //
    function(PopupComponent) {

        'use strict';

        return App.TeamEditComponent = PopupComponent.extend({

            //
            // Properties
            //

            layoutName: 'team_edit',
            controllerName: 'teamEditController',
            popupId: '#team-edit-popup',

            //
            //  Methods
            //

            updateSaveButton: function() {
                if (Mist.teamEditController.formReady) {
                    $('#team-edit-ok').removeClass('ui-state-disabled');
                } else {
                    $('#team-edit-ok').addClass('ui-state-disabled');
                }
            },

            //
            //  Actions
            //

            actions: {
                backClicked: function() {
                    Mist.teamEditController.close();
                },

                saveClicked: function() {
                    Mist.teamEditController.save();
                }
            },

            //
            // Observers
            //

            updateSaveButtonObserver: function() {
                Ember.run.once(this, 'updateSaveButton');
            }.observes('Mist.teamEditController.formReady')
        });
    }
);
