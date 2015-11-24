define('app/views/image', ['app/views/page'],
    //
    //  Image View
    //
    //  @returns Class
    //
    function(PageView) {

        'use strict';

        return App.ImageView = PageView.extend({

            //
            //  Properties
            //

            templateName: 'image',
            image: null,
            extra: null,

            providerIconClass: function() {
                if (!this.image || !this.image.cloud || !this.image.cloud.provider)
                    return '';
                return 'provider-' + this.image.cloud.getSimpleProvider();
            }.property('image.cloud.provider'),


            imageIconClass: function () {
                if (!this.image) return 'image-generic';
                return 'image-' + this.image.cloud.images.getImageOS(this.image.id);
            }.property('image'),


            //
            //  Initialization
            //

            load: function() {
                Ember.run.next(this, function() {
                    this.updateCurrentImage();
                    if (this.image.id) {
                        this.updateExtra();
                    }
                });
            }.on('didInsertElement'),


            //
            //  Methods
            //

            updateCurrentImage: function() {
                Ember.run(this, function() {
                    var image = Mist.cloudsController.getRequestedImage();
                    if (image) this.get('controller').set('model', image);

                    this.set('image', this.get('controller').get('model'));
                    Mist.machineAddController.set('selectedImage', this.get('image'));
                    if (this.image.id) {
                        this.updateExtra();
                    }
                });
            },


            //
            //  Observers
            //

            updateExtra: function () {
                var newExtra = [];
                if (this.image.extra instanceof Object) {
                    forIn(this.image.extra, function (value, key) {
                        newExtra.push({
                            key: key,
                            value: value
                        });
                    });
                }
                this.set('extra', newExtra);
            }.observes('image.extra.[]')
        });
    }
);
