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

            load: function() {

                if (!this.backend.enabled) return;

                var that = this;
                this.set('loading', true);
                Mist.ajax.GET('/backends/' + this.backend.id + '/locations', {
                }).success(function(locations) {
                    if (!that.backend.enabled) return;
                    that._setContent(locations || []);
                }).error(function() {
                    if (!that.backend.enabled) return;
                    Mist.notificationController.notify('Failed to load locations for ' + that.backend.title);
                    that.backend.set('enabled', false);
                }).complete(function(success) {
                    if (!that.backend.enabled) return;
                    that.set('loading', false);
                    that.trigger('onLoad');
                });
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
