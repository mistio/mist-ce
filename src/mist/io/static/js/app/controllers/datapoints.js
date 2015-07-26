define('app/controllers/datapoints', ['app/models/datapoint', 'ember'],
    //
    //  Datapoints Controller
    //
    //  @returns Class
    //
    function (Datapoint) {

        'use strict';

        // Cache an array of null datapoints to
        // display when there is no data
        var EMPTY_DATAPOINTS = [];

        return Ember.Controller.extend({


            //
            //
            //  Properties
            //
            //


            model: null,
            loading: null,
        });
    }
);
