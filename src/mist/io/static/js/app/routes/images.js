define('app/routes/images', ['app/routes/base'],
    //
    //  Images Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.ImagesRoute = BaseRoute.extend({

            documentTitle: 'mist.io - images'

        });
    }
);
