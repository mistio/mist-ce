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
                Mist.cloudsController.model.forEach(function (cloud) {
                    cloud.networks.model.setEach('selected', false);
                });
            }
        });
    }
);
