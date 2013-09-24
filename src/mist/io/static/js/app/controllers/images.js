define('app/controllers/images', [
    'app/models/image',
    'ember',
    'jquery'
    ],
    /**
     * Images controller
     *
     *
     * @returns Class
     */
    function(Image) {
        return Ember.ArrayController.extend({
            backend: null,

            getImage: function(id, callback) {
                // Linode will pass null, so don't bother
                if (id == null){
                    return false;
                }

                var foundImage = false;
                if (this.content) {
                    $.each(this.content, function(idx, image) {
                        if (image.id == id) {
                            foundImage = image;
                            return false;
                        }
                    });
                }

                return foundImage;
            },

            init: function() {
                this._super();
                
                if (!this.backend.enabled) {
                    return;
                }
                else if (this.backend.error && this.backend.state == 'offline'){
                    return;
                }
                
                this.backend.set('state', 'waiting');
                this.backend.set('loadingImages', true);
                var that = this;
                $.getJSON('/backends/' + this.backend.id + '/images', function(data) {
                    if (!that.backend.enabled) {
                        return;
                    }
                    var content = new Array();
                    data.forEach(function(item){
                        item.backend = that.backend;
                        content.push(Image.create(item));
                    });
                    that.set('content', content);
                    Mist.backendsController.getImageCount();
                    that.backend.set('state', 'online');
                    if (that.backend.error){
                        that.backend.set('error', false);
                    }
                    that.backend.set('loadingImages', false);
                }).error(function() {
                    Mist.notificationController.notify("Error loading images for backend: " + that.backend.title);
                    if (that.backend.error){
                        // This backend seems hopeless, disabling it                            
                        that.backend.set('state', 'offline');
                        that.backend.set('enabled', false);
                    } else {
                        // Mark error but try once again
                        that.backend.set('error', "Error loading images");
                        Ember.run.later(that, function(){
                            this.init();
                        }, that.backend.poll_interval); 
                    }
                    that.backend.set('loadingImages', false);
                });
            }
        });
    }
);
