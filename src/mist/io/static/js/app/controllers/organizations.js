define('app/controllers/organizations', ['app/models/organization', 'ember'],
    //
    //  Organizations Controller
    //
    // @returns Class
    //
    function(Organization) {

        'use strict';

        return Ember.Controller.extend(Ember.Evented, {

            //
            // Properties
            //

            model: [],
            teamCount: 0,
            teams: [],
            members: [],

            //
            //  Initialization
            //

            load: function(organizations) {
                this._updateModel(organizations);
                this.set('loading', false);
            },

            //
            // Methods
            //

            getOrganization: function(organizationId) {
                return this.model.findBy('id', organizationId);
            },

            organizationExists: function(organizationId) {
                return !!this.getOrganization(organizationId);
            },

            updateTeams: function () {
                var organizations = Mist.organizationsController.model;
                var teamList = [];
                organizations.forEach(function (organization) {
                    teamList.pushObjects(organization.teams.model);
                });
                this.set('teams', teamList);
            },

            updateMembers: function () {
                var organizations = Mist.organizationsController.model;
                var memberList = [];
                organizations.forEach(function (organization) {
                    memberList.pushObjects(organization.members.model);
                });
                this.set('members', memberList);
            },

            _updateModel: function(organizations) {
                Ember.run(this, function() {
                    // Remove deleted organizations
                    this.model.forEach(function(organization) {
                        if (!organizations.findBy('id', organization.id)) {
                            this.model.removeObject(organization);
                        }
                    }, this);

                    organizations.forEach(function(organization) {
                        var oldOrganization = this.getOrganization(organization.id);

                        if (oldOrganization) {
                            // Update existing organizations
                            forIn(organization, function(value, property) {
                                oldOrganization.set(property, value);
                            });
                        } else {
                            // Add new organizations
                            this._addOrganization(organization);
                        }
                    }, this);

                    this.trigger('onOrganizationListChange');
                });
            },

            _addOrganization: function(organization) {
                Ember.run(this, function() {
                    if (this.organizationExists(organization.id)) return;
                    var organizationModel = Organization.create(organization);
                    this.model.addObject(organizationModel);
                    this.trigger('onOrganizationAdd');
                });
            },

            _updateTeamCount: function() {
                Ember.run(this, function() {
                    var teamCount = 0;
                    this.model.forEach(function(organization) {
                        console.log(organization.get('teamCount'));
                        teamCount += organization.teamCount;
                    });
                    this.set('teamCount', teamCount);
                    this.trigger('onTeamListChange');
                });
            },

            //
            // Observers
            //

            teamCountObserver: function() {
                console.log(11);
                Ember.run.once(this, '_updateTeamCount');
            }.observes('model.@each.teamCount')
        });
    }
);
