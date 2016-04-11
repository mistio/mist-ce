define('app/routes/team', ['app/routes/base'],
    //
    //  Team Route
    //
    //  @returns Class
    //
    function (BaseRoute) {

        'use strict';

        return App.TeamRoute = BaseRoute.extend({

            activate: function () {
                this._super();
                Ember.run.later(this, function () {
                    var model = this.modelFor('team');
                    var id = model._id || model.id;
                    var team = Mist.teamsController.getObject(id);
                    this.set('documentTitle', 'mist.io - ' + (team ? team.name : id));
                }, 500);
            },

            redirect: function (team) {
                Mist.teamsController.set('teamRequest', team._id);
            },

            model: function (args) {
                var id = args.team_id;
                if (Mist.teamsController.loading)
                    return {_id: id};
                return Mist.teamsController.getObject(id);
            },

            exit: function() {
                Mist.logsController.unload();
            }
        });
    }
);
