define('app/views/user_menu', ['ember'],
    /**
     *  User Menu View
     *
     *  @returns Class
     */
    function() {
        return Ember.View.extend({

            /**
             *  Properties
             */

            isNotCore: !IS_CORE,
            accountUrl: URL_PREFIX + '/account',
            template: getTemplate('user_menu'),
            //TODO: change the logo_splash.png to user.png
            gravatarURL: EMAIL && ('https://www.gravatar.com/avatar/' + md5(EMAIL) + '?d=' +
                  encodeURIComponent('https://mist.io/resources/logo_splash.png') +'&s=36'),


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
