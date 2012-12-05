define('app/views/key_list', [
    'text!app/templates/key_list.html','ember'],
    /**
     *
     * Key list page
     *
     * @returns Class
     */
    function(key_list_html) {
        return Ember.View.extend({
            tagName: false,

            init: function() {
                this._super();
                this.set('template', Ember.Handlebars.compile(key_list_html));
            },
        });
    }
);
