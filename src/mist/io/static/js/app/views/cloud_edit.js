define('app/views/cloud_edit', ['app/views/popup'],
    //
    //  Cloud Edit View
    //
    //  @returns Class
    //
    function (PopupComponent) {

        'use strict';

        return App.CloudEditComponent = PopupComponent.extend({

            layoutName: 'cloud_edit',
            controllerName: 'cloudEditController',
            popupId: '#cloud-edit',

            //
            //  Methods
            //

            open: function (position) {
                this._super(position);
            },

            updateStateSlider: function () {
                var newState = Mist.cloudEditController.newState ? '1' : '0';
                $('#cloud-toggle').val(newState).slider('refresh');
            },

            updateRenameButton: function () {
               if (Mist.cloudEditController.formReady) {
                   $('#edit-title-ok').removeClass('ui-state-disabled');
               } else {
                   $('#edit-title-ok').addClass('ui-state-disabled');
               }
            },


            //
            //  Actions
            //

            actions: {

                renameClicked: function() {
                    Mist.cloudEditController.rename();
                },


                stateToggleSwitched: function () {
                    var newState = parseInt($('#cloud-toggle').val());
                    Mist.cloudEditController.set('newState', newState);
                },


                deleteClicked: function () {
                    if (Mist.cloudEditController.cloud.getMonitoredMachines.length)
                        $('#monitoring-message').show();
                    else
                        $('#monitoring-message').hide();
                    $('#cloud-delete-confirm').slideDown();
                },


                yesClicked: function () {
                    Mist.cloudEditController.delete();
                    $('#cloud-delete-confirm').slideUp();
                },


                noClicked: function () {
                    $('#cloud-delete-confirm').slideUp();
                },


                backClicked: function() {
                    Mist.cloudEditController.close();
                }
            },


            //
            //
            //  Observers
            //
            //


            newStateObserver: function () {
                Ember.run.once(this, 'updateStateSlider');
            }.observes('Mist.cloudEditController.newState'),


            newNameObserver: function () {
               Ember.run.once(this, 'updateRenameButton');
            }.observes('Mist.cloudEditController.formReady')
        });
    }
);
