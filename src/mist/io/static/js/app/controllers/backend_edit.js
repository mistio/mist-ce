define('app/controllers/backend_edit', ['ember'],
    /**
     *  Backend Edit Controller
     *
     *  @returns Class
     */
    function() {
        return Ember.Object.extend({

            backend: null,

            deleteBackend: function(callback) {
                Mist.backendsController.deleteBackend(this.backend.id, callback);
            },

            toggleBackend: function(callback) {
                var newState = $('#backend-toggle').val() == '1' ? true : false;
                Mist.backendsController.toggleBackend(this.backend.id, newState, callback);
            }
        });
    }
);
