define('app/views/key_list_item', [
    'text!app/templates/key_list_item.html',
    'ember'
    ],
    /**
     *
     * Key List Item View
     *
     * @returns Class
     */
    function(key_list_item_html) {
        return Ember.View.extend({
            
                template: Ember.Handlebars.compile(key_list_item_html),
                
                //init: function() {
                //    this._super();
                //},
                
                tagName:'li',

                keySelected: function() {
                    var len = 0;
                    Mist.keysController.forEach(function(key) {
                        if (key.selected) {
                            len++;
                        }
                    });
                    
                    if (len > 0) {
                        $('.keys-footer').fadeIn(200);
                    } else {
                        $('.keys-footer').fadeOut(200);
                    }
                }.observes('key.selected'),

                
        });

    }
);
