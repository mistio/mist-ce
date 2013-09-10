define('app/controllers/notification', [
    'ember',
    'jquery',
    ],
    /**
     * Notification controller
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({

            timeout: false,

            notify: function(message){
                if(this.timeout){
                    clearTimeout(this.timeout);
                }
                log("notification: " + message);
                $.mobile.loading( 'show', {
                            text: message,
                            textVisible: true,
                            textonly: true,
                            theme: $.mobile.pageLoadErrorMessageTheme
                });
                this.timeout = setTimeout("$.mobile.loading( 'hide' )", 2000);
            },
            
            warn: function(message){
                if(this.timeout){
                    clearTimeout(this.timeout);
                }
                log("warning: " + message);
                $.mobile.loading( 'show', {
                            text: message,
                            textVisible: true,
                            textonly: true,
                            theme: $.mobile.pageLoadErrorMessageTheme
                });
                this.timeout = setTimeout("$.mobile.loading( 'hide' )", 5000);
            },

            timeNotify: function(message, miliseconds){
                if(this.timeout){
                    clearTimeout(this.timeout);
                }
                log("warning: " + message);
                $.mobile.loading( 'show', {
                            text: message,
                            textVisible: true,
                            textonly: true,
                            theme: $.mobile.pageLoadErrorMessageTheme
                });
                this.timeout = setTimeout("$.mobile.loading( 'hide' )", miliseconds);
            },            
        });
    }
);
