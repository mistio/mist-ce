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
            type: null,
            action: null,
            time: null,


            //
            //
            //  Computed Properties
            //
            //


            formatedDate: function () {
                return Mist.prettyDate(this.get('time'));
            }.property('time')
        });
    }
);
