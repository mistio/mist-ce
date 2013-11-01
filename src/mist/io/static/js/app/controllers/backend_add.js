define('app/controllers/backend_add', [
    'app/models/backend',
    'ember'
    ],
    /**
     * Backend Add Controller
     *
     * @returns Class
     */
    function(Backend) {
        return Ember.Object.extend({

            pendingCreation: null,
            newBackendReady: null,
            newBackendProvider: null,
            newBackendFirstField: null,
            newBackendSecondField: null,
            newBackendOpenStackURL: null,
            newBackendOpenStackTenant: null,

            clear: function() {
                this.set('newBackendReady', null);
                this.set('newBackendProvider', {title: 'Select provider'});
                this.set('newBackendFirstField', null);
                this.set('newBackendSecondField', null);
                this.set('newBackendOpenStackURL', null);
                this.set('newBackendOpenStackTenant', null);
                
                $('#new-backend-provider').collapsible('collapse');
                $('#new-backend-provider').collapsible('option','collapsedIcon','arrow-d');
            },

            addBackend: function() {
                this.set('pendingCreation', true);
                var payload = {
                    'title'      : this.newBackendProvider.title,
                    'provider'   : this.newBackendProvider.provider,
                    'apikey'     : this.newBackendFirstField,
                    'apisecret'  : this.newBackendSecondField,
                    'apiurl'     : this.newBackendOpenStackURL,
                    'tenant_name': this.newBackendOpenStackTenant
                };
                var that = this;
                $.ajax({
                    url: '/backends',
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    headers: { "cache-control": "no-cache" },
                    data: JSON.stringify(payload),
                    success: function(result) {
                        that.clear();
                        $("#add-backend").panel("close");
                        that.set('pendingCreation', false);
                        info('Successfully added backend ' + result.id);
                        Mist.backendsController.pushObject(Backend.create(result));
                    },
                    error: function(request){
                        that.set('pendingCreation', false);
                        Mist.notificationController.notify(request.responseText);
                    }
                });  
            },

            newBackendObserver: function() {
                var ready = false;
                if ('provider' in this.newBackendProvider) { // Filters out the "Select provider" dummy provider
                    if (this.newBackendFirstField && this.newBackendSecondField) {
                        ready = true;
                        if (this.newBackendProvider.title == 'OpenStack') {
                            if (!(this.newBackendOpenStackURL && this.newBackendOpenStackTenant)) {
                                ready = false;
                            }
                        }
                    }
                }
                this.set('newBackendReady', ready);
            }.observes('newBackendProvider',
                       'newBackendFirstField',
                       'newBackendSecondField',
                       'newBackendOpenStackURL',
                       'newBackendOpenStackTenant')
        });
    }
);
