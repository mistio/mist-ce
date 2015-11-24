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
            //  Properties
            //

            baseModel: ImageModel,
            passOnProperties: ['cloud'],


            //
            //  Computed Properties
            //

            hasStarred: function () {
                return !!this.model.findBy('star', true);
            }.property('[].star'),


            //
            //  Methods
            //

            searchImages: function (filter, callback) {
                var that = this;
                Mist.ajax.POST('/clouds/' + this.cloud.id + '/images', {
                    'search_term': filter
                }).error(function () {
                    Mist.notificationController.notify(
                        'Failed to search images on ' + that.cloud.title);
                }).complete(function (success, images) {
                    var imagesToReturn = [];
                    if (success) {
                        images.forEach(function (image) {
                            image.cloud = that.cloud;
                            imagesToReturn.push(ImageModel.create(image));
                        });
                    }
                    if (callback) callback(success, imagesToReturn);
                });
            },

            toggleImageStar: function (image, callback) {
                var that = this;
                Mist.ajax.POST('/clouds/' + this.cloud.id + '/images/' + image.id, {
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
            //  Pseudo-Private Methods
            //

            _toggleImageStar: function (image, star) {
                Ember.run(this, function () {
                    image.set('star', star);
                    this.trigger('onStarToggle', {
                        object: image,
                        star: star
                    });

                    // In case we "star" an image we trigger this event to refresh
                    // images list and make this image appear on top with other starred images
                    if (star) {
                        Mist.cloudsController.trigger('onImagesChange');
                    }
                });
            },
        });
    }
);
