define('app/views/backend_edit', [
    'text!app/templates/backend_edit_dialog.html',
    'ember'],
    /**
     * Edit Backend Dialog
     *
     * @returns Class
     */
    function(edit_backend_dialog_html) {

        return Ember.View.extend({

            template: Ember.Handlebars.compile(edit_backend_dialog_html),

            actions: {
                stateToggleSwitched: function() {
                    Mist.backendEditController.toggleBackend();
                },

                deleteClicked: function( ){
                    if (Mist.backendEditController.backend.getMonitoredMachines) {
                        $('#monitoring-message').show();
                    } else {
                        $('#monitoring-message').hide();
                    }
                    $('#backend-delete-confirm').slideDown();
                },

                backClicked: function() {
                    $('#backend-delete-confirm').slideUp();
                    $("#edit-backend").popup("close");
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
