define('app/models/network', [
        'app/models/base',
        'app/controllers/ip_addresses',
        'app/controllers/subnets'
    ],
    //
    //  Network Model
    //
    //  @returns Class
    //
    function (BaseModel, IPAddressesController, SubnetsController) {

        'use strict';

        return BaseModel.extend({


            //
            //
            //  Properties
            //
            //


            status: null,
            subnets: null,
            ipAddresses: null,
            backend: null,
            selected: null,

            load: function () {
                this.setProperties({
                    subnets: SubnetsController.create(),
                    ipAddresses: IPAddressesController.create()
                });
                var list = this.get('ipaddress_list_status') || [];
                list.forEach(function (ip, index) {
                    // Make ips observable objects
                    ip = list[index] = Ember.Object.create(ip);
                    ip.set('server', Ember.Object.create(ip.get('server')));
                });
            }.on('init')
        });
    }
);
