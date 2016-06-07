define('app/views/user_menu', ['ember', 'md5'],
    /**
     *  User Menu View
     *
     *  @returns Class
     */
    function() {

        'use strict';

        return App.UserMenuComponent = Ember.Component.extend({

            //
            //  Properties
            //

            layoutName: 'user_menu',
            isNotCore: !IS_CORE,
            accountUrl: URL_PREFIX + '/account',
            gravatarURL: EMAIL && ('https://www.gravatar.com/avatar/' + md5(EMAIL) + '?d=' +
                encodeURIComponent('https://mist.io/resources/images/sprite-images/user.png') + '&s=' + (window.devicePixelRatio > 1.5 ? 100 : 50)),
            hasName: Ember.computed(function() {
                return FIRST_NAME && LAST_NAME;
            }),
            gravatarName: Ember.computed('hasName', function() {
                return this.get('hasName') ? FIRST_NAME + ' ' + LAST_NAME : EMAIL;
            }),
            organization: Ember.computed('Mist.organization', 'Mist.organization.name', function() {
                return Mist.organization;
            }),
            organizations: Ember.computed('Mist.orgs', 'Mist.orgs.@each.name', function() {
                return Mist.orgs.filter(function(org) {
                    return org.name;
                });
            }),
            showCurrentOrganization: Ember.computed('organization', function() {
                return !!this.get('organization.name');
            }),
            showCreateOrganization: Ember.computed('showCurrentOrganization', function() {
                return this.get('showCurrentOrganization') && Mist.can_create_org;
            }),
            memberTeam: Ember.computed('showCurrentOrganization', 'Mist.teamsController.model', function() {
                var teams = [], teamsText = '';
                if (this.get('showCurrentOrganization')) {
                    Mist.teamsController.model.forEach(function(team) {
                        team.members.forEach(function(member) {
                            if (member.email == Mist.email) {
                                teams.push(team.name);
                            }
                        });
                    });

                    teamsText = teams.indexOf('Owners') > -1 ? 'Owners' : teams.join(' - ');
                }

                return teamsText;
            }),

            //
            //  Actions
            //

            actions: {
                meClicked: function() {
                    $('#user-menu-popup').popup('open');
                },

                addOrganizationClicked: function() {
                    $('#user-menu-popup').popup('close');
                    Ember.run.later(function() {
                        Mist.organizationAddController.open();
                    }, 300);
                },

                loginClicked: function() {
                    $('#user-menu-popup').popup('close');
                    Ember.run.later(function() {
                        Mist.loginController.open();
                    }, 300);
                },

                logoutClicked: function() {
                    Mist.loginController.logout();
                }
            }
        });
    }
);
