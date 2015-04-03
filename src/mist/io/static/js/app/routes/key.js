define('app/routes/key', ['app/routes/base'],
    //
    //  Key Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.KeyRoute = BaseRoute.extend({

            activate: function () {
                Ember.run.next(this, function () {
                    var model = this.modelFor('key');
                    var id = model._id || model.id;
                    var key = Mist.keysController.getKey(id);
                    this.set('documentTitle', 'mist.io - ' + (key ? key.id : id));
                });
            },

            redirect: function (key) {
                Mist.keysController.set('keyRequest', key._id);
            },

            model: function (args) {
                var id = args.key_id;
                if (Mist.keysController.loading)
                    return {_id: id, machines: []};
                return Mist.keysController.getKey(id);
            }
        });
    }
);
