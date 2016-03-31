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
            formReady: false,

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
                this.set('formReady', false);
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
            },

            //
            // Private Methods
            //

            _updateFormReady: function() {
                this.set('formReady', /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?)*$/.test(this.get('newMember.email')));
            },

            //
            // Observers
            //

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newMember.email'),
        });
    }
);
