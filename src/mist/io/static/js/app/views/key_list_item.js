define('app/views/key_list_item', [
    'text!app/templates/key_list_item.html',
    'ember'
    ],
    /**
     * Key List Item View
     *
     * @returns Class
     */
    function(key_list_item_html) {
        return Ember.View.extend({

                template: Ember.Handlebars.compile(key_list_item_html),

                tagName:'li',
        });
    }
);
