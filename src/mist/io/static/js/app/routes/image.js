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
                    var model = this.modelFor('image');
                    console.log(model);
                    var id = model._id || model.id;
                    var image = Mist.backendsController.getImage(id);
                    console.log(image);
                    this.set('documentTitle', 'mist.io - ' + (image ? image.id : id));
                });
            },

            redirect: function (image) {
                Mist.backendsController.set('imageRequest', image._id);
            },

            model: function (args) {
                var id = args.image_id;
                if (Mist.backendsController.loading ||
                    Mist.backendsController.loadingImages)
                        return {_id: id, backend: {}};
                return Mist.backendsController.getImage(id);
            }
        });
}
);