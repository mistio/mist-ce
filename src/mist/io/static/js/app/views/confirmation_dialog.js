define('app/views/confirmation_dialog', ['ember'],
    /**
     * Confirmation Dialog
     *
     * @returns Class
     */
    function(confirmation_dialog_html) {
        return Ember.View.extend({

            template: getTemplate('confirmation_dialog'),

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
