define('app/routes/team', ['app/routes/base'],
    //
    //  Team Route
    //
    //  @returns Class
    //
    function(BaseRoute) {

        'use strict';

        return App.TeamRoute = BaseRoute.extend({

            activate: function() {
                this._super();
                Ember.run.next(this, function() {
                    var model = this.modelFor('team');
                    console.log(model);
                    var id = model._id || model.id;
                    var team = Mist.teamsController.getTeam(id);
                    console.log(team);
                    this.set('documentTitle', 'mist.io - ' + (team ? team.name : id));
                });
            },

            redirect: function(team) {
                Mist.teamsController.set('teamRequest', team._id);
            },

            model: function(args) {
                console.log(args);
                var id = args.team_id;
                if (Mist.teamsController.loading)
                    return {
                        _id: id
                    };
                return Mist.teamsController.getObject(id);
            },

            exit: function() {
                Mist.logsController.unload();
            }
        });
    }
);
