define('app/routes/keys', ['app/routes/base'],
    //
    //  Keys Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.KeysRoute = BaseRoute.extend({

            documentTitle: 'mist.io - keys',

            exit: function () {
                Mist.keysController.content.setEach('selected', false);
            }
        });
    }
);
