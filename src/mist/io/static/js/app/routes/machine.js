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
                Mist.logsController.unload();
                Ember.run.next(this, function () {
                    var model = this.modelFor('machine');
                    var id = model._id || model.id;
                    var machine = Mist.cloudsController.getMachine(id);
                    this.set('documentTitle', 'mist.io - ' + (machine ? machine.name : id));
                    Ember.run.later(function(){
                        var machine = Mist.cloudsController.getMachine(id);
                        var cloud_id="";
                        if (machine){
                            cloud_id = machine.cloud.id
                        }
                        Mist.logsController.load();
                        if (Mist.logsController.view) Mist.logsController.view.set('preFilterString', cloud_id + ' ' + id );
                        
                    }, 1000);
                });
            },

            exit: function() {
                Mist.logsController.unload();
            },

            redirect: function (machine) {
                Mist.cloudsController.set('machineRequest', machine._id);
            },

            model: function (args) {
                var id = args.machine_id;
                if (Mist.cloudsController.loading ||
                    Mist.cloudsController.loadingMachines)
                        return {_id: id, cloud: {}};
                return Mist.cloudsController.getMachine(id);
            }
        });
    }
);
