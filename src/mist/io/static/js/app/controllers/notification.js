define('app/controllers/notification', ['ember'],
    //
    //  Notification Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({

            //
            //  Properties
            //

            timeout: null,


            //
            //  Methods
            //

            notify: function (message) {
                $('#notification-popup h1').text(message);
                $('#notification-popup').show();
                Ember.run.later(function () {
                    $('#notification-popup').hide();
                }, this.timeout ? this.timeout : 5000);
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
                        $('#message-box-popup')
                    }, 300);
                });
            },


            //
            //  Message Box Object
            //


            messageBox: Ember.Object.create({

                //
                //  Properties
                //

                view: null,
                options: Ember.Object.create({
                    title: null,
                    paragraphs: null,
                    command: null,
                    ps: null,
                    callback: null,
                }),


                //
                //  Methods
                //

                open: function (args) {
                    this._clear();
                    forIn(this, args, function (value, option) {
                        this.options.set(option, value);
                    });
                    this.view.open();
                },

                close: function () {
                    this.view.close();
                    if (this.options.callback instanceof Function)
                        this.options.callback();
                    this._clear();
                },


                //
                //  Pseudo-Private Methods
                //

                _clear: function () {
                    this.options.setProperties({
                        title: null,
                        paragraphs: [],
                        command: null,
                        ps: null,
                        callback: null,
                    })
                },
            }),
        });
    }
);
