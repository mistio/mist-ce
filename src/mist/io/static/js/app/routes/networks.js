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
                Mist.backendsController.model.forEach(function (backend) {
                    backend.networks.model.setEach('selected', false);
                });
            }
        });
    }
);
