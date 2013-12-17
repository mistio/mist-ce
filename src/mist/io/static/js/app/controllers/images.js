define('app/controllers/images', ['app/models/image'],
    /**
     *  Images Controller
     *
     *  @returns Class
     */
    function(Image) {
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
                Mist.ajaxGET('/backends/' + this.backend.id + '/images', {
                }).success(function(images) {
                    if (!that.backend.enabled) return;
                    that._setContent(images);
                }).error(function() {
                    if (!that.backend.enabled) return;
                    Mist.notificationController.notify('Failed to load images for ' + that.backend.title);
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

            searchImages: function(filter, callback) {
                var that = this;
                Mist.ajaxPOST('/backends/' + this.backend.id + '/images', {
                    'search_term' : filter
                }).success(function(images) {

                }).error(function() {
                    Mist.notificationController.notify('Failed to search images');
                }).complete(function(success, images) {
                    var imagesToReturn = [];
                    if (success) {
                        images.forEach(function(image) {
                            image.backend = that.backend;
                            imagesToReturn.push(Image.create(image));
                        });
                    }
                    if (callback) callback(success, imagesToReturn);
                });
            },


            toggleImageStar: function(imageId) {
                var that = this;
                Mist.ajaxPOST('/backends/' + this.backend.id + '/images/' + imageId, {
                    'action' : 'star'
                }).success(function() {

                }).error(function() {

                }).complete(function() {

                });
            },


            clear: function() {
                Ember.run(this, function() {
                    this.set('content', []);
                    this.set('loading', false);
                    this.trigger('onImageListChange');
                });
            },


            getImage: function(imageId) {
                return this.content.findBy('id', imageId);
            },


            imageExists: function(imageId) {
                return !!this.getImage(imageId);
            }



            /**
             * 
             *  Pseudo-Private Methods
             * 
             */

            _setContent: function(images) {
                var that = this;
                Ember.run(function() {
                    that.set('content', []);
                    images.forEach(function(image) {
                        image.backend = that.backend;
                        that.content.pushObject(Image.create(image));
                    });
                    that.trigger('onImageListChange');
                });
            }
        });
    }
);
