define('app/views/image_list', ['app/models/image', 'app/views/mistscreen', 'text!app/templates/image_list.html'],
    /**
     *  Images page
     * 
     *  @returns Class
     */
    function(Image, MistScreen, image_list_html) {
        return MistScreen.extend({

            /**
             *  Properties
             */

            images: [],
            baseImages: [],
            renderedImages: [],
            visibleImagesCount: 0,
            advancedSearchMode: null,
            template: Ember.Handlebars.compile(image_list_html),

            /**
             *
             *  Initialization
             *
             */

            init: function() {
                this._super();
                Mist.backendsController.on('onImageListChange', this, 'updateImageList');
            },


            load: function() {
                this.set('images', []);
                this.set('baseImages', []);
                this.set('renderedImages', []);
                Ember.run.later(this, function() {
                    this.handleFilter();
                    this.handleWindowScroll();
                    if (!Mist.backendsController.loading &&
                        !Mist.backendsController.loadingImages) {
                            this.updateImageList();
                    }
                }, 1000);
            }.on('didInsertElement'),



            /**
             *
             *  Methods
             *
             */

            updateImageList: function() {
                var that = this;
                Mist.backendsController.content.forEach(function(backend) {
                    that.images.addObjects(backend.images.content);
                });
            },


            updateBaseImageList: function() {
                if (this.advancedSearchMode) return;
                this.set('baseImages', this.images);
            },


            updateRenderedImageList: function() {
                var baseLength = this.baseImages.length;
                var newLength = baseLength < 25 ? baseLength : 25;
                this.set('renderedImages', this.baseImages.slice(0, newLength));
            },


            handleFilter: function() {
                var that = this;
                var filterElement = $('#image-list-page .ui-input-search input');
                filterElement.off('keyup');
                filterElement.on('keyup', function() {
                    if (!filterElement.val()) {
                        that.set('advancedSearchMode', false);
                        that.updateBaseImageList();
                    } 
                });
            },


            handleWindowScroll: function() {
                var that = this;
                window.onscroll = scrollHandler;
                function scrollHandler() {
                    if (Mist.isScrolledToBottom()) {
                        that.getMoreImages();
                    }
                };
            },


            getMoreImages: function() {
                var filterValue = $('#image-list-page .ui-input-search input').val();
                if (this.advancedSearchMode || !filterValue) {
                    var newLength = this.renderedImages.length + 25;
                    if (newLength > this.baseImages.length) {
                        newLength = this.baseImages.length;
                    }
                    if (newLength == this.renderedImages.length) return;
                    this.set('renderedImages', this.baseImages.slice(0, newLength));
                    info('yo');
                    info(this.baseImages.length);
                } else {
                    var that = this;
                    var counter = 0;
                    this.baseImages.some(function(image) {
                        if (that.baseImages.indexOf(image) == -1) {
                            if (image.id.indexOf(filterValue) > -1 ||
                                image.name.indexOf(filterValue) > -1) {
                                    that.renderedImages.pushObject(image);
                                    if (++counter == 20) return true;
                            }
                        }
                    });
                }
            },


            renderImageList: function() {
                Ember.run.next(function() {
                    if ($('#image-list-page .ui-listview').listview) {
                        $('#image-list-page .ui-listview').listview('refresh');
                    }
                    if ($('#image-list-page input.ember-checkbox').checkboxradio) {
                        $('#image-list-page input.ember-checkbox').checkboxradio();
                    }
                });
            },



            /**
             *
             *  Actions
             *
             */

            actions: {

                searchClicked: function() {
                    this.set('searchingImages', true);
                    var that = this;
                    var newImages = [];
                    var backendsCount = Mist.backendsController.content.length - 1;
                    var filterValue = $('#image-list-page .ui-input-search input').val();
                    Mist.backendsController.content.forEach(function(backend, index) {
                        backend.searchImages(filterValue, function(success, images) {
                            if (success) {
                                newImages.pushObjects(images);
                            }
                            if (!backendsCount--) {
                                info('index');
                                that.set('searchingImages', false);
                                that.set('baseImages', newImages);
                            }
                        });
                    });
                }
            },



            /**
             *
             *  Observers
             *
             */

            imagesObserver: function() {
                Ember.run.once(this, 'updateBaseImageList');
            }.observes('images', 'images.length'),


            baseImagesObserver: function() {
                Ember.run.once(this, 'updateRenderedImageList');
            }.observes('baseImages', 'baseImages.length'),


            renderedImagesObserver: function() {
                Ember.run.once(this, 'renderImageList');
            }.observes('renderedImages', 'renderedImages.length'),
        });
    }
);
