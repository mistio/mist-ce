define('app/controllers/cloud_add', ['app/models/cloud'],
    //
    //  Cloud Add Controller
    //
    //  @returns Class
    //
    function (Cloud) {

        'use strict';

        return Ember.Object.extend({

            //
            //  Properties
            //

            callback: null,
            provider: null,

            providerList: function() {
                return SUPPORTED_PROVIDERS.map(function (provider) {
                    provider.className = 'provider-';
                    if (provider.provider == 'bare_metal')
                        provider.className += 'baremetal';
                    else if (provider.provider == 'indonesian_vcloud')
                        provider.className += 'indonesian';
                    else
                        provider.className += provider.provider;
                    return provider;
                }).sort(function (a, b) {
                    if (a.provider == 'bare_metal')
                        return 1;
                    if (b.provider == 'bare_metal')
                        return -1;
                    if (a.title > b.title)
                        return 1;
                    if (a.title < b.title)
                        return -1
                    return 0;
                });
            }.property(),


            //
            //  Methods
            //

            open: function (callback) {
                this._clear();
                this.view.clear();
                this.set('callback', callback);
            },

            close: function () {
                this._clear();
                this.view.close();
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
                Mist.cloudsController.addCloud({
                    payload: payload,
                    callback: function (success, cloud) {
                        Ember.run.later(function () {
                            if (payload.monitoring === true)
                                that._showMonitoringPopup(cloud, payload);
                            }, 200);
                        that._giveCallback(success, cloud);
                        if (success) that.close();
                    }
                });
            },


            //
            //  Pseudo-Private Methods
            //

            _showMonitoringPopup: function (cloud, payload) {
                if (payload.windows)
                    showCommand({
                        body: [
                            {
                                paragraph: 'Run this command on your server\'s power shell' +
                                    ' to install the monitoring agent:'
                            },
                            {
                                command: cloud.monitoring.windows_command
                            }
                        ]
                    });
                else if (payload.provider == 'coreos')
                    showCommand({
                        body: [
                            {
                                paragraph: 'Run this command on your server\'s terminal' +
                                    ' to install the monitoring agent:'
                            },
                            {
                                command: cloud.monitoring.coreos_command
                            }
                        ]
                    });
                else
                    showCommand({
                        body: [
                            {
                                paragraph: 'Run this command on your server\'s terminal' +
                                   ' to install the monitoring agent:'
                            },
                            {
                                command: cloud.monitoring.unix_command
                            }
                        ]
                    });

                function showCommand (args) {
                    Mist.dialogController.open({
                        type: DIALOG_TYPES.OK,
                        head: 'Enable monitoring',
                        body: args.body,
                    });
                }
            },

            _clear: function () {
                this.setProperties({
                    callback: null,
                    provider: null,
                });
            },

            _giveCallback: function (success, cloud) {
                if (this.callback) this.callback(success, cloud);
            },
        });
    }
);
