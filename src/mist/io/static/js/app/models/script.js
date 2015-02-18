define('app/models/script', ['app/models/base'],
    //
    //  Script Model
    //
    //  @returns Class
    //
    function (BaseModel) {

        'use sctrict';

        return BaseModel.extend({

            convertProperties: {
                'script_id': 'id',
                'exec_type': 'type'
            }

        });
    }
);
