define('app/views/team', ['app/views/page'],
    /**
     *  Single Team View
     *
     *  @returns Class
     */
    function(PageView) {
        return App.TeamView = PageView.extend({

            //
            //  Properties
            //

            templateName: 'team',

            //
            // Computed Properties
            //

            model: Ember.computed('controller.model', function() {
                return this.get('controller').get('model');
            }),

            isOwners: Ember.computed('team.name', function() {
                return this.get('team.name') == 'Owners';
            }),

            //
            // Initialization
            //

            load: function() {
                // Add event listeners
                Mist.teamsController.on('onTeamListChange', this, 'updateView');
                Ember.run.next(this, this.updateView);
            }.on('didInsertElement'),


            unload: function() {
                // Remove event listeners
                Mist.teamsController.off('onTeamListChange', this, 'updateView');
            }.on('willDestroyElement'),

            //
            // Methods
            //

            updateView: function() {
                this.updateModel();
            },


            updateModel: function() {
                // Check if user has requested a specific team
                // through the address bar and retrieve it
                var team = Mist.teamsController.getRequestedTeam();

                if (team)
                    this.get('controller').set('model', team);
                // Get a reference of team model
                this.set('team', this.get('controller').get('model'));
            },

            //
            // Actions
            //

            actions: {

                inviteMemberClicked: function() {
                    Mist.memberAddController.open();
                },

                saveRulesClicked: function() {
                    Mist.teamsController.saveRules(this.get('team'));
                },

                addRulesClicked: function() {
                    Mist.teamsController.addRule(this.get('team'));
                },

                renameClicked: function() {
                    var team = this.team;
                    Mist.teamEditController.open(team, function(success) {
                        if (success) {
                            Mist.__container__.lookup('router:main').transitionTo('team', Mist.teamEditController.newTeamId);
                        }
                    });
                },

                deleteClicked: function() {
                    var team = this.get('team');

                    Mist.dialogController.open({
                        type: DIALOG_TYPES.YES_NO,
                        head: 'Delete team',
                        body: [{
                            paragraph: 'Are you sure you want to delete team "' +
                                team.name + '" ?'
                        }],
                        callback: function(didConfirm) {
                            if (didConfirm) {
                                Mist.teamsController.deleteTeam({
                                    team: team,
                                    callback: function(success) {
                                        if (success) {
                                            Mist.__container__.lookup('router:main').transitionTo('teams');
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            },

            //
            //  Observers
            //

            modelObserver: function() {
                Ember.run.once(this, 'updateView');
            }.observes('controller.model')
        });
    }
);
