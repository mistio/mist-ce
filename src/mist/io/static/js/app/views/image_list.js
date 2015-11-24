define('app/views/image_list', ['app/views/page'],
    //
    //  Image List View
    //
    //  @returns Class
    //
    function (PageView) {

        'use strict';

        return App.ImageListView = PageView.extend({

            templateName: 'image_list',
            controllerName: 'imagesController',

            //
            //
            //  Properties
            //
            //


            baseImages: [],
            defaultImages: [],
            renderedImages: [],
            renderingMoreImages: null,
            pageYOffset: 0,


            //
            //
            //  Initialization
            //
            //


            load: function () {

                // Add event listeners
                Mist.imageSearchController.on('onSearchEnd', this, 'updateBaseImages');
                Mist.cloudsController.on('onImagesChange', this, 'updateDefaultImages');

                var that = this;
                Ember.run.later(this, function () {
                    if (!this.isDestroyed)
                        Mist.cloudsController.trigger('onImagesChange');

                    // Handle scrolling
                    $(window).on('scroll', function (e) {
                        that.set('pageYOffset', window.pageYOffset);
                    });
                }, 200);

            }.on('didInsertElement'),


            unload: function () {

                // Remove event listeners
                var that = this;
                Mist.cloudsController.model.forEach(function(cloud) {
                    cloud.off('onImagesChange', that, 'updateBaseImages');
                });
                Mist.imageSearchController.off('onSearchEnd', this, 'updateBaseImages');
                $(window).off('scroll');

            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            updateRenderedImages: function () {
                this.set('renderedImages', this.baseImages.slice(0, 25));
            },


            updateBaseImages: function () {

                if (Mist.imageSearchController.searchTerm)
                    this.set('baseImages', Mist.imageSearchController.searchResults);
                else
                    this.set('baseImages', this.defaultImages);

                this.updateRenderedImages();
            },


            updateDefaultImages: function () {
                var newImages = [];
                Mist.cloudsController.model.forEach(function (cloud) {
                    cloud.images.model.forEach(function (image) {
                        if (image.star)
                            newImages.unshift(image);
                        else
                            newImages.push(image);
                    });
                });
                Mist.imageSearchController.set('images', newImages);
                if (!this.isDestroyed){
                    this.set('defaultImages', newImages);
                    this.updateBaseImages();
                }
            },


            renderMoreImages: function () {

                if (this.renderedImages.length == this.baseImages.length)
                    return;

                this.set('renderingMoreImages', true);
                this.renderedImages.addObjects(
                    this.baseImages.slice(this.renderedImages.length,
                                         this.renderedImages.length + 25
                    )
                );

                Ember.run.next(this, function () {
                    this.set('renderingMoreImages', false);
                });
            },


            windowScrolled: function () {
                if (Mist.isScrolledToBottom()) {
                    this.renderMoreImages();
                }
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                searchClicked: function () {
                    Mist.imageSearchController.search(true);
                },

                clearClicked: function() {
                    Mist.imageSearchController.clearSearch();
                }
            },


            //
            //
            //  Observers
            //
            //


            scrollObserver: function() {
                Ember.run.once(this, 'windowScrolled');
            }.observes('pageYOffset')
        });
    }
);
