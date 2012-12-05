define('app/models/key', ['ember'],
    /**
     * Key model
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({

            name: null,
            pub: null,
            priv: null

        });
    }
);
