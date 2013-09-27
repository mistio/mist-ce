define('app/models/key', [
    'ember'
    ],
    /**
     * Key model
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({
            pub: null,
            priv: null,
            name: null,
            machines: null,
            selected: null,
            default_key: null,
            probing: null
        });
    }
);
