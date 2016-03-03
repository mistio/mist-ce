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
                console.log(1111);
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
                console.log(111);
                Ember.run(this, function() {
                    this.set('teamCount', this.teams.model.length);
                    this.trigger('onTeamListChange');
                    Mist.organizationsController.trigger('onTeamListChange');
                });
            },
        });
    }
);
