define('app/models/base', ['ember'],
    //
    //  Base Model
    //
    // @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            id: null,
            name: null,
            selected: false,


            //
            //
            //  Methods
            //
            //


            update: function (data) {
                forIn(this, data, function (value, key) {
                    this.set(key, value);
                });
            }
        });
    }
);
