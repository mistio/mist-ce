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
                this.updateFromRawData(this);
            },

            updateFromRawData: function (data) {

                this.setProperties({
                    // Rename action attribute because it conflicts with
                    // handlebar's templating "action" keyword
                    value: data.value,
                    actionToTake: data.action,
                    timeWindow: data.reminder_offset,
                    operator: Mist.rulesController.getOperatorByTitle(data.operator),
                    metric: Mist.metricsController.getMetric(data.metric),
                    aggregate: Mist.rulesController.getAggregateByValue(data.aggregate),
                    machine: Mist.cloudsController.getMachine(
                        data.machine, data.cloud) || data.machine
                });
            },

            timeWindowToMins: function () {
                return (1 + parseInt(this.get('timeWindow') / 60)).toString();
            }.property('timeWindow')
        });
    }
);
