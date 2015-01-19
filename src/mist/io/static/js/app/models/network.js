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
            backend: null,
            ipAddresses: null,


            //
            //
            //  Methods
            //
            //


            load: function () {
                this.setProperties({
                    subnets: SubnetsController.create(),
                    ipAddresses: IPAddressesController.create()
                });
                this._super();
            }.on('init'),


            update: function (data) {
                if (data.subnets) {
                    this.get('subnets').setContent(data.subnets);
                    delete data.subnets;
                }
                this._super(data);
            }
        });
    }
);
