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

                var section = location.hash;
                if (section != '#key&ui-state=dialog') {
                    // if confirm doesn't come from the single key section, simply go back
                    window.history.go(-1);
                } else {
                    // when in single key view go to keys list view
                    $.mobile.changePage('#keys');
                }
                this.set("callback", function(){});
            }
        });
    }
);
