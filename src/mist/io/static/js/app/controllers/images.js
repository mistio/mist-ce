define('app/controllers/images', ['app/models/image'],
    //
    //  Images Controller
    //
    //  @returns Class
    //
    function (Image) {

        'use strict';

        var OS_MAP = [
            [
                ['rhel', 'redhat', 'red hat'], 'redhat'
            ],
            [
                ['ubuntu'], 'ubuntu'
            ],
            [
                ['ibm'], 'ibm'
            ],
            [
                ['canonical'], 'canonical'
            ],
            [
                ['sles', 'suse'], 'suse'
            ],
            [
                ['oracle'], 'oracle'
            ],
            [
                ['karmic'], 'karmic'
            ],
            [
                ['opensolaris'], 'opensolaris'
            ],
            [
                ['gentoo'], 'gentoo'
            ],
            [
                ['opensuse'], 'opensuse'
            ],
            [
                ['fedora'], 'fedora'
            ],
            [
                ['centos'], 'centos'
            ],
            [
                ['fedora'], 'fedora'
            ],
            [
                ['debian'], 'debian'
            ],
            [
                ['amazon'], 'amazon'
            ]
        ]

        return Ember.ArrayController.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            content: null,
            loading: null,
            backend: null,


            //
            //
            //  Computed Properties
            //
            //


            hasStarred: function () {
                return !!this.content.findBy('star', true);
            }.property('content.@each.star'),


            //
            //
            //  Initialization
            //
            //


            init: function () {
                this._super();
                this.set('content', []);
                this.set('loading', true);
            },


            //
            //
            //  Methods
            //
            //


            load: function (images) {
                this._updateContent(images);
                this.set('loading', false);
            },


            searchImages: function (filter, callback) {
                var that = this;
                Mist.ajax.POST('/backends/' + this.backend.id + '/images', {
                    'search_term': filter
                }).success(function (images) {

                }).error(function () {
                    Mist.notificationController.notify(
                        'Failed to search images on ' + that.backend.title);
                }).complete(function (success, images) {
                    var imagesToReturn = [];
                    if (success) {
                        images.forEach(function (image) {
                            image.backend = that.backend;
                            imagesToReturn.push(Image.create(image));
                        });
                    }
                    if (callback) callback(success, imagesToReturn);
                });
            },


            toggleImageStar: function (image, callback) {
                var that = this;
                Mist.ajax.POST('/backends/' + this.backend.id + '/images/' + image.id, {
                }).success(function (star) {
                    if (!that.imageExists(image.id))
                        that._addImage(image);
                    that._toggleImageStar(image.id, star);
                }).error(function () {
                    Mist.notificationController.notify('Failed to (un)star image');
                }).complete(function (success, star) {
                    if (callback) callback(success, star);
                });
            },


            getImage: function (imageId) {
                return this.content.findBy('id', imageId);
            },


            getImageOS: function (imageId) {

                var os = 'generic';
                var image = this.getImage(imageId);
                var imageTitle;

                if(!image)
                    imageTitle = imageId;
                else
                    imageTitle = image.name;

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


            imageExists: function (imageId) {
                return !!this.getImage(imageId);
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _updateContent: function (images) {
                Ember.run(this, function () {

                    // Remove deleted images
                    this.content.forEach(function (image) {
                        if (!images.findBy('id', image.id))
                            this.content.removeObject(image);
                    }, this);

                    images.forEach(function (image) {

                        var oldImage = this.getImage(image.id);

                        if (oldImage)
                            // Update existing images
                            forIn(image, function (value, property) {
                                oldImage.set(property, value);
                            });
                        else
                            // Add new images
                            this._addImage(image);
                    }, this);

                    this.trigger('onImageListChange');
                });
            },


            _addImage: function (image) {
                Ember.run(this, function () {
                    image.backend = this.backend;
                    this.content.addObject(Image.create(image));
                    this.trigger('onImageAdd');
                });
            },


            _toggleImageStar: function (imageId, star) {
                Ember.run(this, function () {
                    this.getImage(imageId).set('star', star);
                    this.trigger('onImageStarToggle');
                });
            },
        });
    }
);
