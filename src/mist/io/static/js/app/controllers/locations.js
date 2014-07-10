define('app/controllers/locations', ['app/models/location'],
    /**
     *  Locations controller
     *
     *  @returns Class
     */
    function(Location) {
        return Ember.ArrayController.extend(Ember.Evented, {

            /**
             *  Properties
             */

            content: [],
            loading: null,
            backend: null,

            /**
             *
             *  Initialization
             *
             */

            load: function (locations) {
                if (!this.backend.enabled) return;
                this._setContent(locations);
                this.set('loading', true);
            },



            /**
             *
             *  Methods
             *
             */

            clear: function() {
                Ember.run(this, function() {
                    this.set('content', []);
                    this.set('loading', false);
                    this.trigger('onLocationListChange');
                });
            },


            getLocation: function(locationId) {
                return this.content.findBy('id', locationId);
            },



            /**
             *
             *  Pseudo-Private Methods
             *
             */

            _setContent: function(locations) {
                var that = this;
                Ember.run(function() {
                    that.set('content', []);
                    locations.forEach(function(location) {
                        if (location.name == '') location.name = 'Default';
                        that.content.pushObject(Location.create(location));
                    });
                    that.trigger('onLocationListChange');
                });
            }
        });
    }
);
