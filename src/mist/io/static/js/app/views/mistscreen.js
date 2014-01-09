define('app/views/mistscreen', ['ember'],
    /**
     *  Mistscreen View
     *
     *  @returns Class
     */
    function () {
        return Ember.View.extend({

            /**
             *  Initialization
             */

            didInsertElement: function () {
                if ($('.ui-page-active').page) {
                    $('.ui-page-active').page();
                }
            }
        });
    }
);
