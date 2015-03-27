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
                var fields = getProviderFields(provider).filterBy('isSlider', undefined);

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
                        that._giveCallback(success, cloud);
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


            _giveCallback: function (success, cloud) {
                if (this.callback) this.callback(success, cloud);
            },
        });
    }
);
