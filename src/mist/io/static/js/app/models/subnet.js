define('app/models/subnet', [
    'app/models/base'
    'app/controllers/ip_addresses'
    ],
    //
    //  Subnet Model
    //
    //  @returns Class
    //
    function (BaseModel, IPAddressesController) {

        'use strict';

        return BaseModel.extend({


            //
            //
            //  Properties
            //
            //


            ipAddresses: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.set('ipAddresses', IPAddressesController.create());
            }.on('init'),

        });
    }
);
