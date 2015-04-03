define('app/routes/index', ['ember'],
    //
    //  Index Route
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.IndexRoute = Ember.Route.extend({
            activate: function () {
                Ember.run.next(function () {
                    document.title = 'mist.io - home';
                });
            }
        });
    }
);
