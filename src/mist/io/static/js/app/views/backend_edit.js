define('app/views/backend_edit', ['app/views/templated', 'ember'],
    /**
     *  Backend Edit View
     * 
     *  @returns Class
     */
    function(TemplatedView) {
        return TemplatedView.extend({

            /**
             * 
             *  Methods
             * 
             */

            updateEnabledState: function() {
                if ($('#backend-toggle').slider) {
                    if (Mist.backendEditController.backend) {
                        var currentValue = $('#backend-toggle').val();
                        var newValue = Mist.backendEditController.backend.enabled ? '1' : '0';
                        if (currentValue != newValue) {
                            $('#backend-toggle').val(newValue).slider('refresh');
                        }
                    }
                }
            },


            /**
             * 
             *  Observers
             * 
             */

            stateObserver: function() {
                Ember.run.once(this, 'updateEnabledState');
            }.observes('Mist.backendsController.togglingBackend', 'Mist.backendEditController.backend.state'),



            /**
             * 
             *  Actions
             * 
             */

            actions: {


                stateToggleSwitched: function() {
                    Mist.backendEditController.toggleBackend();
                },


                deleteClicked: function(){
                    if (Mist.backendEditController.backend.getMonitoredMachines.length) {
                        $('#monitoring-message').show();
                    } else {
                        $('#monitoring-message').hide();
                    }
                    $('#backend-delete-confirm').slideDown();
                },


                backClicked: function() {
                    $('#backend-delete-confirm').slideUp();
                    $('#edit-backend-popup').popup('close');
                },


                yesClicked: function() {
                    $('#button-confirm-disable').addClass('ui-state-disabled');
                    Mist.backendEditController.deleteBackend(function(success) {
                        if (success) {
                            $('#edit-backend-popup').popup('close');
                            $('#backend-delete-confirm').slideUp();
                        }
                        $('#button-confirm-disable').removeClass('ui-state-disabled');
                    });
                },


                noClicked: function() {
                    $('#backend-delete-confirm').slideUp();
                }
            }
        });
    }
);
