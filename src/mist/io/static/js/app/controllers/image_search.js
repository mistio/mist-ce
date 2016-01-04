define('app/controllers/image_search', ['ember'],
    //
    //  Image Search Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Controller.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            images: null,
            searchTerm: null,
            isSearching: null,
            searchResults: null,
            pendingSearchCancelation: null,


            //
            //
            //  Methods
            //
            //


            scheduleNewSearch: function (onServer) {
                var that = this;
                this.cancelSearch(function () {
                    that.search(onServer);
                });
            },


            cancelSearch: function (callback) {

                this.trigger('beforeSearchCancel');

                if (this.isSearching) {
                    var that = this;
                    this.set('pendingSearchCancelation', function () {
                        that.set('pendingSearchCancelation', null);
                        that.trigger('onSearchCancel');
                        if (callback) callback();
                    });
                } else {
                    if (callback) callback();
                }
            },


            search: function (onServer) {

                if (!this.searchTerm) {
                    this.set('searchResults', []);
                    this.trigger('onSearchEnd');
                    return;
                }

                this.trigger('beforeSearchStart', this.searchTerm);

                // Set up properties
                this.set('isSearching', true);
                this.set('searchResults', []);
                this.trigger('onSearchStart', this.searchTerm);

                if (onServer) {
                    this.searchOnServer();
                } else {
                    var chunkSize = Math.ceil(this.images.length / 10);
                    this.recursiveChunkSearch(this.searchTerm.toLowerCase(), 0, chunkSize);
                }
            },


            endSearch: function () {

                this.set('isSearching', false);

                if (this.pendingSearchCancelation) {
                    this.pendingSearchCancelation();
                } else {
                    this.trigger('onSearchEnd');
                }
            },


            clearSearch: function () {
                this.set('searchTerm', null);
            },


            recursiveChunkSearch: function (term, startIndex, chunkSize) {

                Ember.run.later(this, function () {

                    var images = this.images
                    var imagesLength = images.length;

                    if (this.pendingSearchCancelation || startIndex >= imagesLength) {
                        this.endSearch();
                        return;
                    }

                    for (var i = startIndex, count = 0; i < imagesLength && count < chunkSize; i++,
                        count++) {
                        if (images[i].id.toLowerCase().indexOf(term) > -1 ||
                            images[i].name.toLowerCase().indexOf(term) > -1) {
                                if (images[i].star)
                                    this.searchResults.unshiftObject(images[i]);
                                else
                                    this.searchResults.pushObject(images[i]);
                        }
                    }

                    this.recursiveChunkSearch(term, startIndex + chunkSize, chunkSize);
                }, 60);
            },


            searchOnServer: function () {

                var that = this;
                var searchingClouds = [];
                Mist.cloudsController.model.forEach(function(cloud, index) {

                    if (!cloud.enabled)
                        return;
                    if (cloud.get('isBareMetal'))
                        return;

                    searchingClouds.push(index);
                    cloud.searchImages(that.searchTerm, function(success, images) {

                        if (success)
                            that.searchResults.addObjects(images);

                        searchingClouds.removeObject(index);
                        if (!searchingClouds.length)
                            that.endSearch();
                    });
                });
            },


            //
            //
            //  Observers
            //
            //


            searchTermObserver: function () {
                Ember.run.once(this, 'scheduleNewSearch');
            }.observes('searchTerm')
        });
    }
);
