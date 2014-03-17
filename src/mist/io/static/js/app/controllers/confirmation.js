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
            },

            confirm: function() {
                $('#confirmation-popup').popup('close');
                this.callback();
                this.set('callback', function(){});
            },

            setUp: function(title, text, callback) {
                this.set('title', title)
                    .set('text', text)
                    .set('callback', callback)
                    .show();
            }
        });
    }
);
