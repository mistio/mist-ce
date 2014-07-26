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
            command: null,
            machine: null,
            operator: null,
            maxValue: null,
            aggregate: null,
            timeWindow: null,
            actionToTake: null,
            pendingAction: false,


            init: function () {
                this._super();
                // TODO: delete. This is temp for debugging only
                this.set('aggregate', Mist.rulesController.getAggregateByValue(this.aggregate));
                this.set('timeWindow', this.reminder_offset);
            }
        });
    }
);
