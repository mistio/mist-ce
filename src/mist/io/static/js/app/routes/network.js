define('app/routes/network', ['ember'],
    //
    //  Network Route
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.NetworkRoute = Ember.Route.extend({
            activate: function () {
                Ember.run.next(this, function () {
                    var model = this.modelFor('network');
                    var id = model._id || model.id;
                    var network = Mist.backendsController.getNetwork(id);
                    document.title = 'mist.io - ' + (network ? network.name : id);
                });
            },
            redirect: function (network) {
                Mist.backendsController.set('networkRequest', network._id);
            },
            model: function (args) {
                var id = args.network_id;
                if (Mist.backendsController.loading ||
                    Mist.backendsController.loadingNetworks)
                        return {_id: id, backend: {}};
                return Mist.backendsController.getNetwork(id);
            }
        });
    }
);
