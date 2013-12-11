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

            getImage: function(imageId) {
                return this.content.findBy('id', imageId);
            },



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
                        that.content.pushObject(Image.create(image));
                    });
                    that.trigger('onImageListChange');
                });
            }
        });
    }
);
