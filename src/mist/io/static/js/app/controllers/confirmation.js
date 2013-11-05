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
                $('#dialog-confirm').popup('open');
            },

            confirm: function() {
                $('#dialog-confirm').popup('close');
                this.callback();
                this.set('callback', function(){});
            }
        });
    }
);
