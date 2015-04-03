define('app/routes/scripts', ['ember'],
    //
    //  Scripts Route
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.ScriptsRoute = Ember.Route.extend({
            activate: function () {
                Ember.run.next(function () {
                    document.title = 'mist.io - scripts';
                });
            },
            exit: function () {
                Mist.scriptsController.setEach('selected', false);
            }
        });
    }
);
