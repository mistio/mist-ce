define('app/views/image_list', [
    'app/models/image',
    'app/views/mistscreen',
    'text!app/templates/image_list.html','ember'],
    /**
     *
     * Images page
     *
     * @returns Class
     */
    function(Image, MistScreen, image_list_html) {
        return MistScreen.extend({
            template: Ember.Handlebars.compile(image_list_html),

            advancedSearch: false,
            renderedImages: null,

            init: function(){
                this._super();
                var that=this;
                Ember.run.next(function() {
                    $("#images-advanced-search").css('display', 'none');
                    $(".ajax-loader").fadeIn();
                });
                Ember.run.later(function(){
                    that.renderImages();
                    that.scrollHandler();
                    that.filterHandler();
                    //add this $('ul#images-list li.node:visible').length
                }, 2000);
            },

            scrollHandler: function() {
                var that = this;
                $(window).on('scroll', function() {
                    if (that.isScrolledToBottom()) {
                        var searchText = $('input.ui-input-text').eq(2).val();
                        var counter = 0;
                        Mist.backendsController.content.some(function(backend) {
                            backend.images.content.some(function(image) {
                                if ((!image.star) && that.renderedImages.indexOf(image) == -1) {
                                    if (searchText && image.name.indexOf(searchText) == -1) {
                                        return false;
                                    }
                                    // Filter out Windows
                                    if (image.name.indexOf('Windows') != -1 || image.name.indexOf('windows') != -1) {
                                        return false;
                                    }
                                    that.renderedImages.pushObject(image);
                                    if (++counter == 30)
                                        return true;
                                }
                            });
                            if (counter == 30)
                                return true;
                        });
                    }
                });
            },

            filterHandler: function() {
                var that = this;
                $('input.ui-input-text').eq(2).on('keyup', function() {
                    if ($('input.ui-input-text').eq(2).val()){
                        $("#images-advanced-search").show();
                    }else {
                        $("#images-advanced-search").hide();
                    }
                });
            },

            renderImages: function() {
                if (Mist.backendsController.loadingImages) {
                    this.reRenderImages(2500);
                    return;
                }
                var that = this;
                var newRenderedImages = new Array();
                Mist.backendsController.content.forEach(function(backend) {
                    backend.images.content.forEach(function(image) {
                        if ((image.star || newRenderedImages.length < 10) && newRenderedImages.indexOf(image) == -1) {
                            if (image.star) {
                                newRenderedImages.unshiftObject(image);
                            }
                            else {
                                newRenderedImages.pushObject(image);
                            }
                        }
                    });
                });
                $(".ajax-loader").fadeOut();
                this.set('renderedImages', newRenderedImages);
            },

            reRenderImages: function(interval) {
                var that = this;
                Ember.run.later(function() {
                    that.renderImages();
                }, interval);
            },

            willDestroyElement: function(){
                $(window).off('scroll');
            },

            isScrolledToBottom: function() {
                var distanceToTop = $(document).height() - $(window).height();
                top = $(document).scrollTop();
                return top === distanceToTop;
            },

            advancedSearchClicked: function() {
                var searchText = $('input.ui-input-text').eq(2).val();
                var payload = {
                    'search_term': searchText
                };
                var that = this;
                $(".ajax-loader").fadeIn();
                $('#images-advanced-search span').text('Loading...');
                that.set('renderedImages', new Array());
                Mist.backendsController.content.some(function(backend) {
                    $.ajax({
                        url: '/backends/' + backend.id + '/images',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(payload),
                        success: function(data) {
                            var counter = 0;
                            var exists = false;
                            data.forEach(function(item) {
                                image = Image.create(item);
                                image.backend = backend;
                                if (backend.images.content.indexOf(image) == -1) {
                                    backend.images.content.pushObject(image);
                                }
                                if (++counter < 30) {
                                    that.renderedImages.pushObject(image);
                                }
                            });
                            $(".ajax-loader").fadeOut();
                            $('#images-advanced-search span').text('Continue search on server...');
                        },
                        error: function(jqXHR, textstate, errorThrown) {
                            Mist.notificationController.notify('Error while searching for term: ' + jqXHR.responseText);
                            error(textstate, errorThrown, ' while searching term');
                            $(".ajax-loader").fadeOut();
                            $('#images-advanced-search span').text('Continue search on server...');
                        }
                    });
                });
            }
        });
    }
);
