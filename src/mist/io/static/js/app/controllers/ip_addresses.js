define('app/controllers/ip_addresses', [
        'app/controllers/base_array',
        'app/models/ip_address'
    ],
    //
    //  IP Addresses Controller
    //
    //  @returns Class
    //
    function (BaseArrayController, IPAddressModel) {

        'use strict';

        return Ember.Controller.extend({

            baseModel: IPAddressModel,
            model: [],

            setModel: function(data) {
                var m = [], that = this;
                data.forEach(function(ip) {
                    var newIp = IPAddressModel.create(ip);
                    newIp.set('network', that.get('network'));
                    m.addObject(newIp);
                });
                this.set('model', m);
            }

        });
    }
);
