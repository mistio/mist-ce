define('app/views/home', [
    'text!app/templates/home.html','ember'],
    /**
     *
     * Key page
     *
     * @returns Class
     */
    function(home_html) {
        return Ember.View.extend({
            tagName: false,

            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(home_html));
            },
        });
    }
);
