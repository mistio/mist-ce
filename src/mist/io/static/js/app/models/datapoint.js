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

        });
    }
);
