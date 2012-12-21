define('app/controllers/confirmation', [
    'ember',
    'jquery',
    'mobile'
    ],
    /**
     * Confirmation Dialog controller
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({
            show: function(){
                $.mobile.changePage('#dialog-confirm');
            },

            confirm: function() {
                // the callback should handle page change after it completes
                this.callback();
                this.set("callback", function(){});
            }
        });
    }
);
