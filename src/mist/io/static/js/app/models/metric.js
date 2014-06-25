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
            //
            //  Properties
            //
            //


            id: null,
            name: null,
            unit: null,
            maxValue: null,
            minValue: null,
            hasRange: null,
            hashedId: null,
            isPlugin: null,
            pluginId: null,
            datapoints: null,


            //
            //
            //  Initialization
            //
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
                    .set('isPlugin', this.id.indexOf('mist_python') == 0)
                    .set('pluginId', this.isPlugin ? this.id.split('.')[1] : null);

                delete this.max_value;
                delete this.min_value;
            }
        });
    }
);
