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

            isReady: Ember.computed('Mist.memberAddController.newMember.email', function() {
                return !!Mist.memberAddController.newMember.email;
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
