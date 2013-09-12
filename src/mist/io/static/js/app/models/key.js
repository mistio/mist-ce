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
            
            pub: null,          // str
            priv: null,         // str
            name: null,         // str
            probed: null,       // array of objects[str,str]
            probing: null,      // array of objects[str,str]
            machines: null,     // array of objects[str,str]
            selected: null,     // bool
            default_key: null,  // bool
                        
            probeState: function(machine) {
                // TODO: probe state will be calculated according to given machine
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
