define('app/controllers/teams', ['app/controllers/base_array', 'app/models/team', 'app/models/policy_rule'],
    //
    //  Teams Controller
    //
    //  @returns Class
    //
    function(BaseArrayController, TeamModel, PolicyRuleModel) {

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

            belongsToOtherTeam: function(args) {
                return this.get('model').some(function(team) {
                    return team.id != args.team.id && team.members.indexOf(args.member) != -1;
                });
            },

            addTeam: function(args) {
                var that = this;
                that.set('addingTeam', true);
                Mist.ajax
                    .POST('/api/v1/org/' + Mist.organization.id + '/teams', {
                        'name': args.team.name,
                        'description': args.team.description
                    })
                    .success(function(newTeam) {
                        that._addTeam(args.team, newTeam);
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
                var team = args,
                    that = this;
                that.set('deletingTeam', true);
                Mist.ajax
                    .DELETE('/api/v1/org/' + args.team.organization.id + '/teams/' + args.team.id, {})
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
                    .PUT('/api/v1/org/' + args.team.organization.id + '/teams/' + args.team.id, {
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
                    .DELETE('/api/v1/org/' + args.team.organization.id + '/teams/' + args.team.id + '/members/' + args.member.id, {})
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
                    .POST('/api/v1/org/' + args.team.organization.id + '/teams/' + args.team.id + '/members', {
                        'emails': args.member.email
                    })
                    .success(function(member) {
                        Mist.notificationController.notify('An invitation was sent to user with email: ' + args.member.email);
                        that._addMember(args.team, member);
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

            addRule: function(team) {
                var rule = PolicyRuleModel.create({
                    'operator': 'DENY',
                    'action': 'all',
                    'rtype': 'all',
                    'rid': null,
                    'rtags': {}
                });
                team.policy.rules.pushObject(rule);
            },

            editRule: function(args) {
                var index = args.team.policy.rules.indexOf(args.rule),
                    rule = args.team.policy.rules.objectAt(index),
                    key = args.properties.key,
                    val = args.properties.value;
                rule.set(key, val);

                // When resource type changes force
                // action to be All since bad combinations should be avoided
                if (args.properties.key == 'rtype') {
                    rule.set('action', 'all');
                }

                // When identification changes
                // reset rid & rtags to prevent both to be set
                if (key == 'identification') {
                    rule.setProperties({
                        rid: null,
                        rtags: {}
                    });

                    if (['add', 'create'].indexOf(rule.get('action')) != -1) {
                        rule.set('identification', 'where tags');
                    }
                }

                // When action changes
                // and it is equal to add or create
                // then only tags can be used
                if (key == 'action' && ['add', 'create'].indexOf(val) != -1) {
                    rule.setProperties({
                        identification: 'where tags',
                        rid: null,
                        rtags: {}
                    });
                }
            },

            editOperator: function(args) {
                Ember.set(args.team.policy, 'operator', args.operator);
            },

            moveUpRule: function(rule, team) {
                var index = team.policy.rules.indexOf(rule);

                if (index !== 0) {
                    team.policy.rules
                        .removeAt(index)
                        .insertAt(index - 1, rule);
                }
            },

            moveDownRule: function(rule, team) {
                var index = team.policy.rules.indexOf(rule),
                    len = team.policy.rules.length;

                if (index !== len - 1) {
                    team.policy.rules
                        .removeAt(index)
                        .insertAt(index + 1, rule);
                }
            },

            deleteRule: function(args) {
                args.team.policy.rules.removeObject(args.rule);
            },

            saveRules: function(args) {
                var team = args.team,
                    payloadRules = team.policy.rules
                    .map(function(rule, index) {
                        return {
                            operator: rule.operator,
                            action: rule.action == 'all' || rule.action === '' ? '' : rule.action,
                            rtype: rule.rtype == 'all' || rule.rtype === '' ? '' : rule.rtype,
                            rid: rule.rid,
                            rtags: this._transformRuleTags(rule.get('tagsText'))
                        };
                    }, this);

                if (!this._validateRTags(payloadRules)) {
                    Mist.notificationController.timeNotify('You can use only these chars to declare tags: a-z, 0-9, _, -', 2000);
                    return;
                }

                console.log(payloadRules);

                var that = this;
                that.set('updatingRules', true);
                Mist.ajax
                    .PUT('/api/v1/org/' + team.organization.id + '/teams/' + team.id + '/policy', {
                        policy: {
                            operator: team.policy.operator,
                            rules: payloadRules
                        }
                    })
                    .success(function() {
                        Mist.notificationController.notify('Team\'s ' + team.name + ' policy was updated successfully!');
                        // that._updateRules(team, payloadRules);
                    })
                    .error(function(message) {
                        Mist.notificationController.notify(message);
                    })
                    .complete(function(success) {
                        that.set('updatingRules', false);
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
                    organization: {
                        id: Mist.organization.id,
                        name: Mist.organization.name
                    },
                    members: [],
                    policy: newTeam.policy
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

            _addMember: function(team, member) {
                var newMember = Ember.Object.create({
                    id: member.id,
                    name: member.name,
                    email: member.email,
                    pending: member.pending
                });
                Ember.run(this, function() {
                    team.members.pushObject(newMember);
                });
            },

            _deleteMember: function(team, member) {
                Ember.run(this, function() {
                    team.members.removeObject(member);
                });
            },

            _updateRules: function(team, payloadRules) {
                Ember.run(this, function() {
                    team.policy.rules.setObjects(payloadRules);
                });
            },

            _transformRuleTags: function(tagsText) {
                var tagsArray = tagsText.split(','),
                    rtags = {};

                tagsArray.forEach(function(pair) {
                    if (pair) {
                        var parts = pair.split('=');
                        rtags[parts[0].trim()] = parts[1] === undefined ? null : parts[1].trim();
                    }
                });

                return rtags;
            },

            _validateRTags: function(payloadRules) {
                var regex = new RegExp('^[a-z0-9\_-]+$'),
                    isValid = true;

                if (Object.keys(payloadRules).length) {
                    payloadRules.forEach(function(rule) {
                        for (var tag in rule.rtags) {
                            if ((tag && !regex.test(tag)) || (rule.rtags[tag] && !regex.test(rule.rtags[tag]))) {
                                isValid = false;
                                break;
                            }
                            console.log(tag);
                        }
                    });
                }

                return isValid;
            }
        });
    }
);
