define('app/models/organization', ['ember'],
    //
    //  Organization Model
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return Ember.Object.extend(Ember.Evented, {

            //
            //  Properties
            //

            id: null,
            name: null,
            description: null,

            //
            //  Initialization
            //

            load: function() {

            }.on('init')
        });
    }
);
