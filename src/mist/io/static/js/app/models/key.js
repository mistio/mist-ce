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
            probed: null,
            probing: null,
            selected: null,
            machines: null,
            default_key: null,
            
            selectedObserver: function() {
                Mist.keysController.getSelectedKeyCount();
            }.observes('selected'),
            
            probeState: function() {
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
