define('app/controllers/locations', [
    'app/models/location',
    'ember',
    'jquery'
    ],
    /**
     * Locations controller
     *
     *
     * @returns Class
     */
    function(Location) {
        return Ember.ArrayController.extend({
            backend: null,

            init: function() {
                this._super();

                var that = this;
                $.getJSON('/backends/' + this.backend.id + '/locations', function(data) {
                    var content = new Array();
                    data.forEach(function(item) {
                        content.push(Location.create(item));
                    });
                    that.set('content', content);
                    if (that.backend.error){
                        that.backend.set('error', false);
                    }
                }).error(function() {
                    Mist.notificationController.notify("Error loading locations for backend: " +
                                                        that.backend.title);
                    that.backend.set('error', "Error loading locations");
                });
            }
        });
    }
);
