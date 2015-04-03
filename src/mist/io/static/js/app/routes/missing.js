define('app/routes/missing', ['ember'],
    //
    //  Missing Route
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.MissingRoute = Ember.Route.extend({
            activate: function () {
                Ember.run.next(function () {
                    document.title = 'mist.io - 404';
                });
            },
        });
    }
);
