define('app/views/image_list_item', ['app/views/list_item'],
    //
    //  Image List Item View
    //
    //  @returns Class
    //
    function (ListItemComponent) {

        'use strict';

        return App.ImageListItemComponent = ListItemComponent.extend({

            //
            //  Properties
            //

            image: null,
            layoutName: 'image_list_item',
            classNameBindings: ['starClass'],


            //
            //  Computed Properties
            //

            starClass: function () {
                return this.image.star ? 'staron' : 'staroff';
            }.property('image.star'),


            //
            //  Actions
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
                    info(this.image);
                }
            }
        });
    }
);
