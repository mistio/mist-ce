define('app/controllers/backend_edit', ['ember'],
    /**
     *  Backend Edit Controller
     *
     *  @returns Class
     */
    function() {
        return Ember.Object.extend({

            /**
             *  Properties
             */

            backend: null,
            callback: null,
            newBackendTitle: null,


            /**
             * 
             *  Methods
             * 
             */

            open: function(backend, callback) {
                this.set('backend', backend);
                this.set('callback', callback);
                this.set('newBackendTitle', backend.title);
                $('#monitoring-message').hide();
                $('#backend-delete-confirm').hide();
                $('#backend-toggle option[value=1]')[0].selected = backend.enabled;
                $('#backend-toggle').slider('refresh');
                $('#edit-backend-popup').popup('open', {transition: 'pop'});
            },


            close: function() {
                
            },


            _clear: function() {
                this.set('backend', null);
                this.set('callback', null);
                this.set('newBackendTitle', null);
            },


            rename: function() {
                if (! this.newBackendTitle) return;
                Mist.backendsController.renameBackend(this.backend.id, this.newBackendTitle, this.callback);
            },


            deleteBackend: function(callback) {
                Mist.backendsController.deleteBackend(this.backend.id, callback);
            },


            toggleBackend: function(callback) {
                var newState = $('#backend-toggle').val() == '1' ? true : false;
                Mist.backendsController.toggleBackend(this.backend.id, newState, callback);
            },


            /**
             *  
             *  Observers
             * 
             */

            backendTitleOBserver: function() {
                Ember.run.once(this, 'rename');
            }.observes('newBackendTitle'),
        });
    }
);
