define('app/models/key', ['ember'],
    /**
     *  Key Model
     *
     *  @returns Class
     */
    function() {
        return Ember.Object.extend({

            /**
             *  Properties
             */

            id: null,
            probing: null,
            machines: null,
            selected: null,
            default_key: null,

        });
    }
);
