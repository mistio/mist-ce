define('app/views/backend_edit', ['text!app/templates/backend_edit_dialog.html', 'ember'],
    /**
     *  Edit Backend Popup
     * 
     *  @returns Class
     */
    function(edit_backend_dialog_html) {
        return Ember.View.extend({

            /**
             * 
             *  Properties
             * 
             */

            template: Ember.Handlebars.compile(edit_backend_dialog_html),

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
                    Mist.backendEditController.deleteBackend();
                },

                noClicked: function() {
                    $('#backend-delete-confirm').slideUp();
                }
            }
        });
    }
);
