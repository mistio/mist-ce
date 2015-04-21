define('app/controllers/sizes',
    [
        'app/controllers/base_array',
        'app/models/size'
    ],
    //
    //  Sizes Controller
    //
    //  @returns Class
    //
    function (BaseArrayController, SizeModel) {

        'use strict';

        return BaseArrayController.extend({

            model: SizeModel

        });
    }
);
