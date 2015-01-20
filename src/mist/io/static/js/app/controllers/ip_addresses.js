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

        return BaseArrayController.extend({

            model: IPAddressModel,
            passOnProperties: ['network']

        });
    }
);
