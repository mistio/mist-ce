define('app/routes/machine', ['ember'],
    //
    //  Machine Route
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.MachineRoute = Ember.Route.extend({
            activate: function () {
                Ember.run.next(this, function () {
                    var model = this.modelFor('machine');
                    var id = model._id || model.id;
                    var machine = Mist.backendsController.getMachine(id);
                    document.title = 'mist.io - ' + (machine ? machine.name : id);
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
