define('app/routes/script', ['app/routes/base'],
    //
    //  Script Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.ScriptRoute = BaseRoute.extend({

            activate: function () {
                this._super();
                Ember.run.next(this, function () {
                    var model = this.modelFor('script');
                    var id = model._id || model.id;
                    var script = Mist.scriptsController.getObject(id);
                    if (Mist.logsController.model.length) {
                        Mist.logsController.view.set('filterString', id);
                    }
                    this.set('documentTitle', 'mist.io - ' + (script ? script.name : id));
                });
                Ember.run.later(function(){
                    Mist.logsController.load();
                }, 200);
            },

            redirect: function (script) {
                Mist.scriptsController.set('scriptRequest', script._id);
            },

            model: function (args) {
                var id = args.script_id;
                if (Mist.scriptsController.loading)
                    return {_id: id};
                return Mist.scriptsController.getObject(id);
            },

            exit: function() {
                Mist.logsController.unload();
            }
        });
    }
);
