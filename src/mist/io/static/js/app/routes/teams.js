define('app/routes/teams', ['app/routes/base'],
    //
    //  Teams Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.TeamsRoute = BaseRoute.extend({

            documentTitle: 'mist.io - teams',

            exit: function () {

            }
        });
    }
);
