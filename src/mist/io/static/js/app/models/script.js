define('app/models/script', ['app/models/base'],
    //
    //  Script Model
    //
    //  @returns Class
    //
    function (BaseModel) {

        'use strict';

        return BaseModel.extend({

            convertProperties: {
                'exec_type': 'type',
                'location_type': 'source',
            }

        });
    }
);
