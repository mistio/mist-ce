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
                var subnets = this.get('subnets')
                this.setProperties({
                    subnets: SubnetsController.create({ network: this }),
                    ipAddresses: IPAddressesController.create({ network: this })
                });
                this._updateSubnets(subnets);
            }.on('init'),


            update: function (data) {
                if (data.subnets) {
                    this._updateSubnets(data.subnets);
                    delete data.subnets;
                }
                this._super(data);
            },

            _updateSubnets: function (subnets) {
                this.get('subnets').setContent(subnets);
            },
        });
    }
);
