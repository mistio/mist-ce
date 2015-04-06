define('app/routes/networks', ['app/routes/base'],
    //
    //  Networks Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.NetworksRoute = BaseRoute.extend({

            documentTitle: 'mist.io - networks',

            exit: function() {
                Mist.backendsController.forEach(function (backend) {
                    backend.networks.content.setEach('selected', false);
                });
            }
        });
    }
);
