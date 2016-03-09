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

            add: function() {
                var that = this;
                Mist.teamsController.inviteMember({
                    member: that.get('newMember'),
                    callback: function(success) {
                        if (success) {
                            that.close();
                            Ember.run.next(function() {
                                $('body').enhanceWithin();
                            })
                        }
                    }
                })
            },

            //
            // Private Methods
            //

            _updateFormReady: function() {
                this.set('formReady', !!this.get('newMember.email'));
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
