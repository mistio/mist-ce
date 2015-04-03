define('app/routes/key', ['ember'],
    //
    //  Key Route
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.KeyRoute = Ember.Route.extend({
            activate: function () {
                Ember.run.next(this, function () {
                    var model = this.modelFor('key');
                    var id = model._id || model.id;
                    var key = Mist.keysController.getKey(id);
                    document.title = 'mist.io - ' + (key ? key.id : id);
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
