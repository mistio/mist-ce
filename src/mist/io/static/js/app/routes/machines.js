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
                Mist.backendsController.forEach(function(backend) {
                    backend.machines.content.setEach('selected', false);
                });
            }
        });
    }
);
