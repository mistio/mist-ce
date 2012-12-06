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
            tagName: false,

            confirm: function(){
                Mist.confirmationController.confirm();
            },

            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(confirmation_dialog_html));
            },
        });
    }
);
