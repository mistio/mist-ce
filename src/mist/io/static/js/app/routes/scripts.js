define('app/routes/scripts', ['app/routes/base'],
    //
    //  Scripts Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.ScriptsRoute = BaseRoute.extend({

            documentTitle: 'mist.io - scripts',

            exit: function () {
                Mist.scriptsController.setEach('selected', false);
            }
        });
    }
);
