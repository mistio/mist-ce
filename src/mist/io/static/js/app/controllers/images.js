define('app/controllers/images', [
    'app/models/image',
    'ember',
    'jquery'
    ],
    /**
     * Images Controller
     *
     * @returns Class
     */
    function(Image) {
        return Ember.ArrayController.extend({

            backend: null,
            content: [],

            imageCountObserver: function() {
                Mist.backendsController.updateImageCount();
            }.observes('content.length'),

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
                this.set('content', []);
                if (!this.backend.enabled) {
                    return;
                }
                else if (this.backend.error && this.backend.state == 'offline') {
                    return;
                }
                
                this.backend.set('state', 'waiting');
                this.backend.set('loadingImages', true);
                var that = this;
                $.getJSON('/backends/' + this.backend.id + '/images', function(data) {
                    if (!that.backend.enabled) {
                        that.backend.set('loadingImages', false);
                        return;
                    }
                    var content = new Array();
                    data.forEach(function(item) {
                        var image = Image.create(item);
                        image.backend = that.backend;
                        content.push(image);
                    });
                    that.set('content', content);
                    that.backend.set('loadingImages', false);
                }).error(function(jqXHR, textstate, errorThrown) {
                    Mist.notificationController.notify('Error while loading images for backend ' + that.backend.title);
                    error(textstate, errorThrown, ' while loading images. ', jqXHR.responseText);
                    if (that.backend.error){
                        // This backend seems hopeless, disabling it                            
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
