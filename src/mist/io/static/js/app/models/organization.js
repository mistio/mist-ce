define('app/models/organization', ['app/controllers/teams', 'app/controllers/members', 'ember'],
    //
    //  Organization Model
    //
    //  @returns Class
    //
    function(TeamsController, MembersController) {

        'use strict';

        return Ember.Object.extend(Ember.Evented, {

            //
            //  Properties
            //

            id: null,
            name: null,
            teams: [],
            members: [],

            teamCount: null,


            //
            //  Initialization
            //

            load: function() {
                Ember.run(this, function() {
                    // Add controllers
                    this.teams = TeamsController.create({
                        organization: this,
                        model: []
                    });
                    this.members = MembersController.create({
                        organization: this,
                        model: []
                    });

                    // Add events
                    this.teams.on('onTeamListChange', this, '_updateTeamCount');
                });
            }.on('init'),


            //
            //  Methods
            //

            update: function(data) {
                this._super(data);
            },

            getTeam: function(teamId) {
                return this.teams.getTeam(teamId);
            },

            _updateTeamCount: function() {
                Ember.run(this, function() {
                    this.set('teamCount', this.teams.model.length);
                    this.trigger('onTeamListChange');
                    Mist.organizationsController.trigger('onTeamListChange');
                });
            },
        });
    }
);
