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

                if (!this.backend.enabled) {
                    return;
                }
                else if (this.backend.error && this.backend.state == 'offline'){
                    return;
                }
                
                this.backend.set('state', 'waiting');
                var that = this;
                $.getJSON('/backends/' + this.backend.id + '/locations', function(data) {
                    if (!that.backend.enabled) {
                        return;
                    }
                    var content = new Array();
                    data.forEach(function(item) {
                        if (item.name == '') {
                            item.name = 'Default';
                        }
                        content.push(Location.create(item));
                    });
                    that.set('content', content);
                    that.backend.set('state', 'online');
                    if (that.backend.error){
                        that.backend.set('error', false);
                    }
                }).error(function() {
                    Mist.notificationController.notify("Error loading locations for backend: " +
                                                        that.backend.title);
                    if (that.backend.error){
                        // This backend seems hopeless, disabling it                            
                        that.backend.set('state', 'offline');
                        that.backend.set('enabled', false);
                    } else {
                        // Mark error but try once again
                        that.backend.set('error', "Error loading locations");
                        Ember.run.later(that, function(){
                            this.init();
                        }, that.backend.poll_interval); 
                    }   
                });
            }
        });
    }
);
