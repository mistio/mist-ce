define('app/views/mistscreen', ['ember'],
    /**
     *  Mist Base screen page
     *
     *  @returns Class
     */
    function() {
        return Ember.View.extend({

            tagName: false,

            destroyElement: function() {
                if ($('[data-role=page]').page) {
                    $('[data-role=page]').page('destroy');
                }
                $('.ui-popup').remove();
            },

            didInsertElement: function() {
                if ($('[data-role=page]').page) {
                    $('[data-role=page]').page();
                }
            }
        });
    }
);
