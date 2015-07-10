define('app/routes/index', ['app/routes/base'],
    //
    //  Index Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.IndexRoute = Ember.Route.extend({

            documentTitle: 'mist.io - home',
            setupController: function (controller) {
                warn('setup index lookup');
                this.container.lookup('view:home');
            }
        });
    }
);
