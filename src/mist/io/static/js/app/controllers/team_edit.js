define('app/controllers/team_edit', ['ember'],
    //
    //  Team Edit Controller
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return Ember.Object.extend({

            //
            //  Properties
            //

            team: null,
            newName: '',
            newDescription: '',
            formReady: null,

            //
            //  Methods
            //

            open: function(team) {
                this.setProperties({
                    team: team,
                    newName: team.name,
                    newDescription: team.description
                });
                this._updateFormReady();
                this.view.open();
            },

            close: function() {
                this.view.close();
            },

            save: function() {
                if (this.formReady) {
                    var that = this;
                    Mist.teamsController.renameTeam({
                        team: this.get('team'),
                        newName: this.get('newName'),
                        newDescription: this.get('newDescription'),
                        callback: function(success) {
                            if (success)
                                that.close();
                        }
                    });
                }
            },

            //
            // Private Methods
            //

            _updateFormReady: function() {
                var formReady = false,
                isUnique = Mist.teamsController.model.every(function(team) {
                    return team.id != this.team.id ? team.name != this.newName : true;
                }, this);

                if (this.newName && isUnique && ((this.newName != this.team.name) || (this.newDescription != this.team.description))) {
                    formReady = true;
                }
                this.set('formReady', formReady);
            },

            //
            //  Observers
            //

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newName', 'newDescription')
        });
    }
);
