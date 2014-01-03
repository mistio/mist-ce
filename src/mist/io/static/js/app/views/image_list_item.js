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
                    Mist.machineAddController.open(function (success) {
                        //Mist.Router.router.transitionTo('machines');
                    });
                    Mist.machineAddController.set('newMachineProvider', this.image.backend);
                    Mist.machineAddController.set('newMachineImage', this.image);
                }
            }
        });
    }
);
