define('app/views/confirmation_dialog', [
    'text!app/templates/confirmation_dialog.html','ember'],
    /**
     *
     * Confirmation Dialog
     *
     * @returns Class
     */
    function(confirmation_dialog_html) {
        return Ember.View.extend({
            attributeBindings: ['data-role',],

            confirm: function(){
                Mist.confirmationController.confirm();
            },
            
            reject: function(){
        	   $('#dialog-confirm').popup('close');
            },

            template: Ember.Handlebars.compile(confirmation_dialog_html),
        });
    }
);
