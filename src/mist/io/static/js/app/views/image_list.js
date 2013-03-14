define('app/views/image_list', [
    'app/views/mistscreen',
    'text!app/templates/image_list.html','ember'],
    /**
     *
     * Images page
     *
     * @returns Class
     */
    function(MistScreen, image_list_html) {
        return MistScreen.extend({
            template: Ember.Handlebars.compile(image_list_html),
        });
    }
);
