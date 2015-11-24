define('app/routes/network', ['app/routes/base'],
    //
    //  Network Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.NetworkRoute = BaseRoute.extend({

            activate: function () {
                Ember.run.next(this, function () {
                    var model = this.modelFor('network');
                    var id = model._id || model.id;
                    var network = Mist.cloudsController.getNetwork(id);
                    this.set('documentTitle', 'mist.io - ' + (network ? network.name : id));
                });
            },

            redirect: function (network) {
                Mist.cloudsController.set('networkRequest', network._id);
            },

            model: function (args) {
                var id = args.network_id;
                if (Mist.cloudsController.loading ||
                    Mist.cloudsController.loadingNetworks)
                        return {_id: id, cloud: {}};
                return Mist.cloudsController.getNetwork(id);
            }
        });
    }
);
