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

                var provider = this.get('provider');
                var fields = getProviderFields(provider);
                var title = provider.title;
                if (provider.provider == 'openstack')
                    title += ' ' + PROVIDER_MAP.openstack.findBy('name', 'tenant_name').value;
                if (provider.provider.indexOf('hpcloud') > -1)
                    title += ' ' + PROVIDER_MAP.hpcloud.findBy('name', 'tenant_name').value;

                var payload = {
                    title: title,
                    provider: provider.provider,
                };
                fields.forEach(function (field) {
                    payload[field.name] = field.value;
                });

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

            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _giveCallback: function (success, backend) {
                if (this.callback) this.callback(success, backend);
            },
        });
    }
);
