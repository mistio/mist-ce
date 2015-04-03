define('app/routes/networks', ['ember'],
    //
    //  Networks Route
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.NetworksRoute = Ember.Route.extend({
            activate: function () {
                Ember.run.next(function () {
                    document.title = 'mist.io - networks';
                });
            },
            exit: function() {
                Mist.backendsController.forEach(function (backend) {
                    backend.networks.forEach(function (network) {
                        network.set('selected', false);
                    });
                });
            }
        });
    }
);
