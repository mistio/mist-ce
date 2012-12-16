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

                var that = this;
                if (this.backend.state == 'online' || this.backend.state == 'waiting-ok'){
                    this.backend.set('state', 'waiting-ok');
                } else if (this.backend.state == 'error'){
                    this.backend.set('state', 'waiting-error');
                } else {
                    this.backend.set('state', 'waiting');
                }
                
                $.getJSON('/backends/' + this.backend.id + '/images', function(data) {
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
                }).error(function() {
                    Mist.notificationController.notify("Error loading images for backend: " + that.backend.title);
                    if (that.backend.state == 'online') {
                        // Mark error but try once again
                        that.backend.set('state', 'error');
                        Ember.run.later(that, function(){
                            this.init();
                        }, that.backend.poll_interval);                        
                    } else {
                        // This backend seems hopeless, disabling it                            
                        that.backend.set('state', 'offline');
                        that.backend.set('enabled', {'value': 0, 'label':'Disabled'});
                    }        
                    that.backend.set('error', "Error loading images");          
                });
            }
        });
    }
);
