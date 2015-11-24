define('app/routes/machines', ['app/routes/base'],
    //
    //  Machines Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.MachinesRoute = BaseRoute.extend({

            documentTitle: 'mist.io - machines',

            exit: function() {
                Mist.cloudsController.model.forEach(function(cloud) {
                    cloud.machines.model.setEach('selected', false);
                });
            }
        });
    }
);
