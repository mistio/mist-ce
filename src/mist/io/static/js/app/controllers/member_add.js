define('app/controllers/member_add', ['ember'],
    //
    //  Member Add Controller
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return Ember.Object.extend({

            //
            // Properties
            //

            newMember: Ember.Object.create({
                email: ''
            }),

            //
            // Methods
            //

            open: function() {
                this.clear();
                this.view.open();
            },

            close: function() {
                this.clear();
                this.view.close();
            },

            clear: function() {
                this.get('newMember').set('email', '');
            },

            add: function(team) {
                var that = this;
                Mist.teamsController.inviteMember({
                    member: that.get('newMember'),
                    team: team,
                    callback: function(success) {
                        if (success) {
                            that.close();
                        }
                    }
                })
            }
        });
    }
);
