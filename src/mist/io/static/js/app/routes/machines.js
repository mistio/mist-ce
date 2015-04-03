define('app/routes/machines', ['ember'],
    //
    //  Machines Route
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.MachinesRoute = Ember.Route.extend({
            activate: function() {
                Ember.run.next(function() {
                    document.title = 'mist.io - machines';
                });
            },
            exit: function() {
                Mist.backendsController.forEach(function(backend) {
                    backend.machines.forEach(function(machine) {
                        machine.set('selected', false);
                    });
                });
            }
        });
    }
);
