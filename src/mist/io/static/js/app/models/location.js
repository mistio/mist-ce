define('app/models/location', ['app/models/base'],
    //
    //  Location model
    //
    //  @returns Class
    //
    function (BaseModel) {

        'use strict';

        return BaseModel.extend({

            country: null,
            processProperties: {
                name: function (name) {
                    return name || 'Default';
                }
            }
        });
    }
);
