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
                        typeof this.minValue != 'undefined');
                delete this.max_value;
                delete this.min_value;
            }
        });
    }
);
