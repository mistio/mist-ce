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
            probed: new Array(),
            probing: new Array(),
            selected: null,
            default_key: null,
                        
            probeState: function(machine) {
                if (this.probing) {
                    return 'probing';
                } else if (this.probed) {
                    return 'probed';
                } else {
                    return 'unprobed';
                }
            }.property('probed', 'probing'),

        });
    }
);
