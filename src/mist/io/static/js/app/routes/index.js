define('app/routes/index', ['app/routes/base'],
    //
    //  Index Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.IndexRoute = BaseRoute.extend({

            documentTitle: 'mist.io - home'

        });
    }
);
