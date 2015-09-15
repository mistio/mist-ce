define('app/views/login', ['ember'],
    /**
     *  Login View
     *
     *  @returns Class
     */
    function () {
        return App.LoginPopupComponent = Ember.Component.extend({

            layoutName: 'login',


            //
            //  Methods
            //

            updateLoginButton: function () {
                if (Mist.loginController.loggingIn || !Mist.loginController.formReady) {
                    $('#login-ok').addClass('ui-state-disabled');
                } else {
                    $('#login-ok').removeClass('ui-state-disabled');
                }
            },

            keyUp: function(e) {
                if (e.keyCode == 13) {
                    if (Mist.loginController.formReady) {
                        Mist.loginController.login();
                    }
                }
            },


            //
            //  Actions
            //

            actions: {
                backClicked: function() {
                    Mist.loginController.close();
                },

                loginClicked: function() {
                    Mist.loginController.login();
                }
            },


            //
            //  Observers
            //

            updateLoginButtonObserver: function () {
                Ember.run.once(this, 'updateLoginButton');
            }.observes('Mist.loginController.formReady', 'Mist.loginController.loggingIn')
        });
    }
);
