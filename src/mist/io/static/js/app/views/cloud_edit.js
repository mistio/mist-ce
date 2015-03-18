define('app/views/cloud_edit', ['app/views/popup'],
    //
    //  Cloud Edit View
    //
    //  @returns Class
    //
    function (PopupView) {

        'use strict';

        return App.CloudEditView = PopupView.extend({


            //
            //
            //  Methods
            //
            //


            open: function () {
                this._super();
                $('#monitoring-message').hide();
                $('#cloud-delete-confirm').hide();
            },


            updateStateSlider: function () {
                var newState = Mist.cloudEditController.newState ? '1' : '0';
                $('#cloud-toggle').val(newState).slider('refresh');
            },


            //
            //
            //  Actions
            //
            //


            actions: {

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
                },


                noClicked: function () {
                    $('#cloud-delete-confirm').slideUp();
                },


                backClicked: function() {
                    Mist.cloudEditController.close();
                },
            },


            //
            //
            //  Observers
            //
            //


            newStateObserver: function () {
                Ember.run.once(this, 'updateStateSlider');
            }.observes('Mist.cloudEditController.newState')
        });
    }
);
