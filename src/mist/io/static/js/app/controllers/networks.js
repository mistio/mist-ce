define('app/controllers/networks', [
        'app/controllers/base_array',
        'app/models/network'
    ],
    //
    //  Networks Controller
    //
    //    @returns Class
    //
    function (BaseArrayController, NetworkModel) {

        'use strict';

        return BaseArrayController.extend(Ember.Evented, {

            //
            //  Properties
            //

            cloud: null,
            baseModel: NetworkModel,
            passOnProperties: ['cloud'],


            //
            //  Methods
            //

            associateIP: function (args) {
                var machineId;
                if (args.machine.cloud.provider == 'nephoscale')
                    machineId = args.machine.extra.id;
                else
                    machineId = args.machine.id;

                var url = '/clouds/' + this.cloud.id +
                    '/networks/' + args.network.id;

                var that = this;
                that.set('associatingIP',  true);
                args.ip.set('isAssociating', true);
                Mist.ajax.POST(url, {
                    machine: machineId,
                    ip: args.ip.ipaddress,
                }).error(function () {
                    Mist.notificationController.notify('Failed to associate ip ' +
                        args.ip.ipaddress);
                }).complete(function (success, data) {
                    that.set('associatingIP',  false);
                    args.ip.set('isAssociating', false);
                    if (args.callback) args.callback(success, data);
                });
            },

            reserveIP: function (args) {
                var url = '/clouds/' + this.cloud.id +
                '/networks/' + args.network.id;

                var that = this;
                that.set('reservingIP',  true);
                args.ip.set('isTogglingReserve', true);
                Mist.ajax.POST(url, {
                    ip: args.ip.ipaddress,
                    assign: args.reserve
                }).error(function () {
                    Mist.notificationController.notify('Failed to reserve ip ' +
                        args.ip.ipaddress);
                }).complete(function (success, data) {
                    that.set('reservingIP',  false);
                    args.ip.set('isTogglingReserve', false);
                    if (args.callback) args.callback(success, data);
                });
            },

            deleteNetwork: function (networkId, callback) {
                var that = this;
                that.set('deletingNetwork', true);
                var url = '/clouds/' + this.cloud.id +
                    '/networks/' + networkId;
                Mist.ajax.DELETE(url)
                .success(function () {
                    that._deleteObject(that.getObject(networkId));
                }).error(function (message) {
                    Mist.notificationController.notify(message);
                }).complete(function (success, message) {
                    that.set('deletingNetwork', false);
                    if (callback) callback(success, message);
                });
            }
        });
    }
);
