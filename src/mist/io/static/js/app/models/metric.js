define('app/models/metric', ['ember'],
    //
    //  Metric model
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return Ember.Object.extend({

            //
            //  Properties
            //

            id: null,
            name: null,
            unit: null,
            machines: null,
            maxValue: null,
            minValue: null,
            hasRange: null,
            hashedId: null,
            isPlugin: null,
            pluginId: null,
            datapoints: null,


            lowerName: function () {
                return this.get('name').toLowerCase();
            }.property('name'),


            //
            //  Initialization
            //

            init: function () {
                this._super();
                this.set('hashedId', md5(this.id))
                    .set('machines', this.machines || [])
                    .set('maxValue', this.max_value)
                    .set('minValue', this.min_value)
                    .set('hasRange',
                        typeof this.maxValue != 'undefined' &&
                        typeof this.minValue != 'undefined')
                    .set('isPlugin', this.id.indexOf('mist.python') == 0)
                    .set('pluginId', this.isPlugin ? this.id.split('.')[2] : null);

                delete this.max_value;
                delete this.min_value;
            },


            //
            //  Methods
            //

            hasMachine: function (machine) {
                var hasMachine = false;
                this.machines.some(function (metricMachine) {
                    if (machine.equals(metricMachine))
                        return hasMachine = true;
                });
                return hasMachine;
            }
        });
    }
);
