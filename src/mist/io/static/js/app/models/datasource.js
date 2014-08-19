define('app/models/datasource', ['ember'],
    //
    //  Datasource Model
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


            id: null,
            metric: null,
            machine: null,
            datapoints: null,


            //
            //
            //  Initialization
            //
            //


            //
            //
            //  Methods
            //
            //


            clear: function () {

            }
        });
    }
);
