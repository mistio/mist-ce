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
                if (this.name == '')
                    this.set('name', 'Default');
            }
        });
    }
);
