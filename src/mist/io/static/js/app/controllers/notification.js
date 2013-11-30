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
                $.mobile.loading( 'show', {
                            text: message,
                            textVisible: true,
                            textonly: true,
                            theme: 'b'
                });
                Ember.run.later(function() {
                    $.mobile.loading('hide');
                }, this.timeout ? this.timeout : 2000);
            },
            
            warn: function(message){
                $.mobile.loading( 'show', {
                            text: message,
                            textVisible: true,
                            textonly: true,
                            theme: 'b'
                });
                Ember.run.later(function() {
                    $.mobile.loading('hide');
                }, this.timeout ? this.timeout : 5000);
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
