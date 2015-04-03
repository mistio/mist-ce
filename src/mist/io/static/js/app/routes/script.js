define('app/routes/script', ['ember'],
    //
    //  Script Route
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.ScriptRoute = Ember.Route.extend({
            activate: function () {
                Ember.run.next(this, function () {
                    var model = this.modelFor('script');
                    var id = model._id || model.id;
                    var script = Mist.scriptsController.getObject(id);
                    document.title = 'mist.io - ' + (script ? script.id : id);
                });
            },
            redirect: function (script) {
                Mist.scriptsController.set('scriptRequest', script._id);
            },
            model: function (args) {
                var id = args.script_id;
                if (Mist.scriptsController.loading)
                    return {_id: id};
                return Mist.scriptsController.getObject(id);
            }
        });
    }
);
