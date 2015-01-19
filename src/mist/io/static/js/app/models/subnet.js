define('app/models/subnet', [
        'app/models/base',
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


            load: function (data) {
                this.set('ipAddresses', IPAddressesController.create());
                this._super(data);
            }.on('init'),


            update: function (data) {
                if (data.ipaddress_list_status) {
                    this.get('ipAddresses').setContent(data.ipaddress_list_status);
                }
                this._super(data);
            }
        });
    }
);
