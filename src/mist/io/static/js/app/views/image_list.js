define('app/views/image_list', [
    'app/views/jqm_page',
    'text!app/templates/image_list.html','ember'],
    /**
     *
     * Images page
     *
     * @returns Class
     */
    function(Page, image_list_html) {
        return Page.extend({
            id: 'images',

            init: function() {
                this._super();
                this.set('template', Ember.Handlebars.compile(image_list_html));
            },
        });
    }
);
