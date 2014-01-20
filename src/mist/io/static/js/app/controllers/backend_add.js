define('app/controllers/backend_add', ['app/models/backend','ember'],
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

            callback: null,
            formReady: null,

            newBackendKey: null,
            newBackendProvider: null,
            newBackendFirstField: null,
            newBackendSecondField: null,
            newBackendOpenStackURL: null,
            newBackendOpenStackTenant: null,

            /**
             * 
             *  Methods
             * 
             */

            open: function(callback) {
                $('#add-backend-panel').panel('open');
                Ember.run.next(function(){
                    $('.ui-page-active').height($('.ui-panel-open').height());
                    $('body').css('overflow','auto');
                });
                this._clear();
                this.set('callback', callback);
                this._updateFormReady();
            },


            close: function() {
                $('#add-backend-panel').panel('close');
                this._clear();
            },


            add: function() {
                var that = this;
                Mist.backendsController.addBackend(this.newBackendProvider.title,
                                                   this.newBackendProvider.provider,
                                                   this.newBackendFirstField,
                                                   this.newBackendSecondField,
                                                   this.newBackendOpenStackURL,
                                                   this.newBackendOpenStackTenant,
                                                   this.newBackendKey,
                function(success, backend) {
                    that._giveCallback(success, backend);
                    if (success) {
                        that.close();
                    }
                });
            },



            /**
             * 
             *  Pseudo-Private Methods
             * 
             */

            _clear: function() {
                this.set('callback', null);
                
                this.set('newBackendKey', {id: "Select SSH Key"});
                this.set('newBackendProvider', {title: 'Select provider'});
                this.set('newBackendFirstField', null);
                this.set('newBackendSecondField', null);
                this.set('newBackendOpenStackURL', null);
                this.set('newBackendOpenStackTenant', null);
                
                $('#new-backend-provider').collapsible('collapse');
                $('#new-backend-provider').collapsible('option','collapsedIcon','arrow-d');
            },


            _updateFormReady: function() {
                var ready = false;
                if ('provider' in this.newBackendProvider) { // Filters out the "Select provider" dummy provider
                    if (this.newBackendFirstField && this.newBackendSecondField) {
                        ready = true;
                        if (this.newBackendProvider.provider == 'openstack') {
                            if (!(this.newBackendOpenStackURL && this.newBackendOpenStackTenant)) {
                                ready = false;
                            }
                        } else if (this.newBackendProvider.provider == 'bare_metal') {
                            if (!Mist.keysController.keyExists(this.newBackendKey.id)) {
                                ready = false;
                            }
                        }
                    }
                }
                this.set('formReady', ready);
            },


            _giveCallback: function(success, backend) {
                if (this.callback) this.callback(success, backend);
            },



            /**
             * 
             *  Observers
             * 
             */

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newBackendKey',
                       'newBackendProvider',
                       'newBackendFirstField',
                       'newBackendSecondField',
                       'newBackendOpenStackURL',
                       'newBackendOpenStackTenant')
        });
    }
);
