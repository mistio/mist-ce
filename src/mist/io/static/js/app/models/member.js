define('app/models/member', ['ember'],
    //
    //  Member Model
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend(Ember.Evented, {

            //
            //  Properties
            //

            id: null,
            name: null,
            email: null,
            team: null

        });
    }
);
