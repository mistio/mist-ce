define('app/controllers/backend_add', ['app/models/backend', 'ember'],
    /**
     *  Backend Add Controller
     *
     *  @returns Class
     */
    function (Backend) {
        return Ember.Object.extend({

            /**
             *  Properties
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

            open: function (callback) {
                this._clear();
                this._updateFormReady();
                this.set('callback', callback);

                $('#add-backend-panel').panel('open');
                Ember.run.next(function () {
                    $('.ui-page-active').height($('.ui-panel-open').height());
                    $('body').css('overflow', 'auto');
                });
            },


            close: function () {
                $('#add-backend-panel').panel('close');
                this._clear();
            },


            add: function () {
                var that = this;
                Mist.backendsController.addBackend(
                    this.newBackendProvider.title,
                    this.newBackendProvider.provider,
                    this.newBackendFirstField,
                    this.newBackendSecondField,
                    this.newBackendOpenStackURL,
                    this.newBackendOpenStackTenant,
                    this.newBackendKey.id,
                    function (success, backend) {
                        that._giveCallback(success, backend);
                        if (success) {
                            that.close();
                        }
                    }
                );
            },


            /**
             *
             *  Pseudo-Private Methods
             *
             */

            _clear: function () {

                this.set('callback', null)
                    .set('newBackendFirstField', null)
                    .set('newBackendSecondField', null)
                    .set('newBackendOpenStackURL', null)
                    .set('newBackendOpenStackTenant', null)
                    .set('newBackendKey', {id: 'Select SSH Key'})
                    .set('newBackendProvider', {title: 'Select provider'});

                // These should be in a view :(
                $('#new-backend-key').collapsible('collapse').collapsible('option', 'collapsedIcon', 'arrow-d');
                $('#new-backend-provider').collapsible('collapse').collapsible('option', 'collapsedIcon', 'arrow-d');
            },


            _updateFormReady: function () {
                info(this.newBackendProvider.provider);
                var ready = false;
                if ('provider' in this.newBackendProvider) { // Filters out the "Select provider" dummy provider
                    
                    if (this.newBackendFirstField && this.newBackendSecondField) {
                        
                        ready = true;
                        
                        if (this.newBackendProvider.provider == 'openstack') { // Pure Openstack
                            if (!this.newBackendOpenStackURL) {
                                ready = false;
                            }
                        } else if (this.newBackendProvider.provider.indexOf('openstack') > -1) { // HpCloud
                            if (!(this.newBackendOpenStackURL && this.newBackendOpenStackTenant)) {
                                ready = false;
                            }
                        } else if (this.newBackendProvider.provider == 'bare_metal') { // Baremetal
                            if (!Mist.keysController.keyExists(this.newBackendKey.id)) {
                                ready = false;
                            }
                        }
                    }
                }
                this.set('formReady', ready);
            },


            _giveCallback: function (success, backend) {
                if (this.callback) this.callback(success, backend);
            },


            /**
             *
             *  Observers
             *
             */

            formObserver: function () {
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
