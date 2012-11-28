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
                $.getJSON('/backends/' + this.backend.index + '/images', function(data) {
                    var content = new Array();
                    data.forEach(function(item){
                        item.backend = that.backend;
                        content.push(Image.create(item));
                    });
                    that.set('content', content);
                    Mist.backendsController.getImageCount();
                }).error(function() {
                    Mist.notificationController.notify("Error loading images for backend: " + that.backend.title);
                });
            }
        });
    }
);
