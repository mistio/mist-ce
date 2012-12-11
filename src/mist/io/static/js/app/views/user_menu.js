define('app/views/user_menu', [
    'text!app/templates/user_menu.html',
    'ember'
    ],
    /**
     *
     * Logout Dialog
     *
     * @returns Class
     */
    function(user_menu_html) {
        return Ember.View.extend({
            tagName: false,
            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(user_menu_html));
            },
        });
    }
);
