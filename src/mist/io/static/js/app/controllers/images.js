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

            content: [],
            backend: null,

            imageCountObserver: function() {
                Mist.backendsController.updateImageCount();
            }.observes('content.length'),

            getImage: function(id, callback) {
                // Linode will pass null, so don't bother
                if (id == null){
                    return false;
                }

                var imageToFind = null;
                this.content.some(function(image) {
                    if (image.id == id) {
                        imageToFind = image;
                        return true;
                    }
                });
                return imageToFind;
            },

            init: function() {
                this._super();
                
                if (!this.backend.enabled) {
                    return;
                }
                
                this.backend.set('loadingImages', true);
                var that = this;
                $.getJSON('/backends/' + this.backend.id + '/images', function(data) {
                    that.backend.set('loadingImages', false);
                    if (that.backend.enabled) {
                        var content = new Array();
                        data.forEach(function(item) {
                            var image = Image.create(item);
                            image.backend = that.backend;
                            content.push(image);
                        });
                        that.set('content', content);
                    }
                }).error(function(jqXHR, textstate, errorThrown) {
                    Mist.notificationController.notify('Error while loading images for backend ' + that.backend.title);
                    that.backend.set('loadingImages', false);
                    that.backend.set('enabled', false);
                });
            }
        });
    }
);
