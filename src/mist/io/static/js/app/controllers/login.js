define('app/controllers/login', ['ember'],
    /**
     *  Login Controller
     *
     *  @returns Class
     */
    function() {
        return Ember.Object.extend({

            /**
             *  Properties
             */

            email: null,
            password: null,
            callback: null,
            loggingIn: null,


            /**
             * 
             *  Methods
             * 
             */

            open: function(callback) {
                $('#login-popup').popup('open');
                this._clear();
                this._updateFormReady();
                this.set('callback', callback);
            },


            close: function() {
                $('#login-popup').popup('close');
                this._clear();
            },


            login: function() {
                var that = this;
                this.set('loggingIn', true);
                Mist.ajax.POST('/auth', {
                    'email': this.email,
                    'password': this.password
                }).success(function(data) {
                    Ember.run.next(function() {
                        window.location.reload();
                    });
                }).error(function(message) {
                    Mist.notificationController.notify('Authentication error: ' + message);
                }).complete(function(success, data) {
                    that.set('loggingIn', false);
                    that._giveCallback(success, data);
                });
            },


            logout: function() {
                window.location = '/logout';
            },


            /**
             * 
             *  Pseudo-Private Methods
             * 
             */

            _clear: function() {
                this.set('email', null);
                this.set('password', null);
                this.set('callback', null);
            },


            _updateFormReady: function() {
                this.set('formReady', this.email && this.password);
            },


            _giveCallback: function(success, data) {
                if (this.callback) this.callback(success, data);
            },


            /**
             * 
             *  Observers
             * 
             */

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('email', 'password')
        });
    }
);
