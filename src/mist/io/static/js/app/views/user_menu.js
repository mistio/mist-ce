define('app/views/user_menu', ['app/views/templated', 'md5'],
    /**
     *  User Menu View
     *
     *  @returns Class
     */
    function (TemplatedView) {

        'user strict';

        return App.UserMenuView = TemplatedView.extend({

            /**
             *  Properties
             */
            templateName: 'user_menu',
            isNotCore: !IS_CORE,
            accountUrl: URL_PREFIX + '/account',
            gravatarURL: EMAIL && ('https://www.gravatar.com/avatar/' + md5(EMAIL) + '?d=' +
                  encodeURIComponent('https://mist.io/resources/images/sprite-images/user.png') +'&s=50'),


            /**
             *
             *  Actions
             *
             */

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
