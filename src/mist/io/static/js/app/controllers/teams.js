define('app/controllers/teams', ['app/controllers/base_array', 'app/models/team'],
    //
    //  Teams Controller
    //
    //  @returns Class
    //
    function(BaseArrayController, TeamModel) {

        'use strict';

        return BaseArrayController.extend({

            //
            //  Properties
            //

            baseModel: TeamModel,
            searchTerm: null,
            sortByTerm: 'name',

            //
            //  Computed Properties
            //

            sortByName: Ember.computed('sortByTerm', function() {
                return this.get('sortByTerm') == 'name';
            }),

            sortByType: Ember.computed('sortByTerm', function() {
                return this.get('sortByTerm') == 'type';
            }),

            filteredTeams: Ember.computed('model', 'searchTerm', function() {
                var filteredTeams = [];

                if (this.searchTerm) {
                    var that = this;
                    this.model.forEach(function(team) {
                        var regex = new RegExp(that.searchTerm, 'i');

                        if (regex.test(team.name)) {
                            filteredTeams.push(team);
                        } else {
                            if (team.selected) {
                                team.set('selected', false);
                            }
                        }
                    });
                } else {
                    filteredTeams = this.model;
                }

                return filteredTeams;
            }),

            sortedTeams: Ember.computed('filteredTeams', 'filteredTeams.@each.name', 'filteredTeams.@each.type', 'sortByTerm', function() {
                if (this.get('filteredTeams')) {
                    if (this.get('sortByName')) {
                        return this.get('filteredTeams').sortBy('name');
                    }

                    if (this.get('sortByType')) {
                        return this.get('filteredTeams').sortBy('type');
                    }
                }
            }),

            //
            // Methods
            //

            deleteTeam: function (args) {
                var that = this;
                that.set('deletingTeam', true);
                Mist.ajax.DELETE('/orgs/' + args.team.organization.name + '/teams/' + args.team.id, {
                }).success(function () {
                    that._deleteObject(args.team);
                }).error(function (message) {
                    Mist.notificationController.notify(message);
                }).complete(function (success) {
                    that.set('deletingTeam', false);
                    if (args.callback)
                        args.callback(success);
                })
            },

            renameTeam: function(args) {
                var that = this;
                that.set('renamingTeam', true);
                Mist.ajax.PUT('/orgs/' + args.team.organization.name + '/teams/' + args.team.id, {
                    new_name: args.newName,
                    new_description: args.newDescription
                }).success(function() {
                    that._renameTeam(args.team, args.newName, args.newDescription);
                }).error(function(message) {
                    Mist.notificationController.notify(message);
                }).complete(function(success) {
                    that.set('renamingTeam', false);
                    if (args.callback)
                        args.callback(success);
                });
            },

            getTeam: function(teamId) {
                console.log(teamId, this.model, this.model.findBy('id', teamId));
                return this.model.findBy('id', teamId);
            },

            getRequestedTeam: function() {
                if (this.teamRequest) {
                    return this.getObject(this.teamRequest);
                }
            },

            clearSearch: function() {
                this.set('searchTerm', null);
            },

            //
            // Private Methods
            //

            _renameTeam: function(team, name, description) {
                Ember.run(this, function() {
                    team.set('name', name);
                    if (description) {
                        team.set('description', description);
                    }
                });
            }
        });
    }
);
