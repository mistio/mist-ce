define('app/controllers/datapoints', ['app/models/datapoint', 'ember'],
    //
    //  Datapoints Controller
    //
    //  @returns Class
    //
    function (Datapoint) {

        'use strict';

        // Limit the amount of datapoints to
        // preserve memory (especially on mobile)
        var MAX_DATAPOINTS = 60;

        // Cache an array of null datapoints to
        // display when there is no data
        var EMPTY_DATAPOINTS = [];

        return Ember.ArrayController.extend({


            //
            //
            //  Properties
            //
            //


            content: null,
            loading: null,
        });
    }
);
