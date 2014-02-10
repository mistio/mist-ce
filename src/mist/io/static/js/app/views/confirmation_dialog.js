define('app/views/confirmation_dialog', ['app/views/templated', 'ember'],
    /**
     * Confirmation Dialog
     *
     * @returns Class
     */
    function(TemplatedView) {
        return TemplatedView.extend({

            name: 'confirmation_dialog',

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
