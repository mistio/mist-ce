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

            addTeam: function(args) {
                var that = this;
                that.set('addingTeam', true);
                Mist.ajax
                    .POST('/org/' + args.team.organization.id + '/teams', {
                        'name': args.team.name,
                        'description': args.team.description
                    })
                    .success(function(newTeam) {
                        that._addTeam(team, newTeam);
                    })
                    .error(function(message) {
                        Mist.notificationController.notify(message);
                    })
                    .complete(function(success) {
                        that.set('addingTeam', false);
                        if (args.callback)
                            args.callback(success);
                    });
            },

            deleteTeam: function(args) {
                var that = this;
                that.set('deletingTeam', true);
                Mist.ajax
                    .DELETE('/org/' + args.team.organization.id + '/teams/' + args.team.id, {})
                    .success(function() {
                        that._deleteObject(args.team);
                    })
                    .error(function(message) {
                        Mist.notificationController.notify(message);
                    })
                    .complete(function(success) {
                        that.set('deletingTeam', false);
                        if (args.callback)
                            args.callback(success);
                    });
            },

            renameTeam: function(args) {
                var that = this;
                that.set('renamingTeam', true);
                Mist.ajax
                    .PUT('/org/' + args.team.organization.id + '/teams/' + args.team.id, {
                        new_name: args.newName,
                        new_description: args.newDescription
                    })
                    .success(function() {
                        that._renameTeam(args.team, args.newName, args.newDescription);
                    })
                    .error(function(message) {
                        Mist.notificationController.notify(message);
                    })
                    .complete(function(success) {
                        that.set('renamingTeam', false);
                        if (args.callback)
                            args.callback(success);
                    });
            },

            removeMember: function(args) {
                var that = this;
                that.set('deletingMember', true);
                Mist.ajax
                    .DELETE('/org/' + args.team.organization.id + '/teams/' + args.team.id + '/members/' + args.member.id, {})
                    .success(function() {
                        that._deleteMember(args.team, args.member);
                    })
                    .error(function(message) {
                        Mist.notificationController.notify(message);
                    })
                    .complete(function(success) {
                        that.set('deletingMember', false);
                        if (args.callback)
                            args.callback(success);
                    });
            },

            inviteMember: function(args) {
                var that = this;
                that.set('invitingMember', true);
                Mist.ajax
                    .POST('/org/' + args.team.organization.id + '/teams/' + args.team.id + '/members', {
                        'email': args.member.email
                    })
                    .success(function() {
                        Mist.notificationController.notify('An invitation was sent to user with email: ' + args.member.email);
                    })
                    .error(function(message) {
                        Mist.notificationController.notify(message);
                    })
                    .complete(function(success) {
                        that.set('invitingMember', false);
                        if (args.callback)
                            args.callback(success);
                    });
            },

            getTeam: function(teamId) {
                console.log(teamId, this.get('model'), Mist.teamsController.model, this.model.findBy('id', teamId));
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

            _addTeam: function(team, newTeam) {
                var team = Ember.Object.create({
                    id: newTeam.id,
                    name: team.name,
                    description: team.description,
                    organization: team.organization,
                    members: [],
                    policy: {}
                });
                Ember.run(this, function() {
                    this.model.pushObject(team);
                    this.trigger('onAdd', {
                        object: team
                    });
                });
            },

            _renameTeam: function(team, name, description) {
                Ember.run(this, function() {
                    team.set('name', name);
                    if (description) {
                        team.set('description', description);
                    }
                });
            },

            _deleteMember: function(team, member) {
                Ember.run(this, function() {
                    team.members.removeObject(member);
                });
            }
        });
    }
);
