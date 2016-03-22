define('app/routes/teams', ['app/routes/base'],
    //
    //  Teams Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.TeamsRoute = BaseRoute.extend({

            documentTitle: 'mist.io - teams',

            activate: function () {
                this._super();
                // If no teams exist and no team named owners force a redirect to home page
                if (!Mist.teamsController.model.length || !Mist.teamsController.model.slice().shift().name.toLowerCase() == 'owners') {
                    this.transitionTo('/');
                }
            },

            exit: function() {
                Mist.teamsController.model.forEach(function(team) {
                    team.set('selected', false);
                });
            }
        });
    }
);
