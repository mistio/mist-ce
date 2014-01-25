define('app/controllers/notification', ['ember'],
    /**
     *  Notification Controller
     *
     *  @returns Class
     */
    function () {
        return Ember.Object.extend({

            /**
             *  Properties
             */

            timeout: null,


            /**
             *
             *  Methods
             *
             */

            notify: function (message) {
                $('#notification-popup h1').text(message);
                $('#notification-popup').show();
                Ember.run.later(function () {
                    $('#notification-popup').hide();
                }, this.timeout ? this.timeout : 2000);
            },


            timeNotify: function (message, miliseconds) {
                $('#notification-popup h1').text(message);
                $('#notification-popup').show();
                Ember.run.later(function () {
                    $('#notification-popup').hide();
                }, miliseconds);
            },

            showMessagebox: function() {
                $('#message-box-popup').popup('open').popup('reposition', {positionTo: 'window'});
                Ember.run.next(function() {
                    $('#message-box-popup').popup('reposition', {positionTo: 'window'});
                    Ember.run.later(function() {
                        $('#message-box-popup').popup('reposition', {positionTo: 'window'});
                    }, 300);
                });
            } 
        });
    }
);
