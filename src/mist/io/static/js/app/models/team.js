define('app/models/team', ['ember'],
    //
    //  Team Model
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
            // members: [],
            // organization: null,
            // policy: null,

            //
            // Initialization
            //

            load: function() {

            }.on('init')
        });
    }
);
