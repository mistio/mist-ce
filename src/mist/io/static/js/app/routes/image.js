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
                    if(! model) return this.transitionTo('images');
                    var id = model._id || model.id;
                    this.set('documentTitle', 'mist.io - ' + (model ? model.id : id));
                });
            },

            redirect: function (image) {
                // if(true) console.log('1');
                // Mist.keysController.set('imageRequest', image._id);
            },

            model: function (args) {
                var id = args.image_id;

                if(! Mist.backendsController.model.length) return null;

                return {
                    id: id,
                    name: 'marios'
                };
            }
        });
}
);