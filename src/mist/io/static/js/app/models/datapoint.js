define('app/models/datapoint', ['ember'],
    //
    //  Datapoint Model
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            time: null,
            value: null,


            //
            //
            //  Initialization
            //
            //


            init: function () {
                this._super();


                if (this.time != null && this.value != null)
                    this.setProperties({
                        time: new Date(this.time),
                        value: this.value
                    });
                else
                    this.setProperties({
                        time: new Date(this[1] * 1000),
                        value: this[0]
                    });
                delete this[0];
                delete this[1];
            }
        });
    }
);
