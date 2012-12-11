define('app/views/logout_dialog', [
    'text!app/templates/logout_dialog.html',
    'ember'
    ],
    /**
     *
     * Logout Dialog
     *
     * @returns Class
     */
    function(logout_dialog_html) {
        return Ember.View.extend({
            tagName: false,

            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(logout_dialog_html));
            },
        });
    }
);
