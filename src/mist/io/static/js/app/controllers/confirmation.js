define('app/controllers/confirmation', [
    'ember',
    'jquery',
    ],
    /**
     * Confirmation Dialog Controller
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({

            show: function(){
                $('#confirmation-popup').popup('open');
            },

            confirm: function() {
                $('#confirmation-popup').popup('close');
                this.callback();
                this.set('callback', function(){});
            }
        });
    }
);
