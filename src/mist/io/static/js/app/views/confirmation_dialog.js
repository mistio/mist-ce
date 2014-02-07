define('app/views/confirmation_dialog', [
    'text!app/templates/confirmation_dialog.html','ember'],
    /**
     * Confirmation Dialog
     *
     * @returns Class
     */
    function(confirmation_dialog_html) {
        return Ember.View.extend({

            template: Ember.Handlebars.compile(confirmation_dialog_html),

            attributeBindings: ['data-role',],

            actions: {
                yesClicked: function() {
                    Mist.confirmationController.confirm();
                },
                
                noClicked: function() {
            	   $('#confirmation-popup').popup('close');
                }
            }
        });
    }
);
