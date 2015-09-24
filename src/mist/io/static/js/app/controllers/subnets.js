define('app/controllers/subnets', [
        'app/controllers/base_array',
        'app/models/subnet'
    ],
    //
    //  Subnets Controller
    //
    // @returns Class
    //
    function (BaseArrayController, SubnetModel) {

        'use strict';

        return BaseArrayController.extend({

            baseModel: SubnetModel,
            passOnProperties: ['network']

        });
    }
);
