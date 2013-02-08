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
                var machine = Mist.machine;
                $.mobile.changePage('#dialog-confirm');
                Mist.set('machine', machine);
            },

            confirm: function() {
                // the callback should handle page change after it completes
                this.callback();
                this.set("callback", function(){});
            }
        });
    }
);
