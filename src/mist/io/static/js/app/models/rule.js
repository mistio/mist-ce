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
            aggregate: null,
            timeWindow: null,
            machineKey: null,
            machineName: null,
            machineSize: null,
            actionToTake: null,
            machineImage: null,
            machineScript: null,
            pendingAction: false,
            machineBackend: null,
            machineLocation: null,


            init: function () {
                this._super();
                // TODO: delete. This is temp for debugging only
                this.set('aggregate', this.aggregate || {value:'every'});
                this.set('timeWindow', this.timeWindow || 60);
            }
        });
    }
);
