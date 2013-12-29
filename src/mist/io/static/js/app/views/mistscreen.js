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

            didInsertElement: function() {
                if ($('[data-role=page]').page) {
                    $('[data-role=page]').page().show();
                }
            }
        });
    }
);
