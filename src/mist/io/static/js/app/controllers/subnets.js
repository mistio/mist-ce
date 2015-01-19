define('app/controllers/subnets', [
        'app/controllers/base_array',
        'app/models/subnet'
    ],
    //
    //  Subnets Controller
    //
    // @returns Class
    function (BaseArrayController, SubnetModel) {

        'use strict';

        return BaseArrayController.extend({


            //
            //
            //  Properties
            //
            //


            network: null,
            model: SubnetModel,


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
