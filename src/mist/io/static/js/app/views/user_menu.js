define('app/views/user_menu', ['text!app/templates/user_menu.html', 'ember'],
    /**
     *  User Menu View
     *
     *  @returns Class
     */
    function(user_menu_html) {
        return Ember.View.extend({

            /**
             *  Properties
             */

            account_url: URL_PREFIX + '/account',
            logout: URL_PREFIX.length == 0 ? true : false,
            template: Ember.Handlebars.compile(user_menu_html),
            gravatarURL: 'https://www.gravatar.com/avatar/'+md5(EMAIL)+'?d=blank&s=40',
            notLogout: function() {
                return !this.logout;
            }.property('logout'),

            /**
             * 
             *  Actions
             * 
             */
            actions: {
                meClicked: function(){
                   $('#user-menu-popup').popup('open');
                }
            }
        });
    }
);
