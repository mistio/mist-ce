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
                // Linode will pass null, so dont bother
                if (id == null){
                    return false;
                }

                retImage = false;
                if (this.content) {
                    $.each(this.content, function(idx, image){
                        if(image.id == id){
                            retImage = image;
                            return false;
                        }
                    });
                }

                if(retImage){
                    callback(retImage);
                } else {
                    var that = this;

                    $.ajax({
                        url: 'backends/' + this.backend.index + '/images/' + id + '/metadata',
                        success: function(data) {
                            data.backend = that.backend;
                            var image = Image.create(data);
                            that.content.push(image);
                            callback(image);
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            Mist.notificationntroller.notify("Error loading image id:" + id);

                        }
                    });
                }
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
                }).error(function() {
                    Mist.notificationController.notify("Error loading images for backend: " + that.backend.title);
                });
            }
        });
    }
);
