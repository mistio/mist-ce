define('app/views/mistscreen', ['ember'],
    /**
     *  Mistscreen View
     *
     *  @returns Class
     */
    function() {
        return Ember.View.extend({

            /**
             *  Initialization
             */

            destroyElement: function() {
                $('.ui-popup').remove();
                if ($('[data-role=page]').page) {
                    $('[data-role=page]').page('destroy');
                }
            },

            didInsertElement: function() {
                if ($('[data-role=page]').page) {
                    $('[data-role=page]').page().show();
                }
            }
        });
    }
);
