define('app/controllers/ip_addresses', [
        'app/controllers/base_array',
        'app/models/ip_address'
    ],
    //
    //  IP Addresses Controller
    //
    //  @returns Class
    function (BaseArrayController, IPAddressModel) {

        'use strict';

        return BaseArrayController.extend({


            //
            //
            //  Properties
            //
            //


            network: null,
            model: IPAddressModel,


            //
            //
            //  Methods
            //
            //


            setContent: function (content) {
                content.setEach('network', this.get('network'));
                this._super(content);
            }
        });
    }
);
