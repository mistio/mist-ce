define('app/routes/machine', ['app/routes/base'],
    //
    //  Machine Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.MachineRoute = BaseRoute.extend({

            activate: function () {
                Ember.run.next(this, function () {
                    var model = this.modelFor('machine');
                    var id = model._id || model.id;
                    var machine = Mist.backendsController.getMachine(id);
                    this.set('documentTitle', 'mist.io - ' + (machine ? machine.name : id));
                });
            },

            redirect: function (machine) {
                Mist.backendsController.set('machineRequest', machine._id);
            },

            model: function (args) {
                var id = args.machine_id;
                if (Mist.backendsController.loading ||
                    Mist.backendsController.loadingMachines)
                        return {_id: id, backend: {}};
                return Mist.backendsController.getMachine(id);
            }
        });
    }
);
