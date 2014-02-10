define('app/views/image_list', ['app/models/image', 'app/views/mistscreen'],
    /**
     *  Images page
     *
     *  @returns Class
     */
    function (Image, MistScreen) {
        return MistScreen.extend({

            /**
             *  Properties
             */

            images: [],
            baseImages: [],
            renderedImages: [],
            advancedSearchMode: null,
            name: 'image_list',


            /**
             *
             *  Initialization
             *
             */

            load: function () {

                // Clear image arrays
                this.set('images', []);
                this.set('baseImages', []);
                this.set('renderedImages', []);

                // Add event listeners
                var that = this;
                Ember.run.later(function () {
                    $('.ui-page').on('scroll', function () {
                        that.windowScrolled();
                    });
                    $('#image-list-page .ui-input-search input').on('keyup', function () {
                        that.filterChanged();
                    });
                }, 500);
                Mist.backendsController.on('onImageListChange', this, 'updateImageList');

                this.updateImageList();

            }.on('didInsertElement'),


            unload: function () {

                // Remove event listeners
                $('.ui-page-active').off('scroll');
                $('#image-list-page .ui-input-search input').off('keyup');
                Mist.backendsController.off('onImageListChange', this, 'updateImageList');

            }.on('willDestroyElement'),


            /**
             *
             *  Methods
             *
             */

            updateImageList: function () {
                var newImages = [];
                Mist.backendsController.content.forEach(function (backend) {
                    backend.images.content.forEach(function (image) {
                        if (image.star) {
                            newImages.unshift(image);
                        } else {
                            newImages.push(image);
                        }
                    });
                });
                this.set('images', newImages);
            },


            updateBaseImageList: function () {

                // If user is in advanced search mode
                // and for some reason this.images change
                // we don't want to remove the search
                // results to show the new images
                if (this.advancedSearchMode) return;

                var newBaseImages = [];
                this.images.forEach(function (image) {
                    if (image.star) {
                        newBaseImages.unshift(image);
                    } else {
                        newBaseImages.push(image);
                    }
                });
                this.set('baseImages', newBaseImages);
            },


            updateRenderedImageList: function () {
                var baseLength = this.baseImages.length;
                var newLength = baseLength < 25 ? baseLength : 25;

                var that = this;
                this.baseImages.some(function (image, index) {
                    if (index == newLength) return true;
                    if (image.star) {
                        if (that.renderedImages.indexOf(image) == -1) {
                            that.renderedImages.unshiftObject(image);
                        }
                    } else {
                        that.renderedImages.addObject(image);
                    }
                });
            },


            filterChanged: function () {
                var filter = $('#image-list-page .ui-input-search input').val();
                if (!filter) {
                    this.set('advancedSearchMode', false);
                    this.updateBaseImageList();
                }
            },


            windowScrolled: function () {
                if (Mist.isScrolledToBottom()) {
                    this.getMoreImages();
                }
            },


            getMoreImages: function () {
                var filterValue = $('#image-list-page .ui-input-search input').val();
                if (!filterValue) {
                    // Grab the next 25 images from the base
                    // images array
                    var newLength = this.renderedImages.length + 25;
                    if (newLength > this.baseImages.length) {
                        newLength = this.baseImages.length;
                    }
                    if (newLength == this.renderedImages.length) return;

                    var that = this;
                    this.baseImages.some(function (image, index) {
                        if (index == newLength) return true;
                        that.renderedImages.addObject(image);
                    });
                } else {
                    // Else, user has typed in the filter input
                    // so grab 25 images from the base images 
                    // array that meet the filter criteria
                    var that = this;
                    var counter = 0;
                    this.baseImages.some(function (image) {
                        if (that.baseImages.indexOf(image) == -1) {
                            if (image.id.indexOf(filterValue) > -1 ||
                                image.name.indexOf(filterValue) > -1) {
                                that.renderedImages.addObject(image);
                                if (++counter == 25) return true;
                            }
                        }
                    });
                }
            },


            /**
             *
             *  Actions
             *
             */

            actions: {


                searchClicked: function () {

                    var that = this;
                    var resultImages = [];
                    var backendsCount = Mist.backendsController.content.filterBy('enabled', true).length;
                    var filterValue = $('#image-list-page .ui-input-search input').val();

                    this.set('searchingImages', true);
                    this.set('advancedSearchMode', true);

                    Mist.backendsController.content.forEach(function (backend, index) {
                        if (backend.enabled) {
                            backend.searchImages(filterValue, function (success, images) {
                                if (success) {
                                    resultImages.addObjects(images);
                                }
                                if (!--backendsCount) {
                                    that.set('searchingImages', false);
                                    that.set('baseImages', resultImages);
                                }
                            });
                        }
                    });
                }
            },


            /**
             *
             *  Observers
             *
             */

            imagesObserver: function () {
                Ember.run.once(this, 'updateBaseImageList');
            }.observes('images', 'images.length'),


            baseImagesObserver: function () {
                Ember.run.once(this, 'updateRenderedImageList');
            }.observes('baseImages', 'baseImages.length')
        });
    }
);
