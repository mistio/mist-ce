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
                info(this.metric_id);
                this.set('id', this.metric_id);
                this.set('alias', this.id);
                this.set('target', this._target);
                this.set('maxValue', this.max_value || 99999999);
            }
        });
    }
);
