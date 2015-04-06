define('app/controllers/images',
    [
        'app/controllers/base_array',
        'app/models/image'
    ],
    //
    //  Images Controller
    //
    //  @returns Class
    //
    function (BaseArrayController, ImageModel) {

        'use strict';

        return BaseArrayController.extend({


            //
            //
            //  Properties
            //
            //


            model: ImageModel,
            passOnProperties: ['backend'],


            //
            //
            //  Computed Properties
            //
            //


            hasStarred: function () {
                return !!this.findBy('star', true);
            }.property('@each.star'),


            //
            //
            //  Methods
            //
            //


            searchImages: function (filter, callback) {
                var that = this;
                Mist.ajax.POST('/backends/' + this.backend.id + '/images', {
                    'search_term': filter
                }).error(function () {
                    Mist.notificationController.notify(
                        'Failed to search images on ' + that.backend.title);
                }).complete(function (success, images) {
                    var imagesToReturn = [];
                    if (success) {
                        images.forEach(function (image) {
                            image.backend = that.backend;
                            imagesToReturn.push(ImageModel.create(image));
                        });
                    }
                    if (callback) callback(success, imagesToReturn);
                });
            },


            toggleImageStar: function (image, callback) {
                var that = this;
                Mist.ajax.POST('/backends/' + this.backend.id + '/images/' + image.id, {
                }).success(function (star) {
                    if (!that.objectExists(image.id))
                        that._addObject(image);
                    that._toggleImageStar(image, star);
                }).error(function () {
                    Mist.notificationController.notify('Failed to (un)star image');
                }).complete(function (success, star) {
                    if (callback) callback(success, star);
                });
            },


            getImageOS: function (imageId) {
                // TODO (gtsop): Move this into a computed
                // property on image model
                var os = 'generic';
                var image = this.getObject(imageId);

                if(!image)
                    var imageTitle = imageId;
                else
                    var imageTitle = image.name;

                OS_MAP.some(function (pair) {
                    return pair[0].some(function (key) {
                        if (imageTitle.toLowerCase().indexOf(key) > -1){
                            os = pair[1];
                            return true;
                        }
                    });
                });

                return os;
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _toggleImageStar: function (image, star) {
                Ember.run(this, function () {
                    image.set('star', star);
                    this.trigger('onStarToggle', {
                        object: image,
                        star: star
                    });
                });
            },
        });
    }
);
