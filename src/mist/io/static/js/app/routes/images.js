define('app/routes/images', ['ember'],
    //
    //  Images Route
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.ImagesRoute = Ember.Route.extend({
            activate: function() {
                Ember.run.next(function() {
                    document.title = 'mist.io  images';
                });
            }
        });
    }
);
