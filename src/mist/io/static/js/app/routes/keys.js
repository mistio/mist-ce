define('app/routes/keys', ['ember'],
    //
    //  Keys Route
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.KeysRoute = Ember.Route.extend({
            activate: function () {
                Ember.run.next(function () {
                    document.title = 'mist.io - keys';
                });
            },
            exit: function () {
                Mist.keysController.content.setEach('selected', false);
            }
        });
    }
);
