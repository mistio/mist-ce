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

            confirm: function(){
                this.callback();
                window.history.go(-1);

                this.set("callback", function(){});
            }
        });
    }
);
