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
            unit: null,
            name: null,
            target: null,
            maxValue: null,


            //
            //
            //  Initialization
            //
            //


            init: function () {
                this._super();
                this.set('maxValue', this.max_value || 99999999);
            }
        });
    }
);
