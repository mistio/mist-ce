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

            model: function () {
                return this.get('controller').get('model');
            }.property('controller.model'),

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
                                console.log(123);
                                Mist.teamsController.deleteTeam(team, function(success) {
                                    if (success)
                                        console.log(123);
                                        Mist.__container__.lookup('router:main').transitionTo('teams');
                                });
                            }
                        }
                    });
                },

                removeMemberClicked: function(member) {
                    var teamId = this.get('team').id;

                    Mist.dialogController.open({
                        type: DIALOG_TYPES.YES_NO,
                        head: 'Delete member',
                        body: [{
                            paragraph: 'Are you sure you want to remove member "' +
                                member.name + '" ?'
                        }],
                        callback: function(didConfirm) {
                            if (didConfirm) {
                                var args = {
                                    member: member,
                                    teamId: teamId
                                };
                                Mist.teamsController.removeMember(args);
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
