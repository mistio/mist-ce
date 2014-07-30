define('app/models/location', ['ember'],
    /**
     * Location model
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({
            id: null,
            name: null,
            country: null,
            init: function () {
                this._super();
                this.nameObserver();
            },
            nameObserver: function () {
                this.set('name', this.name || 'Default');
            }.observes('name')
        });
    }
);
