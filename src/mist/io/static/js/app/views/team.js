define('app/views/team', ['app/views/page', 'app/models/team'],
    /**
     *  Single Team View
     *
     *  @returns Class
     */
    function (PageView, Team) {
        return App.TeamView = PageView.extend({

            /**
             *  Properties
             */
            templateName: 'team',
            team: null,


            /**
             *
             *  Initialization
             *
             */

            load: function () {
                // Add event listeners
                Mist.teamsController.on('onTeamListChange', this, 'updateView');
                Ember.run.next(this, this.updateView);
            }.on('didInsertElement'),


            unload: function () {
                // Remove event listeners
                Mist.teamsController.off('onTeamListChange', this, 'updateView');
            }.on('willDestroyElement'),


            /**
             *
             *  Methods
             *
             */

            updateView: function () {

                this.updateModel();
            },


            updateModel: function () {

                // Check if user has requested a specific team
                // through the address bar and retrieve it
                var team = Mist.teamsController.getRequestedTeam();
                if (team)
                    this.get('controller').set('model', team);

                // Get a reference of team model
                this.set('team', this.get('controller').get('model'));
            },


            /**
             *
             *  Actions
             *
             */

            actions: {

                renameClicked: function () {
                    var team = this.team;
                    Mist.teamEditController.open(team.id, function (success) {
                        if (success) {
                            Mist.__container__.lookup('router:main').transitionTo('team', Mist.teamEditController.newTeamId);
                        }
                    });
                },


                deleteClicked: function () {

                    var teamId = this.team.id;

                    Mist.dialogController.open({
                        type: DIALOG_TYPES.YES_NO,
                        head: 'Delete team',
                        body: [
                            {
                                paragraph: 'Are you sure you want to delete "' +
                                    teamId + '" ?'
                            }
                        ],
                        callback: function (didConfirm) {
                            if (didConfirm) {
                                Mist.teamsController.deleteTeam(teamId, function (success) {
                                    if (success)
                                    Mist.__container__.lookup('router:main').transitionTo('teams');
                                });
                            }
                        }
                    });
                }
            },


            //
            //  Observers
            //

            modelObserver: function () {
                Ember.run.once(this, 'updateView');
            }.observes('controller.model')
        });
    }
);
