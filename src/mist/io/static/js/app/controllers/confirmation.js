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
                // if confirm doesn't come from the keys section, searching is case sensitive
                if (this.title.indexOf('Key') == -1) {
                    window.history.go(-1);
                }
                this.set("callback", function(){});
            }
        });
    }
);
