define('app/views/key', [
    'text!app/templates/key.html','ember'],
    /**
     *
     * Key page
     *
     * @returns Class
     */
    function(key_html) {
        return Ember.View.extend({
            tagName: false,
            keyBinding: 'Mist.key',

            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(key_html));
            },
        });
    }
);
