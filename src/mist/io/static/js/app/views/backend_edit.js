define('app/views/backend_edit', ['app/views/popup'],
    //
    //  Backend Edit View
    //
    //  @returns Class
    //
    function (PopupView) {

        'use strict';

        return App.BackendEditView = PopupView.extend({


            //
            //
            //  Methods
            //
            //


            open: function () {
                this._super();
                $('#monitoring-message').hide();
                $('#backend-delete-confirm').hide();
            },


            updateStateSlider: function () {
                var newState = Mist.backendEditController.newState ? '1' : '0';
                $('#backend-toggle').val(newState).slider('refresh');
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                stateToggleSwitched: function () {
                    var newState = parseInt($('#backend-toggle').val());
                    Mist.backendEditController.set('newState', newState);
                },


                deleteClicked: function () {
                    if (Mist.backendEditController.backend.getMonitoredMachines.length)
                        $('#monitoring-message').show();
                    else
                        $('#monitoring-message').hide();
                    $('#backend-delete-confirm').slideDown();
                },


                yesClicked: function () {
                    Mist.backendEditController.delete();
                },


                noClicked: function () {
                    $('#backend-delete-confirm').slideUp();
                },


                backClicked: function() {
                    Mist.backendEditController.close();
                },
            },


            //
            //
            //  Observers
            //
            //


            newStateObserver: function () {
                Ember.run.once(this, 'updateStateSlider');
            }.observes('Mist.backendEditController.newState')
        });
    }
);
