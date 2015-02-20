define('app/views/login', ['app/views/templated'],
    /**
     *  Login View
     *
     *  @returns Class
     */
    function (TemplatedView) {
        return App.LoginView = TemplatedView.extend({

            /**
             *
             *  Methods
             *
             */

            updateLoginButton: function () {
                if (Mist.loginController.loggingIn || !Mist.loginController.formReady) {
                    $('#login-ok').addClass('ui-state-disabled');
                } else {
                    $('#login-ok').removeClass('ui-state-disabled');
                }
            },


            /**
             *
             *  Actions
             *
             */

            keyUp: function(e) {
                if (e.keyCode == 13) {
                    if (Mist.loginController.formReady) {
                        Mist.loginController.login();
                    }
                }
            },

            actions: {


                backClicked: function() {
                    Mist.loginController.close();
                },

                loginClicked: function() {
                    Mist.loginController.login();
                }
            },


            /**
             *
             *  Observers
             *
             */

            updateLoginButtonObserver: function () {
                Ember.run.once(this, 'updateLoginButton');
            }.observes('Mist.loginController.formReady', 'Mist.loginController.loggingIn')
        });
    }
);
