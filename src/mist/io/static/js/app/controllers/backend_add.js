define('app/controllers/backend_add', ['app/models/backend', 'ember'],
    /**
     *  Backend Add Controller
     *
     *  @returns Class
     */
    function(Backend) {
        return Ember.Object.extend({

            /**
             * 
             *  Properties
             * 
             */

            newBackendReady: null,
            newBackendProvider: null,
            newBackendFirstField: null,
            newBackendSecondField: null,
            newBackendOpenStackURL: null,
            newBackendOpenStackTenant: null,
            newBackendCallback: null,

            /**
             * 
             *  Observers
             * 
             */

            newBackendObserver: function() {
                var ready = false;
                if ('provider' in this.newBackendProvider) { // Filters out the "Select provider" dummy provider
                    if (this.newBackendFirstField && this.newBackendSecondField) {
                        ready = true;
                        if (this.newBackendProvider.provider == 'openstack') {
                            if (!(this.newBackendOpenStackURL && this.newBackendOpenStackTenant)) {
                                ready = false;
                            }
                        }
                    }
                }
                this.set('newBackendReady', ready);
            }.observes('newBackendProvider', 'newBackendFirstField', 'newBackendSecondField', 'newBackendOpenStackURL',
                                                                                              'newBackendOpenStackTenant'),


            /**
             * 
             *  Methods
             * 
             */

            clear: function() {
                this.set('newBackendReady', null);
                this.set('newBackendProvider', {title: 'Select provider'});
                this.set('newBackendFirstField', null);
                this.set('newBackendSecondField', null);
                this.set('newBackendOpenStackURL', null);
                this.set('newBackendOpenStackTenant', null);
                this.set('newBackendCallback', null);

                $('#new-backend-provider').collapsible('collapse');
                $('#new-backend-provider').collapsible('option','collapsedIcon','arrow-d');
            },


            add: function() {
                Mist.backendsController.addBackend(this.newBackendProvider.title,
                                                   this.newBackendProvider.provider,
                                                   this.newBackendFirstField,
                                                   this.newBackendSecondField,
                                                   this.newBackendOpenStackURL,
                                                   this.newBackendOpenStackTenant,
                                                   this.newBackendCallback);
            }
        });
    }
);
