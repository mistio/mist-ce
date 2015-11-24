define('app/models/rule', ['app/models/base'],
    //
    //  Rule Model
    //
    //  @returns Class
    //
    function (BaseModel) {

        'use strict';

        return BaseModel.extend({

            //
            //  Properties
            //

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

            convertProperties: {
                action: 'actionToTake',
                reminder_offset: 'timeWindow'
            },

            processProperties: {
                operator: function (operator) {
                    return Mist.rulesController.getOperatorByTitle(operator);
                },
                metric: function (metricId) {
                    return Mist.metricsController.getMetric(metricId);
                },
                aggregate: function (aggregate) {
                    return Mist.rulesController.getAggregateByValue(aggregate);
                },
                machine: function (machine) {
                    return Mist.cloudsController.getMachine(
                        machine, this.get('cloud')) || machine;
                },
            },


            //
            //  Computed Properties
            //

            timeWindowToMins: function () {
                return (1 + parseInt(this.get('timeWindow') / 60)).toString();
            }.property('timeWindow')
        });
    }
);
