define('app/controllers/backend_add', ['app/models/backend'],
    //
    //  Backend Add Controller
    //
    //  @returns Class
    //
    function (Backend) {

        'use strict';

        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            callback: null,
            formReady: null,


            //
            //
            //  Methods
            //
            //

            open: function (callback) {
                this._clear();
                this._updateFormReady();
                this.set('callback', callback);

                $('#add-backend-panel').panel('open');
                Ember.run.next(function () {
                    $('.ui-page-active').height($('.ui-panel-open').height());
                    $('body').css('overflow', 'auto');

                    //This is the advanced section of OpenStack, by default
                    //hidden
                    $('#openstack-advanced').val('0').slider('refresh');
                    $('#non-hp-cloud').hide();
                });
            },


            close: function () {
                $('#add-backend-panel').panel('close');
                this._clear();
            },


            add: function () {

                var fields = getProviderFields(this.get('provider'));
                var payload = {
                    title: this.get('provider').title,
                    provider: this.get('provider').provider,
                };
                fields.forEach(function (field) {
                    payload[field.name] = field.value;
                });
                info(payload);
                var that = this;
                Mist.backendsController.addBackend({
                    payload: payload,
                    callback: function (success, backend) {
                        that._giveCallback(success, backend);
                        if (success) that.close();
                    }
                });
                return;


                var that = this;
                var projectName = this.newBackendOpenStackTenant || this.newBackendProjectName;

                // Add tenant name to backend title for openstack and hpcloud
                var provider = this.newBackendProvider.provider;
                var title = this.newBackendProvider.title +
                    (provider == 'openstack' || provider.indexOf('hpcloud') > -1 ?
                        ' ' + this.newBackendOpenStackTenant : '');

                Mist.backendsController.addBackend({

                    APIKey: this.newBackendFirstField,
                    APISecret: this.newBackendSecondField,
                    title: title,
                    provider: this.newBackendProvider.provider,
                    APIURL: this.newBackendOpenStackURL,
                    region: this.newBackendOpenStackRegion,
                    tenant: projectName,
                    computeEndpont: this.newBackendOpenStackComputeEndpoint,
                    dockerURL: this.newBackendDockerURL,
                    port: this.newBackendPort,
                    key: this.newBackendKey.id,

                    callback: function (success, backend) {
                        that._giveCallback(success, backend);
                        if (success) that.close();
                    }
                });
            },


            /**
             *
             *  Pseudo-Private Methods
             *
             */

            _clear: function () {

                this.set('callback', null)
                    .set('newBackendPort', null)
                    .set('newBackendFirstField', null)
                    .set('newBackendSecondField', null)
                    .set('newBackendOpenStackURL', null)
                    .set('newBackendOpenStackRegion', null)
                    .set('newBackendOpenStackTenant', null)
                    .set('newBackendOpenStackComputeEndpoint', null)
                    .set('newBackendDockerURL', null)
                    .set('newBackendKey', {id: 'Select SSH Key'})
                    .set('newBackendProvider', {title: 'Select provider'});

                // These should be in a view :(
                $('#new-backend-key').collapsible('collapse').collapsible('option', 'collapsedIcon', 'carat-d');
                $('#new-backend-provider').collapsible('collapse').collapsible('option', 'collapsedIcon', 'carat-d');
            },


            _updateFormReady: function () {

                // Filter out the "Select provider" dummy provider
                if (! ('provider' in this.newBackendProvider)) {
                    this.set('formReady', false);
                    return;
                }

                var ready = false;

                if (this.newBackendProvider.provider == 'docker') {
                    if (this.newBackendDockerURL && this.newBackendPort) {
                        ready = true;
                    }
                } else if (this.newBackendProvider.provider == 'linode') {
                    if (this.newBackendSecondField && this.newBackendSecondField) {
                        ready = true;
                    }
                } else if (this.newBackendProvider.provider == 'digitalocean') {
                    if (this.newBackendSecondField) {
                        ready = true;
                    }
                } else if (this.newBackendFirstField && this.newBackendSecondField) {

                    ready = true;

                    if (this.newBackendProvider.provider == 'openstack') { // Openstack
                        if (!this.newBackendOpenStackURL || !this.newBackendOpenStackTenant) {
                            ready = false;
                        }
                    } else if (this.newBackendProvider.provider.indexOf('hpcloud') > -1) { // HpCloud
                        if (!this.newBackendOpenStackTenant) {
                            ready = false;
                        }
                    } else if (this.newBackendProvider.provider == 'bare_metal') { // Baremetal
                        if (!Mist.keysController.keyExists(this.newBackendKey.id)) {
                            ready = false;
                        }
                    } else if (this.newBackendProvider.provider == 'gce') { // Google Compute Engine
                        if (!this.newBackendProjectName) {
                            ready = false;
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
                       'newBackendProjectName',
                       'newBackendDockerURL',
                       'newBackendPort',
                       'newBackendOpenStackURL',
                       'newBackendOpenStackTenant')
        });
    }
);
