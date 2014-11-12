define('app/models/log', ['ember'],
    //
    //  Log Model
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
            user: null,
            event: null,
            timestamp: null,


            //
            //
            //  Computed Properties
            //
            //


            formatedDate: function () {
                return Mist.prettyDate(this.get('timestamp'));
            }.property('timestamp')
        });
    }
);
