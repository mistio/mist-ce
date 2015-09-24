define('app/routes/index', ['app/routes/base'],
    //
    //  Index Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.IndexRoute = BaseRoute.extend({

            documentTitle: 'mist.io - home',

            activate: function() {
                this._super();
                Ember.run.later(function(){
                    Mist.logsController.load();
                }, 200);
            },

            exit: function() {
                Mist.logsController.unload();
            }
        });
    }
);
