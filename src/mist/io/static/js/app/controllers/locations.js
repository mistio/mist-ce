define('app/controllers/locations', [
        'app/controllers/base_array',
        'app/models/location'
    ],
    //
    //  Locations controller
    //
    //  @returns Class
    //
    function (BaseArrayController, LocationModel) {

        'use strict';

        return BaseArrayController.extend({

            model: LocationModel

        });
    }
);
