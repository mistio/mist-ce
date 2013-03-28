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
                $('#dialog-confirm').popup('close');
                this.callback();
                this.set("callback", function(){});
            }
        });
    }
);
