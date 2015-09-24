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
            //  Properties
            //

            network: null,
            ipAddresses: null,


            //
            //  Initialization
            //

            load: function (data) {
                this.set('ipAddresses',
                    IPAddressesController.create({
                        network: this.get('network')
                    })
                );
                this.update(this);
            }.on('init'),


            //
            //  Methods
            //

            update: function (data) {
                if (data.ipaddress_list_status) {
                    data.ipaddress_list_status.forEach(function (ip) {
                        ip.id = ip.ipaddress;
                    });
                    this.get('ipAddresses').setModel(data.ipaddress_list_status);
                }
                this._super(data);
            }
        });
    }
);
