define('app/views/member_item', ['ember', 'md5'],
    //
    //  Member Item Component
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return App.MemberItemComponent = Ember.Component.extend({

            //
            //  Properties
            //

            layoutName: 'member_item',
            tagName: 'tr',
            classNames: ['member-item'],
            member: null,
            team: null,

            //
            //  Computed Properties
            //

            isOwners: Ember.computed('team.name', function() {
                return this.get('team.name') == 'Owners';
            }),

            gravatarURL: Ember.computed('member.email', function() {
                var email = this.get('member.email');
                return 'https://www.gravatar.com/avatar/' + md5(email) + '?d=' +
                    encodeURIComponent('https://mist.io/resources/images/sprite-images/user.png') + '&s=' + (window.devicePixelRatio > 1.5 ? 36 : 18);
            }),

            //
            // Actions
            //

            actions: {
                removeMemberClicked: function() {
                    var team = this.get('team'),
                        member = this.get('member');

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
                                    team: team
                                };
                                Mist.teamsController.removeMember(args);
                            }
                        }
                    });
                }
            }
        });
    }
)
