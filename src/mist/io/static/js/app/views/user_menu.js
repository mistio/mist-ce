define('app/views/user_menu', ['ember', 'md5'],
    /**
     *  User Menu View
     *
     *  @returns Class
     */
    function () {

        'use strict';

        return App.UserMenuComponent = Ember.Component.extend({

            //
            //  Properties
            //
            layoutName: 'user_menu',
            isNotCore: !IS_CORE,
            accountUrl: URL_PREFIX + '/account',
            gravatarURL: EMAIL && ('https://www.gravatar.com/avatar/' + md5(EMAIL) + '?d=' +
                  encodeURIComponent('https://mist.io/resources/images/sprite-images/user.png') +'&s='+(window.devicePixelRatio > 1.5 ? 100 : 50)),
            hasName: Ember.computed(function() {
                return FIRST_NAME && LAST_NAME;
            }),
            gravatarName: Ember.computed('hasName', function() {
                return this.get('hasName') ? FIRST_NAME + ' ' + LAST_NAME : EMAIL;
            }),


            //
            //  Actions
            //

            actions: {

                meClicked: function(){
                    $('#user-menu-popup').popup('open');
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
