define('app/models/team', ['app/models/base'],
    //
    //  Team Model
    //
    //  @returns Class
    //
    function (BaseModel) {

        'use strict';

        return BaseModel.extend({

            //
            //  Properties
            //

            id: null,
            name: null
        });
    }
);
