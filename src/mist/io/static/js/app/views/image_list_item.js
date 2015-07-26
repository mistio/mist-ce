define('app/views/image_list_item', ['app/views/list_item'],
    //
    //  Image List Item View
    //
    //  @returns Class
    //
    function (ListItemView) {

        'use strict';

        return App.ImageListItemView = ListItemView.extend({


            //
            //
            //  Properties
            //
            //


            image: null,
            templateName: 'image_list_item',


            //
            //
            //  Computed Properties
            //
            //


            starClass: function () {
                return this.image.star ? 'staron' : 'staroff';
            }.property('image.star'),


            //
            //
            //  Actions
            //
            //


            actions: {


                toggleImageStar: function () {
                    var that = this;
                    this.image.toggle(function (success, star) {
                        if (!success) {
                            that.image.set('star', !that.image.star);
                        }
                    });
                },


                launchImage: function () {
                    this.image.backend.images.model.addObject(this.image);
                    Mist.machineAddController.open();
                    Ember.run.next(this, function () {
                        Mist.machineAddController.view._actions.selectProvider(this.image.backend);
                        Mist.machineAddController.view._actions.selectImage(this.image);
                    });
                }
            }
        });
    }
);
