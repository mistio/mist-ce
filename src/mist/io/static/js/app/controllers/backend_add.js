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
            provider: null,


            //
            //
            //  Methods
            //
            //


            open: function (callback) {
                this._clear();
                this.view.open();
                this.set('callback', callback);
            },


            close: function () {
                this._clear();
                this.view.close();
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
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _clear: function () {
                this.setProperties({
                    callback: null,
                    provider: null,
                });
            },


            _giveCallback: function (success, backend) {
                if (this.callback) this.callback(success, backend);
            },
        });
    }
);
