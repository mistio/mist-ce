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

            model: function() {
                return this.get('controller').get('model');
            }.property('controller.model'),

            hasMembers: Ember.computed('team.members.[]', function() {
                return !!(this.get('team.members') && this.get('team.members').length);
            }),

            //
            // Initialization
            //

            load: function() {
                // Add event listeners
                Mist.teamsController.on('onChange', this, 'updateView');
                this.updateView();
            }.on('didInsertElement'),


            unload: function() {
                // Remove event listeners
                Mist.teamsController.off('onChange', this, 'updateView');
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
                this.set('model', team);
            },

            //
            // Actions
            //

            actions: {

                inviteMemberClicked: function() {
                    Mist.memberAddController.open();
                },

                saveRulesClicked: function() {
                    Mist.teamsController.saveRules({
                        team: this.get('team')
                    });
                },

                addRulesClicked: function() {
                    Mist.teamsController.addRule(this.get('team'));
                },

                renameClicked: function() {
                    Mist.teamEditController.open(this.get('team'));
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
