define('app/controllers/locations', ['app/models/location'],
    //
    //  Locations controller
    //
    //  @returns Class
    //
    function (Location) {

        'use strict';

        return Ember.ArrayController.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            content: null,
            loading: null,
            cloud: null,


            //
            //
            //  Initialization
            //
            //


            init: function () {
                this._super();
                this.set('content', []);
                this.set('loading', true);
            },


            //
            //
            //  Methods
            //
            //


            load: function (locations) {
                this._updateContent(locations);
                this.set('loading', false);
            },


            getLocation: function (locationId) {
                return this.content.findBy('id', locationId);
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _updateContent: function (locations) {
                Ember.run(this, function () {

                    // Remove deleted locations
                    this.content.forEach(function (location) {
                        if (!locations.findBy('id', location.id))
                            this.content.removeObject(location);
                    }, this);

                    locations.forEach(function (location) {

                        var oldLocation = this.getLocation(location.id);

                        if (oldLocation)
                            // Update existing locations
                            forIn(location, function (value, property) {
                                oldLocation.set(property, value);
                            });
                        else
                            // Add new locations
                            this._addLocation(location);
                    }, this);

                    this.trigger('onLocationListChange');
                });
            },


            _addLocation: function (location) {
                Ember.run(this, function () {
                    this.content.addObject(Location.create(location));
                    this.trigger('onLocationAdd');
                });
            },


            _deleteLocation: function (locationId) {
                Ember.run(this, function () {
                    this.content.removeObject(this.getLocation(locationId));
                    this.trigger('onLocationDelete');
                });
            }
        });
    }
);
