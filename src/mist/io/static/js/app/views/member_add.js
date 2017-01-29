define('app/views/member_add', ['app/views/popup'],
    //
    //  Member Add View
    //
    //  @returns Class
    //
    function(PopupComponent) {

        'use strict';

        return App.MemberAddComponent = PopupComponent.extend({

            //
            //  Properties
            //

            layoutName: 'member_add',
            controllerName: 'memberAddController',
            popupId: '#member-add',
            team: null,

            //
            //  Computed Properties
            //

            isReady: Ember.computed('Mist.memberAddController.newMember.email', 'team.members', function() {
                var newEmail = Mist.memberAddController.newMember.email,
                isUnique = false;

                if (this.get('team') && this.get('team').members) {
                    isUnique = this.get('team').members.every(function(member) {
                        return member.email != newEmail;
                    });
                }

                return /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?)*$/.test(newEmail) && isUnique;
            }),

            //
            //  Actions
            //

            actions: {
                backClicked: function() {
                    Mist.memberAddController.close();
                },

                addClicked: function() {
                    Mist.memberAddController.add(this.get('team'));
                }
            }
        });
    }
);
