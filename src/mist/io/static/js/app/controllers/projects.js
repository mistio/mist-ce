define('app/controllers/projects',
    [
        'app/controllers/base_array',
        'app/models/project'
    ],
    //
    //  Projects Controller
    //
    //  @returns Class
    //
    function (BaseArrayController, ProjectModel) {

        'use strict';

        return BaseArrayController.extend({

            baseModel: ProjectModel

        });
    }
);
