define('app/models/log', ['ember'],
    //
    //  Log Model
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({

            //
            //  Properties
            //

            _id: null,
            email: null,
            time: null,
            action: null,
            cloudId: null,
            machineId: null,
            mode: null,


            load: function () {
                this.set('date', new Date(this.get('time') * 1000));
            }.on('init'),
        });
    }
);
