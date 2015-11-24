define('app/routes/image', ['app/routes/base'],
    //
    //  Image Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.ImageRoute = BaseRoute.extend({

            activate: function () {
                Ember.run.next(this, function () {
                    var model = this.modelFor('image'),
                    id = model._id || model.id,
                    image = Mist.cloudsController.getImage(id);

                    this.set('documentTitle', 'mist.io - ' + (image ? image.id : id));
                });
            },

            redirect: function (image) {
                if(!image) this.transitionTo('images');
            },

            model: function (args) {
                var id = args.image_id,
                model = Mist.cloudsController.getImage(id);

                if(!model) {
                    return null;
                }
                return Mist.cloudsController.getImage(id);
            }
        });
    }
);