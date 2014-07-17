define('app/models/rule', ['ember'],
    //
    //  Rule Model
    //
    //  @returns Class
    ///
    function () {

        'use strict';

        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            id: null,
            unit: null,
            value: null,
            metric: null,
            cycles: null,
            command: null,
            machine: null,
            operator: null,
            maxValue: null,
            machineKey: null,
            machineName: null,
            machineSize: null,
            actionToTake: null,
            machineImage: null,
            machineScript: null,
            pendingAction: false,
            machineBackend: null,
            machineLocation: null

        });
    }
);
