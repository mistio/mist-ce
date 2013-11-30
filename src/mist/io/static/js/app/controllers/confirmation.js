define('app/controllers/confirmation', ['ember'],
    /**
     * Confirmation Dialog Controller
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({

            show: function() {
                $('#confirmation-popup').popup('open');
                Ember.run.later(function() {
                    $('#confirmation-popup').popup('reposition', {positionTo: 'window'});
                }, 10);
            },

            confirm: function() {
                $('#confirmation-popup').popup('close');
                this.callback();
                this.set('callback', function(){});
            }
        });
    }
);
