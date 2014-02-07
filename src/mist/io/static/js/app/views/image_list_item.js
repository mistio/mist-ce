define('app/views/image_list_item', ['app/views/list_item', 'text!app/templates/image_list_item.html'],
    /**
     *  Image List Item View
     *
     *  @returns Class
     */
    function (ListItemView, image_list_item_html) {
        return ListItemView.extend({

            /**
             *  Properties
             */

            image: null,
            template: Ember.Handlebars.compile(image_list_item_html),


            /**
             *
             *  Actions
             *
             */

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
                    this.image.backend.images.content.addObject(this.image);
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
