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
                this.view.clear();
                this.view.open();
                this.set('callback', callback);
            },


            close: function () {
                this._clear();
                this.view.close();
                this.view.clear();
            },


            add: function () {

                var provider = this.get('provider');
                var fields = getProviderFields(provider).rejectBy('name', undefined);

                var payload = {
                    title: provider.title,
                    provider: provider.provider,
                };
                fields.forEach(function (field) {
                    payload[field.name] = field.value;
                });

                var that = this;
                Mist.backendsController.addBackend({
                    payload: payload,
                    callback: function (success, backend) {
                        Ember.run.later(function () {
                            if (payload.monitoring === true)
                                that._showMonitoringPopup(backend, payload);
                            }, 200);
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


            _showMonitoringPopup: function (backend, payload) {
                Mist.dialogController.open({
                    type: DIALOG_TYPES.OK,
                    head: 'Enable monitoring',
                    body: [
                        {
                            paragraph: 'Run this command on your server to install' +
                                ' the monitoring agent'
                        },
                        {
                            command: payload.windows ? backend.monitoring.windows_command :
                                backend.monitoring.unix_command
                        },
                    ],
                });
            },


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
