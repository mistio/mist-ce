define('app/controllers/confirmation', [
    'ember',
    'jquery',
    ],
    /**
     * Confirmation Dialog controller
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({
            show: function(){
                $('#dialog-confirm').popup('open', {transition: 'pop'});
            },

            confirm: function() {
                this.callback();
                this.set("callback", function(){});
                $('#dialog-confirm').popup('close');
            }
        });
    }
);
