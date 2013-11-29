define('app/views/mistscreen', ['ember'],
    /**
     *  Mist Base screen page
     *
     *  @returns Class
     */
    function() {
        return Ember.View.extend({

            tagName: false,

            willInsertElement: function() {
                try {
                    $('[data-role=page]').page('destroy');
                    $('.ui-popup').remove();
                } catch(e){}
            },

            didInsertElement: function() {
                try {
                    $('[data-role=page]').page();
                } catch(e){}
            }
        });
    }
);
