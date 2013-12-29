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
                info('dist');
            },
            willInsertElement: function() {
                info('will');  
            },
            didInsertElement: function() {
                info('yo');
                if ($('[data-role=page]').page) {
                    $('[data-role=page]').page().show();
                }
            }
        });
    }
);
