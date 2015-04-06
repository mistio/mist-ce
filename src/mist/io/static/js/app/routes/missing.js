define('app/routes/missing', ['ember'],
    //
    //  Missing Route
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.MissingRoute = Ember.Route.extend({

            documentTitle: 'mist.io - 404'

        });
    }
);
