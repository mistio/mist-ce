define('app/models/size', ['app/models/base'],
    //
    //  Size Model
    //
    //  @returns Class
    //
    function (BaseModel) {

        'use strict';

        return BaseModel.extend({

            ram: null,
            disk: null,
            price: null,
            driver: null,
            bandwidth: null

        });
    }
);
