define('app/controllers/teams', ['app/models/team', 'ember'],
    //
    //  Teams Controller
    //
    //  @returns Class
    //
    function(Team) {

        'use strict';

        return Ember.Controller.extend(Ember.Evented, {

            //
            // Properties
            //

            model: [],
            loading: null,
            members: [],
            organization: null,

            //
            //  Initialization
            //

            init: function () {
                console.log('i');
                this._super();
                this.set('model', []);
                this.set('loading', true);
            },

            load: function (teams) {
                this._updateModel(teams);
                this.set('loading', false);
            },

            //
            //  Methods
            //

            getTeam: function(teamId) {
                return this.model.findBy('id', teamId);
            },

            teamExists: function(teamId) {
                return !!this.getTeam(teamId);
            },


            //
            //  Pseudo-Private Methods
            //

            _updateModel: function(teams) {
                var that = this;
                Ember.run(function() {
                    // Replace dummy teams (newly created)
                    var dummyTeams = that.model.filterBy('id', -1);

                    dummyTeams.forEach(function(team) {
                        var realTeam = teams.findBy('name', team.name);
                        if (realTeam) {
                            for (var attr in realTeam) {
                                team.set(attr, realTeam[attr]);
                            }
                        }
                    });

                    // Remove deleted teams
                    that.model.forEach(function(team) {
                        if (!teams.findBy('id', team.id)) {
                            if (team.id != -1) {
                                that.model.removeObject(team);
                            }
                        }
                    });

                    // Update model
                    teams.forEach(function(team) {
                        if (that.teamExists(team.id)) {
                            // Update existing teams
                            var old_team = that.getTeam(team.id);

                            for (var attr in team) {
                                old_team.set(attr, team[attr]);
                            }
                        } else {
                            // Add new team
                            team.organization = that.organization;
                            that.model.pushObject(Team.create(team));
                        }
                    });

                    Mist.organizationsController.updateTeams();
                    that.trigger('onTeamListChange');
                });
            },
        });
    }
);
