define('app/views/team_list', ['app/views/page'],
    //
    //  Team List View
    //
    //  @returns Class
    //
    function(PageView) {

        'use strict';

        return App.TeamListView = PageView.extend({

            //
            //  Properties
            //

            templateName: 'team_list',
            controllerName: 'teamsController',

            //
            // Computed Properties
            //

            hasOrganization: Ember.computed('Mist.organizationsController.model', function() {
                return !!Mist.organizationsController.model;
            }),

            canRename: Ember.computed('Mist.teamsController.model.@each.selected', function() {
                return Mist.teamsController.get('selectedObjects').length == 1;
            }),

            canDelete: Ember.computed('Mist.teamsController.model.@each.selected', function() {
                return Mist.teamsController.get('selectedObjects').length;
            }),

            //
            // Initialization
            //

            load: function() {

                // Add event listeners
                Mist.teamsController.on('onSelectedChange', this, 'updateFooter');

                this.updateFooter();

            }.on('didInsertElement'),


            unload: function() {

                // Remove event listeners
                Mist.teamsController.off('onSelectedChange', this, 'updateFooter');

            }.on('willDestroyElement'),

            //
            // Methods
            //

            updateFooter: function() {
                if (Mist.teamsController.get('selectedObjects').length) {
                    this.$('.ui-footer').slideDown();
                } else {
                    this.$('.ui-footer').slideUp();
                }
            },

            //
            //  Actions
            //

            actions: {
                addOrganizationClicked: function() {
                    Mist.organizationAddController.open();
                },

                addClicked: function() {
                    Mist.teamAddController.open();
                },

                editClicked: function() {
                    Mist.teamEditController.open(Mist.teamsController.get('selectedObjects')[0]);
                },

                selectClicked: function() {
                    $('#select-teams-popup').popup('open');
                },

                selectionModeClicked: function(mode) {
                    $('#select-teams-popup').popup('close');
                    Ember.run(function() {
                        Mist.teamsController.get('filteredTeams').forEach(function(team) {
                            if(team.get('name') != 'Owners') {
                                team.set('selected', mode);
                            }
                        });
                    });
                },

                deleteClicked: function() {
                    var teams = Mist.teamsController.get('selectedObjects');

                    Mist.dialogController.open({
                        type: DIALOG_TYPES.YES_NO,
                        head: 'Delete teams',
                        body: [{
                            paragraph: 'Are you sure you want to delete ' + (teams.length > 1 ? 'these teams: ' : 'this team: ') + teams.toStringByProperty('name') + ' ?'
                        }],
                        callback: function(didConfirm) {
                            if (!didConfirm) return;
                            teams.forEach(function(team) {
                                Mist.teamsController.deleteTeam({
                                    team: team
                                });
                            });
                        }
                    });
                },

                clearClicked: function() {
                    Mist.teamsController.clearSearch();
                },

                sortBy: function(criteria) {
                    Mist.teamsController.set('sortByTerm', criteria);
                }
            }
        });
    }
);
